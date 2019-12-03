import {
  ObjectProperty,
  isAssignmentPattern,
  isLogicalExpression,
  isConditionalExpression,
  LogicalExpression,
  isMemberExpression
} from '@babel/types';
import {
  Operation,
  OperationTypes,
  ValueTypes,
  ValueOperation,
  InvokableValue,
  GetOperation,
  SetOperation,
  MergeOperation,
  RefOperation,
  StructOperation,
  StaticValue,
  FuncOperation,
  StaticOperation
} from '../lib/producer/types';
import { getMemberExpressionParams } from './getMemberExpressionParams';
import { PathType } from './types';
import { processInvokablePathValue } from './processInvokablePathValue';
import { processStruct } from './processStruct';
import { processPropPathValue } from './processPropPathValue';

const constValue = (value: any): ValueOperation => {
  return {
    type: OperationTypes.VALUE,
    value: {
      type: ValueTypes.CONST,
      value: value
    }
  };
};

const funcValue = (node: Node): FuncOperation => {
  return {
    type: OperationTypes.FUNC,
    value: {
      params: [],
      fn: () => {}
    }
  };
};

const logicalExpression = (node: LogicalExpression): FuncOperation => {
  const params: StaticOperation[] = [];
  let temp: any = node;
  while (temp.left) {
    temp = temp.left;

    if (!temp) {
      temp = false;
    } else {
      if (isMemberExpression(temp)) {
        const result = Values.MemberExpression(temp) as StaticOperation;
        if (result) {
          params.push(result);
        }
      } else {
        params.push({
          type: OperationTypes.VALUE,
          value: {
            type: ValueTypes.CONST,
            value: { __node__: temp }
          }
        });
      }
    }
  }
  // do right

  return {
    type: OperationTypes.FUNC,
    value: {
      params,
      fn: () => {}
    }
  };
};

interface Values {
  [key: string]: (node: any) => Operation | undefined;
}

const Values: Values = {
  // foo = Get.foo.bar
  MemberExpression: node => {
    const params = getMemberExpressionParams(node);
    const op = params[0] as PathType;
    const rawPath = params.slice(1);
    const path: InvokableValue[] = processInvokablePathValue(rawPath);

    // TODO: Is path valid? e.g. get operations with invoke

    if (op === PathType.GET) {
      return {
        type: OperationTypes.GET,
        path
      } as GetOperation;
    } else if (op === PathType.SET) {
      return {
        type: OperationTypes.SET,
        path
      } as SetOperation;
    } else if (op === PathType.MERGE) {
      return {
        type: OperationTypes.MERGE,
        path
      } as MergeOperation;
    } else if (op === PathType.REF) {
      return {
        type: OperationTypes.REF,
        path
      } as RefOperation;
    } else if (op === PathType.PROP) {
      return {
        type: OperationTypes.VALUE,
        value: processPropPathValue(rawPath)
      } as ValueOperation;
    } else {
      return undefined;
    }
  },
  // foo = Get.foo || Get.bar
  LogicalExpression: node => {
    return logicalExpression(node);
  },
  // foo = Get.foo ? true : false
  ConditionalExpression: node => {
    return funcValue(node);
  },
  BinaryExpression: node => {
    return funcValue(node);
  },
  ObjectExpression: node => {
    const value = processStruct(node);
    return value as StructOperation;
  }
};

export const processValue = (node: ObjectProperty): Operation | void => {
  let valueNode;
  if (isAssignmentPattern(node.value)) {
    valueNode = node.value.right;
  } else {
    valueNode = node.value;
  }

  if (valueNode && Values[valueNode.type]) {
    return Values[valueNode.type](valueNode);
  } else {
    return constValue({ __node__: valueNode });
  }
};
