import { describe, expect, it } from "vitest";
import { runTriage } from "../triage/engine.js";
import { ComplaintCode } from "../types/complaint.js";
import { CTASLevel, PathwayType } from "../types/triage.js";
import { AgeGroup } from "../types/patient.js";
import { buildEncounter, buildIntake, buildPatient } from "./helpers.js";

describe("triage engine — Chest Pain", () => {
  it("ACS: pressure-squeezing + radiation to left arm + sweating → CTAS 2, ED", () => {
    const patient = buildPatient({ age: 55 });
    const encounter = buildEncounter(patient, ComplaintCode.CHEST_PAIN);
    const intake = buildIntake(
      encounter.id,
      { pain_level: 8, onset: "1-6 hours", trajectory: "Same" },
      {
        pain_location: "Center",
        pain_character: "Pressure-squeezing",
        radiation: ["Left arm"],
        positional: "No",
        associated: ["Sweating"],
        heart_history: "No",
        recent_immobility: "No",
        shortness_of_breath: "No",
      },
    );

    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBe(CTASLevel.LEVEL_2);
    expect(result.recommended_pathway).toBe(PathwayType.EMERGENCY_DEPARTMENT);
    expect(
      result.second_order_modifiers.some((m) => m.name === "high_suspicion_ACS"),
    ).toBe(true);
  });

  it("Aortic dissection: tearing + sudden onset → CTAS 2", () => {
    const patient = buildPatient({ age: 60 });
    const encounter = buildEncounter(patient, ComplaintCode.CHEST_PAIN);
    const intake = buildIntake(
      encounter.id,
      { pain_level: 9, onset: "< 1 hour", trajectory: "Worse" },
      {
        pain_character: "Tearing",
        radiation: ["Back"],
        positional: "No",
        associated: ["None"],
        heart_history: "No",
        recent_immobility: "No",
        shortness_of_breath: "No",
      },
    );

    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBeLessThanOrEqual(CTASLevel.LEVEL_2);
  });

  it("Mild positional chest pain, pain 3 → CTAS 4 or 5, urgent care or home", () => {
    const patient = buildPatient({ age: 28 });
    const encounter = buildEncounter(patient, ComplaintCode.CHEST_PAIN);
    const intake = buildIntake(
      encounter.id,
      { pain_level: 3, onset: "1-3 days", trajectory: "Better" },
      {
        pain_character: "Sharp-stabbing",
        radiation: ["Nowhere"],
        positional: "Yes",
        associated: ["None"],
        heart_history: "No",
        recent_immobility: "No",
        shortness_of_breath: "No",
      },
    );

    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBeGreaterThanOrEqual(CTASLevel.LEVEL_4);
    expect([
      PathwayType.URGENT_CARE,
      PathwayType.HOME_CARE,
    ]).toContain(result.recommended_pathway);
  });
});

describe("triage engine — Headache", () => {
  it("SAH suspected: worst-ever + sudden onset → CTAS 1 or 2", () => {
    const patient = buildPatient({ age: 45 });
    const encounter = buildEncounter(patient, ComplaintCode.HEADACHE);
    const intake = buildIntake(
      encounter.id,
      { pain_level: 10, onset: "< 1 hour", trajectory: "Worse" },
      {
        severity: "Worst of my life",
        onset_type: "Sudden (seconds-minutes)",
        stiff_neck: "No",
        fever: "No",
        vision_changes: ["None"],
        weakness_one_side: "No",
        speech_difficulty: "No",
        head_injury: "No",
        migraine_history: "No",
        different_from_usual: "Yes",
        seizure: "No",
      },
    );

    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBeLessThanOrEqual(CTASLevel.LEVEL_2);
  });

  it("Stroke: weakness one side + speech difficulty → CTAS 1, ED_DIRECT (global red flag)", () => {
    const patient = buildPatient({ age: 70, age_group: AgeGroup.SENIOR });
    const encounter = buildEncounter(patient, ComplaintCode.HEADACHE);
    const intake = buildIntake(
      encounter.id,
      {},
      {
        severity: "Severe",
        onset_type: "Sudden (seconds-minutes)",
        weakness_one_side: "Yes",
        speech_difficulty: "Yes",
        stiff_neck: "No",
        fever: "No",
        vision_changes: ["None"],
        head_injury: "No",
        migraine_history: "No",
        different_from_usual: "Yes",
        seizure: "No",
      },
    );
    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBe(CTASLevel.LEVEL_1);
    expect(result.recommended_pathway).toBe(PathwayType.ED_DIRECT);
    expect(result.bypass_queue).toBe(true);
    expect(result.global_red_flags_triggered).toContain("suspected_stroke");
  });
});

