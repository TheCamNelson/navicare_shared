import fs from "node:fs";
import path from "node:path";
import os from "node:os";
const DATE_KEYS = new Set([
    "created_at",
    "updated_at",
    "completed_at",
    "abandoned_at",
    "date_of_birth",
    "entered_queue_at",
    "assigned_at",
    "reviewed_at",
    "follow_up_at",
]);
function reviveDates(value) {
    if (value === null || value === undefined)
        return value;
    if (Array.isArray(value))
        return value.map(reviveDates);
    if (typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            if (DATE_KEYS.has(k) && typeof v === "string") {
                out[k] = new Date(v);
            }
            else {
                out[k] = reviveDates(v);
            }
        }
        return out;
    }
    return value;
}
function defaultPath() {
    const env = process.env.NAVICARE_STORE_PATH;
    if (env)
        return env;
    return path.join(os.tmpdir(), "navicare-store.json");
}
export function attachFilePersistence(store, filePath = defaultPath()) {
    // Load existing snapshot if present
    try {
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, "utf8");
            const snap = JSON.parse(raw);
            const m = store;
            const load = (target, entries) => {
                if (!entries)
                    return;
                target.clear();
                for (const [k, v] of entries)
                    target.set(k, reviveDates(v));
            };
            load(m.patients, snap.patients);
            load(m.encounters, snap.encounters);
            load(m.intakes, snap.intakes);
            load(m.triageResults, snap.triageResults);
            load(m.queue, snap.queue);
            load(m.reviews, snap.reviews);
            load(m.clinicians, snap.clinicians);
            if (snap.messages) {
                m.messages.clear();
                for (const [k, v] of snap.messages) {
                    m.messages.set(k, v.map(reviveDates));
                }
            }
        }
    }
    catch (err) {
        // Corrupt file? Start fresh.
        console.warn(`[navicare-store] failed to load ${filePath}:`, err);
    }
    // Save snapshot helper
    const save = () => {
        try {
            const m = store;
            const snap = {
                patients: Array.from(m.patients.entries()),
                encounters: Array.from(m.encounters.entries()),
                intakes: Array.from(m.intakes.entries()),
                triageResults: Array.from(m.triageResults.entries()),
                queue: Array.from(m.queue.entries()),
                reviews: Array.from(m.reviews.entries()),
                messages: Array.from(m.messages.entries()),
                clinicians: Array.from(m.clinicians.entries()),
            };
            const tmp = `${filePath}.tmp`;
            fs.writeFileSync(tmp, JSON.stringify(snap, null, 2));
            fs.renameSync(tmp, filePath);
        }
        catch (err) {
            console.warn(`[navicare-store] failed to persist ${filePath}:`, err);
        }
    };
    // Hook into store subscribers — persist on every event
    for (const table of [
        "patient",
        "encounter",
        "intake",
        "triage",
        "queue",
        "review",
        "message",
    ]) {
        store.subscribe(table, () => save());
    }
    // Persist immediately to lock in the seeded clinicians
    save();
    // Lightweight cross-process reload: re-read file before each operation.
    // We do this by wrapping the maps' get operations via a Proxy on the store.
    // Simpler: expose a manual `reloadFromDisk()` and call it from getStore() each time.
    // For simplicity in MVP, we re-load on every getStore() call (see below).
    store.reloadFromDisk = () => {
        try {
            if (!fs.existsSync(filePath))
                return;
            const raw = fs.readFileSync(filePath, "utf8");
            const snap = JSON.parse(raw);
            const m = store;
            const load = (target, entries) => {
                if (!entries)
                    return;
                target.clear();
                for (const [k, v] of entries)
                    target.set(k, reviveDates(v));
            };
            load(m.patients, snap.patients);
            load(m.encounters, snap.encounters);
            load(m.intakes, snap.intakes);
            load(m.triageResults, snap.triageResults);
            load(m.queue, snap.queue);
            load(m.reviews, snap.reviews);
            load(m.clinicians, snap.clinicians);
            if (snap.messages) {
                m.messages.clear();
                for (const [k, v] of snap.messages) {
                    m.messages.set(k, v.map(reviveDates));
                }
            }
        }
        catch {
            // ignore
        }
    };
}
//# sourceMappingURL=file-persistence.js.map