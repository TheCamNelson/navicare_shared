import { type Patient } from "../types/patient.js";
import { type Encounter } from "../types/encounter.js";
import type { IntakeData } from "../types/intake.js";
import type { TriageResult, CTASLevel } from "../types/triage.js";
import type { ClinicianReview, Clinician } from "../types/clinician.js";
import type { QueueEntry, QueueFlag, Message } from "../types/queue.js";
import type { DataStore, EncounterCreateInput, PatientCreateInput, QueueListFilter, StoreEventCallback, StoreTable } from "./types.js";
declare class InMemoryStore implements DataStore {
    private patients;
    private encounters;
    private intakes;
    private triageResults;
    private queue;
    private reviews;
    private messages;
    private clinicians;
    private subscribers;
    constructor();
    private seedClinicians;
    private notify;
    createPatient(input: PatientCreateInput): Promise<Patient>;
    getPatient(id: string): Promise<Patient | null>;
    findPatientByEmail(email: string): Promise<Patient | null>;
    createEncounter(input: EncounterCreateInput): Promise<Encounter>;
    getEncounter(id: string): Promise<Encounter | null>;
    listEncountersForPatient(patientId: string): Promise<Encounter[]>;
    updateEncounter(id: string, patch: Partial<Encounter>): Promise<Encounter>;
    saveIntake(encounterId: string, intake: IntakeData): Promise<IntakeData>;
    getIntake(encounterId: string): Promise<IntakeData | null>;
    saveTriageResult(encounterId: string, result: TriageResult): Promise<TriageResult>;
    getTriageResult(encounterId: string): Promise<TriageResult | null>;
    enqueue(encounterId: string, ctas: CTASLevel, flags: QueueFlag[]): Promise<QueueEntry>;
    listQueue(filter?: QueueListFilter): Promise<QueueEntry[]>;
    assignQueue(entryId: string, clinicianId: string): Promise<QueueEntry>;
    listClinicians(): Promise<Clinician[]>;
    getClinician(id: string): Promise<Clinician | null>;
    saveClinicianReview(review: ClinicianReview): Promise<ClinicianReview>;
    getReview(encounterId: string): Promise<ClinicianReview | null>;
    appendMessage(encounterId: string, message: Omit<Message, "id" | "created_at" | "encounter_id">): Promise<Message>;
    listMessages(encounterId: string): Promise<Message[]>;
    subscribe(table: StoreTable, cb: StoreEventCallback): () => void;
}
declare global {
    var __navicareStore: InMemoryStore | undefined;
}
export declare function getStore(): DataStore;
export declare function resetStore(): void;
export { InMemoryStore };
//# sourceMappingURL=memory-store.d.ts.map