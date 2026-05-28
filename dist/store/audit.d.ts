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
export declare function logAudit(adminClient: SupabaseClient<Database>, event: AuditEvent): Promise<void>;
//# sourceMappingURL=audit.d.ts.map