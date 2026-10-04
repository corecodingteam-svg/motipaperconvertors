import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.ts";
import SearchableSelect from "./SearchableSelect.tsx";
import type { InkLine } from "../lib/inks.ts";

type InkItem = { id: string; name: string; unit: string; quantity: number };

const inputStyle: React.CSSProperties = { padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, width: "100%", fontSize: 14, boxSizing: "border-box" };

/** Ink type + quantity lines for a job card; stock comes from Inventory → Ink / Plates (category ink). */
export default function InkLinesEditor({ inks, onChange }: { inks: InkLine[]; onChange: (inks: InkLine[]) => void }) {
  const { data: items = [] } = useQuery<InkItem[]>({
    queryKey: ["ink-items"],
    queryFn: () => api.get("/admin/inventory/items", { params: { category: "ink", limit: 5000 } }).then(r => r.data.data ?? []),
  });
  const options = items.map(i => ({ value: i.id, label: `${i.name} (${Number(i.quantity)} ${i.unit} in stock)` }));
  const update = (idx: number, patch: Partial<InkLine>) => onChange(inks.map((l, j) => (j === idx ? { ...l, ...patch } : l)));

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 13, color: "#3b5bdb", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Ink Used</div>
      {inks.map((line, i) => {
        const item = items.find(it => it.id === line.inventoryItemId);
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 160px 40px", gap: 12, marginBottom: 10, alignItems: "end" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
              Ink Type
              <SearchableSelect options={options} value={line.inventoryItemId} onChange={v => update(i, { inventoryItemId: v })} placeholder="— select ink —" />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
              Quantity{item ? ` (${item.unit})` : ""}
              <input style={inputStyle} type="number" min={0} step="any" value={line.quantity || ""} onChange={e => update(i, { quantity: Number(e.target.value) })} placeholder="Qty" />
            </label>
            <button type="button" onClick={() => onChange(inks.filter((_, j) => j !== i))} style={{ height: 36, border: "1px solid #fdd", borderRadius: 6, cursor: "pointer", background: "#fff", color: "#c92a2a", fontSize: 16 }}>×</button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => onChange([...inks, { inventoryItemId: "", quantity: 0 }])}
        style={{ padding: "8px 16px", border: "1px dashed #3b5bdb", borderRadius: 6, cursor: "pointer", background: "#f5f7ff", color: "#3b5bdb", fontWeight: 600, fontSize: 13 }}
      >+ Add Ink</button>
      {items.length === 0 && <div style={{ fontSize: 12, color: "#868e96", marginTop: 8 }}>No ink items yet — add them in Inventory → Ink / Plates.</div>}
    </div>
  );
}
