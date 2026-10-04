// Ink lines on a job card. The job form keeps them as JSON in form.inks_json so they travel
// through the same save/draft calls as the other form fields.
export type InkLine = { inventoryItemId: string; quantity: number };
export type JobInk = { inventory_item_id: string; quantity: number | string; ink_name?: string | null; unit?: string | null };

export function parseInks(form: Record<string, string | boolean>): InkLine[] {
  try {
    const raw = JSON.parse((form.inks_json as string) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

export function inksToJson(inks: JobInk[] | undefined): string {
  return JSON.stringify((inks ?? []).map(i => ({ inventoryItemId: i.inventory_item_id, quantity: Number(i.quantity) })));
}

/** "Black Ink – 2 kg, Cyan – 1 kg" for the detail and print views */
export function inkSummary(inks: JobInk[] | undefined): string {
  if (!inks || inks.length === 0) return "—";
  return inks.map(i => `${i.ink_name ?? "Ink"} – ${Number(i.quantity)}${i.unit ? " " + i.unit : ""}`).join(", ");
}
