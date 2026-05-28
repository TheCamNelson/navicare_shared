import type { Encounter } from "../types/encounter.js";
import type { IntakeData } from "../types/intake.js";
import type { Patient } from "../types/patient.js";
import { type TriageResult } from "../types/triage.js";
export declare const ALGORITHM_VERSION = "1.0.0";
export interface RunTriageInput {
    encounter: Encounter;
    intake: IntakeData;
    patient: Patient;
}
export declare function runTriage(input: RunTriageInput): TriageResult;
//# sourceMappingURL=engine.d.ts.map