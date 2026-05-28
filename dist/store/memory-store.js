import { randomUUID } from "node:crypto";
import { AgeGroup, InsuranceStatus, calculateAge, getAgeGroup, } from "../types/patient.js";
import { EncounterState, } from "../types/encounter.js";
const CTAS_WEIGHTS = {
    1: 5000,
    2: 1000,
    3: 500,
    4: 200,
    5: 100,
};
const FLAG_BONUSES = {
    MENTAL_HEALTH_SI: 300,
    PEDIATRIC_UNDER_2: 200,
    PREGNANCY: 150,
    REPEAT_VISIT: 100,
    ELDERLY_80_PLUS: 50,
};
function calculatePriority(ctas, enteredAt, flags) {
    const base = CTAS_WEIGHTS[ctas] ?? 100;
    const waitMinutes = Math.max(0, (Date.now() - enteredAt.getTime()) / 60000);
    const flagBonus = flags.reduce((sum, f) => sum + (FLAG_BONUSES[f] ?? 0), 0);
    return base + waitMinutes * 10 + flagBonus;
}
class InMemoryStore {
    patients = new Map();
    encounters = new Map();
    intakes = new Map(); // by encounter_id
    triageResults = new Map(); // by encounter_id
    queue = new Map();
    reviews = new Map(); // by encounter_id
    messages = new Map(); // by encounter_id
    clinicians = new Map();
    subscribers = new Map();
    constructor() {
        this.seedClinicians();
    }
    seedClinicians() {
        const general = {
            id: "clinician-general-1",
            name: "Dr. Sarah Chen",
            license_number: "CPSO-12345",
            clinician_type: "GENERAL",
            is_available: true,
        };
        const mh = {
            id: "clinician-mh-1",
            name: "Dr. Marcus Patel",
            license_number: "CPSO-67890",
            clinician_type: "MH",
            is_available: true,
        };
        this.clinicians.set(general.id, general);
        this.clinicians.set(mh.id, mh);
    }
    notify(table, type, payload) {
        const subs = this.subscribers.get(table);
        if (!subs)
            return;
        for (const cb of subs) {
            try {
                cb({ table, type, payload });
            }
            catch {
                // Ignore subscriber errors
            }
        }
    }
    async createPatient(input) {
        const age = calculateAge(input.date_of_birth);
        const patient = {
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
    async getPatient(id) {
        return this.patients.get(id) ?? null;
    }
    async findPatientByEmail(email) {
        for (const p of this.patients.values()) {
            if (p.email && p.email.toLowerCase() === email.toLowerCase())
                return p;
        }
        return null;
    }
    async createEncounter(input) {
        const patient = this.patients.get(input.patient_id);
        if (!patient)
            throw new Error(`Patient not found: ${input.patient_id}`);
        const isPed = input.is_pediatric_flag ??
            (patient.age_group === AgeGroup.INFANT ||
                patient.age_group === AgeGroup.TODDLER ||
                patient.age_group === AgeGroup.PEDIATRIC);
        const encounter = {
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
    async getEncounter(id) {
        return this.encounters.get(id) ?? null;
    }
    async listEncountersForPatient(patientId) {
        const list = [];
        for (const e of this.encounters.values()) {
            if (e.patient_id === patientId)
                list.push(e);
        }
        return list.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    }
    async updateEncounter(id, patch) {
        const existing = this.encounters.get(id);
        if (!existing)
            throw new Error(`Encounter not found: ${id}`);
        const updated = {
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
    async saveIntake(encounterId, intake) {
        const stored = { ...intake, encounter_id: encounterId };
        this.intakes.set(encounterId, stored);
        this.notify("intake", "create", stored);
        return stored;
    }
    async getIntake(encounterId) {
        return this.intakes.get(encounterId) ?? null;
    }
    async saveTriageResult(encounterId, result) {
        const stored = { ...result, encounter_id: encounterId };
        this.triageResults.set(encounterId, stored);
        this.notify("triage", "create", stored);
        return stored;
    }
    async getTriageResult(encounterId) {
        return this.triageResults.get(encounterId) ?? null;
    }
    async enqueue(encounterId, ctas, flags) {
        const enteredAt = new Date();
        const entry = {
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
    async listQueue(filter) {
        let list = Array.from(this.queue.values());
        if (filter?.status)
            list = list.filter((e) => e.status === filter.status);
        if (filter?.clinician_id) {
            list = list.filter((e) => e.assigned_clinician_id === filter.clinician_id);
        }
        if (filter?.ctas_level) {
            list = list.filter((e) => e.ctas_level === filter.ctas_level);
        }
        // Recalculate priority and sort
        list.forEach((e) => {
            e.priority_score = calculatePriority(e.ctas_level, e.entered_queue_at, e.special_flags);
        });
        list.sort((a, b) => b.priority_score - a.priority_score);
        return list;
    }
    async assignQueue(entryId, clinicianId) {
        const entry = this.queue.get(entryId);
        if (!entry)
            throw new Error(`Queue entry not found: ${entryId}`);
        const updated = {
            ...entry,
            assigned_clinician_id: clinicianId,
            assigned_at: new Date(),
            status: "ASSIGNED",
        };
        this.queue.set(entryId, updated);
        this.notify("queue", "update", updated);
        return updated;
    }
    async listClinicians() {
        return Array.from(this.clinicians.values());
    }
    async getClinician(id) {
        return this.clinicians.get(id) ?? null;
    }
    async saveClinicianReview(review) {
        this.reviews.set(review.encounter_id, review);
        this.notify("review", "create", review);
        return review;
    }
    async getReview(encounterId) {
        return this.reviews.get(encounterId) ?? null;
    }
    async appendMessage(encounterId, message) {
        const full = {
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
    async listMessages(encounterId) {
        return this.messages.get(encounterId) ?? [];
    }
    subscribe(table, cb) {
        let subs = this.subscribers.get(table);
        if (!subs) {
            subs = new Set();
            this.subscribers.set(table, subs);
        }
        subs.add(cb);
        return () => {
            subs.delete(cb);
        };
    }
}
export function getStore() {
    if (!globalThis.__navicareStore) {
        globalThis.__navicareStore = new InMemoryStore();
    }
    return globalThis.__navicareStore;
}
export function resetStore() {
    globalThis.__navicareStore = new InMemoryStore();
}
export { InMemoryStore };
//# sourceMappingURL=memory-store.js.map