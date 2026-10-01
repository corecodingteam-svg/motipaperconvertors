import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.ts";
import { useAuthStore } from "../store/auth.ts";

interface SettingItem { id: string; name: string; }

const inputStyle: React.CSSProperties = { padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, boxSizing: "border-box" };
const th: React.CSSProperties = { padding: "11px 14px", textAlign: "left", fontSize: 13, color: "#555", fontWeight: 600 };
const td: React.CSSProperties = { padding: "11px 14px", fontSize: 13 };

function SettingsList({ label, queryKey, endpoint }: { label: string; queryKey: string; endpoint: string }) {
  const [newName, setNewName] = useState("");
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery<SettingItem[]>({
    queryKey: [queryKey],
    queryFn: () => api.get(endpoint).then(r => r.data),
  });

  const add = useMutation({
    mutationFn: () => api.post(endpoint, { name: newName.trim() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); setNewName(""); toast.success("Item added"); },
    onError: () => toast.error("Failed to add item"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`${endpoint}/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); toast.success("Item deleted"); },
    onError: () => toast.error("Failed to delete item"),
  });

  const filtered = items
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          style={{ ...inputStyle, flex: 1, minWidth: 180, maxWidth: 260 }}
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder={`Add new ${label}...`}
          onKeyDown={e => { if (e.key === "Enter" && newName.trim()) add.mutate(); }}
        />
        <button
          onClick={() => add.mutate()}
          disabled={!newName.trim() || add.isPending}
          style={{ padding: "8px 18px", background: "#3b5bdb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 14 }}
        >
          {add.isPending ? "Adding..." : "Add"}
        </button>
        <div style={{ flex: 1 }} />
        <input
          style={{ ...inputStyle, width: 200 }}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder={`Search ${label.toLowerCase()}...`}
        />
        <button
          onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
          title="Toggle sort order"
          style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", background: "#fff", fontSize: 13, whiteSpace: "nowrap" }}
        >
          A–Z {sortDir === "asc" ? "↑" : "↓"}
        </button>
      </div>
      <div style={{ padding: "8px 20px", borderBottom: "1px solid #eee", fontSize: 12, color: "#888" }}>
        {filtered.length} of {items.length} {label.toLowerCase()}s
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #eee" }}>
            <th style={{ ...th, cursor: "pointer", userSelect: "none" }} onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}>
              {label} {sortDir === "asc" ? "↑" : "↓"}
            </th>
            <th style={{ ...th, width: 60 }} />
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr><td colSpan={2} style={{ ...td, textAlign: "center", color: "#888" }}>Loading...</td></tr>
          )}
          {paginated.map(item => (
            <tr key={item.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={td}>{item.name}</td>
              <td style={td}>
                <button
                  onClick={() => remove.mutate(item.id)}
                  disabled={remove.isPending}
                  style={{ padding: "3px 10px", border: "1px solid #fdd", borderRadius: 6, cursor: "pointer", fontSize: 13, background: "#fff", color: "#c92a2a" }}
                >
                  &times;
                </button>
              </td>
            </tr>
          ))}
          {!isLoading && filtered.length === 0 && (
            <tr><td colSpan={2} style={{ ...td, textAlign: "center", color: "#888", padding: 24 }}>
              {search ? `No results for "${search}"` : `No ${label.toLowerCase()} added yet`}
            </td></tr>
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #eee", fontSize: 13 }}>
          <span style={{ color: "#888" }}>Page {page} of {totalPages} · {filtered.length} total</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setPage(1)} disabled={page === 1} style={{ padding: "4px 10px", border: "1px solid #ddd", borderRadius: 5, cursor: "pointer", background: "#fff", fontSize: 12 }}>«</button>
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={{ padding: "4px 10px", border: "1px solid #ddd", borderRadius: 5, cursor: "pointer", background: "#fff", fontSize: 12 }}>‹ Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} style={{ padding: "4px 10px", border: "1px solid #ddd", borderRadius: 5, cursor: "pointer", background: "#fff", fontSize: 12 }}>Next ›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={{ padding: "4px 10px", border: "1px solid #ddd", borderRadius: 5, cursor: "pointer", background: "#fff", fontSize: 12 }}>»</button>
          </div>
        </div>
      )}
    </div>
  );
}

interface Provider { id: string; name: string; contact_person?: string | null; phone?: string | null; email?: string | null; address?: string | null; gstin?: string | null; notes?: string | null; }
const EMPTY_PROVIDER = { name: "", contactPerson: "", phone: "", email: "", address: "", gstin: "", notes: "" };

function PaperProvidersSettings() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(EMPTY_PROVIDER);
  const { data: providers = [], isLoading } = useQuery<Provider[]>({
    queryKey: ["settings-paper-providers"],
    queryFn: () => api.get("/admin/settings/paper-providers").then(r => r.data),
  });
  const close = () => { setEditingId(null); setForm(EMPTY_PROVIDER); };
  const save = useMutation({
    mutationFn: () => editingId === "new"
      ? api.post("/admin/settings/paper-providers", form)
      : api.patch(`/admin/settings/paper-providers/${editingId}`, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["settings-paper-providers"] }); toast.success("Provider saved"); close(); },
    onError: () => toast.error("Failed to save provider"),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/settings/paper-providers/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["settings-paper-providers"] }); toast.success("Provider deleted"); },
    onError: () => toast.error("Failed to delete provider"),
  });
  const edit = (p: Provider) => {
    setEditingId(p.id);
    setForm({ name: p.name, contactPerson: p.contact_person ?? "", phone: p.phone ?? "", email: p.email ?? "", address: p.address ?? "", gstin: p.gstin ?? "", notes: p.notes ?? "" });
  };
  const set = (k: keyof typeof EMPTY_PROVIDER) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const lbl: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontSize: 13 };

  return (
    <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#666" }}>Providers selectable when adding external paper stock</span>
        <button onClick={() => { setForm(EMPTY_PROVIDER); setEditingId("new"); }} style={{ padding: "8px 18px", background: "#3b5bdb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>+ Add Provider</button>
      </div>
      {editingId && (
        <div style={{ padding: 20, borderBottom: "1px solid #eee", background: "#fafbff" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <label style={lbl}>Name *<input style={inputStyle} value={form.name} onChange={set("name")} /></label>
            <label style={lbl}>Contact Person<input style={inputStyle} value={form.contactPerson} onChange={set("contactPerson")} /></label>
            <label style={lbl}>Phone<input style={inputStyle} value={form.phone} onChange={set("phone")} /></label>
            <label style={lbl}>Email<input style={inputStyle} value={form.email} onChange={set("email")} /></label>
            <label style={lbl}>GSTIN<input style={inputStyle} value={form.gstin} onChange={set("gstin")} /></label>
            <label style={lbl}>Address<input style={inputStyle} value={form.address} onChange={set("address")} /></label>
          </div>
          <label style={lbl}>Notes<textarea style={{ ...inputStyle, minHeight: 56 }} value={form.notes} onChange={set("notes")} /></label>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => save.mutate()} disabled={!form.name.trim() || save.isPending} style={{ padding: "8px 20px", background: "#3b5bdb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>{save.isPending ? "Saving…" : "Save"}</button>
            <button onClick={close} style={{ padding: "8px 14px", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", background: "#fff" }}>Cancel</button>
          </div>
        </div>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ background: "#f8f9fa", borderBottom: "1px solid #eee" }}>
          <th style={th}>Name</th><th style={th}>Contact</th><th style={th}>Phone</th><th style={th}>Email</th><th style={th}>GSTIN</th><th style={th}>Address</th><th style={{ ...th, width: 110 }} />
        </tr></thead>
        <tbody>
          {isLoading && <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "#888" }}>Loading...</td></tr>}
          {providers.map(p => (
            <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ ...td, fontWeight: 500 }}>{p.name}</td>
              <td style={td}>{p.contact_person || "—"}</td>
              <td style={td}>{p.phone || "—"}</td>
              <td style={td}>{p.email || "—"}</td>
              <td style={td}>{p.gstin || "—"}</td>
              <td style={td}>{p.address || "—"}</td>
              <td style={td}>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => edit(p)} style={{ padding: "3px 10px", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", fontSize: 13, background: "#fff" }}>Edit</button>
                  <button onClick={() => { if (confirm(`Delete ${p.name}?`)) remove.mutate(p.id); }} style={{ padding: "3px 10px", border: "1px solid #fdd", borderRadius: 6, cursor: "pointer", fontSize: 13, background: "#fff", color: "#c92a2a" }}>&times;</button>
                </div>
              </td>
            </tr>
          ))}
          {!isLoading && providers.length === 0 && <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "#888", padding: 24 }}>No providers added yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

interface PrintTemplate { header: string | null; footer: string | null; signature: string | null; printFontSize?: number; }

function ImageUploadCard({ label, hint, value, onChange }: {
  label: string; hint: string; value: string; onChange: (v: string) => void;
}) {
  const cardStyle: React.CSSProperties = {
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
    padding: 20, marginBottom: 16,
  };
  const readImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div style={cardStyle}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>{hint}</div>
      {value ? (
        <div>
          <img src={value} alt={label} style={{ maxWidth: "100%", maxHeight: 160, border: "1px solid #e5e7eb", borderRadius: 6, display: "block", marginBottom: 8 }} />
          <button onClick={() => onChange("")} style={{ padding: "4px 12px", border: "1px solid #fdd", borderRadius: 6, cursor: "pointer", fontSize: 13, background: "#fff", color: "#c92a2a" }}>Remove</button>
        </div>
      ) : (
        <label style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          border: "2px dashed #d1d5db", borderRadius: 8, padding: "32px 16px", cursor: "pointer",
          color: "#6b7280", fontSize: 13, gap: 8,
        }}>
          <span style={{ fontSize: 24 }}>📁</span>
          <span>Click or drag to upload image</span>
          <input type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) readImage(f); }} />
        </label>
      )}
    </div>
  );
}

function PrintTemplateSettings() {
  const { data: template, refetch } = useQuery<PrintTemplate>({
    queryKey: ["print-template"],
    queryFn: () => api.get("/admin/settings/print-template").then(r => r.data),
  });

  const [header, setHeader] = useState<string>("");
  const [footer, setFooter] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [printFontSize, setPrintFontSize] = useState<number>(11);
  const [sigMode, setSigMode] = useState<"draw" | "upload">("draw");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setHeader(template.header || "");
      setFooter(template.footer || "");
      setSignature(template.signature || "");
      setPrintFontSize(template.printFontSize ?? 11);
    }
  }, [template]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setDrawing(true);
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#1f2937"; ctx.lineWidth = 2; ctx.lineCap = "round";
    ctx.stroke();
  };
  const endDraw = () => {
    if (!drawing) return;
    setDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) setSignature(canvas.toDataURL());
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature("");
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/admin/settings/print-template", { header, footer, signature, printFontSize });
      await refetch();
      toast.success("Print template saved");
    } catch {
      toast.error("Failed to save print template");
    } finally {
      setSaving(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
    padding: 20, marginBottom: 16,
  };
  const sigTabBtn = (active: boolean): React.CSSProperties => ({
    padding: "5px 16px", border: "none",
    borderBottom: active ? "2px solid #3b5bdb" : "2px solid transparent",
    background: "none", cursor: "pointer", fontWeight: active ? 700 : 400,
    color: active ? "#3b5bdb" : "#555", fontSize: 13,
  });

  return (
    <div>
      <ImageUploadCard
        label="Press Header"
        hint="Letterhead top — recommended 800×150px"
        value={header}
        onChange={setHeader}
      />
      <ImageUploadCard
        label="Press Footer"
        hint="Contact info / stamp — recommended 800×100px"
        value={footer}
        onChange={setFooter}
      />
      <div style={cardStyle}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Authorised Signature</div>
        <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: 16 }}>
          <button style={sigTabBtn(sigMode === "draw")} onClick={() => setSigMode("draw")}>Draw</button>
          <button style={sigTabBtn(sigMode === "upload")} onClick={() => setSigMode("upload")}>Upload</button>
        </div>
        {sigMode === "draw" && (
          <div>
            <canvas
              ref={canvasRef}
              width={400} height={120}
              style={{ border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: "crosshair", display: "block" }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
            />
            <button onClick={clearCanvas} style={{ marginTop: 8, padding: "4px 14px", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", fontSize: 13, background: "#fff" }}>Clear</button>
          </div>
        )}
        {sigMode === "upload" && (
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            border: "2px dashed #d1d5db", borderRadius: 8, padding: "24px 16px", cursor: "pointer",
            color: "#6b7280", fontSize: 13, gap: 8,
          }}>
            <span style={{ fontSize: 24 }}>📁</span>
            <span>Click to upload signature image</span>
            <input type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => {
                const f = e.target.files?.[0]; if (!f) return;
                const reader = new FileReader();
                reader.onload = ev => setSignature(ev.target?.result as string);
                reader.readAsDataURL(f);
              }} />
          </label>
        )}
        {signature && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Current Signature:</div>
            <img src={signature} alt="Signature" style={{ maxWidth: 400, maxHeight: 120, border: "1px solid #e5e7eb", borderRadius: 6, display: "block" }} />
            <button onClick={() => setSignature("")} style={{ marginTop: 6, padding: "4px 12px", border: "1px solid #fdd", borderRadius: 6, cursor: "pointer", fontSize: 13, background: "#fff", color: "#c92a2a" }}>Remove</button>
          </div>
        )}
      </div>
      <div style={cardStyle}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Print Font Size</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>Font size used in printed job cards (affects all text in the print view)</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <input
            type="range"
            min={4}
            max={20}
            step={1}
            value={printFontSize}
            onChange={e => setPrintFontSize(Number(e.target.value))}
            style={{ flex: 1, maxWidth: 260, accentColor: "#3b5bdb", cursor: "pointer" }}
          />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", minWidth: 40 }}>{printFontSize}px</span>
        </div>
      </div>
      <button
        onClick={save}
        disabled={saving}
        style={{ padding: "10px 28px", background: "#3b5bdb", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 14 }}
      >
        {saving ? "Saving..." : "Save Template"}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const role = useAuthStore(s => s.role);
  const [tab, setTab] = useState<"job_types" | "print_colors" | "plate_sources" | "binding_types" | "paper_providers" | "staff_types" | "print_template">("job_types");

  if (role === "staff" || role === "operator") return null;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 20px",
    border: "none",
    borderBottom: active ? "2px solid #3b5bdb" : "2px solid transparent",
    background: "none",
    cursor: "pointer",
    fontWeight: active ? 700 : 400,
    color: active ? "#3b5bdb" : "#555",
    fontSize: 14,
  });

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Settings</h1>
      <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "1px solid #eee", padding: "0 8px" }}>
          <button style={tabStyle(tab === "job_types")} onClick={() => setTab("job_types")}>Job Types</button>
          <button style={tabStyle(tab === "print_colors")} onClick={() => setTab("print_colors")}>Print Colors</button>
          <button style={tabStyle(tab === "plate_sources")} onClick={() => setTab("plate_sources")}>Plate Sources</button>
          <button style={tabStyle(tab === "binding_types")} onClick={() => setTab("binding_types")}>Binding Types</button>
          <button style={tabStyle(tab === "paper_providers")} onClick={() => setTab("paper_providers")}>Paper Providers</button>
          <button style={tabStyle(tab === "staff_types")} onClick={() => setTab("staff_types")}>Staff Types</button>
          <button style={tabStyle(tab === "print_template")} onClick={() => setTab("print_template")}>Print Template</button>
        </div>
        <div style={{ padding: 20 }}>
          {tab === "job_types" && (
            <SettingsList
              label="Job Type"
              queryKey="settings-job-types"
              endpoint="/admin/settings/job-types"
            />
          )}
          {tab === "print_colors" && (
            <SettingsList
              label="Print Color"
              queryKey="settings-print-colors"
              endpoint="/admin/settings/print-colors"
            />
          )}
          {tab === "plate_sources" && (
            <SettingsList
              label="Plate Source"
              queryKey="settings-plate-sources"
              endpoint="/admin/settings/plate-sources"
            />
          )}
          {tab === "binding_types" && (
            <SettingsList
              label="Binding Type"
              queryKey="settings-binding-types"
              endpoint="/admin/settings/binding-types"
            />
          )}
          {tab === "paper_providers" && <PaperProvidersSettings />}
          {tab === "staff_types" && (
            <SettingsList
              label="Staff Type"
              queryKey="settings-staff-types"
              endpoint="/admin/settings/staff-types"
            />
          )}
          {tab === "print_template" && <PrintTemplateSettings />}
        </div>
      </div>
    </div>
  );
}
