export type ComplaintResponses = Record<string, unknown>;
export interface BaselineResponses {
    onset: string;
    pain_level: number;
    trajectory: string;
    comorbidities: string[];
    current_medications: string;
    recent_visit: boolean;
    drug_allergies: string;
}
export interface IntakeData extends BaselineResponses {
    id: string;
    encounter_id: string;
    complaint_responses: ComplaintResponses;
    created_at: Date;
}
//# sourceMappingURL=intake.d.ts.map