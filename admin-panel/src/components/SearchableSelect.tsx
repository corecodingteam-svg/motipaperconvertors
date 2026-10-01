import { useState, useRef, useEffect } from "react";

// Keeps the trigger identical to the text inputs used across the forms so heights match.
const inputStyle: React.CSSProperties = { padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, width: "100%", fontSize: 14, boxSizing: "border-box" };
const errInputStyle: React.CSSProperties = { ...inputStyle, border: "1px solid #e03131", boxShadow: "0 0 0 3px rgba(224,49,49,0.12)" };

export interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isError?: boolean;
}

export default function SearchableSelect({ options, value, onChange, placeholder = "— select —", disabled = false, isError = false }: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find(o => o.value === value)?.label ?? "";

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filtered = query.trim() === ""
    ? options
    : options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));

  function handleInputClick() {
    if (disabled) return;
    setOpen(true);
    setQuery("");
  }

  function handleSelect(opt: { value: string; label: string }) {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <input
        readOnly={!open}
        disabled={disabled}
        value={open ? query : selectedLabel}
        onChange={e => setQuery(e.target.value)}
        onClick={handleInputClick}
        onFocus={handleInputClick}
        placeholder={placeholder}
        style={{
          ...(isError ? errInputStyle : inputStyle),
          cursor: disabled ? "not-allowed" : "pointer",
          background: disabled ? "#f5f5f5" : "#fff",
        }}
      />
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 1000,
          background: "#fff", border: "1px solid #ddd", borderRadius: 6,
          boxShadow: "0 4px 16px rgba(0,0,0,.12)", maxHeight: 220, overflowY: "auto",
          marginTop: 2,
        }}>
          {filtered.length === 0 && (
            <div style={{ padding: "10px 14px", fontSize: 13, color: "#888" }}>No options found</div>
          )}
          {filtered.map(opt => (
            <div
              key={opt.value}
              onMouseDown={() => handleSelect(opt)}
              style={{
                padding: "9px 14px", fontSize: 13, cursor: "pointer",
                background: opt.value === value ? "#e7ecff" : "transparent",
                color: opt.value === value ? "#3b5bdb" : "#333",
                fontWeight: opt.value === value ? 600 : 400,
              }}
              onMouseEnter={e => { if (opt.value !== value) (e.currentTarget as HTMLDivElement).style.background = "#f5f7ff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = opt.value === value ? "#e7ecff" : "transparent"; }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
