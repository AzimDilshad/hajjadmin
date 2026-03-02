import http from "http";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const PORT = Number(process.env.PORT || 4000);
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "hajjumrah_wayfinder";
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

const ROLE_PERMISSIONS = {
  SuperAdmin: ["pilgrims.add", "pilgrims.edit", "pilgrims.delete", "pilgrims.view", "accounts.view", "accounts.add", "accounts.edit", "accounts.delete", "packages.manage", "reports.download", "users.manage"],
  Manager: ["pilgrims.add", "pilgrims.edit", "pilgrims.view", "accounts.view", "packages.manage", "reports.download"],
  Accountant: ["pilgrims.view", "accounts.view", "accounts.add", "accounts.edit", "reports.download"],
  DataEntry: ["pilgrims.add", "pilgrims.view"],
};

const client = new MongoClient(MONGO_URI);
await client.connect();
const db = client.db(MONGO_DB_NAME);

const collections = {
  packages: db.collection("packages"),
  pilgrims: db.collection("pilgrims"),
  passportDetails: db.collection("passportDetails"),
  payments: db.collection("payments"),
  documents: db.collection("documents"),
  leads: db.collection("leads"),
  expenses: db.collection("expenses"),
  medicalReports: db.collection("medicalReports"),
  vaccineTemplates: db.collection("vaccineTemplates"),
  leadConversions: db.collection("leadConversions"),
  users: db.collection("users"),
};

