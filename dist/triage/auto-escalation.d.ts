import type { Encounter } from "../types/encounter.js";
import type { IntakeData } from "../types/intake.js";
import { CTASLevel } from "../types/triage.js";
/**
 * VTriage high-risk auto-escalation rules — patterns that auto-escalate to minimum CTAS 2.
 * Per techspec.txt §5.6, 7 explicit patterns are codified.
 */
export declare function applyAutoEscalationRules(currentCTAS: CTASLevel, encounter: Encounter, intake: IntakeData): CTASLevel;
//# sourceMappingURL=auto-escalation.d.ts.map