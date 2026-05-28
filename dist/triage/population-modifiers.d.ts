import type { Encounter } from "../types/encounter.js";
import type { IntakeData } from "../types/intake.js";
import { type Patient } from "../types/patient.js";
import { CTASLevel, type PopulationModifier } from "../types/triage.js";
export declare function applyPopulationModifiers(currentCTAS: CTASLevel, intake: IntakeData, encounter: Encounter, patient: Patient): {
    ctas: CTASLevel;
    modifiers: PopulationModifier[];
};
//# sourceMappingURL=population-modifiers.d.ts.map