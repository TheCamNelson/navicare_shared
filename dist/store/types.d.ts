import type { Patient, InsuranceStatus } from "../types/patient.js";
import type { Encounter } from "../types/encounter.js";
import type { IntakeData } from "../types/intake.js";
import type { TriageResult, CTASLevel } from "../types/triage.js";
import type { ClinicianReview, Clinician } from "../types/clinician.js";
import type { QueueEntry, QueueFlag, Message } from "../types/queue.js";
export interface PatientCreateInput {
    first_name: string;
    last_name: string;
    date_of_birth: Date;
    phone: string;
    email?: string;
    preferred_language?: "en" | "fr";
    postal_code: string;
    insurance_status?: InsuranceStatus;
    health_card_number?: string;
    health_card_version?: string;
    preferred_pharmacy_id?: string;
}
export interface EncounterCreateInput {
    patient_id: string;
    complaint_code?: Encounter["complaint_code"];
    is_pediatric_flag?: boolean;
    is_repeat_visit?: boolean;
    previous_encounter_id?: string;
}
export interface QueueListFilter {
    status?: QueueEntry["status"];
    clinician_id?: string;
    ctas_level?: CTASLevel;
}
export type StoreTable = "patient" | "encounter" | "intake" | "triage" | "queue" | "review" | "message" | "clinician";
export type StoreEventCallback = (event: {
    table: StoreTable;
    type: "create" | "update" | "delete";
    payload: unknown;
}) => void;
export interface DataStore {
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
//# sourceMappingURL=types.d.ts.map