describe("triage engine — Mental Health", () => {
  it("Plan to harm self → CTAS 1, ED_DIRECT, bypass queue", () => {
    const patient = buildPatient({ age: 30 });
    const encounter = buildEncounter(patient, ComplaintCode.MENTAL_HEALTH);
    const intake = buildIntake(
      encounter.id,
      {},
      {
        concern_type: "Crisis",
        thoughts_self_harm: "Yes",
        thoughts_harm_others: "No",
        plan_to_harm: "Yes",
        feel_safe: "No",
        substance_use: "No",
        overdose: "No",
        mh_provider: "No",
        symptom_duration: "Days",
        daily_activities: "Not at all",
      },
    );

    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBe(CTASLevel.LEVEL_1);
    expect(result.recommended_pathway).toBe(PathwayType.ED_DIRECT);
    expect(result.bypass_queue).toBe(true);
    expect(result.global_red_flags_triggered).toContain("active_suicidal_plan");
  });

  it("Suicidal ideation without plan → minimum CTAS 2, ED", () => {
    const patient = buildPatient({ age: 25 });
    const encounter = buildEncounter(patient, ComplaintCode.MENTAL_HEALTH);
    const intake = buildIntake(
      encounter.id,
      {},
      {
        concern_type: "Depression",
        thoughts_self_harm: "Yes",
        thoughts_harm_others: "No",
        plan_to_harm: "No",
        feel_safe: "Yes",
        substance_use: "No",
        overdose: "No",
        mh_provider: "Yes",
        symptom_duration: "Weeks",
        daily_activities: "Somewhat",
      },
    );

    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBe(CTASLevel.LEVEL_2);
    expect(result.recommended_pathway).toBe(PathwayType.EMERGENCY_DEPARTMENT);
  });
});

describe("triage engine — Allergic / Anaphylaxis", () => {
  it("Tongue swelling + breathing difficulty → CTAS 1 (global red flag)", () => {
    const patient = buildPatient({ age: 40 });
    const encounter = buildEncounter(patient, ComplaintCode.ALLERGIC);
    const intake = buildIntake(
      encounter.id,
      { pain_level: 5, onset: "< 1 hour", trajectory: "Worse" },
      {
        exposure_source: "Food",
        time_since_exposure: "< 30 minutes",
        swelling_location: ["Tongue", "Lips"],
        breathing_trouble: "Yes",
        dizzy_faint: "Yes",
        hives: "Widespread",
        epipen: "Haven't used it",
        previous_severe: "Yes",
        gi_symptoms: "Yes",
        reaction_trajectory: "Worse",
      },
    );
    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBe(CTASLevel.LEVEL_1);
    expect(result.global_red_flags_triggered).toContain("anaphylaxis");
  });

  it("Mild localized allergic reaction, improving → CTAS 5, Home Care", () => {
    const patient = buildPatient({ age: 30 });
    const encounter = buildEncounter(patient, ComplaintCode.ALLERGIC);
    const intake = buildIntake(
      encounter.id,
      { pain_level: 2, onset: "3-7 days", trajectory: "Better" },
      {
        exposure_source: "Insect sting",
        time_since_exposure: "2-6 hours",
        swelling_location: ["None"],
        breathing_trouble: "No",
        dizzy_faint: "No",
        hives: "Localized",
        epipen: "Don't have one",
        previous_severe: "No",
        gi_symptoms: "No",
        reaction_trajectory: "Improving",
      },
    );
    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBe(CTASLevel.LEVEL_5);
    expect(result.recommended_pathway).toBe(PathwayType.HOME_CARE);
  });
});

