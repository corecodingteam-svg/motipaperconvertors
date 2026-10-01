import { Router } from "express";
import { z } from "zod";
import db from "../db/knex.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { requireTenant } from "../middleware/tenantScope.js";

const router = Router();
router.use(requireTenant);

const NameSchema = z.object({ name: z.string().min(1) });

// ── Job Types ─────────────────────────────────────────────────────────────────

router.get("/job-types", requirePermission("settings.view"), async (req, res) => {
  const rows = await db("tenant_settings")
    .where({ tenant_id: req.user.tenantId!, key: "job_type" })
    .orderBy("created_at", "asc")
    .select("id", "value as name", "tenant_id");
  res.json(rows);
});

router.post("/job-types", requirePermission("settings.edit"), async (req, res) => {
  const parsed = NameSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [row] = await db("tenant_settings")
    .insert({ tenant_id: req.user.tenantId!, key: "job_type", value: parsed.data.name })
    .returning(["id", "value as name", "tenant_id"]);
  res.status(201).json(row);
});

router.delete("/job-types/:id", requirePermission("settings.edit"), async (req, res) => {
  await db("tenant_settings")
    .where({ id: req.params.id, tenant_id: req.user.tenantId!, key: "job_type" })
    .delete();
  res.json({ ok: true });
});

// ── Print Colors ──────────────────────────────────────────────────────────────

router.get("/print-colors", requirePermission("settings.view"), async (req, res) => {
  const rows = await db("tenant_settings")
    .where({ tenant_id: req.user.tenantId!, key: "print_color" })
    .orderBy("created_at", "asc")
    .select("id", "value as name", "tenant_id");
  res.json(rows);
});

router.post("/print-colors", requirePermission("settings.edit"), async (req, res) => {
  const parsed = NameSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [row] = await db("tenant_settings")
    .insert({ tenant_id: req.user.tenantId!, key: "print_color", value: parsed.data.name })
    .returning(["id", "value as name", "tenant_id"]);
  res.status(201).json(row);
});

router.delete("/print-colors/:id", requirePermission("settings.edit"), async (req, res) => {
  await db("tenant_settings")
    .where({ id: req.params.id, tenant_id: req.user.tenantId!, key: "print_color" })
    .delete();
  res.json({ ok: true });
});

// ── Plate Sources ─────────────────────────────────────────────────────────────

router.get("/plate-sources", requirePermission("settings.view"), async (req, res) => {
  const rows = await db("tenant_settings")
    .where({ tenant_id: req.user.tenantId!, key: "plate_source" })
    .orderBy("created_at", "asc")
    .select("id", "value as name", "tenant_id");
  res.json(rows);
});

router.post("/plate-sources", requirePermission("settings.edit"), async (req, res) => {
  const parsed = NameSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [row] = await db("tenant_settings")
    .insert({ tenant_id: req.user.tenantId!, key: "plate_source", value: parsed.data.name })
    .returning(["id", "value as name", "tenant_id"]);
  res.status(201).json(row);
});

router.delete("/plate-sources/:id", requirePermission("settings.edit"), async (req, res) => {
  await db("tenant_settings")
    .where({ id: req.params.id, tenant_id: req.user.tenantId!, key: "plate_source" })
    .delete();
  res.json({ ok: true });
});

// ── Binding Types ─────────────────────────────────────────────────────────────

router.get("/binding-types", requirePermission("settings.view"), async (req, res) => {
  const rows = await db("tenant_settings")
    .where({ tenant_id: req.user.tenantId!, key: "binding_type" })
    .orderBy("created_at", "asc")
    .select("id", "value as name", "tenant_id");
  res.json(rows);
});

router.post("/binding-types", requirePermission("settings.edit"), async (req, res) => {
  const parsed = NameSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [row] = await db("tenant_settings")
    .insert({ tenant_id: req.user.tenantId!, key: "binding_type", value: parsed.data.name })
    .returning(["id", "value as name", "tenant_id"]);
  res.status(201).json(row);
});

router.delete("/binding-types/:id", requirePermission("settings.edit"), async (req, res) => {
  await db("tenant_settings")
    .where({ id: req.params.id, tenant_id: req.user.tenantId!, key: "binding_type" })
    .delete();
  res.json({ ok: true });
});

// ── Paper Providers (external paper inventory suppliers) ──────────────────────

const ProviderSchema = z.object({
  name: z.string().trim().min(1),
  contactPerson: z.string().optional(), phone: z.string().optional(), email: z.string().optional(),
  address: z.string().optional(), gstin: z.string().optional(), notes: z.string().optional(),
});
const PROVIDER_COLS = ["id", "name", "contact_person", "phone", "email", "address", "gstin", "notes"];

