import { z } from "zod";
import { ComplaintCode } from "../types/complaint.js";
export declare const BaselineSchema: z.ZodObject<{
    onset: z.ZodEnum<[string, ...string[]]>;
    pain_level: z.ZodNumber;
    trajectory: z.ZodEnum<[string, ...string[]]>;
    comorbidities: z.ZodArray<z.ZodEnum<[string, ...string[]]>, "many">;
    current_medications: z.ZodString;
    recent_visit: z.ZodBoolean;
    drug_allergies: z.ZodString;
}, "strip", z.ZodTypeAny, {
    onset: string;
    pain_level: number;
    trajectory: string;
    comorbidities: string[];
    current_medications: string;
    recent_visit: boolean;
    drug_allergies: string;
}, {
    onset: string;
    pain_level: number;
    trajectory: string;
    comorbidities: string[];
    current_medications: string;
    recent_visit: boolean;
    drug_allergies: string;
}>;
export declare const ComplaintResponseSchemas: Record<ComplaintCode, z.ZodTypeAny>;
export declare const IntakeDataSchema: z.ZodObject<{
    id: z.ZodString;
    encounter_id: z.ZodString;
    onset: z.ZodEnum<[string, ...string[]]>;
    pain_level: z.ZodNumber;
    trajectory: z.ZodEnum<[string, ...string[]]>;
    comorbidities: z.ZodArray<z.ZodEnum<[string, ...string[]]>, "many">;
    current_medications: z.ZodString;
    recent_visit: z.ZodBoolean;
    drug_allergies: z.ZodString;
    complaint_responses: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    created_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    onset: string;
    pain_level: number;
    trajectory: string;
    comorbidities: string[];
    current_medications: string;
    recent_visit: boolean;
    drug_allergies: string;
    id: string;
    encounter_id: string;
    complaint_responses: Record<string, unknown>;
    created_at: Date;
}, {
    onset: string;
    pain_level: number;
    trajectory: string;
    comorbidities: string[];
    current_medications: string;
    recent_visit: boolean;
    drug_allergies: string;
    id: string;
    encounter_id: string;
    complaint_responses: Record<string, unknown>;
    created_at: Date;
}>;
export declare function validateIntake(complaint: ComplaintCode, intake: unknown): z.SafeParseReturnType<unknown, unknown>;
//# sourceMappingURL=intake.zod.d.ts.map