import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db.gen.js";

export type AuditActorType = "SYSTEM" | "PATIENT" | "CLINICIAN" | "SUPERVISOR";

export interface AuditEvent {
  encounter_id?: string;
  event_type: string;
  actor_type: AuditActorType;
  actor_id?: string;
  event_data?: Record<string, unknown>;
}

/**
 * Append an audit_logs row. RLS blocks INSERT for anon/authenticated, so the
 * ADMIN (service-role) client must be used.
 *
 * Failures are swallowed and logged via console.error — audit log failures
 * must never break the user-facing flow, but should be visible in server
 * logs for follow-up.
 */
export async function logAudit(
  adminClient: SupabaseClient<Database>,
  event: AuditEvent,
): Promise<void> {
  const { error } = await adminClient.from("audit_logs").insert({
    encounter_id: event.encounter_id ?? null,
    event_type: event.event_type,
    actor_type: event.actor_type,
    actor_id: event.actor_id ?? null,
    event_data: (event.event_data ?? {}) as Database["public"]["Tables"]["audit_logs"]["Insert"]["event_data"],
  });
  if (error) {
    // Do not throw — best effort.
    // eslint-disable-next-line no-console
    console.error("audit log insert failed", { event_type: event.event_type, error: error.message });
  }
}