describe("triage engine — Abdominal", () => {
  it("Rigid abdomen → CTAS 2", () => {
    const patient = buildPatient({ age: 50 });
    const encounter = buildEncounter(patient, ComplaintCode.ABDOMINAL);
    const intake = buildIntake(
      encounter.id,
      { pain_level: 8, onset: "1-6 hours", trajectory: "Worse" },
      {
        location: "Lower right",
        pain_character: "Sharp",
        vomiting: "Yes multiple times",
        blood_stool: "No",
        diarrhea: "No",
        eating_status: "Unable to keep anything down",
        abdomen_rigid: "Yes",
        pregnancy_possible: "N/A",
        fever: "Yes",
        recent_surgery: "No",
      },
    );
    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBe(CTASLevel.LEVEL_2);
  });

  it("Pregnant + mild abdominal pain → minimum CTAS 3 (population modifier)", () => {
    const patient = buildPatient({ age: 28 });
    const encounter = buildEncounter(patient, ComplaintCode.ABDOMINAL);
    const intake = buildIntake(
      encounter.id,
      {
        pain_level: 3,
        onset: "1-3 days",
        trajectory: "Better",
        comorbidities: ["Pregnancy"],
      },
      {
        location: "Lower center",
        pain_character: "Crampy",
        vomiting: "No",
        blood_stool: "No",
        diarrhea: "No",
        eating_status: "Yes normally",
        abdomen_rigid: "No",
        pregnancy_possible: "Yes",
        fever: "No",
        recent_surgery: "No",
      },
    );
    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBeLessThanOrEqual(CTASLevel.LEVEL_3);
  });
});

describe("triage engine — Pediatric", () => {
  it("Infant <3mo with fever 38.5 → CTAS 1 (neonatal fever global flag)", () => {
    const patient = buildPatient({ age: 0, age_group: AgeGroup.INFANT });
    const encounter = buildEncounter(patient, ComplaintCode.PEDIATRIC, {
      is_pediatric_flag: true,
    });
    const intake = buildIntake(
      encounter.id,
      { pain_level: 5, onset: "< 1 hour", trajectory: "Worse" },
      {
        child_age_years: 0,
        child_age_months: 2,
        consciousness: "Drowsy but rousable",
        feeding: "Reduced",
        rash_type: "No",
        seizures: "No",
        vaccinations: "Yes",
        fever: "Yes",
        temperature: 38.5,
        vomiting_diarrhea: "No",
        inconsolable_crying: "No",
        parent_gut_instinct: "Yes",
      },
    );
    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBe(CTASLevel.LEVEL_1);
    expect(result.global_red_flags_triggered).toContain("neonatal_fever");
  });

  it("Non-blanching rash + fever in child → CTAS 1 (meningococcal)", () => {
    const patient = buildPatient({ age: 5, age_group: AgeGroup.PEDIATRIC });
    const encounter = buildEncounter(patient, ComplaintCode.PEDIATRIC, {
      is_pediatric_flag: true,
    });
    const intake = buildIntake(
      encounter.id,
      {},
      {
        child_age_years: 5,
        consciousness: "Normal",
        feeding: "Reduced",
        rash_type: "Yes, non-blanching (doesn't fade)",
        seizures: "No",
        vaccinations: "Yes",
        fever: "Yes",
        temperature: 39.0,
        vomiting_diarrhea: "No",
        inconsolable_crying: "No",
        parent_gut_instinct: "Yes",
      },
    );
    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBe(CTASLevel.LEVEL_1);
    expect(result.global_red_flags_triggered).toContain("meningococcal_rash");
  });
});

describe("triage engine — Back / Joint", () => {
  it("Cauda equina: back pain + bladder/bowel → CTAS 1", () => {
    const patient = buildPatient({ age: 50 });
    const encounter = buildEncounter(patient, ComplaintCode.BACK_JOINT);
    const intake = buildIntake(
      encounter.id,
      {},
      {
        location: "Lower back",
        preceding_injury: "Yes",
        numbness: "Yes",
        bladder_bowel: "Yes",
        joint_swollen: "No",
        fever: "No",
        can_walk: "No",
        weakness: "Yes",
        bilateral_weakness: "Yes",
        cancer_history: "No",
        weight_loss: "No",
      },
    );
    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBe(CTASLevel.LEVEL_1);
    expect(result.global_red_flags_triggered).toContain("cauda_equina");
  });
});