const uid = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 10000)}`;

const LEAD_STATUSES = ["New", "Contacted", "Follow-up Required", "Interested", "Negotiation", "Confirmed", "Converted to Pilgrim", "Not Interested", "Closed"];

async function ensureDefaultUsers() {
  const defaults = [
    { name: "Admin User", email: "admin@goodhope.com", password: "admin123", role: "SuperAdmin" },
    { name: "Branch Manager", email: "manager@goodhope.com", password: "manager123", role: "Manager", branch: "Hyderabad" },
    { name: "Accounts Head", email: "accounts@goodhope.com", password: "acc123", role: "Accountant" },
    { name: "Data Entry Staff", email: "data@goodhope.com", password: "data123", role: "DataEntry", branch: "Bangalore" },
  ];

  for (const u of defaults) {
    const exists = await collections.users.findOne({ email: u.email });
    if (exists) continue;
    const passwordHash = await bcrypt.hash(u.password, 10);
    await collections.users.insertOne({
      id: uid("u"),
      name: u.name,
      email: u.email,
      passwordHash,
      role: u.role,
      branch: u.branch,
      status: "Active",
      lastLogin: null,
    });
  }
}

await ensureDefaultUsers();

function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch { reject(new Error("Invalid JSON payload")); }
    });
  });
}

function sanitizeUser(u) {
  const { _id, passwordHash, password, ...safe } = u;
  return safe;
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

function requireAuth(req) {
  const token = getBearerToken(req);
  if (!token) return { error: "Missing auth token", status: 401 };
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { user: decoded };
  } catch {
    return { error: "Invalid or expired token", status: 401 };
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 200, { ok: true });
  const { url, method } = req;

  try {
    if (url === "/api/health" && method === "GET") return send(res, 200, { ok: true });

    if (url === "/api/auth/login" && method === "POST") {
      const body = await parseBody(req);
      const user = await collections.users.findOne({ email: body.email, status: "Active" });
      if (!user) return send(res, 401, { message: "Invalid credentials" });

      const inputPassword = String(body.password || "");
      let ok = false;

      if (user.passwordHash) {
        ok = await bcrypt.compare(inputPassword, user.passwordHash);
      } else if (user.password) {
        ok = inputPassword === String(user.password);
        if (ok) {
          const passwordHash = await bcrypt.hash(inputPassword, 10);
          await collections.users.updateOne({ id: user.id }, { $set: { passwordHash }, $unset: { password: "" } });
          user.passwordHash = passwordHash;
          delete user.password;
        }
      }

      if (!ok) return send(res, 401, { message: "Invalid credentials" });

      const lastLogin = new Date().toISOString().slice(0, 10);
      await collections.users.updateOne({ id: user.id }, { $set: { lastLogin } });
      const safeUser = sanitizeUser({ ...user, lastLogin });
      const token = jwt.sign({ id: safeUser.id, email: safeUser.email, role: safeUser.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return send(res, 200, { user: safeUser, permissions: ROLE_PERMISSIONS[safeUser.role] || [], token });
    }

    const auth = requireAuth(req);
    if (auth.error) return send(res, auth.status, { message: auth.error });

    if (url === "/api/bootstrap" && method === "GET") {
      const [packages, pilgrims, passportDetails, payments, documents, leads, expenses, medicalReports, vaccineTemplates, leadConversions, users] = await Promise.all([
        collections.packages.find({}).toArray(),
        collections.pilgrims.find({}).toArray(),
        collections.passportDetails.find({}).toArray(),
        collections.payments.find({}).toArray(),
        collections.documents.find({}).toArray(),
        collections.leads.find({}).toArray(),
        collections.expenses.find({}).toArray(),
        collections.medicalReports.find({}).toArray(),
        collections.vaccineTemplates.find({}).toArray(),
        collections.leadConversions.find({}).toArray(),
        collections.users.find({}).toArray(),
      ]);
      return send(res, 200, {
        packages: packages.map(({ _id, ...x }) => ({ ...x, tags: x.tags || [] })),
        pilgrims: pilgrims.map(({ _id, ...x }) => x),
        passportDetails: passportDetails.map(({ _id, ...x }) => x),
        payments: payments.map(({ _id, ...x }) => x),
        documents: documents.map(({ _id, ...x }) => x),
        leads: leads.map(({ _id, ...x }) => x),
        expenses: expenses.map(({ _id, ...x }) => x),
        medicalReports: medicalReports.map(({ _id, ...x }) => x),
        vaccineTemplates: vaccineTemplates.map(({ _id, ...x }) => x),
        leadConversions: leadConversions.map(({ _id, ...x }) => x),
        users: users.map(sanitizeUser),
      });
    }

    if (url === "/api/packages" && method === "POST") {
      const body = await parseBody(req);
      if (!body.package_name || !body.package_type || !body.makkah_hotel || !body.madinah_hotel) return send(res, 400, { message: "Missing required package fields" });
      const record = { id: uid("pkg"), tags: body.tags || [], ...body };
      await collections.packages.insertOne(record);
      return send(res, 201, record);
    }

    if (url?.startsWith("/api/packages/") && method === "PATCH") {
      const id = url.split("/")[3];
      const body = await parseBody(req);
      const pkg = await collections.packages.findOne({ id });
      if (!pkg) return send(res, 404, { message: "Package not found" });
      const updated = { ...pkg, ...body, tags: body.tags || pkg.tags || [] };
      await collections.packages.updateOne({ id }, { $set: updated });
      return send(res, 200, { ...updated, _id: undefined });
    }

    if (url?.startsWith("/api/packages/") && method === "DELETE") {
      const id = url.split("/")[3];
      const assigned = await collections.pilgrims.findOne({ package_id: id });
      if (assigned) return send(res, 400, { message: "Cannot delete package assigned to pilgrims" });
      const result = await collections.packages.deleteOne({ id });
      if (!result.deletedCount) return send(res, 404, { message: "Package not found" });
      return send(res, 200, { ok: true });
    }

    if (url === "/api/pilgrims" && method === "POST") {
      const body = await parseBody(req);
      const count = await collections.pilgrims.countDocuments();
      const record = { id: uid("p"), registration_no: `GH-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`, created_at: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString().slice(0, 10), ...body };
      await collections.pilgrims.insertOne(record);
      if (body.passport_number) {
        await collections.passportDetails.insertOne({ id: uid("pp"), pilgrim_id: record.id, passport_number: body.passport_number, issue_date: body.passport_issue_date || "", expiry_date: body.passport_expiry_date || "", place_of_issue: body.passport_place_of_issue || "" });
      }
      return send(res, 201, record);
    }

    if (url?.startsWith("/api/pilgrims/") && method === "PATCH") {
      const id = url.split("/")[3];
      const body = await parseBody(req);
      const pilgrim = await collections.pilgrims.findOne({ id });
      if (!pilgrim) return send(res, 404, { message: "Pilgrim not found" });
      const updated = { ...pilgrim, ...body, updated_at: new Date().toISOString().slice(0, 10) };
      await collections.pilgrims.updateOne({ id }, { $set: updated });
      if (body.passport_number) {
        const passport = await collections.passportDetails.findOne({ pilgrim_id: id });
        const payload = { passport_number: body.passport_number, issue_date: body.passport_issue_date || passport?.issue_date || "", expiry_date: body.passport_expiry_date || passport?.expiry_date || "", place_of_issue: body.passport_place_of_issue || passport?.place_of_issue || "" };
        if (passport) await collections.passportDetails.updateOne({ pilgrim_id: id }, { $set: payload });
        else await collections.passportDetails.insertOne({ id: uid("pp"), pilgrim_id: id, ...payload });
      }
      return send(res, 200, { ...updated, _id: undefined });
    }

    if (url?.startsWith("/api/pilgrims/") && method === "DELETE") {
      const id = url.split("/")[3];
      const result = await collections.pilgrims.deleteOne({ id });
      if (!result.deletedCount) return send(res, 404, { message: "Pilgrim not found" });
      await Promise.all([
        collections.passportDetails.deleteMany({ pilgrim_id: id }),
        collections.payments.deleteMany({ pilgrim_id: id }),
        collections.documents.deleteMany({ pilgrim_id: id }),
      ]);
      return send(res, 200, { ok: true });
    }


    if (url === "/api/leads" && method === "POST") {
      const body = await parseBody(req);
      if (!body.full_name || !body.mobile || !body.source || !body.interest) return send(res, 400, { message: "Missing required lead fields" });
      const now = new Date().toISOString().slice(0, 10);
      const record = {
        id: uid("ld"),
        status: LEAD_STATUSES.includes(body.status) ? body.status : "New",
        full_name: body.full_name,
        mobile: body.mobile,
        email: body.email || "",
        city: body.city || "",
        source: body.source,
        interest: body.interest,
        budget: body.budget || "",
        notes: body.notes || "",
        assigned_to: body.assigned_to || "",
        follow_up_date: body.follow_up_date || "",
        created_at: now,
        updated_at: now,
      };
      await collections.leads.insertOne(record);
      return send(res, 201, record);
    }

    if (url?.startsWith("/api/leads/") && method === "PATCH") {
      const id = url.split("/")[3];
      const body = await parseBody(req);
      const lead = await collections.leads.findOne({ id });
      if (!lead) return send(res, 404, { message: "Lead not found" });
      const updated = { ...lead, ...body, status: body.status && LEAD_STATUSES.includes(body.status) ? body.status : lead.status, updated_at: new Date().toISOString().slice(0, 10) };
      await collections.leads.updateOne({ id }, { $set: updated });
      return send(res, 200, { ...updated, _id: undefined });
    }

    if (url?.startsWith("/api/leads/") && method === "DELETE") {
      const id = url.split("/")[3];
      const result = await collections.leads.deleteOne({ id });
      if (!result.deletedCount) return send(res, 404, { message: "Lead not found" });
      return send(res, 200, { ok: true });
    }

    if (url?.startsWith("/api/leads/") && url?.endsWith("/convert") && method === "POST") {
      const id = url.split("/")[3];
      const body = await parseBody(req);
      const lead = await collections.leads.findOne({ id });
      if (!lead) return send(res, 404, { message: "Lead not found" });
      if (!body.package_id) return send(res, 400, { message: "package_id is required" });

      const pilgrim = {
        id: uid("p"),
        registration_no: `GH-${new Date().getFullYear()}-${String((await collections.pilgrims.countDocuments()) + 1).padStart(3, "0")}`,
        full_name: lead.full_name,
        passport_name: lead.full_name.toUpperCase(),
        gender: "Male",
        date_of_birth: "",
        mobile: lead.mobile,
        email: lead.email || "",
        address: lead.city || "",
        blood_group: "",
        package_id: body.package_id,
        departure_city: lead.city || "",
        room_type: "Double",
        status: "Registered",
        created_at: new Date().toISOString().slice(0, 10),
        updated_at: new Date().toISOString().slice(0, 10),
      };

      await collections.pilgrims.insertOne(pilgrim);
      await collections.leads.updateOne({ id }, { $set: { status: "Converted to Pilgrim", converted_pilgrim_id: pilgrim.id, package_id: body.package_id, updated_at: new Date().toISOString().slice(0, 10) } });
      const conversion = { id: uid("lch"), lead_id: id, pilgrim_id: pilgrim.id, package_id: body.package_id, converted_at: new Date().toISOString() };
      await collections.leadConversions.insertOne(conversion);

      return send(res, 201, { ok: true, pilgrim, conversion });
    }

    if (url === "/api/payments" && method === "POST") {
      const body = await parseBody(req);
      const record = { id: uid("pay"), ...body };
      await collections.payments.insertOne(record);
      return send(res, 201, record);
    }

    if (url === "/api/expenses" && method === "POST") {
      const body = await parseBody(req);
      if (!body.batch_id || !body.title || body.amount == null) return send(res, 400, { message: "Missing required expense fields" });
      const record = { id: uid("exp"), expense_date: body.expense_date || new Date().toISOString().slice(0, 10), category: body.category || "Other", ...body };
      await collections.expenses.insertOne(record);
      return send(res, 201, record);
    }

    if (url?.startsWith("/api/expenses/") && method === "PATCH") {
      const id = url.split("/")[3];
      const body = await parseBody(req);
      const expense = await collections.expenses.findOne({ id });
      if (!expense) return send(res, 404, { message: "Expense not found" });
      const updated = { ...expense, ...body };
      await collections.expenses.updateOne({ id }, { $set: updated });
      return send(res, 200, { ...updated, _id: undefined });
    }

    if (url?.startsWith("/api/expenses/") && method === "DELETE") {
      const id = url.split("/")[3];
      const result = await collections.expenses.deleteOne({ id });
      if (!result.deletedCount) return send(res, 404, { message: "Expense not found" });
      return send(res, 200, { ok: true });
    }

    if (url?.startsWith("/api/medical-reports/") && method === "PUT") {
      const pilgrimId = url.split("/")[3];
      const body = await parseBody(req);
      const current = await collections.medicalReports.findOne({ pilgrim_id: pilgrimId });
      const height = Number(body.height_cm || current?.height_cm || 0);
      const weight = Number(body.weight_kg || current?.weight_kg || 0);
      const bmi = height > 0 ? Number((weight / ((height / 100) ** 2)).toFixed(1)) : undefined;
      const next = {
        id: current?.id || uid("med"),
        pilgrim_id: pilgrimId,
        created_at: current?.created_at || new Date().toISOString().slice(0, 10),
        updated_at: new Date().toISOString().slice(0, 10),
        ...current,
        ...body,
        bmi,
      };
      await collections.medicalReports.updateOne({ pilgrim_id: pilgrimId }, { $set: next }, { upsert: true });
      return send(res, 200, next);
    }

    if (url === "/api/vaccine-templates" && method === "POST") {
      const body = await parseBody(req);
      if (!body.name) return send(res, 400, { message: "name is required" });
      const record = { id: uid("vac"), name: body.name, mandatory: !!body.mandatory, enabled: body.enabled !== false };
      await collections.vaccineTemplates.insertOne(record);
      return send(res, 201, record);
    }

    if (url?.startsWith("/api/vaccine-templates/") && method === "PATCH") {
      const id = url.split("/")[3];
      const body = await parseBody(req);
      const row = await collections.vaccineTemplates.findOne({ id });
      if (!row) return send(res, 404, { message: "Vaccine template not found" });
      const updated = { ...row, ...body };
      await collections.vaccineTemplates.updateOne({ id }, { $set: updated });
      return send(res, 200, { ...updated, _id: undefined });
    }

    if (url?.startsWith("/api/vaccine-templates/") && method === "DELETE") {
      const id = url.split("/")[3];
      const result = await collections.vaccineTemplates.deleteOne({ id });
      if (!result.deletedCount) return send(res, 404, { message: "Vaccine template not found" });
      return send(res, 200, { ok: true });
    }

    if (url === "/api/documents" && method === "POST") {
      const body = await parseBody(req);
      if (!body.pilgrim_id || !body.name) return send(res, 400, { message: "Missing required document fields" });
      const record = { id: uid("doc"), uploaded_at: new Date().toISOString(), doc_type: body.doc_type || "Other", ...body };
      await collections.documents.insertOne(record);
      return send(res, 201, record);
    }

    if (url?.startsWith("/api/documents/") && method === "DELETE") {
      const id = url.split("/")[3];
      const result = await collections.documents.deleteOne({ id });
      if (!result.deletedCount) return send(res, 404, { message: "Document not found" });
      return send(res, 200, { ok: true });
    }

    if (url === "/api/users" && method === "POST") {
      const body = await parseBody(req);
      if (!body.name || !body.email || !body.role) return send(res, 400, { message: "Missing required user fields" });
      const existing = await collections.users.findOne({ email: body.email });
      if (existing) return send(res, 409, { message: "Email already exists" });
      const passwordHash = await bcrypt.hash("welcome123", 10);
      const record = { id: uid("u"), passwordHash, status: "Active", ...body };
      await collections.users.insertOne(record);
      return send(res, 201, sanitizeUser(record));
    }

    if (url?.startsWith("/api/users/") && url?.endsWith("/status") && method === "PATCH") {
      const id = url.split("/")[3];
      const user = await collections.users.findOne({ id });
      if (!user) return send(res, 404, { message: "User not found" });
      const status = user.status === "Active" ? "Inactive" : "Active";
      await collections.users.updateOne({ id }, { $set: { status } });
      return send(res, 200, sanitizeUser({ ...user, status }));
    }

    if (url?.startsWith("/api/users/") && url?.endsWith("/password") && method === "PATCH") {
      const id = url.split("/")[3];
      const body = await parseBody(req);
      const user = await collections.users.findOne({ id });
      if (!user) return send(res, 404, { message: "User not found" });
      if (!body.password || String(body.password).length < 4) return send(res, 400, { message: "Password too short" });
      const passwordHash = await bcrypt.hash(String(body.password), 10);
      await collections.users.updateOne({ id }, { $set: { passwordHash } });
      return send(res, 200, { ok: true });
    }

    if (url?.startsWith("/api/users/") && method === "PATCH") {
      const id = url.split("/")[3];
      const body = await parseBody(req);
      const user = await collections.users.findOne({ id });
      if (!user) return send(res, 404, { message: "User not found" });
      const next = { ...body };
      delete next.password;
      delete next.passwordHash;
      await collections.users.updateOne({ id }, { $set: next });
      return send(res, 200, sanitizeUser({ ...user, ...next }));
    }

    if (url?.startsWith("/api/users/") && method === "DELETE") {
      const id = url.split("/")[3];
      const result = await collections.users.deleteOne({ id });
      if (!result.deletedCount) return send(res, 404, { message: "User not found" });
      return send(res, 200, { ok: true });
    }

    return send(res, 404, { message: "Not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    const status = message.includes("Invalid JSON") ? 400 : 500;
    return send(res, status, { message });
  }
});

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`MongoDB database: ${MONGO_DB_NAME}`);
});
