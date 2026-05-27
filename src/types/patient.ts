export enum AgeGroup {
  INFANT = "INFANT",       // < 1 year
  TODDLER = "TODDLER",     // 1-2 years
  PEDIATRIC = "PEDIATRIC", // 2-16 years
  ADULT = "ADULT",         // 16-65 years
  SENIOR = "SENIOR",       // 65-80 years
  ELDERLY = "ELDERLY",     // 80+ years
}

export enum InsuranceStatus {
  OHIP_ACTIVE = "OHIP_ACTIVE",
  OHIP_EXPIRED = "OHIP_EXPIRED",
  UNINSURED = "UNINSURED",
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

export function getAgeGroup(age: number): AgeGroup {
  if (age < 1) return AgeGroup.INFANT;
  if (age < 2) return AgeGroup.TODDLER;
  if (age < 16) return AgeGroup.PEDIATRIC;
  if (age < 65) return AgeGroup.ADULT;
  if (age < 80) return AgeGroup.SENIOR;
  return AgeGroup.ELDERLY;
}

export function calculateAge(dob: Date, today: Date = new Date()): number {
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}
