export declare enum AgeGroup {
    INFANT = "INFANT",// < 1 year
    TODDLER = "TODDLER",// 1-2 years
    PEDIATRIC = "PEDIATRIC",// 2-16 years
    ADULT = "ADULT",// 16-65 years
    SENIOR = "SENIOR",// 65-80 years
    ELDERLY = "ELDERLY"
}
export declare enum InsuranceStatus {
    OHIP_ACTIVE = "OHIP_ACTIVE",
    OHIP_EXPIRED = "OHIP_EXPIRED",
    UNINSURED = "UNINSURED"
}
export interface Patient {
    id: string;
    health_card_number?: string;
    health_card_version?: string;
    date_of_birth: Date;
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    preferred_language: "en" | "fr";
    postal_code: string;
    preferred_pharmacy_id?: string;
    insurance_status: InsuranceStatus;
    age_group: AgeGroup;
    age: number;
    created_at: Date;
    updated_at: Date;
}
export declare function getAgeGroup(age: number): AgeGroup;
export declare function calculateAge(dob: Date, today?: Date): number;
//# sourceMappingURL=patient.d.ts.map