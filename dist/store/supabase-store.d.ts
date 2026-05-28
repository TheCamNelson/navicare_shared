import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db.gen.js";
import { type Patient } from "../types/patient.js";
import { type Encounter } from "../types/encounter.js";
import type { IntakeData } from "../types/intake.js";
import { CTASLevel, type TriageResult } from "../types/triage.js";
import { type Clinician, type ClinicianReview } from "../types/clinician.js";
import { QueueFlag, type Message, type QueueEntry } from "../types/queue.js";
import type { DataStore, EncounterCreateInput, PatientCreateInput, QueueListFilter, StoreEventCallback, StoreTable } from "./types.js";
export interface SupabaseStoreOptions {
    /** Cookie-aware client carrying the end-user's JWT — used for RLS-gated reads/writes. */
    userClient: SupabaseClient<Database>;
    /** Service-role client — used ONLY for system-level writes that RLS forbids. */
    adminClient: SupabaseClient<Database>;
}
export declare class SupabaseStore implements DataStore {
    private readonly userClient;
    private readonly adminClient;
    constructor(opts: SupabaseStoreOptions);
    createPatient(_input: PatientCreateInput): Promise<Patient>;
    getPatient(id: string): Promise<Patient | null>;
    findPatientByEmail(_email: string): Promise<Patient | null>;
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
    subscribe(_table: StoreTable, _cb: StoreEventCallback): () => void;
}
//# sourceMappingURL=supabase-store.d.ts.map