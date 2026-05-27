import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStore, resetStore } from "../store/memory-store.js";
import { ComplaintCode } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";
import { InsuranceStatus } from "../types/patient.js";
import { QueueFlag } from "../types/queue.js";

beforeEach(() => {
  resetStore();
});

describe("in-memory store", () => {
  it("creates and retrieves a patient", async () => {
    const store = new InMemoryStore();
    const p = await store.createPatient({
      first_name: "Test",
      last_name: "User",
      date_of_birth: new Date("1990-05-15"),
      phone: "4165550100",
      email: "test@example.com",
      postal_code: "M5V 1A1",
      insurance_status: InsuranceStatus.OHIP_ACTIVE,
    });
    expect(p.id).toBeTruthy();
    expect(p.age).toBeGreaterThan(30);
    const found = await store.getPatient(p.id);
    expect(found?.id).toBe(p.id);
  });

  it("finds patient by email (case insensitive)", async () => {
    const store = new InMemoryStore();
    await store.createPatient({
      first_name: "Find",
      last_name: "Me",
      date_of_birth: new Date("1990-01-01"),
      phone: "4165550000",
      email: "Find@Example.COM",
      postal_code: "M5V 1A1",
    });
    const found = await store.findPatientByEmail("find@example.com");
    expect(found).not.toBeNull();
    expect(found?.email).toBe("Find@Example.COM");
  });

  it("creates an encounter, enqueues, assigns clinician, lists queue", async () => {
    const store = new InMemoryStore();
    const p = await store.createPatient({
      first_name: "Q",
      last_name: "Patient",
      date_of_birth: new Date("1985-01-01"),
      phone: "4165550111",
      postal_code: "M5V 1A1",
    });
    const enc = await store.createEncounter({
      patient_id: p.id,
      complaint_code: ComplaintCode.HEADACHE,
    });
    expect(enc.id).toBeTruthy();

    const entry = await store.enqueue(enc.id, CTASLevel.LEVEL_3, [
      QueueFlag.REPEAT_VISIT,
    ]);
    expect(entry.status).toBe("WAITING");

    const clinicians = await store.listClinicians();
    expect(clinicians.length).toBeGreaterThanOrEqual(2);

    const assigned = await store.assignQueue(entry.id, clinicians[0]!.id);
    expect(assigned.status).toBe("ASSIGNED");
    expect(assigned.assigned_clinician_id).toBe(clinicians[0]!.id);

    const assignedList = await store.listQueue({ status: "ASSIGNED" });
    expect(assignedList.length).toBe(1);
  });

  it("queue list is sorted by priority", async () => {
    const store = new InMemoryStore();
    const p = await store.createPatient({
      first_name: "Q",
      last_name: "P",
      date_of_birth: new Date("1985-01-01"),
      phone: "4165550111",
      postal_code: "M5V 1A1",
    });
    const enc1 = await store.createEncounter({ patient_id: p.id });
    const enc2 = await store.createEncounter({ patient_id: p.id });
    const enc3 = await store.createEncounter({ patient_id: p.id });
    await store.enqueue(enc1.id, CTASLevel.LEVEL_4, []);
    await store.enqueue(enc2.id, CTASLevel.LEVEL_2, []);
    await store.enqueue(enc3.id, CTASLevel.LEVEL_3, []);
    const queue = await store.listQueue({ status: "WAITING" });
    expect(queue[0]!.ctas_level).toBe(CTASLevel.LEVEL_2);
  });

  it("subscribe callback fires on create", async () => {
    const store = new InMemoryStore();
    let calls = 0;
    const unsub = store.subscribe("patient", () => {
      calls += 1;
    });
    await store.createPatient({
      first_name: "Sub",
      last_name: "Test",
      date_of_birth: new Date("1990-01-01"),
      phone: "4165550000",
      postal_code: "M5V 1A1",
    });
    expect(calls).toBe(1);
    unsub();
    await store.createPatient({
      first_name: "After",
      last_name: "Unsub",
      date_of_birth: new Date("1990-01-01"),
      phone: "4165550000",
      postal_code: "M5V 1A1",
    });
    expect(calls).toBe(1);
  });

  it("appendMessage and listMessages", async () => {
    const store = new InMemoryStore();
    const p = await store.createPatient({
      first_name: "Msg",
      last_name: "Test",
      date_of_birth: new Date("1985-01-01"),
      phone: "4165550111",
      postal_code: "M5V 1A1",
    });
    const enc = await store.createEncounter({ patient_id: p.id });
    await store.appendMessage(enc.id, {
      sender: "BOT",
      text: "Hello",
    });
    await store.appendMessage(enc.id, {
      sender: "PATIENT",
      text: "Hi",
    });
    const msgs = await store.listMessages(enc.id);
    expect(msgs.length).toBe(2);
    expect(msgs[0]!.text).toBe("Hello");
  });
});
