import React from "react";
import { RenderContext } from "./render";

const ViewContext = React.createContext({} as RenderContext);

export const ViewProvider = ViewContext.Provider;
export default ViewContext;
