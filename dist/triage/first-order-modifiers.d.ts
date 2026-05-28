import { ComplaintCode } from "../types/complaint.js";
import type { IntakeData } from "../types/intake.js";
import { CTASLevel, type ModifierEntry } from "../types/triage.js";
export declare function mapPainToCTAS(painLevel: number, complaint: ComplaintCode): CTASLevel;
export declare function evaluateFirstOrderModifiers(complaint: ComplaintCode, intake: IntakeData): ModifierEntry[];
//# sourceMappingURL=first-order-modifiers.d.ts.map