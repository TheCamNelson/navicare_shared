import { ComplaintCode } from "../types/complaint.js";
import type { IntakeData } from "../types/intake.js";
import { type ModifierEntry } from "../types/triage.js";
type Evaluator = (intake: IntakeData) => ModifierEntry[];
export declare function evaluateSecondOrderModifiers(complaint: ComplaintCode, intake: IntakeData): ModifierEntry[];
export declare const SECOND_ORDER_EVALUATORS: Record<ComplaintCode, Evaluator>;
export {};
//# sourceMappingURL=second-order-modifiers.d.ts.map