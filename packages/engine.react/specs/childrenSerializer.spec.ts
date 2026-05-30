import React from "react";
import { childrenSerializer } from "../src/childrenSerializer";
import { circular } from "../src/circular";

const serialize = (value: any) => (childrenSerializer.serializer as any)(value);

test("targets the external children value", () => {
  expect(childrenSerializer.name).toBe("children");
});

test("serializes a single react element to JSON", () => {
  const el = React.createElement("div", { id: "x" }, "hello");
  const result = serialize(el);
  expect(typeof result).toBe("string");
  expect(JSON.parse(result as string).type).toBe("div");
});

test("serializes an array that contains react elements", () => {
  const els = [React.createElement("span", null, "a"), "plain"];
  const result = serialize(els);
  expect(typeof result).toBe("string");
});

test("ignores values that are not react elements", () => {
  expect(serialize("just a string")).toBeUndefined();
  expect(serialize(42)).toBeUndefined();
  expect(serialize(["a", "b"])).toBeUndefined();
});

test("circular replacer drops keys starting with underscore", () => {
  const json = JSON.stringify({ a: 1, _b: 2, c: { _d: 3, e: 4 } }, circular());
  expect(JSON.parse(json)).toEqual({ a: 1, c: { e: 4 } });
});

test("circular replacer guards against cyclic references", () => {
  const a: any = { name: "a" };
  a.self = a;
  expect(() => JSON.stringify(a, circular())).not.toThrow();
});
