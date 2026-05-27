import { z } from "zod";
import { ComplaintCode } from "../types/complaint.js";
import {
  ONSET_OPTIONS,
  TRAJECTORY_OPTIONS,
  COMORBIDITY_OPTIONS,
} from "../complaints/baseline-questions.js";

const tuple = <T extends string>(arr: readonly T[]) =>
  arr as unknown as [T, ...T[]];

export const BaselineSchema = z.object({
  onset: z.enum(tuple(ONSET_OPTIONS)),
  pain_level: z.number().int().min(1).max(10),
  trajectory: z.enum(tuple(TRAJECTORY_OPTIONS)),
  comorbidities: z.array(z.enum(tuple(COMORBIDITY_OPTIONS))),
  current_medications: z.string(),
  recent_visit: z.boolean(),
  drug_allergies: z.string(),
});

const yesNo = z.union([z.literal("Yes"), z.literal("No"), z.boolean()]);

// Chest Pain
const ChestPainResponses = z.object({
  pain_location: z.enum(["Center", "Left side", "Right side", "All over"]),
  pain_character: z.enum([
    "Sharp-stabbing",
    "Pressure-squeezing",
    "Burning",
    "Aching",
    "Tearing",
  ]),
  radiation: z.array(
    z.enum(["Left arm", "Right arm", "Jaw", "Back", "Neck", "Nowhere"]),
  ),
  positional: yesNo,
  associated: z.array(
    z.enum([
      "Sweating",
      "Nausea-Vomiting",
      "Dizziness",
      "Palpitations",
      "Feeling of doom",
      "None",
    ]),
  ),
  heart_history: yesNo,
  recent_immobility: yesNo,
  shortness_of_breath: yesNo,
});

const AbdominalResponses = z.object({
  location: z.enum([
    "Upper right",
    "Upper left",
    "Upper center",
    "Lower right",
    "Lower left",
    "Lower center",
    "All over",
  ]),
  pain_character: z.enum(["Sharp", "Crampy", "Dull-aching", "Burning", "Colicky"]),
  vomiting: z.enum([
    "No",
    "Yes once-twice",
    "Yes multiple times",
    "Yes, with blood",
  ]),
  blood_stool: yesNo,
  diarrhea: z.enum(["No", "Non-bloody", "Bloody"]),
  eating_status: z.enum(["Yes normally", "Reduced", "Unable to keep anything down"]),
  abdomen_rigid: yesNo,
  pregnancy_possible: z.enum(["Yes", "No", "N/A"]),
  fever: z.enum(["Yes", "No", "Not sure"]),
  recent_surgery: yesNo,
});

const HeadacheResponses = z.object({
  severity: z.enum(["Worst of my life", "Severe", "Moderate", "Mild"]),
  onset_type: z.enum(["Sudden (seconds-minutes)", "Gradual (hours)"]),
  stiff_neck: yesNo,
  fever: yesNo,
  vision_changes: z.array(
    z.enum(["Blurry", "Double", "Vision loss", "Spots-aura", "None"]),
  ),
  weakness_one_side: yesNo,
  speech_difficulty: yesNo,
  head_injury: yesNo,
  migraine_history: yesNo,
  different_from_usual: z.enum(["Yes", "No", "Don't usually get headaches"]),
  seizure: yesNo,
});

const MentalHealthResponses = z.object({
  concern_type: z.enum([
    "Anxiety-Panic",
    "Depression",
    "Crisis",
    "Psychosis",
    "Substance Use",
    "Other",
  ]),
  thoughts_self_harm: yesNo,
  thoughts_harm_others: yesNo,
  plan_to_harm: yesNo,
  feel_safe: yesNo,
  substance_use: yesNo,
  overdose: yesNo,
  mh_provider: yesNo,
  symptom_duration: z.enum(["Hours", "Days", "Weeks", "Months"]),
  daily_activities: z.enum(["Yes", "Somewhat", "Not at all"]),
});

// Permissive schemas for complaints we don't fully constrain; they accept any shape
// (still validated downstream by the engine which is forgiving of missing fields).
const PermissiveResponses = z.record(z.unknown());

export const ComplaintResponseSchemas: Record<ComplaintCode, z.ZodTypeAny> = {
  [ComplaintCode.CHEST_PAIN]: ChestPainResponses,
  [ComplaintCode.ABDOMINAL]: AbdominalResponses,
  [ComplaintCode.HEADACHE]: HeadacheResponses,
  [ComplaintCode.FEVER]: PermissiveResponses,
  [ComplaintCode.BREATHING]: PermissiveResponses,
  [ComplaintCode.INJURY]: PermissiveResponses,
  [ComplaintCode.ALLERGIC]: PermissiveResponses,
  [ComplaintCode.MENTAL_HEALTH]: MentalHealthResponses,
  [ComplaintCode.PEDIATRIC]: PermissiveResponses,
  [ComplaintCode.SKIN_WOUND]: PermissiveResponses,
  [ComplaintCode.BACK_JOINT]: PermissiveResponses,
  [ComplaintCode.URINARY_REPRO]: PermissiveResponses,
  [ComplaintCode.EYE_ENT]: PermissiveResponses,
  [ComplaintCode.OTHER]: PermissiveResponses,
};

export const IntakeDataSchema = z.object({
  id: z.string(),
  encounter_id: z.string(),
  onset: BaselineSchema.shape.onset,
  pain_level: BaselineSchema.shape.pain_level,
  trajectory: BaselineSchema.shape.trajectory,
  comorbidities: BaselineSchema.shape.comorbidities,
  current_medications: BaselineSchema.shape.current_medications,
  recent_visit: BaselineSchema.shape.recent_visit,
  drug_allergies: BaselineSchema.shape.drug_allergies,
  complaint_responses: PermissiveResponses,
  created_at: z.date(),
});

export function validateIntake(
  complaint: ComplaintCode,
  intake: unknown,
): z.SafeParseReturnType<unknown, unknown> {
  const result = IntakeDataSchema.safeParse(intake);
  if (!result.success) return result;
  const responseSchema = ComplaintResponseSchemas[complaint];
  return responseSchema.safeParse(result.data.complaint_responses);
}
