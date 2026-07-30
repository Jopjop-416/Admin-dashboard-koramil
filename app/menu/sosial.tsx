import React, { useState } from "react";
import { Search, Filter, Download, BookOpen, HeartPulse, GraduationCap } from "lucide-react";
import { kecamatan, KecamatanRow, desaLabuhanHaji, DesaRow, fmt } from "../App";

export default function Sosial() {
  const [viewLevel, setViewLevel] = useState<"kecamatan" | "desa">("kecamatan");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("literacy");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const dataSrc = viewLevel === "kecamatan" ? kecamatan : desaLabuhanHaji;

  const filtered = [...dataSrc]
    .filter((k) => k.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = (a as any)[sortKey] as number;
      const vb = (b as any)[sortKey] as number;
      return sortDir === "asc" ? va - vb : vb - va;
    });

  const firstMetric = viewLevel === "kecamatan"
    ? (kecamatan.reduce((s, k) => s + k.literacy, 0) / kecamatan.length).toFixed(1) + "%"
    : desaLabuhanHaji.reduce((s, k) => s + k.hamlets, 0);

  const secondMetric = viewLevel === "kecamatan"
    ? kecamatan.reduce((s, k) => s + k.schoolCount, 0)
    : desaLabuhanHaji.reduce((s, k) => s + k.rt, 0);

  const thirdMetric = viewLevel === "kecamatan"
    ? kecamatan.reduce((s, k) => s + k.healthFacility, 0)
    : "-";

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function exportCSV() {
    const header = viewLevel === "kecamatan"
      ? ["No", "Kecamatan", "Melek Huruf (%)", "Lama Sekolah (thn)", "Sekolah", "Puskesmas/Pustu", "Posyandu", "APS (%)", "Tempat Ibadah"]
      : ["No", "Desa/Kelurahan", "Dusun", "Rukun Tetangga (RT)"];
      
    const rows = filtered.map((k, i) => {
      if (viewLevel === "kecamatan") {
        const kec = k as KecamatanRow;
        return [i + 1, kec.name, kec.literacy, kec.avgSchooling, kec.schoolCount, kec.healthFacility, kec.posyandu, kec.aps, kec.worshipPlace];
      } else {
        const desa = k as DesaRow;
        return [i + 1, desa.name, desa.hamlets, desa.rt];
      }
    });
    
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-sosial-${viewLevel}-2024.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    window.print();
  }

  const colsKecamatan: { key: string; label: string; fmt: (k: any) => React.ReactNode }[] = [
    { key: "name", label: "Kecamatan", fmt: (k: KecamatanRow) => k.name },
    { key: "literacy", label: "Melek Huruf (%)", fmt: (k: KecamatanRow) => <span className={k.literacy >= 90 ? "text-violet-600 font-semibold" : ""}>{k.literacy.toFixed(1)}%</span> },
    { key: "avgSchooling", label: "Lama Sekolah (thn)", fmt: (k: KecamatanRow) => k.avgSchooling.toFixed(1) },
    { key: "schoolCount", label: "Sekolah", fmt: (k: KecamatanRow) => String(k.schoolCount) },
    { key: "healthFacility", label: "Puskesmas", fmt: (k: KecamatanRow) => String(k.healthFacility) },
    { key: "posyandu", label: "Posyandu", fmt: (k: KecamatanRow) => String(k.posyandu) },
    { key: "aps", label: "APS (%)", fmt: (k: KecamatanRow) => k.aps.toFixed(1) + "%" },
    { key: "worshipPlace", label: "Tempat Ibadah", fmt: (k: KecamatanRow) => String(k.worshipPlace) },
  ];

  const colsDesa: { key: string; label: string; fmt: (k: any) => React.ReactNode }[] = [
    { key: "name", label: "Desa/Kelurahan", fmt: (k: DesaRow) => k.name },
    { key: "hamlets", label: "Dusun", fmt: (k: DesaRow) => String(k.hamlets) },
    { key: "rt", label: "Rukun Tetangga (RT)", fmt: (k: DesaRow) => String(k.rt) },
  ];

  const cols = viewLevel === "kecamatan" ? colsKecamatan : colsDesa;

  return (
    <div className="px-6 pt-4 pb-6 space-y-5">
      {/* View Toggle */}
      <div className="flex gap-1 bg-secondary rounded-md p-1 border border-border w-fit">
        {(["kecamatan", "desa"] as const).map((level) => (
          <button
            key={level}
            onClick={() => {
              setViewLevel(level);
              setSortKey(level === "kecamatan" ? "literacy" : "hamlets");
              setSearch("");
            }}
            className={"text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all capitalize " + (viewLevel === level ? "bg-black text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <BookOpen size={17} className="text-violet-500" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">{firstMetric}</p>
            <p className="text-[10px] text-muted-foreground">{viewLevel === "kecamatan" ? "Rata-rata Melek Huruf" : "Total Dusun"}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-fuchsia-500/10 flex items-center justify-center">
            <GraduationCap size={17} className="text-fuchsia-500" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">{secondMetric}</p>
            <p className="text-[10px] text-muted-foreground">{viewLevel === "kecamatan" ? "Total Sekolah (SD-SMA)" : "Total Rukun Tetangga (RT)"}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center">
            <HeartPulse size={17} className="text-pink-500" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">{thirdMetric}</p>
            <p className="text-[10px] text-muted-foreground">{viewLevel === "kecamatan" ? "Total Fasilitas Kesehatan" : "-"}</p>
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
