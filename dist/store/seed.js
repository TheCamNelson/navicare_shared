import { InsuranceStatus } from "../types/patient.js";
export const seedPatients = [
    {
        first_name: "Alice",
        last_name: "Anderson",
        date_of_birth: new Date("1985-04-12"),
        phone: "4165551234",
        email: "alice@example.com",
        postal_code: "M5V 2T6",
        insurance_status: InsuranceStatus.OHIP_ACTIVE,
        preferred_language: "en",
    },
    {
        first_name: "Bobby",
        last_name: "Baker",
        date_of_birth: new Date("2024-09-20"), // infant
        phone: "4165555555",
        postal_code: "M4Y 1P3",
        insurance_status: InsuranceStatus.OHIP_ACTIVE,
        preferred_language: "en",
    },
    {
        first_name: "Cleo",
        last_name: "Choi",
        date_of_birth: new Date("1940-01-01"), // elderly
        phone: "4165557777",
        postal_code: "L4V 1B7",
        insurance_status: InsuranceStatus.OHIP_ACTIVE,
        preferred_language: "en",
    },
];
export async function seedDeterministicPatients(store) {
    for (const p of seedPatients) {
        const existing = p.email ? await store.findPatientByEmail(p.email) : null;
        if (!existing) {
            await store.createPatient(p);
        }
    }
}
//# sourceMappingURL=seed.js.map