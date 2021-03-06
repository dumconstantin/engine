import React, { isValidElement } from "react";
import { nanoid } from "nanoid";
import ViewContext from "./context";
import { BaseProps, BaseState } from "./types";
import {
  GraphNodeType,
  ValueSerializer,
  ProducerFn,
  ViewConfig,
  ViewInstance,
  ProducerConfig,
  ExternalProducerContext,
  StructOperation,
} from "@c11/engine.types";
import type { ProducerInstance } from "@c11/engine.types";
import { RenderComponent } from "./renderComponent";
import type { RenderContext } from "./render";

// TopLevel{
//   ErrorManagement,
//   propsManagement
// }

// MidLevel{
//   ChildSelection,
//   StateManagement,
//   ListenerManagement
// }

/**
 * - Builds up the state
 * - Creates listeners to react to state changes
 * - Gives the state to the renderComponent
 * - Chooses in which view-state/variant the component needs to be in
 * - Mounts and unmounts children states accordingly
 */

/**
 * - Receives props from the outside world.
 * - Creates the state manager (which to be a component
 * to properly handle errors).
 * - Looks over errors that might occur in the state manager
 * and handles them accordingly
 */

interface SampleState {}

export type ViewFn<ExternalProps = {}> = (
  props: any
) => React.ReactElement<ExternalProps> | null;

export type ViewExtra = {
  producers?: ProducerFn[];
};

export type View<ExternalProps = {}> = ViewFn<ExternalProps> & ViewExtra;

type InstanceApi = {
  replaceView: (config: ViewConfig) => void;
  replaceProducers: (producers: ProducerConfig[]) => void;
};

type InstanceCache = {
  [k: string]: {
    producers: ProducerConfig[];
    instances: {
      [k2: string]: InstanceApi;
    };
  };
};

const cache: InstanceCache = {};

const circular = () => {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    if (key.startsWith("_")) {
      return;
    }
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

// TODO: Create a production and development view - there too many overlaps now

export function view(config: ViewConfig) {
  const sourceId = config.sourceId;
  let producers: ProducerConfig[] = [];
  let setProducers: RenderContext["setProducers"];
  return class ViewComponent extends React.Component<BaseProps, SampleState> {
    static contextType = ViewContext;
    stateUpdate: any = {};
    fn: any;
    isComponentMounted: boolean = false;
    viewProps: StructOperation;
    producers: { [k: string]: ProducerInstance } = {};
    isStateReady = false;
    viewProducer: ProducerInstance;
    viewContext: ExternalProducerContext;
    ref: any;
    id: string;
    static producers(newProducers: ProducerConfig[]) {
      producers = newProducers;
      // TODO: should throw an error if the same producer is used twice
      // check using sourceId in development
      if (setProducers) {
        setProducers(sourceId, newProducers);
      }
    }
    constructor(externalProps: BaseProps, context: RenderContext) {
      super(externalProps, context);
      const childrenSerializer: ValueSerializer = {
        type: GraphNodeType.EXTERNAL,
        name: "children",
        serializer: (value) => {
          if (
            value instanceof Array &&
            value.includes((x: any) => !isValidElement(x))
          ) {
            return;
          } else if (!isValidElement(value)) {
            return;
          }
          const result = JSON.stringify(value, circular());
          return result;
        },
      };
      const viewContext = {
        props: externalProps,
        keepReferences: ["external.children"],
        serializers: [childrenSerializer],
        debug: context.debug,
      };
      this.viewContext = viewContext;
      this.viewProps = config.props;
      this.ref = React.createRef();
      this.fn = config.fn;
      const viewProducer = {
        props: config.props,
        fn: this.updateData.bind(this),
        meta: config.meta,
      };
      this.id = nanoid();
      this.viewProducer = context.addProducer(viewProducer, viewContext, {
        viewId: this.id,
        viewSourceId: sourceId,
      });
      if (sourceId) {
        const updatedProducers = context.getProducers(sourceId);
        if (updatedProducers) {
          producers = updatedProducers;
        }
        setProducers = context.setProducers;
        context.registerView(sourceId, config);
        if (!updatedProducers) {
          context.setProducers(sourceId, producers);
        }
        context.subscribeViewInstance(sourceId, this.id, {
          replaceView: (newConfig) => {
            this.fn = newConfig.fn;
            this.viewProducer.unmount();
            const viewProducer = {
              props: newConfig.props,
              fn: this.updateData.bind(this),
              meta: newConfig.meta,
            };
            this.viewProducer = this.context.addProducer(
              viewProducer,
              this.viewContext,
              {
                viewId: this.id,
                viewSourceId: sourceId,
              }
            );
            this.viewProducer.mount();
          },
          replaceProducer: (id, config) => {
            if (this.producers[id]) {
              const producer = this.producers[id];
              delete this.producers[id];
              producer.unmount();
            }
            this.producers[id] = this.context.addProducer(
              config,
              this.viewContext,
              {
                viewId: this.id,
                viewSourceId: sourceId,
              }
            );
            if (this.isComponentMounted) {
              this.producers[id].mount();
            }
          },
          replaceProducers: (newProducers) => {
            Object.keys(this.producers).forEach((x) => {
              const producer = this.producers[x];
              delete this.producers[x];
              producer.unmount();
            });
            this.producers = {};
            newProducers.forEach((x) => {
              const producer = this.context.addProducer(x, this.viewContext, {
                viewId: this.id,
                viewSourceId: sourceId,
              });
              if (this.isComponentMounted) {
                producer.mount();
              }
              const producerId = x.sourceId || nanoid();
              this.producers[producerId] = producer;
            });
          },
        });
      }
      producers.forEach((x: any) => {
        const id = x.sourceId || nanoid();
        this.producers[id] = context.addProducer(x, viewContext, {
          viewId: this.id,
          viewSourceId: sourceId,
        });
      });
      this.state = { data: {} };
      this.context = context;
    }
    componentDidMount() {
      this.isComponentMounted = true;
      Object.values(this.producers).forEach((x) => x.mount());
      this.viewProducer.mount();
    }
    componentWillUnmount() {
      this.isComponentMounted = false;
      if (sourceId) {
        this.context.removeViewInstance(sourceId, this.id);
      }
      Object.values(this.producers).forEach((x) => {
        x.unmount();
      });

      this.viewProducer.unmount();
    }
    updateData(data: any) {
      // only keep the latest data
      this.stateUpdate = {
        data,
        done: false,
      };

      if (!this.isComponentMounted) {
        return;
      }

      setImmediate(() => {
        if (!this.isComponentMounted) {
          return;
        }
        if (!this.isStateReady) {
          this.isStateReady = true;
        }
        if (this.stateUpdate.done) {
          return;
        }
        this.stateUpdate.done = true;
        this.setState({
          data: this.stateUpdate.data,
        });
      });
    }
    render() {
      // TODO: anyway of knowing if the props changed?
      Object.values(this.producers).forEach((x) => {
        x.updateExternal(this.props);
      });
      this.viewProducer.updateExternal(this.props);
      if (!this.isStateReady) {
        return null;
      }
      return <RenderComponent ref={this.ref} state={this.state} fn={this.fn} />;
    }
  };
}
