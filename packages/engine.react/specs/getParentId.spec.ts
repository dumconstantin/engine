import { getParentId } from "../src/getParentId";

test("returns the viewid of the nearest ancestor that has one", () => {
  const root = document.createElement("div");
  const parent = document.createElement("div");
  parent.setAttribute("data-viewid", "parent-1");
  const child = document.createElement("div");
  parent.appendChild(child);
  root.appendChild(parent);

  expect(getParentId(child, root)).toBe("parent-1");
});

test("stops at and returns undefined when reaching the root without a viewid", () => {
  const root = document.createElement("div");
  const child = document.createElement("div");
  root.appendChild(child);

  expect(getParentId(child, root)).toBeUndefined();
});

test("returns undefined when the element has no parent", () => {
  const el = document.createElement("div");
  const root = document.createElement("div");

  expect(getParentId(el, root)).toBeUndefined();
});

test("skips intermediate elements without a viewid", () => {
  const root = document.createElement("div");
  const grandparent = document.createElement("div");
  grandparent.setAttribute("data-viewid", "gp-1");
  const parent = document.createElement("div"); // no viewid
  const child = document.createElement("div");
  parent.appendChild(child);
  grandparent.appendChild(parent);
  root.appendChild(grandparent);

  expect(getParentId(child, root)).toBe("gp-1");
});
