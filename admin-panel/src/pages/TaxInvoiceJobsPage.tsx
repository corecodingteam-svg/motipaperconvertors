import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "../lib/api.ts";
import { fmtDate } from "../lib/fmtDate.ts";
import { useHasPerm } from "../store/auth.ts";
import { useListState } from "../hooks/useListState.ts";
import TableControls, { SortIcon } from "../components/TableControls.tsx";
import TableSkeleton from "../components/TableSkeleton.tsx";
import Pagination from "../components/Pagination.tsx";
import type { PagedResult } from "../lib/queryHelpers.ts";

type TaxJob = {
  id: string; job_number: number; title: string; job_type?: string; order_type: string; status: string;
  client_name?: string; client_company_name?: string; quantity?: number; quoted_price?: number;
  tax_invoice_no: string; invoice_date?: string | null;
};

const th: React.CSSProperties = { padding: "11px 14px", textAlign: "left", fontSize: 13, color: "#555", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "11px 14px", fontSize: 13 };

export default function TaxInvoiceJobsPage() {
  const canEdit = useHasPerm("jobs.edit");
  const qc = useQueryClient();
  const [list, actions] = useListState({ sortBy: "created_at", filters: {} });

  // Key starts with "jobs" so saving a job elsewhere refreshes this list too
  const { data, isLoading } = useQuery<PagedResult<TaxJob>>({
    queryKey: ["jobs", "tax-invoice-done", actions.toParams()],
    queryFn: () => api.get("/admin/jobs", { params: { ...actions.toParams(), taxInvoice: "done" } }).then(r => r.data),
    placeholderData: keepPreviousData,
  });

  // Clearing the invoice number sends the card back to its Job Cards / External Jobs list
  const reopen = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/jobs/${id}`, { tax_invoice_no: "" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["jobs"] }); toast.success("Moved back to the job card list"); },
    onError: () => toast.error("Failed to update job card"),
  });

  const col = (label: string, key: string) => (
    <th style={th} onClick={() => actions.setSort(key)}>{label}<SortIcon col={key} sortBy={list.sortBy} sortDir={list.sortDir} /></th>
  );

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Tax Invoice Cards</h1>
      <p style={{ marginBottom: 16, color: "#666", fontSize: 13 }}>Job cards (internal and external) whose tax invoice is filled. They no longer appear in the Job Cards and External Jobs lists.</p>
      <TableControls search={list.search} onSearch={actions.setSearch} placeholder="Search job no, title, client..." />
      <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,.06)", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #eee" }}>
              {col("#", "job_number")}
              <th style={th}>Type</th>
              {col("Job Title", "title")}
              <th style={th}>Client</th>
              <th style={th}>Qty</th>
              <th style={th}>Tax Invoice No</th>
              {col("Invoice Date", "invoice_date")}
              {col("Quoted", "quoted_price")}
              {canEdit && <th style={th} />}
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableSkeleton cols={canEdit ? 9 : 8} />}
            {data?.data?.map(j => (
              <tr key={j.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ ...td, fontWeight: 700 }}>{j.job_number}</td>
                <td style={td}>{j.order_type === "external" ? "External" : "Internal"}</td>
                <td style={{ ...td, fontWeight: 600, color: "#111827" }}>{j.job_type || j.title || "—"}</td>
                <td style={td}>{j.client_company_name || j.client_name || "—"}</td>
                <td style={td}>{j.quantity ?? "—"}</td>
                <td style={{ ...td, fontWeight: 600 }}>{j.tax_invoice_no}</td>
                <td style={td}>{fmtDate(j.invoice_date)}</td>
                <td style={{ ...td, fontWeight: 600 }}>{j.quoted_price ? "Rs." + Number(j.quoted_price).toLocaleString("en-IN") : "—"}</td>
                {canEdit && (
                  <td style={td}>
                    <button
                      onClick={() => { if (confirm(`Clear the tax invoice no. and move job #${j.job_number} back to the job card list?`)) reopen.mutate(j.id); }}
                      disabled={reopen.isPending}
                      style={{ padding: "4px 10px", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", fontSize: 12, background: "#fff", whiteSpace: "nowrap" }}
                    >↩ Move back</button>
                  </td>
                )}
              </tr>
            ))}
            {data && !data.data?.length && <tr><td colSpan={canEdit ? 9 : 8} style={{ ...td, textAlign: "center", color: "#888", padding: 24 }}>No tax invoice cards yet</td></tr>}
          </tbody>
        </table>
      </div>
      {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} limit={data.limit} onPage={actions.setPage} />}
    </div>
  );
}
