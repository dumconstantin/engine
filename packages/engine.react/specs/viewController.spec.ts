import { EventNames } from "@c11/engine.types";
import { createViewController } from "../src/viewController";

jest.useFakeTimers();

const makeProducer = () => ({
  mount: jest.fn(),
  unmount: jest.fn(),
  updateExternal: jest.fn(),
});

const makeContext = () => {
  const configs: any[] = [];
  const instances: ReturnType<typeof makeProducer>[] = [];
  let rootContainer: HTMLElement = document.createElement("div");
  const ctx: any = {
    emit: jest.fn(),
    debug: false,
    addProducer: jest.fn((config: any) => {
      configs.push(config);
      const instance = makeProducer();
      instances.push(instance);
      return instance;
    }),
    subscribeViewInstance: jest.fn(),
    removeViewInstance: jest.fn(),
    setProducers: jest.fn(),
    getProducers: jest.fn(() => undefined),
    registerView: jest.fn(),
    getRoot: () => rootContainer,
    errorFallback: jest.fn(),
  };
  return {
    ctx,
    configs,
    instances,
    setRoot: (el: HTMLElement) => (rootContainer = el),
  };
};

const makeConfig = () =>
  ({
    fn: () => null,
    props: { type: "STRUCT", value: {} },
    meta: { name: "TestView" },
    buildId: "build-1",
    sourceId: undefined,
  } as any);

test("creates the view, view-state and user producers on construction", () => {
  const { ctx, configs } = makeContext();
  const userProducer = { props: {}, fn: () => {}, meta: { name: "user" } };
  createViewController({
    config: makeConfig(),
    sourceId: undefined,
    context: ctx,
    shared: { producers: [userProducer] as any },
    initialProps: {},
    onState: jest.fn(),
  });

  expect(ctx.addProducer).toHaveBeenCalledTimes(3);
  expect(configs.some((c) => c.meta?.name === "InternalProducer")).toBe(true);
});

test("mount emits VIEW_MOUNTED and mounts every producer", () => {
  const { ctx, instances } = makeContext();
  const controller = createViewController({
    config: makeConfig(),
    sourceId: undefined,
    context: ctx,
    shared: { producers: [{ props: {}, fn: () => {}, meta: {} }] as any },
    initialProps: {},
    onState: jest.fn(),
  });

  controller.mount();

  expect(ctx.emit).toHaveBeenCalledWith(
    EventNames.VIEW_MOUNTED,
    { buildId: "build-1", sourceId: undefined },
    expect.objectContaining({ viewInstanceId: controller.id })
  );
  instances.forEach((p) => expect(p.mount).toHaveBeenCalled());
});

test("unmount emits VIEW_UNMOUNTED and unmounts every producer", () => {
  const { ctx, instances } = makeContext();
  const controller = createViewController({
    config: makeConfig(),
    sourceId: undefined,
    context: ctx,
    shared: { producers: [] },
    initialProps: {},
    onState: jest.fn(),
  });

  controller.mount();
  controller.unmount();

  expect(ctx.emit).toHaveBeenCalledWith(
    EventNames.VIEW_UNMOUNTED,
    expect.anything(),
    expect.anything()
  );
  instances.forEach((p) => expect(p.unmount).toHaveBeenCalled());
});

test("updateData strips _producerId and reports state after mount", () => {
  const { ctx, configs } = makeContext();
  const onState = jest.fn();
  const controller = createViewController({
    config: makeConfig(),
    sourceId: undefined,
    context: ctx,
    shared: { producers: [] },
    initialProps: {},
    onState,
  });

  // the view producer's fn is the data-binding callback
  const updateData = configs[0].fn;
  controller.mount();
  updateData({ foo: 1, _producerId: "secret" });
  jest.runAllTimers();

  expect(onState).toHaveBeenCalledWith({ data: { foo: 1 }, ready: true });
});

test("updateData does not report state before mount", () => {
  const { ctx, configs } = makeContext();
  const onState = jest.fn();
  createViewController({
    config: makeConfig(),
    sourceId: undefined,
    context: ctx,
    shared: { producers: [] },
    initialProps: {},
    onState,
  });

  configs[0].fn({ foo: 1 });
  jest.runAllTimers();

  expect(onState).not.toHaveBeenCalled();
});

test("onMount records the view hierarchy through _update", () => {
  const { ctx, configs, setRoot } = makeContext();
  const controller = createViewController({
    config: makeConfig(),
    sourceId: undefined,
    context: ctx,
    shared: { producers: [] },
    initialProps: {},
    onState: jest.fn(),
  });

  // build the DOM the controller will inspect
  const container = document.createElement("div");
  const rootView = document.createElement("div");
  rootView.setAttribute("data-viewid", "ROOT");
  const viewEl = document.createElement("div");
  viewEl.setAttribute("data-viewid", controller.id);
  rootView.appendChild(viewEl);
  container.appendChild(rootView);
  setRoot(container);

  // capture _update by invoking the internal view-state producer fn
  const updateValue = { set: jest.fn(), merge: jest.fn(), remove: jest.fn() };
  const update = jest.fn(() => updateValue);
  const internal = configs.find((c) => c.meta?.name === "InternalProducer");
  internal.fn({ _update: update });

  controller.onMount();

  expect(updateValue.merge).toHaveBeenCalledWith({
    rootId: "ROOT",
    parentId: "ROOT",
  });
  expect(updateValue.set).toHaveBeenCalledWith(expect.any(Number));
});
