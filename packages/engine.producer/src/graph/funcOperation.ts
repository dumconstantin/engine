import {
  DatastoreInstance,
  GraphStructure,
  FuncOperation,
  OperationTypes,
} from "@c11/engine.types";
import { observeOperation } from "./observeOperation";
import { valueOperation } from "./valueOperation";

export const funcOperation = (
  db: DatastoreInstance,
  structure: GraphStructure,
  op: FuncOperation
) => {
  const getParams = (params: any) => {
    const result = params.map((x: any) => {
      if (x.type === OperationTypes.OBSERVE) {
        const path = observeOperation(structure, x);
        if (path) {
          return db.get(path);
        }
      } else if (x.type === OperationTypes.VALUE) {
        return valueOperation(structure, x);
      } else {
        // operation not supported
      }
    });
    return result;
  };
  const params = getParams(op.value.params);

  // TODO: Maybe add a try catch here
  const value = op.value.fn.apply(null, params);
  return value;
};
