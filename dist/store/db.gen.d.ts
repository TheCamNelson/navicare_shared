export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export type Database = {
    __InternalSupabase: {
        PostgrestVersion: "14.5";
    };
    public: {
        Tables: {
            audit_logs: {
                Row: {
                    actor_id: string | null;
                    actor_type: string;
                    created_at: string;
                    encounter_id: string | null;
                    event_data: Json;
                    event_type: string;
                    id: string;
                    ip_address: string | null;
                    session_id: string | null;
                };
                Insert: {
                    actor_id?: string | null;
                    actor_type: string;
                    created_at?: string;
                    encounter_id?: string | null;
                    event_data?: Json;
                    event_type: string;
                    id?: string;
                    ip_address?: string | null;
                    session_id?: string | null;
                };
                Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
                Relationships: [];
            };
            clinician_reviews: {
                Row: {
                    clinician_id: string;
                    decision: string;
                    encounter_id: string;
                    final_ctas: number;
                    final_pathway: string;
                    id: string;
                    notes: string | null;
                    original_ctas: number;
                    override_reason: string | null;
                    reviewed_at: string;
                };
                Insert: {
                    clinician_id: string;
                    decision: string;
                    encounter_id: string;
                    final_ctas: number;
                    final_pathway: string;
                    id?: string;
                    notes?: string | null;
                    original_ctas: number;
                    override_reason?: string | null;
                    reviewed_at?: string;
                };
                Update: Partial<Database["public"]["Tables"]["clinician_reviews"]["Insert"]>;
                Relationships: [];
            };
            clinicians: {
                Row: {
                    clinician_type: string;
                    created_at: string;
                    id: string;
                    is_available: boolean;
                    license_number: string;
                };
                Insert: {
                    clinician_type: string;
                    created_at?: string;
                    id: string;
                    is_available?: boolean;
                    license_number: string;
                };
                Update: Partial<Database["public"]["Tables"]["clinicians"]["Insert"]>;
                Relationships: [];
            };
            encounters: {
                Row: {
                    abandoned_at: string | null;
                    complaint_code: string | null;
                    completed_at: string | null;
                    created_at: string;
                    id: string;
                    is_pediatric_flag: boolean;
                    is_repeat_visit: boolean;
                    patient_id: string;
                    previous_encounter_id: string | null;
                    state: string;
                    updated_at: string;
                };
                Insert: {
                    abandoned_at?: string | null;
                    complaint_code?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
                    id?: string;
                    is_pediatric_flag?: boolean;
                    is_repeat_visit?: boolean;
                    patient_id: string;
                    previous_encounter_id?: string | null;
                    state?: string;
                    updated_at?: string;
                };
                Update: Partial<Database["public"]["Tables"]["encounters"]["Insert"]>;
                Relationships: [];
            };
            intakes: {
                Row: {
                    baseline: Json;
                    complaint_responses: Json;
                    created_at: string;
                    encounter_id: string;
                    id: string;
                };
                Insert: {
                    baseline?: Json;
                    complaint_responses?: Json;
                    created_at?: string;
                    encounter_id: string;
                    id?: string;
                };
                Update: Partial<Database["public"]["Tables"]["intakes"]["Insert"]>;
                Relationships: [];
            };
            messages: {
                Row: {
                    content: string;
                    created_at: string;
                    encounter_id: string;
                    id: string;
                    role: string;
                    tool_calls: Json | null;
                };
                Insert: {
                    content: string;
                    created_at?: string;
                    encounter_id: string;
                    id?: string;
                    role: string;
                    tool_calls?: Json | null;
                };
                Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
                Relationships: [];
            };
            outcomes: {
                Row: {
                    ambulance_reason: string | null;
                    ambulance_recommended: boolean;
                    created_at: string;
                    ed_facility_id: string | null;
                    encounter_id: string;
                    facility_id: string | null;
                    follow_up_at: string | null;
                    id: string;
                    pathway: string;
                    prescription: Json | null;
                    red_flag_watch_list: string[];
                    self_care_instructions: string[];
                };
                Insert: {
                    ambulance_reason?: string | null;
                    ambulance_recommended?: boolean;
                    created_at?: string;
                    ed_facility_id?: string | null;
                    encounter_id: string;
                    facility_id?: string | null;
                    follow_up_at?: string | null;
                    id?: string;
                    pathway: string;
                    prescription?: Json | null;
                    red_flag_watch_list?: string[];
                    self_care_instructions?: string[];
                };
                Update: Partial<Database["public"]["Tables"]["outcomes"]["Insert"]>;
                Relationships: [];
            };
            profiles: {
                Row: {
                    created_at: string;
                    date_of_birth: string | null;
                    first_name: string | null;
                    health_card_last4: string | null;
                    id: string;
                    language: string;
                    last_name: string | null;
                    phone: string | null;
                    postal_code: string | null;
                    role: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    date_of_birth?: string | null;
                    first_name?: string | null;
                    health_card_last4?: string | null;
                    id: string;
                    language?: string;
                    last_name?: string | null;
                    phone?: string | null;
                    postal_code?: string | null;
                    role?: string;
                    updated_at?: string;
                };
                Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
                Relationships: [];
            };
            queue_entries: {
                Row: {
                    assigned_at: string | null;
                    assigned_clinician_id: string | null;
                    clinician_type_required: string | null;
                    ctas_level: number;
                    encounter_id: string;
                    entered_queue_at: string;
                    id: string;
                    priority_score: number;
                    special_flags: string[];
                    status: string;
                };
                Insert: {
                    assigned_at?: string | null;
                    assigned_clinician_id?: string | null;
                    clinician_type_required?: string | null;
                    ctas_level: number;
                    encounter_id: string;
                    entered_queue_at?: string;
                    id?: string;
                    priority_score?: number;
                    special_flags?: string[];
                    status?: string;
                };
                Update: Partial<Database["public"]["Tables"]["queue_entries"]["Insert"]>;
                Relationships: [];
            };
            triage_results: {
                Row: {
                    advisor_baseline_notes: Json | null;
                    advisor_completion_notes: Json | null;
                    algorithm_version: string;
                    bypass_queue: boolean;
                    complaint_derived_ctas: number;
                    complaint_red_flags: Json;
                    created_at: string;
                    encounter_id: string;
                    final_ctas_level: number;
                    first_order_modifiers: Json;
                    global_red_flags: Json;
                    id: string;
                    methodology: string;
                    population_modifiers: Json;
                    recommended_pathway: string;
                    second_order_modifiers: Json;
                    up_triage_applied: boolean;
                };
                Insert: {
                    advisor_baseline_notes?: Json | null;
                    advisor_completion_notes?: Json | null;
                    algorithm_version: string;
                    bypass_queue?: boolean;
                    complaint_derived_ctas: number;
                    complaint_red_flags?: Json;
                    created_at?: string;
                    encounter_id: string;
                    final_ctas_level: number;
                    first_order_modifiers?: Json;
                    global_red_flags?: Json;
                    id?: string;
                    methodology?: string;
                    population_modifiers?: Json;
                    recommended_pathway: string;
                    second_order_modifiers?: Json;
                    up_triage_applied?: boolean;
                };
                Update: Partial<Database["public"]["Tables"]["triage_results"]["Insert"]>;
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            is_clinician: {
                Args: never;
                Returns: boolean;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
//# sourceMappingURL=db.gen.d.ts.map