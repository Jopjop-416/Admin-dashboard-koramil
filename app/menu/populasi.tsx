import React, { useState } from "react";
import { Search, Filter, Download, Users, TrendingUp, Activity } from "lucide-react";
import { kecamatan, KecamatanRow, desaLabuhanHaji, DesaRow, fmt, fmtK } from "../App";

export default function Populasi() {
  const [viewLevel, setViewLevel] = useState<"kecamatan" | "desa">("kecamatan");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("population");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const dataSrc = viewLevel === "kecamatan" ? kecamatan : desaLabuhanHaji;

  const filtered = [...dataSrc]
    .filter((k) => k.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = (a as any)[sortKey] as number;
      const vb = (b as any)[sortKey] as number;
      return sortDir === "asc" ? va - vb : vb - va;
    });

  const totalPop = dataSrc.reduce((s, k) => s + k.population, 0);
  const avgDensity = Math.round(dataSrc.reduce((s, k) => s + k.density, 0) / dataSrc.length);
  const thirdMetric = viewLevel === "kecamatan" 
    ? (kecamatan.reduce((s, k) => s + k.growth, 0) / kecamatan.length).toFixed(1) + "%"
    : (desaLabuhanHaji.reduce((s, k) => s + k.sexRatio, 0) / desaLabuhanHaji.length).toFixed(0);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function exportCSV() {
    // Basic export for now, can be adjusted based on viewLevel
    const header = viewLevel === "kecamatan" 
      ? ["No", "Kecamatan", "Penduduk", "Laki-laki", "Perempuan", "Kepadatan/km²", "Jml KK", "Laju (%)"]
      : ["No", "Desa/Kelurahan", "Penduduk", "Laki-laki", "Perempuan", "Persentase", "Kepadatan/km²", "Rasio Jenis Kelamin"];
    
    const rows = filtered.map((k, i) => {
      if (viewLevel === "kecamatan") {
        const kec = k as KecamatanRow;
        return [i + 1, kec.name, kec.population, kec.male, kec.female, kec.density, kec.households, kec.growth];
      } else {
        const desa = k as DesaRow;
        return [i + 1, desa.name, desa.population, desa.male, desa.female, desa.populationPercentage, desa.density, desa.sexRatio];
      }
    });
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-populasi-${viewLevel}-2024.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    window.print();
  }

  const colsKecamatan: { key: string; label: string; fmt: (k: any) => React.ReactNode }[] = [
    { key: "name", label: "Kecamatan", fmt: (k: KecamatanRow) => k.name },
    { key: "population", label: "Penduduk", fmt: (k: KecamatanRow) => fmt(k.population) },
    { key: "male", label: "Laki-laki", fmt: (k: KecamatanRow) => fmt(k.male) },
    { key: "female", label: "Perempuan", fmt: (k: KecamatanRow) => fmt(k.female) },
    { key: "density", label: "Kepadatan/km²", fmt: (k: KecamatanRow) => fmt(k.density) },
    { key: "households", label: "Jml KK", fmt: (k: KecamatanRow) => fmt(k.households) },
    { key: "growth", label: "Laju (%)", fmt: (k: KecamatanRow) => <span className={k.growth >= 2 ? "text-green-600 font-semibold" : "text-muted-foreground"}>{k.growth.toFixed(1)}%</span> },
  ];

  const colsDesa: { key: string; label: string; fmt: (k: any) => React.ReactNode }[] = [
    { key: "name", label: "Desa/Kelurahan", fmt: (k: DesaRow) => k.name },
    { key: "population", label: "Jumlah", fmt: (k: DesaRow) => fmt(k.population) },
    { key: "male", label: "Laki-Laki", fmt: (k: DesaRow) => fmt(k.male) },
    { key: "female", label: "Perempuan", fmt: (k: DesaRow) => fmt(k.female) },
    { key: "populationPercentage", label: "Persentase (%)", fmt: (k: DesaRow) => k.populationPercentage.toFixed(2) + "%" },
    { key: "density", label: "Kepadatan/km²", fmt: (k: DesaRow) => fmt(k.density) },
    { key: "sexRatio", label: "Rasio J. Kelamin", fmt: (k: DesaRow) => String(k.sexRatio) },
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
              setSortKey(level === "kecamatan" ? "population" : "population");
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
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users size={17} className="text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">{fmtK(totalPop)}</p>
            <p className="text-[10px] text-muted-foreground">Total Penduduk {viewLevel === "kecamatan" ? "Lombok Timur" : "Labuhan Haji"}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <Activity size={17} className="text-rose-500" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">{fmt(avgDensity)}</p>
            <p className="text-[10px] text-muted-foreground">Rata-rata Kepadatan / km²</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp size={17} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">{viewLevel === "kecamatan" ? "+" : ""}{thirdMetric}</p>
            <p className="text-[10px] text-muted-foreground">{viewLevel === "kecamatan" ? "Rata-rata Pertumbuhan" : "Rata-rata Rasio Jenis Kelamin"}</p>
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