describe("triage engine — Urinary / Reproductive", () => {
  it("Testicular pain + sudden onset → CTAS 1 (global red flag)", () => {
    const patient = buildPatient({ age: 22 });
    const encounter = buildEncounter(patient, ComplaintCode.URINARY_REPRO);
    const intake = buildIntake(
      encounter.id,
      { pain_level: 9, onset: "< 1 hour", trajectory: "Worse" },
      {
        concern_type: "Testicular pain",
        fever: "No",
        flank_pain: "No",
        pregnant: "N/A",
        sudden_onset: "Yes",
        nausea_vomiting: "Yes",
        symptom_duration: "< 24 hours",
      },
    );
    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBe(CTASLevel.LEVEL_1);
    expect(result.global_red_flags_triggered).toContain("testicular_torsion");
  });

  it("Pregnant 25 weeks + heavy bleeding → CTAS 1 (late pregnancy bleeding)", () => {
    const patient = buildPatient({ age: 30 });
    const encounter = buildEncounter(patient, ComplaintCode.URINARY_REPRO);
    const intake = buildIntake(
      encounter.id,
      { comorbidities: ["Pregnancy"] },
      {
        concern_type: "Pregnancy-related bleeding",
        fever: "No",
        flank_pain: "No",
        pregnant: "Yes",
        weeks_pregnant: 25,
        bleeding_severity: "Heavy (soaking pad per hour)",
        nausea_vomiting: "No",
        symptom_duration: "< 24 hours",
      },
    );
    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBe(CTASLevel.LEVEL_1);
    expect(result.global_red_flags_triggered).toContain("late_pregnancy_bleeding");
  });

  it("Simple UTI, no fever, no flank pain → CTAS 4 or 5, Home Care", () => {
    const patient = buildPatient({ age: 32 });
    const encounter = buildEncounter(patient, ComplaintCode.URINARY_REPRO);
    const intake = buildIntake(
      encounter.id,
      { pain_level: 3, onset: "1-3 days", trajectory: "Same" },
      {
        concern_type: "Urinary symptoms",
        fever: "No",
        flank_pain: "No",
        pregnant: "No",
        nausea_vomiting: "No",
        symptom_duration: "1-3 days",
      },
    );
    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBeGreaterThanOrEqual(CTASLevel.LEVEL_4);
    expect([PathwayType.HOME_CARE, PathwayType.URGENT_CARE]).toContain(
      result.recommended_pathway,
    );
  });
});

describe("triage engine — Breathing", () => {
  it("Can barely breathe → CTAS 1", () => {
    const patient = buildPatient({ age: 60 });
    const encounter = buildEncounter(patient, ComplaintCode.BREATHING);
    const intake = buildIntake(
      encounter.id,
      { pain_level: 7, onset: "< 1 hour", trajectory: "Worse" },
      {
        breathing_severity: "Can barely breathe",
        onset_type: "Suddenly (minutes)",
        wheezing: "Yes",
        chest_pain: "Yes",
        cyanosis: "Yes",
        asthma_copd_history: "Asthma",
        inhaler_response: "No improvement",
        leg_swelling: "No",
        fever_cough: "Neither",
        lie_flat: "No",
        heart_failure: "No",
      },
    );
    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBe(CTASLevel.LEVEL_1);
  });
});

describe("triage engine — Population modifiers", () => {
  it("Elderly 82 + chest pain even mild → minimum CTAS 3 (age escalation)", () => {
    const patient = buildPatient({ age: 82, age_group: AgeGroup.ELDERLY });
    const encounter = buildEncounter(patient, ComplaintCode.CHEST_PAIN);
    const intake = buildIntake(
      encounter.id,
      { pain_level: 3, onset: "1-3 days", trajectory: "Better" },
      {
        pain_character: "Aching",
        radiation: ["Nowhere"],
        positional: "Yes",
        associated: ["None"],
        heart_history: "No",
        recent_immobility: "No",
        shortness_of_breath: "No",
      },
    );
    const result = runTriage({ encounter, intake, patient });
    expect(result.final_ctas_level).toBeLessThanOrEqual(CTASLevel.LEVEL_3);
    expect(
      result.population_modifiers_applied.some((m) =>
        m.name.startsWith("age_"),
      ),
    ).toBe(true);
  });

  it("Repeat visit + same complaint within 7d → escalated by 1", () => {
    const patient = buildPatient({ age: 35 });
    const encounter = buildEncounter(patient, ComplaintCode.HEADACHE);
    const intake = buildIntake(
      encounter.id,
      {
        pain_level: 5,
        onset: "1-3 days",
        trajectory: "Same",
        recent_visit: true,
      },
      {
        severity: "Moderate",
        onset_type: "Gradual (hours)",
        stiff_neck: "No",
        fever: "No",
        vision_changes: ["None"],
        weakness_one_side: "No",
        speech_difficulty: "No",
        head_injury: "No",
        migraine_history: "Yes",
        different_from_usual: "No",
        seizure: "No",
      },
    );
    const result = runTriage({ encounter, intake, patient });
    expect(
      result.population_modifiers_applied.some((m) => m.name === "repeat_visit"),
    ).toBe(true);
  });
});
