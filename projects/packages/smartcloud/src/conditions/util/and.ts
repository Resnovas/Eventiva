/** @format */

import {
  IssueConditionConfig,
  PRConditionConfig,
  ProjectConditionConfig,
  UtilProps,
  UtilThis,
} from '../';
import { evaluator } from '../../evaluator';
const TYPE = '$and';

export interface ConditionAnd {
  type: typeof TYPE;
  pattern: [PRConditionConfig | IssueConditionConfig | ProjectConditionConfig];
}

async function and(this: UtilThis, condition: ConditionAnd, props: UtilProps) {
  let success = 0;
  condition.pattern.forEach(async (condition) => {
    if (await evaluator.call(this, condition, props)) success++;
  });

  return success == condition.pattern.length;
}

export default [TYPE, and] as const;
