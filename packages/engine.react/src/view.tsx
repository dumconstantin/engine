import React, { useContext, useEffect, useRef, useState } from "react";
import { extractProducers } from "@c11/engine.utils";
import { ProducersList, ViewConfig, View, ViewFn } from "@c11/engine.types";
import { RenderComponent } from "./renderComponent";
import ViewContext from "./context";
import { ViewErrorBoundary } from "./errorBoundary";
import {
  createViewController,
  ViewController,
  ViewShared,
  ViewState,
} from "./viewController";

export type { View, ViewFn };

//TODO: Add viewId on every view - see engine.patterns/component implementation
//  storing data on a views[viewId] location might be problematic
//  if the parent will re-render and trigger the re-rendering of the child view
//  which will receive a new viewId - further exploration is needed

//TODO: update the state for the parent to add the child id link
//  update.views[parentId].children[viewId]

//TODO: make the above capability plug&play through a flag or a plugin
//  adding everything on state regarding the lifecycle of the views
//  might add unnecessary overhead.
//  also, for easier development capabilities could be split and added
//  in a bundle
//  example plugins:
//  - view recording: record views on state, allocate a viewId, parentId, etc
//    allow the view hierarchy to be known to the views
//  - view monitoring: add to the view instance on the state information regarding
//    isInViewport, isSelected, isFocused, etc
//  - producer recodring: the same recording as above but for producers and
//    allocate a producerId which can be used with update.producers[prop.producerId].data
export function view(config: ViewConfig) {
  const sourceId = config.sourceId;
  // producer list/setter shared by every instance of this view, also mutated
  // by the static `producers()` method below
  const shared: ViewShared = { producers: [] };

  const ViewComponent = (props: any) => {
    const context = useContext(ViewContext);
    const [state, setState] = useState<ViewState>({ data: {}, ready: false });
    const controllerRef = useRef<ViewController | null>(null);
    if (!controllerRef.current) {
      controllerRef.current = createViewController({
        config,
        sourceId,
        context,
        shared,
        initialProps: props,
        onState: setState,
      });
    }
    const controller = controllerRef.current;

    // keep producers bound to the latest external props (parity with the
    // previous render-time updateExternal calls)
    controller.updateExternal(props);

    useEffect(() => {
      controller.mount();
      return () => controller.unmount();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!state.ready) {
      return null;
    }

    return (
      <ViewErrorBoundary
        viewId={controller.id}
        meta={config.meta}
        errorFallback={context.errorFallback}
      >
        <RenderComponent
          onMount={() => controller.onMount()}
          viewId={controller.id}
          state={state}
          fn={controller.getFn()}
        />
      </ViewErrorBoundary>
    );
  };

  return Object.assign(ViewComponent, {
    displayName: config.meta?.name,
    isView: true,
    buildId: config.buildId,
    producers: (newProducers: ProducersList) => {
      const producersList = extractProducers(newProducers);
      shared.producers = shared.producers.concat(producersList);
      if (shared.setProducers) {
        shared.setProducers(sourceId as string, producersList);
      }
    },
  });
}
