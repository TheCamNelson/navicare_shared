import { randomUUID } from "node:crypto";
import { EncounterState, type Encounter } from "../types/encounter.js";
import {
  AgeGroup,
  InsuranceStatus,
  getAgeGroup,
  type Patient,
} from "../types/patient.js";
import type { IntakeData } from "../types/intake.js";
import { ComplaintCode } from "../types/complaint.js";

export interface BuildPatientOverrides {
  age?: number;
  age_group?: AgeGroup;
}

export function buildPatient(overrides: BuildPatientOverrides = {}): Patient {
  const age = overrides.age ?? 35;
  return {
    id: randomUUID(),
    first_name: "Test",
    last_name: "Patient",
    date_of_birth: new Date(Date.now() - age * 365.25 * 86400 * 1000),
    phone: "4165550000",
    preferred_language: "en",
    postal_code: "M5V 2T6",
    insurance_status: InsuranceStatus.OHIP_ACTIVE,
    age,
    age_group: overrides.age_group ?? getAgeGroup(age),
    created_at: new Date(),
    updated_at: new Date(),
  };
}

export function buildEncounter(
  patient: Patient,
  complaint: ComplaintCode,
  overrides: Partial<Encounter> = {},
): Encounter {
  return {
    id: randomUUID(),
    patient_id: patient.id,
    state: EncounterState.INTAKE_COMPLETE,
    complaint_code: complaint,
    is_pediatric_flag:
      patient.age_group === AgeGroup.INFANT ||
      patient.age_group === AgeGroup.TODDLER ||
      patient.age_group === AgeGroup.PEDIATRIC,
    is_repeat_visit: false,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

export function buildIntake(
  encounterId: string,
  base: Partial<IntakeData> = {},
  complaintResponses: Record<string, unknown> = {},
): IntakeData {
  return {
    id: randomUUID(),
    encounter_id: encounterId,
    onset: "1-6 hours",
    pain_level: 5,
    trajectory: "Same",
    comorbidities: [],
    current_medications: "",
    recent_visit: false,
    drug_allergies: "",
    complaint_responses: complaintResponses,
    created_at: new Date(),
    ...base,
  };
}
