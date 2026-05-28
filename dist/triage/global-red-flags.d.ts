import type { Encounter } from "../types/encounter.js";
import type { IntakeData } from "../types/intake.js";
import type { Patient } from "../types/patient.js";
export interface GlobalRedFlag {
    name: string;
    instructions: string;
}
/**
 * Check the 14 global red flags from clinical.txt §6 / techspec.txt §5.2.
 * Returns ALL triggered flags. If any are triggered the patient is CTAS 1 / ED_DIRECT.
 */
export declare function checkGlobalRedFlags(intake: IntakeData, encounter: Encounter, _patient: Patient): GlobalRedFlag[];
//# sourceMappingURL=global-red-flags.d.ts.map