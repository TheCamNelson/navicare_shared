export declare enum CTASLevel {
    LEVEL_1 = 1,
    LEVEL_2 = 2,
    LEVEL_3 = 3,
    LEVEL_4 = 4,
    LEVEL_5 = 5
}
export declare enum PathwayType {
    HOME_CARE = "HOME_CARE",
    URGENT_CARE = "URGENT_CARE",
    EMERGENCY_DEPARTMENT = "ED",
    ED_DIRECT = "ED_DIRECT"
}
export interface ModifierEntry {
    name: string;
    value?: string | number;
    ctas_impact: CTASLevel;
}
export interface PopulationModifier {
    name: string;
    escalation: number;
}
export interface TriageResult {
    id: string;
    encounter_id: string;
    algorithm_version: string;
    methodology: "eCTAS_VTriage_v1";
    global_red_flags_triggered: string[];
    complaint_red_flags: ModifierEntry[];
    first_order_modifiers: ModifierEntry[];
    second_order_modifiers: ModifierEntry[];
    population_modifiers_applied: PopulationModifier[];
    complaint_derived_ctas: CTASLevel;
    final_ctas_level: CTASLevel;
    recommended_pathway: PathwayType;
    bypass_queue: boolean;
    up_triage_applied: boolean;
    instructions?: string;
    created_at: Date;
}
//# sourceMappingURL=triage.d.ts.map