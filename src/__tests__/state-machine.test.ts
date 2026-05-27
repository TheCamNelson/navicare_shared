import { describe, expect, it } from "vitest";
import {
  canTransition,
  transitionState,
  InvalidStateTransitionError,
  VALID_TRANSITIONS,
} from "../state-machine/transitions.js";
import { EncounterState } from "../types/encounter.js";
import { ComplaintCode } from "../types/complaint.js";
import { buildEncounter, buildPatient } from "./helpers.js";

describe("state machine transitions", () => {
  it("allows CREATED -> IDENTITY_VERIFIED", () => {
    expect(
      canTransition(EncounterState.CREATED, EncounterState.IDENTITY_VERIFIED),
    ).toBe(true);
  });

  it("rejects CREATED -> COMPLETED", () => {
    expect(canTransition(EncounterState.CREATED, EncounterState.COMPLETED)).toBe(
      false,
    );
  });

  it("rejects CREATED -> INTAKE_IN_PROGRESS (must verify identity first)", () => {
    expect(
      canTransition(EncounterState.CREATED, EncounterState.INTAKE_IN_PROGRESS),
    ).toBe(false);
  });

  it("CREATED -> INTAKE_IN_PROGRESS via transitionState throws", () => {
    const patient = buildPatient();
    const encounter = buildEncounter(patient, ComplaintCode.HEADACHE, {
      state: EncounterState.CREATED,
    });
    expect(() =>
      transitionState(encounter, EncounterState.INTAKE_IN_PROGRESS),
    ).toThrow(InvalidStateTransitionError);
  });

  it("transitionState returns a new immutable encounter", () => {
    const patient = buildPatient();
    const original = buildEncounter(patient, ComplaintCode.HEADACHE, {
      state: EncounterState.CREATED,
    });
    const next = transitionState(original, EncounterState.IDENTITY_VERIFIED);
    expect(next).not.toBe(original);
    expect(next.state).toBe(EncounterState.IDENTITY_VERIFIED);
    expect(original.state).toBe(EncounterState.CREATED);
  });

  it("sets completed_at on COMPLETED", () => {
    const patient = buildPatient();
    const e = buildEncounter(patient, ComplaintCode.HEADACHE, {
      state: EncounterState.HOME_CARE_IN_PROGRESS,
    });
    const completed = transitionState(e, EncounterState.COMPLETED);
    expect(completed.completed_at).toBeInstanceOf(Date);
  });

  it("terminal states have no outgoing transitions", () => {
    expect(VALID_TRANSITIONS[EncounterState.COMPLETED]).toEqual([]);
    expect(VALID_TRANSITIONS[EncounterState.ABANDONED]).toEqual([]);
    expect(VALID_TRANSITIONS[EncounterState.REJECTED]).toEqual([]);
  });
});
