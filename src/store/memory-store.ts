import { randomUUID } from "node:crypto";
import {
  AgeGroup,
  InsuranceStatus,
  calculateAge,
  getAgeGroup,
  type Patient,
} from "../types/patient.js";
import {
  EncounterState,
  type Encounter,
} from "../types/encounter.js";
import type { IntakeData } from "../types/intake.js";
import type { TriageResult, CTASLevel } from "../types/triage.js";
import type { ClinicianReview, Clinician } from "../types/clinician.js";
import type { QueueEntry, QueueFlag, Message } from "../types/queue.js";
import type {
  DataStore,
  EncounterCreateInput,
  PatientCreateInput,
  QueueListFilter,
  StoreEventCallback,
  StoreTable,
} from "./types.js";

const CTAS_WEIGHTS: Record<number, number> = {
  1: 5000,
  2: 1000,
  3: 500,
  4: 200,
  5: 100,
};

const FLAG_BONUSES: Record<string, number> = {
  MENTAL_HEALTH_SI: 300,
  PEDIATRIC_UNDER_2: 200,
  PREGNANCY: 150,
  REPEAT_VISIT: 100,
  ELDERLY_80_PLUS: 50,
};

function calculatePriority(
  ctas: CTASLevel,
  enteredAt: Date,
  flags: QueueFlag[],
): number {
  const base = CTAS_WEIGHTS[ctas] ?? 100;
  const waitMinutes = Math.max(0, (Date.now() - enteredAt.getTime()) / 60000);
  const flagBonus = flags.reduce((sum, f) => sum + (FLAG_BONUSES[f] ?? 0), 0);
  return base + waitMinutes * 10 + flagBonus;
}

class InMemoryStore implements DataStore {
  private patients = new Map<string, Patient>();
  private encounters = new Map<string, Encounter>();
  private intakes = new Map<string, IntakeData>(); // by encounter_id
  private triageResults = new Map<string, TriageResult>(); // by encounter_id
  private queue = new Map<string, QueueEntry>();
  private reviews = new Map<string, ClinicianReview>(); // by encounter_id
  private messages = new Map<string, Message[]>(); // by encounter_id
  private clinicians = new Map<string, Clinician>();
  private subscribers: Map<StoreTable, Set<StoreEventCallback>> = new Map();

  constructor() {
    this.seedClinicians();
  }

  private seedClinicians(): void {
    const general: Clinician = {
      id: "clinician-general-1",
      name: "Dr. Sarah Chen",
      license_number: "CPSO-12345",
      clinician_type: "GENERAL",
      is_available: true,
    };
    const mh: Clinician = {
      id: "clinician-mh-1",
      name: "Dr. Marcus Patel",
      license_number: "CPSO-67890",
      clinician_type: "MH",
      is_available: true,
    };
    this.clinicians.set(general.id, general);
    this.clinicians.set(mh.id, mh);
  }

  private notify(
    table: StoreTable,
    type: "create" | "update" | "delete",
    payload: unknown,
  ): void {
    const subs = this.subscribers.get(table);
    if (!subs) return;
    for (const cb of subs) {
      try {
        cb({ table, type, payload });
      } catch {
        // Ignore subscriber errors
      }
    }
  }

