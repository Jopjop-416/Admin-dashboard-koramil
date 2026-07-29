import React, { useState } from "react";
import { Search, Filter, Download, BookOpen, HeartPulse, GraduationCap } from "lucide-react";
import { kecamatan, KecamatanRow, fmt } from "../App";

export default function Sosial() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof KecamatanRow>("literacy");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = kecamatan
    .filter((k) => k.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = a[sortKey] as number;
      const vb = b[sortKey] as number;
      return sortDir === "asc" ? va - vb : vb - va;
    });

  const avgLit = (kecamatan.reduce((s, k) => s + k.literacy, 0) / kecamatan.length).toFixed(1);
  const avgAps = (kecamatan.reduce((s, k) => s + k.aps, 0) / kecamatan.length).toFixed(1);
  const totalSchools = kecamatan.reduce((s, k) => s + k.schoolCount, 0);
  const totalHealth = kecamatan.reduce((s, k) => s + k.healthFacility, 0);
  const totalPosyandu = kecamatan.reduce((s, k) => s + k.posyandu, 0);
  const totalWorship = kecamatan.reduce((s, k) => s + k.worshipPlace, 0);

  function toggleSort(key: keyof KecamatanRow) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function exportCSV() {
    const header = ["No", "Kecamatan", "Melek Huruf (%)", "Lama Sekolah (thn)", "Sekolah", "Puskesmas/Pustu", "Posyandu", "APS (%)", "Tempat Ibadah"];
    const rows = kecamatan.map((k, i) => [
      i + 1, k.name, k.literacy, k.avgSchooling, k.schoolCount, k.healthFacility, k.posyandu, k.aps, k.worshipPlace
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data-sosial-lotim-2024.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    window.print();
  }

  const cols: { key: keyof KecamatanRow; label: string; fmt: (k: KecamatanRow) => React.ReactNode }[] = [
    { key: "name", label: "Kecamatan", fmt: (k) => k.name },
    { key: "literacy", label: "Melek Huruf (%)", fmt: (k) => <span className={k.literacy >= 90 ? "text-violet-600 font-semibold" : ""}>{k.literacy.toFixed(1)}%</span> },
    { key: "avgSchooling", label: "Lama Sekolah (thn)", fmt: (k) => k.avgSchooling.toFixed(1) },
    { key: "schoolCount", label: "Sekolah", fmt: (k) => String(k.schoolCount) },
    { key: "healthFacility", label: "Puskesmas", fmt: (k) => String(k.healthFacility) },
    { key: "posyandu", label: "Posyandu", fmt: (k) => String(k.posyandu) },
    { key: "aps", label: "APS (%)", fmt: (k) => k.aps.toFixed(1) + "%" },
    { key: "worshipPlace", label: "Tempat Ibadah", fmt: (k) => String(k.worshipPlace) },
  ];

  return (
    <div className="px-6 pt-4 pb-6 space-y-5">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <BookOpen size={17} className="text-violet-500" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">{avgLit}%</p>
            <p className="text-[10px] text-muted-foreground">Rata-rata Melek Huruf</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <GraduationCap size={17} className="text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">{avgAps}%</p>
            <p className="text-[10px] text-muted-foreground">Angka Partisipasi Sekolah (APS)</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center">
            <HeartPulse size={17} className="text-pink-500" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">{totalHealth + totalPosyandu}</p>
            <p className="text-[10px] text-muted-foreground">Total Faskes & Posyandu</p>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kecamatan…"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground border border-border rounded-lg px-2.5 py-1.5">
            <Filter size={11} />
            <span>{filtered.length} dari {kecamatan.length} kecamatan</span>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={exportCSV} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-[#217346] border border-[#217346] text-white hover:opacity-90 transition-colors">
              <Download size={12} className="text-white" /> Excel (CSV)
            </button>
            <button onClick={exportPDF} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white border border-[#EC1C24] text-[#EC1C24] hover:bg-red-50 transition-colors">
              <Download size={12} className="text-[#EC1C24]" /> PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white border-b-2 border-border/70">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-8 border-b-2 border-border/70 bg-white">No</th>
                {cols.map((c) => (
                  <th
                    key={c.key}
                    onClick={() => toggleSort(c.key)}
                    className="text-left px-3 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors whitespace-nowrap select-none border-b-2 border-border/70 bg-white"
                  >
                    <span className="flex items-center gap-1">
                      {c.label}
                      {sortKey === c.key && <span className="text-primary">{sortDir === "desc" ? "↓" : "↑"}</span>}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((k, i) => (
                <tr key={k.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3 font-sans text-muted-foreground text-[10px]">{i + 1}</td>
                  {cols.map((c) => (
                    <td key={c.key} className="px-3 py-3 font-sans text-foreground whitespace-nowrap">
                      {c.key === "name" ? <span className="font-medium text-foreground">{c.fmt(k)}</span> : c.fmt(k)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