function providerFields(d: Partial<z.infer<typeof ProviderSchema>>) {
  const f: Record<string, unknown> = {};
  if (d.name !== undefined) f.name = d.name;
  if (d.contactPerson !== undefined) f.contact_person = d.contactPerson || null;
  if (d.phone !== undefined) f.phone = d.phone || null;
  if (d.email !== undefined) f.email = d.email || null;
  if (d.address !== undefined) f.address = d.address || null;
  if (d.gstin !== undefined) f.gstin = d.gstin || null;
  if (d.notes !== undefined) f.notes = d.notes || null;
  return f;
}

router.get("/paper-providers", requirePermission("settings.view"), async (req, res) => {
  const rows = await db("paper_providers")
    .where({ tenant_id: req.user.tenantId! })
    .orderBy("name", "asc")
    .select(PROVIDER_COLS);
  res.json(rows);
});

router.post("/paper-providers", requirePermission("settings.edit"), async (req, res) => {
  const parsed = ProviderSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [row] = await db("paper_providers")
    .insert({ tenant_id: req.user.tenantId!, ...providerFields(parsed.data) })
    .returning(PROVIDER_COLS);
  res.status(201).json(row);
});

router.patch("/paper-providers/:id", requirePermission("settings.edit"), async (req, res) => {
  const parsed = ProviderSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [row] = await db("paper_providers")
    .where({ id: req.params.id, tenant_id: req.user.tenantId! })
    .update({ ...providerFields(parsed.data), updated_at: new Date() })
    .returning(PROVIDER_COLS);
  if (!row) { res.status(404).json({ error: "Provider not found" }); return; }
  res.json(row);
});

router.delete("/paper-providers/:id", requirePermission("settings.edit"), async (req, res) => {
  await db("paper_providers")
    .where({ id: req.params.id, tenant_id: req.user.tenantId! })
    .delete();
  res.json({ ok: true });
});

// ── Staff Types ───────────────────────────────────────────────────────────────

router.get("/staff-types", requirePermission("settings.view"), async (req, res) => {
  const rows = await db("tenant_settings")
    .where({ tenant_id: req.user.tenantId!, key: "staff_type" })
    .orderBy("created_at", "asc")
    .select("id", "value as name", "tenant_id");
  res.json(rows);
});

router.post("/staff-types", requirePermission("settings.edit"), async (req, res) => {
  const parsed = NameSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const [row] = await db("tenant_settings")
    .insert({ tenant_id: req.user.tenantId!, key: "staff_type", value: parsed.data.name })
    .returning(["id", "value as name", "tenant_id"]);
  res.status(201).json(row);
});

router.delete("/staff-types/:id", requirePermission("settings.edit"), async (req, res) => {
  await db("tenant_settings")
    .where({ id: req.params.id, tenant_id: req.user.tenantId!, key: "staff_type" })
    .delete();
  res.json({ ok: true });
});

// ── Print Template ────────────────────────────────────────────────────────────

const PrintTemplateSchema = z.object({
  header: z.string().optional(),
  footer: z.string().optional(),
  signature: z.string().optional(),
  printFontSize: z.number().min(4).max(20).optional(),
});

router.get("/print-template", requirePermission("settings.view"), async (req, res) => {
  const rows = await db("tenant_settings")
    .where({ tenant_id: req.user.tenantId! })
    .whereIn("key", ["print_header", "print_footer", "print_signature", "print_font_size"])
    .select("key", "value");

  const result: Record<string, string | number | null> = { header: null, footer: null, signature: null, printFontSize: 11 };
  for (const row of rows) {
    if (row.key === "print_header")    result.header = row.value;
    if (row.key === "print_footer")    result.footer = row.value;
    if (row.key === "print_signature") result.signature = row.value;
    if (row.key === "print_font_size") result.printFontSize = Number(row.value);
  }
  res.json(result);
});

router.post("/print-template", requirePermission("settings.edit"), async (req, res) => {
  const parsed = PrintTemplateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const keyMap: Record<string, string> = {
    header: "print_header",
    footer: "print_footer",
    signature: "print_signature",
  };

  for (const [field, dbKey] of Object.entries(keyMap)) {
    const value = (parsed.data as Record<string, string | undefined>)[field];
    if (value === undefined) continue;
    await db("tenant_settings").where({ tenant_id: req.user.tenantId!, key: dbKey }).delete();
    if (value !== "") {
      await db("tenant_settings").insert({ tenant_id: req.user.tenantId!, key: dbKey, value });
    }
  }

  // Save printFontSize as a plain numeric string
  if (parsed.data.printFontSize !== undefined) {
    await db("tenant_settings").where({ tenant_id: req.user.tenantId!, key: "print_font_size" }).delete();
    await db("tenant_settings").insert({ tenant_id: req.user.tenantId!, key: "print_font_size", value: String(parsed.data.printFontSize) });
  }

  res.json({ ok: true });
});

export default router;