  async createPatient(input: PatientCreateInput): Promise<Patient> {
    const age = calculateAge(input.date_of_birth);
    const patient: Patient = {
      id: randomUUID(),
      first_name: input.first_name,
      last_name: input.last_name,
      date_of_birth: input.date_of_birth,
      phone: input.phone,
      email: input.email,
      preferred_language: input.preferred_language ?? "en",
      postal_code: input.postal_code,
      insurance_status: input.insurance_status ?? InsuranceStatus.OHIP_ACTIVE,
      health_card_number: input.health_card_number,
      health_card_version: input.health_card_version,
      preferred_pharmacy_id: input.preferred_pharmacy_id,
      age,
      age_group: getAgeGroup(age),
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.patients.set(patient.id, patient);
    this.notify("patient", "create", patient);
    return patient;
  }

  async getPatient(id: string): Promise<Patient | null> {
    return this.patients.get(id) ?? null;
  }

  async findPatientByEmail(email: string): Promise<Patient | null> {
    for (const p of this.patients.values()) {
      if (p.email && p.email.toLowerCase() === email.toLowerCase()) return p;
    }
    return null;
  }

  async createEncounter(input: EncounterCreateInput): Promise<Encounter> {
    const patient = this.patients.get(input.patient_id);
    if (!patient) throw new Error(`Patient not found: ${input.patient_id}`);
    const isPed =
      input.is_pediatric_flag ??
      (patient.age_group === AgeGroup.INFANT ||
        patient.age_group === AgeGroup.TODDLER ||
        patient.age_group === AgeGroup.PEDIATRIC);
    const encounter: Encounter = {
      id: randomUUID(),
      patient_id: input.patient_id,
      state: EncounterState.CREATED,
      complaint_code: input.complaint_code,
      is_pediatric_flag: isPed,
      is_repeat_visit: input.is_repeat_visit ?? false,
      previous_encounter_id: input.previous_encounter_id,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.encounters.set(encounter.id, encounter);
    this.notify("encounter", "create", encounter);
    return encounter;
  }

  async getEncounter(id: string): Promise<Encounter | null> {
    return this.encounters.get(id) ?? null;
  }

  async listEncountersForPatient(patientId: string): Promise<Encounter[]> {
    const list: Encounter[] = [];
    for (const e of this.encounters.values()) {
      if (e.patient_id === patientId) list.push(e);
    }
    return list.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async updateEncounter(
    id: string,
    patch: Partial<Encounter>,
  ): Promise<Encounter> {
    const existing = this.encounters.get(id);
    if (!existing) throw new Error(`Encounter not found: ${id}`);
    const updated: Encounter = {
      ...existing,
      ...patch,
      id: existing.id,
      patient_id: existing.patient_id,
      created_at: existing.created_at,
      updated_at: new Date(),
    };
    this.encounters.set(id, updated);
    this.notify("encounter", "update", updated);
    return updated;
  }

  async saveIntake(encounterId: string, intake: IntakeData): Promise<IntakeData> {
    const stored: IntakeData = { ...intake, encounter_id: encounterId };
    this.intakes.set(encounterId, stored);
    this.notify("intake", "create", stored);
    return stored;
  }

  async getIntake(encounterId: string): Promise<IntakeData | null> {
    return this.intakes.get(encounterId) ?? null;
  }

  async saveTriageResult(
    encounterId: string,
    result: TriageResult,
  ): Promise<TriageResult> {
    const stored: TriageResult = { ...result, encounter_id: encounterId };
    this.triageResults.set(encounterId, stored);
    this.notify("triage", "create", stored);
    return stored;
  }

  async getTriageResult(encounterId: string): Promise<TriageResult | null> {
    return this.triageResults.get(encounterId) ?? null;
  }

  async enqueue(
    encounterId: string,
    ctas: CTASLevel,
    flags: QueueFlag[],
  ): Promise<QueueEntry> {
    const enteredAt = new Date();
    const entry: QueueEntry = {
      id: randomUUID(),
      encounter_id: encounterId,
      ctas_level: ctas,
      priority_score: calculatePriority(ctas, enteredAt, flags),
      special_flags: flags,
      entered_queue_at: enteredAt,
      status: "WAITING",
    };
    this.queue.set(entry.id, entry);
    this.notify("queue", "create", entry);
    return entry;
  }

  async listQueue(filter?: QueueListFilter): Promise<QueueEntry[]> {
    let list = Array.from(this.queue.values());
    if (filter?.status) list = list.filter((e) => e.status === filter.status);
    if (filter?.clinician_id) {
      list = list.filter((e) => e.assigned_clinician_id === filter.clinician_id);
    }
    if (filter?.ctas_level) {
      list = list.filter((e) => e.ctas_level === filter.ctas_level);
    }
    // Recalculate priority and sort
    list.forEach((e) => {
      e.priority_score = calculatePriority(
        e.ctas_level,
        e.entered_queue_at,
        e.special_flags,
      );
    });
    list.sort((a, b) => b.priority_score - a.priority_score);
    return list;
  }

  async assignQueue(entryId: string, clinicianId: string): Promise<QueueEntry> {
    const entry = this.queue.get(entryId);
    if (!entry) throw new Error(`Queue entry not found: ${entryId}`);
    const updated: QueueEntry = {
      ...entry,
      assigned_clinician_id: clinicianId,
      assigned_at: new Date(),
      status: "ASSIGNED",
    };
    this.queue.set(entryId, updated);
    this.notify("queue", "update", updated);
    return updated;
  }

  async listClinicians(): Promise<Clinician[]> {
    return Array.from(this.clinicians.values());
  }

  async getClinician(id: string): Promise<Clinician | null> {
    return this.clinicians.get(id) ?? null;
  }

  async saveClinicianReview(
    review: ClinicianReview,
  ): Promise<ClinicianReview> {
    this.reviews.set(review.encounter_id, review);
    this.notify("review", "create", review);
    return review;
  }

  async getReview(encounterId: string): Promise<ClinicianReview | null> {
    return this.reviews.get(encounterId) ?? null;
  }

  async appendMessage(
    encounterId: string,
    message: Omit<Message, "id" | "created_at" | "encounter_id">,
  ): Promise<Message> {
    const full: Message = {
      ...message,
      id: randomUUID(),
      encounter_id: encounterId,
      created_at: new Date(),
    };
    const list = this.messages.get(encounterId) ?? [];
    list.push(full);
    this.messages.set(encounterId, list);
    this.notify("message", "create", full);
    return full;
  }

  async listMessages(encounterId: string): Promise<Message[]> {
    return this.messages.get(encounterId) ?? [];
  }

  subscribe(table: StoreTable, cb: StoreEventCallback): () => void {
    let subs = this.subscribers.get(table);
    if (!subs) {
      subs = new Set();
      this.subscribers.set(table, subs);
    }
    subs.add(cb);
    return () => {
      subs!.delete(cb);
    };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __navicareStore: InMemoryStore | undefined;
}

export function getStore(): DataStore {
  if (!globalThis.__navicareStore) {
    globalThis.__navicareStore = new InMemoryStore();
  }
  return globalThis.__navicareStore;
}

export function resetStore(): void {
  globalThis.__navicareStore = new InMemoryStore();
}

export { InMemoryStore };
