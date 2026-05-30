import React, { useEffect } from "react";

export const RenderComponent = ({ fn, viewId, state, onMount }: any) => {
  let extraProps = {
    "data-viewid": viewId,
    //TODO: add view name/location for debugging
  };
  // runs on every render to re-record the view hierarchy after re-renders
  useEffect(() => {
    onMount();
  });
  let el = fn.call(null, state.data);
  if (el) {
    return React.cloneElement(el, extraProps);
  } else {
    return null;
  }
};
