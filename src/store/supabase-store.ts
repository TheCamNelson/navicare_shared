import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "./db.gen.js";
import {
  AgeGroup,
  InsuranceStatus,
  calculateAge,
  getAgeGroup,
  type Patient,
} from "../types/patient.js";
import { EncounterState, type Encounter } from "../types/encounter.js";
import type { ComplaintCode } from "../types/complaint.js";
import type { IntakeData } from "../types/intake.js";
import {
  CTASLevel,
  PathwayType,
  type ModifierEntry,
  type PopulationModifier,
  type TriageResult,
} from "../types/triage.js";
import {
  ClinicianDecision,
  type Clinician,
  type ClinicianReview,
  type ClinicianType,
} from "../types/clinician.js";
import {
  QueueFlag,
  type Message,
  type QueueEntry,
  type QueueStatus,
} from "../types/queue.js";
import type {
  DataStore,
  EncounterCreateInput,
  PatientCreateInput,
  QueueListFilter,
  StoreEventCallback,
  StoreTable,
} from "./types.js";

/** Priority weights — mirrors memory-store so demo data behaves identically. */
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

export interface SupabaseStoreOptions {
  /** Cookie-aware client carrying the end-user's JWT — used for RLS-gated reads/writes. */
  userClient: SupabaseClient<Database>;
  /** Service-role client — used ONLY for system-level writes that RLS forbids. */
  adminClient: SupabaseClient<Database>;
}

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type EncounterRow = Database["public"]["Tables"]["encounters"]["Row"];
type IntakeRow = Database["public"]["Tables"]["intakes"]["Row"];
type TriageRow = Database["public"]["Tables"]["triage_results"]["Row"];
type QueueRow = Database["public"]["Tables"]["queue_entries"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ClinicianRow = Database["public"]["Tables"]["clinicians"]["Row"];
type ReviewRow = Database["public"]["Tables"]["clinician_reviews"]["Row"];

/* ──────────────────────────── row → domain converters ──────────────────────────── */

function profileToPatient(row: ProfileRow, email?: string): Patient {
  const dob = row.date_of_birth ? new Date(row.date_of_birth) : new Date(0);
  const age = row.date_of_birth ? calculateAge(dob) : 0;
  return {
    id: row.id,
    first_name: row.first_name ?? "",
    last_name: row.last_name ?? "",
    date_of_birth: dob,
    phone: row.phone ?? "",
    email,
    preferred_language: (row.language === "fr" ? "fr" : "en"),
    postal_code: row.postal_code ?? "",
    // We only store the last 4 digits of the card; reconstruct nothing here.
    health_card_number: row.health_card_last4 ?? undefined,
    insurance_status: row.health_card_last4
      ? InsuranceStatus.OHIP_ACTIVE
      : InsuranceStatus.UNINSURED,
    age,
    age_group: row.date_of_birth ? getAgeGroup(age) : AgeGroup.ADULT,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

function rowToEncounter(row: EncounterRow): Encounter {
  return {
    id: row.id,
    patient_id: row.patient_id,
    state: row.state as EncounterState,
    complaint_code: (row.complaint_code ?? undefined) as ComplaintCode | undefined,
    is_pediatric_flag: row.is_pediatric_flag,
    is_repeat_visit: row.is_repeat_visit,
    previous_encounter_id: row.previous_encounter_id ?? undefined,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    completed_at: row.completed_at ? new Date(row.completed_at) : undefined,
    abandoned_at: row.abandoned_at ? new Date(row.abandoned_at) : undefined,
  };
}

function rowToIntake(row: IntakeRow): IntakeData {
  const baseline = (row.baseline ?? {}) as Partial<{
    onset: string;
    pain_level: number;
    trajectory: string;
    comorbidities: string[];
    current_medications: string;
    recent_visit: boolean;
    drug_allergies: string;
  }>;
  return {
    id: row.id,
    encounter_id: row.encounter_id,
    created_at: new Date(row.created_at),
    onset: baseline.onset ?? "",
    pain_level: baseline.pain_level ?? 0,
    trajectory: baseline.trajectory ?? "",
    comorbidities: baseline.comorbidities ?? [],
    current_medications: baseline.current_medications ?? "",
    recent_visit: baseline.recent_visit ?? false,
    drug_allergies: baseline.drug_allergies ?? "",
    complaint_responses: (row.complaint_responses ?? {}) as Record<string, unknown>,
  };
}

function rowToTriage(row: TriageRow): TriageResult {
  return {
    id: row.id,
    encounter_id: row.encounter_id,
    algorithm_version: row.algorithm_version,
    methodology: row.methodology as TriageResult["methodology"],
    global_red_flags_triggered: (row.global_red_flags ?? []) as unknown as string[],
    complaint_red_flags: (row.complaint_red_flags ?? []) as unknown as ModifierEntry[],
    first_order_modifiers: (row.first_order_modifiers ?? []) as unknown as ModifierEntry[],
    second_order_modifiers: (row.second_order_modifiers ?? []) as unknown as ModifierEntry[],
    population_modifiers_applied: (row.population_modifiers ?? []) as unknown as PopulationModifier[],
    complaint_derived_ctas: row.complaint_derived_ctas as CTASLevel,
    final_ctas_level: row.final_ctas_level as CTASLevel,
    recommended_pathway: row.recommended_pathway as PathwayType,
    bypass_queue: row.bypass_queue,
    up_triage_applied: row.up_triage_applied,
    created_at: new Date(row.created_at),
  };
}

function rowToQueue(row: QueueRow): QueueEntry {
  return {
    id: row.id,
    encounter_id: row.encounter_id,
    ctas_level: row.ctas_level as CTASLevel,
    priority_score: row.priority_score,
    special_flags: (row.special_flags ?? []) as QueueFlag[],
    clinician_type_required: (row.clinician_type_required ?? undefined) as
      | "MH"
      | "PEDS"
      | "GENERAL"
      | undefined,
    assigned_clinician_id: row.assigned_clinician_id ?? undefined,
    entered_queue_at: new Date(row.entered_queue_at),
    assigned_at: row.assigned_at ? new Date(row.assigned_at) : undefined,
    status: row.status as QueueStatus,
  };
}

/** Best-effort mapping of message DB roles → domain sender enums. */
function dbRoleToSender(role: string): Message["sender"] {
  switch (role.toLowerCase()) {
    case "patient":
      return "PATIENT";
    case "clinician":
      return "CLINICIAN";
    case "system":
      return "SYSTEM";
    case "ai":
    case "bot":
    case "assistant":
      return "BOT";
    default:
      return "SYSTEM";
  }
}

function senderToDbRole(sender: Message["sender"]): string {
  switch (sender) {
    case "PATIENT":
      return "patient";
    case "CLINICIAN":
      return "clinician";
    case "BOT":
      return "ai";
    case "SYSTEM":
    default:
      return "system";
  }
}

function rowToMessage(row: MessageRow): Message {
  // The tool_calls column doubles as a metadata bag here so we can
  // round-trip senderId without changing the schema.
  const meta = (row.tool_calls ?? null) as { sender_id?: string } | null;
  return {
    id: row.id,
    encounter_id: row.encounter_id,
    sender: dbRoleToSender(row.role),
    sender_id: meta?.sender_id,
    text: row.content,
    metadata: meta ?? undefined,
    created_at: new Date(row.created_at),
  };
}

function rowToClinician(row: ClinicianRow, name?: string): Clinician {
  return {
    id: row.id,
    name: name ?? "Clinician",
    license_number: row.license_number,
    clinician_type: row.clinician_type as ClinicianType,
    is_available: row.is_available,
  };
}

function rowToReview(row: ReviewRow, clinicianName: string, clinicianLicense: string): ClinicianReview {
  return {
    id: row.id,
    encounter_id: row.encounter_id,
    clinician_id: row.clinician_id,
    clinician_name: clinicianName,
    clinician_license: clinicianLicense,
    original_ctas: row.original_ctas as CTASLevel,
    final_ctas: row.final_ctas as CTASLevel,
    decision: row.decision as ClinicianDecision,
    override_reason: row.override_reason ?? undefined,
    notes: row.notes ?? "",
    final_pathway: row.final_pathway as PathwayType,
    reviewed_at: new Date(row.reviewed_at),
  };
}

/* ─────────────────────────────────── SupabaseStore ─────────────────────────────────── */

export class SupabaseStore implements DataStore {
  private readonly userClient: SupabaseClient<Database>;
  private readonly adminClient: SupabaseClient<Database>;

  constructor(opts: SupabaseStoreOptions) {
    this.userClient = opts.userClient;
    this.adminClient = opts.adminClient;
  }

  /* ───── Patient ───── */

  async createPatient(_input: PatientCreateInput): Promise<Patient> {
    throw new Error(
      "createPatient is handled by Supabase Auth signup; the on_auth_user_created trigger creates the profile row.",
    );
  }

  async getPatient(id: string): Promise<Patient | null> {
    // Try user client first (will succeed if id === auth.uid() OR caller is clinician).
    const { data, error } = await this.userClient
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return profileToPatient(data);
  }

  async findPatientByEmail(_email: string): Promise<Patient | null> {
    throw new Error(
      "findPatientByEmail is no longer supported — use Supabase Auth (signInWithPassword) and read profiles by auth.uid().",
    );
  }

  /* ───── Encounter ───── */

  async createEncounter(input: EncounterCreateInput): Promise<Encounter> {
    const insert: Database["public"]["Tables"]["encounters"]["Insert"] = {
      patient_id: input.patient_id,
      complaint_code: input.complaint_code ?? null,
      is_pediatric_flag: input.is_pediatric_flag ?? false,
      is_repeat_visit: input.is_repeat_visit ?? false,
      previous_encounter_id: input.previous_encounter_id ?? null,
      state: EncounterState.CREATED,
    };
    const { data, error } = await this.userClient
      .from("encounters")
      .insert(insert)
      .select()
      .single();
    if (error) throw error;
    return rowToEncounter(data);
  }

  async getEncounter(id: string): Promise<Encounter | null> {
    const { data, error } = await this.userClient
      .from("encounters")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToEncounter(data) : null;
  }

  async listEncountersForPatient(patientId: string): Promise<Encounter[]> {
    const { data, error } = await this.userClient
      .from("encounters")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToEncounter);
  }

  async updateEncounter(id: string, patch: Partial<Encounter>): Promise<Encounter> {
    const update: Database["public"]["Tables"]["encounters"]["Update"] = {};
    if (patch.state !== undefined) update.state = patch.state;
    if (patch.complaint_code !== undefined) update.complaint_code = patch.complaint_code ?? null;
    if (patch.is_pediatric_flag !== undefined) update.is_pediatric_flag = patch.is_pediatric_flag;
    if (patch.is_repeat_visit !== undefined) update.is_repeat_visit = patch.is_repeat_visit;
    if (patch.previous_encounter_id !== undefined) {
      update.previous_encounter_id = patch.previous_encounter_id ?? null;
    }
    if (patch.completed_at !== undefined) {
      update.completed_at = patch.completed_at ? patch.completed_at.toISOString() : null;
    }
    if (patch.abandoned_at !== undefined) {
      update.abandoned_at = patch.abandoned_at ? patch.abandoned_at.toISOString() : null;
    }
    update.updated_at = new Date().toISOString();

    const { data, error } = await this.userClient
      .from("encounters")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return rowToEncounter(data);
  }

  /* ───── Intake ───── */

  async saveIntake(encounterId: string, intake: IntakeData): Promise<IntakeData> {
    const baseline = {
      onset: intake.onset,
      pain_level: intake.pain_level,
      trajectory: intake.trajectory,
      comorbidities: intake.comorbidities,
      current_medications: intake.current_medications,
      recent_visit: intake.recent_visit,
      drug_allergies: intake.drug_allergies,
    };
    const insert: Database["public"]["Tables"]["intakes"]["Insert"] = {
      encounter_id: encounterId,
      baseline: baseline as Json,
      complaint_responses: (intake.complaint_responses ?? {}) as Json,
    };
    // RLS only allows insert for encounter owner. Use upsert-like behavior:
    // delete any existing row first (also RLS-checked), then insert.
    await this.userClient.from("intakes").delete().eq("encounter_id", encounterId);
    const { data, error } = await this.userClient
      .from("intakes")
      .insert(insert)
      .select()
      .single();
    if (error) throw error;
    return rowToIntake(data);
  }

  async getIntake(encounterId: string): Promise<IntakeData | null> {
    const { data, error } = await this.userClient
      .from("intakes")
      .select("*")
      .eq("encounter_id", encounterId)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToIntake(data) : null;
  }

  /* ───── Triage ───── */

  async saveTriageResult(
    encounterId: string,
    result: TriageResult,
  ): Promise<TriageResult> {
    // Patients/clinicians cannot INSERT triage_results under RLS — system writes only.
    const insert: Database["public"]["Tables"]["triage_results"]["Insert"] = {
      encounter_id: encounterId,
      algorithm_version: result.algorithm_version,
      methodology: result.methodology,
      global_red_flags: (result.global_red_flags_triggered ?? []) as Json,
      complaint_red_flags: (result.complaint_red_flags ?? []) as unknown as Json,
      first_order_modifiers: (result.first_order_modifiers ?? []) as unknown as Json,
      second_order_modifiers: (result.second_order_modifiers ?? []) as unknown as Json,
      population_modifiers: (result.population_modifiers_applied ?? []) as unknown as Json,
      complaint_derived_ctas: result.complaint_derived_ctas,
      final_ctas_level: result.final_ctas_level,
      recommended_pathway: result.recommended_pathway,
      bypass_queue: result.bypass_queue,
      up_triage_applied: result.up_triage_applied,
    };
    await this.adminClient.from("triage_results").delete().eq("encounter_id", encounterId);
    const { data, error } = await this.adminClient
      .from("triage_results")
      .insert(insert)
      .select()
      .single();
    if (error) throw error;
    return rowToTriage(data);
  }

  async getTriageResult(encounterId: string): Promise<TriageResult | null> {
    const { data, error } = await this.userClient
      .from("triage_results")
      .select("*")
      .eq("encounter_id", encounterId)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToTriage(data) : null;
  }

  /* ───── Queue ───── */

  async enqueue(
    encounterId: string,
    ctas: CTASLevel,
    flags: QueueFlag[],
  ): Promise<QueueEntry> {
    const enteredAt = new Date();
    const insert: Database["public"]["Tables"]["queue_entries"]["Insert"] = {
      encounter_id: encounterId,
      ctas_level: ctas,
      priority_score: calculatePriority(ctas, enteredAt, flags),
      special_flags: flags as unknown as string[],
      entered_queue_at: enteredAt.toISOString(),
      status: "WAITING",
    };
    // Service-role only.
    const { data, error } = await this.adminClient
      .from("queue_entries")
      .insert(insert)
      .select()
      .single();
    if (error) throw error;
    return rowToQueue(data);
  }

  async listQueue(filter?: QueueListFilter): Promise<QueueEntry[]> {
    let q = this.userClient.from("queue_entries").select("*");
    if (filter?.status) q = q.eq("status", filter.status);
    if (filter?.clinician_id) q = q.eq("assigned_clinician_id", filter.clinician_id);
    if (filter?.ctas_level) q = q.eq("ctas_level", filter.ctas_level);
    const { data, error } = await q;
    if (error) throw error;
    const list = (data ?? []).map(rowToQueue);
    // Recompute priority on read so wait-bonus reflects current time.
    list.forEach((e) => {
      e.priority_score = calculatePriority(e.ctas_level, e.entered_queue_at, e.special_flags);
    });
    list.sort((a, b) => b.priority_score - a.priority_score);
    return list;
  }

  async assignQueue(entryId: string, clinicianId: string): Promise<QueueEntry> {
    const { data, error } = await this.userClient
      .from("queue_entries")
      .update({
        assigned_clinician_id: clinicianId,
        assigned_at: new Date().toISOString(),
        status: "ASSIGNED",
      })
      .eq("id", entryId)
      .select()
      .single();
    if (error) throw error;
    return rowToQueue(data);
  }

  /* ───── Clinician ───── */

  async listClinicians(): Promise<Clinician[]> {
    const { data, error } = await this.userClient.from("clinicians").select("*");
    if (error) throw error;
    if (!data || data.length === 0) return [];
    // Resolve names via profiles (the clinician.id === auth.users.id === profile.id).
    const ids = data.map((c) => c.id);
    const { data: profileData } = await this.userClient
      .from("profiles")
      .select("id,first_name,last_name")
      .in("id", ids);
    const byId = new Map<string, { first_name: string | null; last_name: string | null }>();
    for (const p of profileData ?? []) byId.set(p.id, p);
    return data.map((row) => {
      const p = byId.get(row.id);
      const name =
        p && (p.first_name || p.last_name)
          ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim()
          : undefined;
      return rowToClinician(row, name);
    });
  }

  async getClinician(id: string): Promise<Clinician | null> {
    const { data, error } = await this.userClient
      .from("clinicians")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const { data: profile } = await this.userClient
      .from("profiles")
      .select("first_name,last_name")
      .eq("id", id)
      .maybeSingle();
    const name = profile && (profile.first_name || profile.last_name)
      ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
      : undefined;
    return rowToClinician(data, name);
  }

  /* ───── Review ───── */

  async saveClinicianReview(review: ClinicianReview): Promise<ClinicianReview> {
    const insert: Database["public"]["Tables"]["clinician_reviews"]["Insert"] = {
      id: review.id,
      encounter_id: review.encounter_id,
      clinician_id: review.clinician_id,
      decision: review.decision,
      original_ctas: review.original_ctas,
      final_ctas: review.final_ctas,
      final_pathway: review.final_pathway,
      override_reason: review.override_reason ?? null,
      notes: review.notes ?? null,
      reviewed_at: review.reviewed_at.toISOString(),
    };
    // RLS allows the reviewing clinician (clinician_id = auth.uid()) to insert/update.
    await this.userClient.from("clinician_reviews").delete().eq("encounter_id", review.encounter_id);
    const { data, error } = await this.userClient
      .from("clinician_reviews")
      .insert(insert)
      .select()
      .single();
    if (error) throw error;
    return rowToReview(data, review.clinician_name, review.clinician_license);
  }

  async getReview(encounterId: string): Promise<ClinicianReview | null> {
    const { data, error } = await this.userClient
      .from("clinician_reviews")
      .select("*")
      .eq("encounter_id", encounterId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    // Hydrate the clinician name/license to keep the domain interface stable.
    const clinician = await this.getClinician(data.clinician_id);
    return rowToReview(data, clinician?.name ?? "Clinician", clinician?.license_number ?? "");
  }

  /* ───── Messages ───── */

  async appendMessage(
    encounterId: string,
    message: Omit<Message, "id" | "created_at" | "encounter_id">,
  ): Promise<Message> {
    const insert: Database["public"]["Tables"]["messages"]["Insert"] = {
      id: randomUUID(),
      encounter_id: encounterId,
      role: senderToDbRole(message.sender),
      content: message.text,
      tool_calls: message.sender_id ? ({ sender_id: message.sender_id } as Json) : null,
    };
    // PATIENT/CLINICIAN messages go through RLS (user client). AI/SYSTEM messages
    // need admin because RLS only permits patient/clinician inserts.
    const client =
      message.sender === "BOT" || message.sender === "SYSTEM"
        ? this.adminClient
        : this.userClient;
    const { data, error } = await client.from("messages").insert(insert).select().single();
    if (error) throw error;
    return rowToMessage(data);
  }

  async listMessages(encounterId: string): Promise<Message[]> {
    const { data, error } = await this.userClient
      .from("messages")
      .select("*")
      .eq("encounter_id", encounterId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToMessage);
  }

  /* ───── Subscriptions ───── */

  subscribe(_table: StoreTable, _cb: StoreEventCallback): () => void {
    // Realtime not wired up here. Consumers wanting live updates should use
    // the browser client directly via supabase.channel(...) and supabase-js
    // postgres_changes — handled in the apps, not in this server-side store.
    return () => {
      /* noop */
    };
  }
}
