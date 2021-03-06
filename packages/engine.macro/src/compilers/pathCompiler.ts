import { InvokablePath, ValueTypes } from "@c11/engine.types";
import {
  ArrayExpression,
  arrayExpression,
  objectExpression,
  objectProperty,
  identifier,
  stringLiteral,
  nullLiteral,
} from "@babel/types";

export const pathCompiler = (path: InvokablePath): ArrayExpression => {
  const parts = path.map((x) => {
    let type = objectProperty(identifier("type"), stringLiteral(x.type));
    let value = objectProperty(identifier("ignored"), nullLiteral());
    if (x.type === ValueTypes.CONST) {
      let paramValue;
      if (x.value.__node__) {
        paramValue = x.value.__node__;
      } else {
        paramValue = stringLiteral(x.value.toString());
      }
      value = objectProperty(identifier("value"), paramValue);
    } else if (
      x.type === ValueTypes.INTERNAL ||
      x.type === ValueTypes.EXTERNAL
    ) {
      const path = x.path.map((y: string) => stringLiteral(y));
      value = objectProperty(identifier("path"), arrayExpression(path));
    } else if (x.type === ValueTypes.INVOKE) {
      const path = x.path.map((y: string) => stringLiteral(y));
      value = objectProperty(identifier("path"), arrayExpression(path));
    }
    return objectExpression([type, value]);
  });
  const result = arrayExpression(parts);
  return result;
};
