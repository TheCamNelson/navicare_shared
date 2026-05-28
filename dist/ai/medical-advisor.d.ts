import type { TriageResult } from "../types/triage.js";
import type { IntakeData } from "../types/intake.js";
import type { Patient } from "../types/patient.js";
import { ComplaintCode } from "../types/complaint.js";
export interface AdvisorOpinion {
    summary: string;
    differential_diagnoses: string[];
    recommended_workup: string[];
    red_flags_to_watch: string[];
    generated_at: Date;
    source: "MOCK_DETERMINISTIC";
}
/**
 * Returns a deterministic mock "AI medical advisor" opinion based on the
 * triage result. Used by the CRM until a real LLM is wired up.
 */
export declare function generateAdvisorOpinion(args: {
    patient: Patient;
    intake: IntakeData;
    triage: TriageResult;
    complaintCode: ComplaintCode | undefined;
}): AdvisorOpinion;
//# sourceMappingURL=medical-advisor.d.ts.map