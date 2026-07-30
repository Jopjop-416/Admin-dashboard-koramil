const fs = require('fs');
let content = fs.readFileSync('app/App.tsx', 'utf8');

// 1. Fix LeafletMap markers logic
const oldMarkers = /const visible = kecamatan\.filter\(\(k\) => \{\s+if \(filter === "padat"\) return k\.density > 500;\s+if \(filter === "jarang"\) return k\.density <= 500;\s+return true;\s+\}\);/;
const newMarkers = `const activeDataSrc = viewLevel === "kecamatan" ? kecamatan : desaLabuhanHaji;
      const visible = activeDataSrc.filter((k) => {
        if (filter === "padat") return k.density > 500;
        if (filter === "jarang") return k.density <= 500;
        return true;
      });`;
content = content.replace(oldMarkers, newMarkers);

// 2. Fix LeafletMap viewLevel effect (flyTo)
const effectInject = `    useEffect(() => {
      if (!mapRef.current) return;
      if (viewLevel === "desa") {
        mapRef.current.flyTo([-8.6605, 116.5806], 13, { duration: 1.5 });
      } else {
        mapRef.current.flyTo([-8.58, 116.53], 10, { duration: 1.5 });
      }
    }, [viewLevel]);

    // Sync markers when filter or selectedId changes`;
if (!content.includes('viewLevel === "desa"')) {
    content = content.replace('// Sync markers when filter or selectedId changes', effectInject);
}

// 3. Fix MapsPage Toggle Buttons style to match Dashboard
const oldMapsToggle = /<div className="ml-2 flex bg-card\/90 border border-border rounded-full shadow-lg" style=\{\{ backdropFilter: "blur\(8px\)" \}\}>[\s\S]*?<\/button>\s*<\/div>/;
const newMapsToggle = `<div className="ml-2 flex w-fit shrink-0 gap-1 bg-secondary rounded-md p-1 border border-border" style={{ backdropFilter: "blur(8px)" }}>
            <button
              onClick={() => { setViewLevel("kecamatan"); setSelected(null); }}
              className={"text-[11px] px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap " + (viewLevel === "kecamatan" ? "bg-black text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              Kecamatan
            </button>
            <button
              onClick={() => { setViewLevel("desa"); setSelected(null); }}
              className={"text-[11px] px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap " + (viewLevel === "desa" ? "bg-black text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              Desa
            </button>
          </div>`;
content = content.replace(oldMapsToggle, newMapsToggle);

// Also need to fix the LeafletMap viewLevel dependency in the useEffect for markers!
const oldDeps = /\}, \[filter, selectedId, onSelect\]\);/;
const newDeps = `}, [filter, selectedId, onSelect, viewLevel]);`;
content = content.replace(oldDeps, newDeps);

fs.writeFileSync('app/App.tsx', content);
