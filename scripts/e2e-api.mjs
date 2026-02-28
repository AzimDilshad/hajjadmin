import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.join(__dirname, "..");
const port = 4100;
const base = `http://127.0.0.1:${port}/api`;
const testDbName = `hajjumrah_wayfinder_e2e_${Date.now()}`;

function assert(condition, message) { if (!condition) throw new Error(message); }

async function api(pathname, init = {}, token = "") {
  const headers = { "Content-Type": "application/json", ...(init.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${pathname}`, { headers, ...init });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${init.method || "GET"} ${pathname} failed (${res.status}): ${JSON.stringify(body)}`);
  return body;
}

async function waitForHealth(retries = 40) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const health = await api("/health");
      if (health.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Backend did not become healthy in time");
}

async function main() {
  const server = spawn("node", ["backend/server.js"], {
    cwd: repoRoot,
    env: { ...process.env, PORT: String(port), MONGO_DB_NAME: testDbName },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (d) => process.stdout.write(`[server] ${d}`));
  server.stderr.on("data", (d) => process.stderr.write(`[server-err] ${d}`));

  try {
    await waitForHealth();

    const login = await api("/auth/login", { method: "POST", body: JSON.stringify({ email: "admin@goodhope.com", password: "admin123" }) });
    assert(login.user?.email === "admin@goodhope.com", "Login user mismatch");
    assert(login.token, "JWT token missing in login response");
    const token = login.token;

    const createdPackage = await api("/packages", {
      method: "POST",
      body: JSON.stringify({ package_name: "E2E Umrah", package_type: "Economy", makkah_hotel: "E2E Makkah", madinah_hotel: "E2E Madinah", total_days: 10, base_price: 123456, tags: ["E2E", "Hajj 2026"] }),
    }, token);
    assert(createdPackage.tags.includes("E2E"), "Package tags not saved");

    const updatedPackage = await api(`/packages/${createdPackage.id}`, { method: "PATCH", body: JSON.stringify({ base_price: 130000, tags: ["E2E", "Updated"] }) }, token);
    assert(updatedPackage.base_price === 130000, "Package update failed");

    const createdPilgrim = await api("/pilgrims", {
      method: "POST",
      body: JSON.stringify({ full_name: "E2E Pilgrim", passport_name: "E2E PILGRIM", gender: "Male", date_of_birth: "1992-01-01", mobile: "+91 99999 99999", email: "e2e.pilgrim@example.com", address: "E2E Address", blood_group: "O+", package_id: createdPackage.id, departure_city: "Hyderabad", room_type: "Double", status: "Registered", passport_number: "E2E12345", passport_issue_date: "2023-01-01", passport_expiry_date: "2033-01-01", passport_place_of_issue: "Hyderabad" }),
    }, token);

    const createdPayment = await api("/payments", { method: "POST", body: JSON.stringify({ pilgrim_id: createdPilgrim.id, amount: 50000, payment_date: "2026-02-27", payment_mode: "UPI", reference_no: "E2E-UPI-001", notes: "E2E payment" }) }, token);
    assert(createdPayment.id, "Payment was not created");

    const createdDocument = await api("/documents", { method: "POST", body: JSON.stringify({ pilgrim_id: createdPilgrim.id, name: "passport-copy.pdf", size: "120.0 KB", mime_type: "application/pdf", doc_type: "Passport Copy", data_url: "data:application/pdf;base64,VEVTVA==" }) }, token);
    assert(createdDocument.doc_type === "Passport Copy", "Document type not saved");

    const createdUser = await api("/users", { method: "POST", body: JSON.stringify({ name: "E2E User", email: "e2e.user@goodhope.com", role: "Manager", branch: "E2E Branch" }) }, token);
    const updatedUser = await api(`/users/${createdUser.id}`, { method: "PATCH", body: JSON.stringify({ name: "E2E User Updated", branch: "Updated Branch" }) }, token);
    assert(updatedUser.name.includes("Updated"), "User update failed");

    const passwordResult = await api(`/users/${createdUser.id}/password`, { method: "PATCH", body: JSON.stringify({ password: "newpass123" }) }, token);
    assert(passwordResult.ok, "Password update failed");

    const toggledUser = await api(`/users/${createdUser.id}/status`, { method: "PATCH" }, token);
    assert(toggledUser.status === "Inactive", "User status toggle failed");

    const bootstrap = await api("/bootstrap", {}, token);
    assert(bootstrap.packages.some((p) => p.id === createdPackage.id), "Created package missing from bootstrap");
    assert(bootstrap.pilgrims.some((p) => p.id === createdPilgrim.id), "Created pilgrim missing from bootstrap");
    assert(bootstrap.payments.some((p) => p.id === createdPayment.id), "Created payment missing from bootstrap");
    assert(bootstrap.documents.some((d) => d.id === createdDocument.id), "Created document missing from bootstrap");

    await api(`/users/${createdUser.id}`, { method: "DELETE" }, token);
    await api(`/documents/${createdDocument.id}`, { method: "DELETE" }, token);

    console.log("✅ API E2E flow passed");
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error("❌ API E2E flow failed:", error.message);
  process.exitCode = 1;
});
