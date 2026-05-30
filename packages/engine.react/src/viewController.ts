import { randomId, now } from "@c11/engine.utils";
import { EventNames, PathType, OperationTypes } from "@c11/engine.types";
import { pathFn } from "@c11/engine.runtime";
import type {
  ProducerConfig,
  ProducerInstance,
  ViewConfig,
  RootElement,
  UpdateValue,
} from "@c11/engine.types";
import type { RenderContext } from "./render";
import { childrenSerializer } from "./childrenSerializer";
import { getParentId } from "./getParentId";

export type ViewState = { data: any; ready: boolean };

/**
 * Producer list and setter shared across every instance of a given view,
 * mutated both by the view's static `producers()` method and by each
 * instance's controller during construction (mirrors the previous
 * module-scoped closure variables of the class component).
 */
export type ViewShared = {
  producers: ProducerConfig[];
  setProducers?: RenderContext["setProducers"];
};

export type ViewController = {
  id: string;
  getFn: () => ViewConfig["fn"];
  mount: () => void;
  unmount: () => void;
  updateExternal: (props: any) => void;
  onMount: () => void;
};

/**
 * Holds the producer-based data binding, view-state registration and HMR
 * wiring for a single view instance. Framework-agnostic: it reports rendered
 * state through `onState` instead of touching React directly so it can be
 * driven by a function component (or unit-tested with a fake context).
 */
export function createViewController({
  config,
  sourceId,
  context,
  shared,
  initialProps,
  onState,
}: {
  config: ViewConfig;
  sourceId: string | undefined;
  context: RenderContext;
  shared: ViewShared;
  initialProps: any;
  onState: (next: ViewState) => void;
}): ViewController {
  const id = randomId();
  const createdAt = now();
  let fn = config.fn;
  let isMounted = false;
  let isStateReady = false;
  let stateUpdate: { data: any; done: boolean } = { data: {}, done: true };
  let _update: ((path: any) => UpdateValue<any, any>) | undefined;
  const producers: { [k: string]: ProducerInstance } = {};

  const emit: RenderContext["emit"] = (name, payload = {}, ctx = {}) => {
    context.emit &&
      context.emit(name, payload, {
        ...ctx,
        viewId: config.buildId,
        viewInstanceId: id,
      });
  };

  const viewContext = {
    emit,
    props: {
      ...initialProps,
      _viewId: id,
      _props: initialProps,
    },
    keepReferences: ["external.children"],
    serializers: [childrenSerializer],
    debug: context.debug,
  };

  function updateData(data: any) {
    // because the view data binding comes from a producer the data will
    // contain all private props from the producer which should be deleted
    // from the view unless it was provided explicitly as a prop
    if (!viewContext.props._producerId) {
      delete data._producerId;
    }

    stateUpdate = { data, done: false };

    if (!isMounted) {
      return;
    }

    setImmediate(() => {
      if (!isMounted) {
        return;
      }
      if (!isStateReady) {
        isStateReady = true;
      }
      if (stateUpdate.done) {
        return;
      }
      stateUpdate.done = true;
      onState({ data: stateUpdate.data, ready: true });
    });
  }

  let viewProducer = context.addProducer(
    {
      props: config.props,
      fn: updateData,
      meta: config.meta,
    },
    viewContext,
    { viewId: id, viewSourceId: sourceId as string }
  );

  const viewStateProducer = context.addProducer(
    {
      props: {
        type: OperationTypes.STRUCT,
        value: {
          _update: {
            type: OperationTypes.CONSTRUCTOR,
            value: PathType.UPDATE,
          },
        },
      },
      fn: ({ _update: update }: any) => {
        _update = update;
        update(pathFn("views", id)).set({
          id,
          createdAt,
          data: {},
        });
        return () => {
          update(pathFn("views", id)).remove();
        };
      },
      meta: {
        ...config.meta,
        name: "InternalProducer",
      },
    } as unknown as ProducerConfig,
    viewContext,
    { viewId: id, viewSourceId: sourceId as string }
  );

  if (sourceId) {
    const updatedProducers = context.getProducers(sourceId);
    if (updatedProducers) {
      shared.producers = updatedProducers;
    }
    shared.setProducers = context.setProducers;
    context.registerView(sourceId, config);
    if (!updatedProducers) {
      context.setProducers(sourceId, shared.producers);
    }
    context.subscribeViewInstance(sourceId, id, {
      replaceView: (newConfig) => {
        fn = newConfig.fn;
        viewProducer.unmount();
        viewProducer = context.addProducer(
          {
            props: newConfig.props,
            fn: updateData,
            meta: newConfig.meta,
          },
          viewContext,
          { viewId: id, viewSourceId: sourceId }
        );
        viewProducer.mount();
      },
      replaceProducer: (producerId, producerConfig) => {
        if (producers[producerId]) {
          const producer = producers[producerId];
          delete producers[producerId];
          producer.unmount();
        }
        producers[producerId] = context.addProducer(
          producerConfig,
          viewContext,
          { viewId: id, viewSourceId: sourceId }
        );
        if (isMounted) {
          producers[producerId].mount();
        }
      },
      replaceProducers: (newProducers) => {
        Object.keys(producers).forEach((x) => {
          const producer = producers[x];
          delete producers[x];
          producer.unmount();
        });
        newProducers.forEach((x) => {
          const producer = context.addProducer(x, viewContext, {
            viewId: id,
            viewSourceId: sourceId,
          });
          if (isMounted) {
            producer.mount();
          }
          const producerId = x.sourceId || randomId();
          producers[producerId] = producer;
        });
      },
    });
  }

  shared.producers.forEach((x: any) => {
    const producerId = x.sourceId || randomId();
    producers[producerId] = context.addProducer(x, viewContext, {
      viewId: id,
      viewSourceId: sourceId as string,
    });
  });

  function mount() {
    isMounted = true;
    emit(EventNames.VIEW_MOUNTED, {
      buildId: config.buildId,
      sourceId: config.sourceId,
    });
    Object.values(producers).forEach((x) => x.mount());
    viewProducer.mount();
    viewStateProducer.mount();
  }

  function unmount() {
    isMounted = false;
    if (sourceId) {
      context.removeViewInstance(sourceId, id);
    }
    emit(EventNames.VIEW_UNMOUNTED);
    Object.values(producers).forEach((x) => x.unmount());
    viewProducer.unmount();
    viewStateProducer.unmount();
  }

  function updateExternal(props: any) {
    Object.values(producers).forEach((x) => x.updateExternal(props));
    viewProducer.updateExternal(props);
  }

  function onMount() {
    const root = context.getRoot()?.querySelector(`[data-viewid]`);
    const view = context.getRoot()?.querySelector(`[data-viewid="${id}"]`);

    if (!root || !view || !_update) {
      return;
    }

    const parentId = getParentId(view as HTMLElement, root as RootElement);

    _update(pathFn("views", id)).merge({
      rootId: root.getAttribute("data-viewid"),
      parentId,
    });

    _update(pathFn("views", parentId, "children", id)).set(createdAt);
  }

  return {
    id,
    getFn: () => fn,
    mount,
    unmount,
    updateExternal,
    onMount,
  };
}
