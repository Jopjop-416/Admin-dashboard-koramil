import React, { useState } from "react";
import { Search, Filter, Download, Map, Home, Mountain } from "lucide-react";
import { kecamatan, KecamatanRow, desaLabuhanHaji, DesaRow, fmt, fmtK } from "../App";

export default function Geographic() {
  const [viewLevel, setViewLevel] = useState<"kecamatan" | "desa">("kecamatan");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("area");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const dataSrc = viewLevel === "kecamatan" ? kecamatan : desaLabuhanHaji;

  const filtered = [...dataSrc]
    .filter((k) => k.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = (a as any)[sortKey] as number;
      const vb = (b as any)[sortKey] as number;
      return sortDir === "asc" ? va - vb : vb - va;
    });

  const totalArea = dataSrc.reduce((s, k) => s + k.area, 0);
  const secondMetric = viewLevel === "kecamatan" 
    ? kecamatan.reduce((s, k) => s + k.villages, 0)
    : desaLabuhanHaji.reduce((s, k) => s + k.hamlets, 0);
  const thirdMetric = viewLevel === "kecamatan" 
    ? Math.round(kecamatan.reduce((s, k) => s + k.elevation, 0) / kecamatan.length)
    : Math.round(desaLabuhanHaji.reduce((s, k) => s + k.areaPercentage, 0) / desaLabuhanHaji.length);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function exportCSV() {
    const header = viewLevel === "kecamatan"
      ? ["No", "Kecamatan", "Luas (km²)", "Desa/Kel", "Dusun", "Jalan (km)", "Elevasi (m)", "Sawah (%)", "Jarak Kab (km)"]
      : ["No", "Desa/Kelurahan", "Luas Total (sq.km)", "Persentase Luas (%)"];
    
    const rows = filtered.map((k, i) => {
      if (viewLevel === "kecamatan") {
        const kec = k as KecamatanRow;
        return [i + 1, kec.name, kec.area, kec.villages, kec.hamlets, kec.roadLength, kec.elevation, kec.sawahPct, kec.distanceToCapital];
      } else {
        const desa = k as DesaRow;
        return [i + 1, desa.name, desa.area, desa.areaPercentage];
      }
    });
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-geografis-${viewLevel}-2024.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    window.print();
  }

  const colsKecamatan: { key: string; label: string; fmt: (k: any) => React.ReactNode }[] = [
    { key: "name", label: "Kecamatan", fmt: (k: KecamatanRow) => k.name },
    { key: "area", label: "Luas (km²)", fmt: (k: KecamatanRow) => k.area.toFixed(2) },
    { key: "villages", label: "Desa/Kel", fmt: (k: KecamatanRow) => String(k.villages) },
    { key: "hamlets", label: "Dusun", fmt: (k: KecamatanRow) => String(k.hamlets) },
    { key: "roadLength", label: "Jalan (km)", fmt: (k: KecamatanRow) => String(k.roadLength) },
    { key: "elevation", label: "Elevasi (m)", fmt: (k: KecamatanRow) => String(k.elevation) },
    { key: "sawahPct", label: "Sawah (%)", fmt: (k: KecamatanRow) => k.sawahPct.toFixed(0) + "%" },
    { key: "distanceToCapital", label: "Jarak Kab (km)", fmt: (k: KecamatanRow) => String(k.distanceToCapital) },
  ];

  const colsDesa: { key: string; label: string; fmt: (k: any) => React.ReactNode }[] = [
    { key: "name", label: "Desa/Kelurahan", fmt: (k: DesaRow) => k.name },
    { key: "area", label: "Luas Total (sq.km)", fmt: (k: DesaRow) => k.area.toFixed(2) },
    { key: "areaPercentage", label: "Persentase Luas (%)", fmt: (k: DesaRow) => k.areaPercentage.toFixed(2) + "%" },
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
              setSortKey("area");
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
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Map size={17} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">{totalArea.toFixed(0)} km²</p>
            <p className="text-[10px] text-muted-foreground">Total Luas Wilayah</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Home size={17} className="text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">{secondMetric}</p>
            <p className="text-[10px] text-muted-foreground">{viewLevel === "kecamatan" ? "Total Desa/Kelurahan" : "Total Dusun"}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Mountain size={17} className="text-orange-500" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">{thirdMetric} {viewLevel === "kecamatan" ? "m" : "%"}</p>
            <p className="text-[10px] text-muted-foreground">{viewLevel === "kecamatan" ? "Rata-rata Elevasi (mdpl)" : "Rata-rata Persentase Luas"}</p>
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
              placeholder={viewLevel === "kecamatan" ? "Cari kecamatan…" : "Cari desa…"}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground border border-border rounded-lg px-2.5 py-1.5">
            <Filter size={11} />
            <span>{filtered.length} dari {dataSrc.length} {viewLevel === "kecamatan" ? "kecamatan" : "Desa"}</span>
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
