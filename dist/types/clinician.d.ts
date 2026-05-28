import type { CTASLevel, PathwayType } from "./triage.js";
export declare enum ClinicianDecision {
    CONFIRMED = "CONFIRMED",
    ESCALATED = "ESCALATED",
    DOWNGRADED = "DOWNGRADED"
}
export type ClinicianType = "MH" | "PEDS" | "GENERAL";
export interface Clinician {
    id: string;
    name: string;
    license_number: string;
    clinician_type: ClinicianType;
    is_available: boolean;
}
export interface ClinicianReview {
    id: string;
    encounter_id: string;
    clinician_id: string;
    clinician_name: string;
    clinician_license: string;
    original_ctas: CTASLevel;
    final_ctas: CTASLevel;
    decision: ClinicianDecision;
    override_reason?: string;
    notes: string;
    final_pathway: PathwayType;
    reviewed_at: Date;
}
//# sourceMappingURL=clinician.d.ts.map