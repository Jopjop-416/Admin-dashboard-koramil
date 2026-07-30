import re
with open('app/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import {', 'import { supabase } from \'../lib/supabaseClient\';\nimport {', 1)

content = content.replace('export const kecamatan = [...DEFAULT_KECAMATAN];', 'export const kecamatan: KecamatanRow[] = [];')
content = content.replace('export const desaLabuhanHaji: DesaRow[] = [', 'export const desaLabuhanHaji: DesaRow[] = [];\n/*')
content = content.replace('    bpr: 2,\n  }\n];', '    bpr: 2,\n  }\n];*/')

app_code = '''export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [modal, setModal] = useState<KecamatanRow | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: kecData } = await supabase.from('kecamatan').select('*');
      const { data: desaData } = await supabase.from('desa').select('*');

      const toCamel = (obj: any) => {
        if (!obj || typeof obj !== 'object') return obj;
        const newObj: any = {};
        for (const key in obj) {
          const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
          newObj[camelKey] = obj[key];
        }
        return newObj;
      };

      if (kecData && kecData.length > 0) {
        kecamatan.length = 0;
        const mapped = kecData.map(toCamel).map((k: any) => {
          const def = DEFAULT_KECAMATAN.find(d => d.name === k.name);
          return { ...k, color: def?.color, gridCol: def?.gridCol, gridRow: def?.gridRow };
        });
        kecamatan.push(...mapped);
      }
      
      if (desaData && desaData.length > 0) {
        desaLabuhanHaji.length = 0;
        desaLabuhanHaji.push(...desaData.map(toCamel));
      }
      setDataLoaded(true);
    }
    loadData();
  }, []);

  const handleDistrict = useCallback(
    (k: KecamatanRow | DesaRow) => setModal(k as any),
    [],
  );

  if (!dataLoaded) return <div className="flex h-screen items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return ('''
content = content.replace('''export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [modal, setModal] = useState<KecamatanRow | null>(null);

  const handleDistrict = useCallback(
    (k: KecamatanRow) => setModal(k),
    [],
  );

  return (''', app_code)

old_dash = '''function DashboardPage({ onDistrict }: { onDistrict: (k: KecamatanRow) => void }) {
  const [category, setCategory] = useState<Category>("penduduk");
  const [search, setSearch]     = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);

  const filteredKec = useMemo(
    () => {
      const q = search.trim().toLowerCase();
      const normalizedQ = normalizeSearch(search);
      if (!q) return kecamatan;

      return kecamatan.filter((k) => {'''
new_dash = '''function DashboardPage({ onDistrict }: { onDistrict: (k: KecamatanRow | DesaRow) => void }) {
  const [category, setCategory] = useState<Category>("penduduk");
  const [search, setSearch]     = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [viewLevel, setViewLevel] = useState<"kecamatan" | "desa">("kecamatan");
  
  const activeDataSrc = viewLevel === "kecamatan" ? kecamatan : desaLabuhanHaji;

  const filteredKec = useMemo(
    () => {
      const q = search.trim().toLowerCase();
      const normalizedQ = normalizeSearch(search);
      if (!q) return activeDataSrc;

      return activeDataSrc.filter((k) => {'''
content = content.replace(old_dash, new_dash)

content = content.replace('''  const selectedDistrict = useMemo(
    () => kecamatan.find((k) => k.id === selectedDistrictId) ?? null,
    [selectedDistrictId],
  );''', '''  const selectedDistrict = useMemo(
    () => activeDataSrc.find((k) => k.id === selectedDistrictId) ?? null,
    [selectedDistrictId, activeDataSrc],
  );''')

content = content.replace('''    const exact = kecamatan.find(
      (k) => k.name.toLowerCase() === q || (!!normalizedQ && normalizeSearch(k.name) === normalizedQ),
    );
    const matches = kecamatan.filter((k) =>
      k.name.toLowerCase().includes(q) || (!!normalizedQ && normalizeSearch(k.name).includes(normalizedQ)),
    );
    const next = exact ?? (matches.length === 1 ? matches[0] : null);

    setSelectedDistrictId((prev) => (next ? next.id : prev === null ? prev : null));
  }, [search]);''', '''    const exact = activeDataSrc.find(
      (k) => k.name.toLowerCase() === q || (!!normalizedQ && normalizeSearch(k.name) === normalizedQ),
    );
    const matches = activeDataSrc.filter((k) =>
      k.name.toLowerCase().includes(q) || (!!normalizedQ && normalizeSearch(k.name).includes(normalizedQ)),
    );
    const next = exact ?? (matches.length === 1 ? matches[0] : null);

    setSelectedDistrictId((prev) => (next ? next.id : prev === null ? prev : null));
  }, [search, activeDataSrc]);''')

old_dash_toggle = '''          <div className="relative ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />'''
new_dash_toggle = '''          <div className="flex w-fit shrink-0 gap-1 bg-secondary rounded-md p-1 border border-border">
            <button
              onClick={() => { setViewLevel("kecamatan"); setSelectedDistrictId(null); }}
              className={"text-[11px] px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap " + (viewLevel === "kecamatan" ? "bg-black text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              Kecamatan
            </button>
            <button
              onClick={() => { setViewLevel("desa"); setSelectedDistrictId(null); }}
              className={"text-[11px] px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap " + (viewLevel === "desa" ? "bg-black text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              Desa
            </button>
          </div>
          <div className="relative ml-auto">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />'''
content = content.replace(old_dash_toggle, new_dash_toggle)

old_maps = '''function MapsPage() {
  const [selected, setSelected] = useState<KecamatanRow | null>(
    null,
  );
  const [filter, setFilter] = useState<
    "all" | "padat" | "jarang"
  >("all");
  const [category, setCategory] = useState<Category>("penduduk");

  const handleSelect = useCallback(
    (k: KecamatanRow) => setSelected(k),
    [],
  );

  return (
    <div className="flex h-full min-h-0">
      {/* Map container */}
      <div className="flex-1 relative min-h-[640px]">
        <LeafletMap
          filter={filter}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
        />

        {/* Filter overlay */}
        <div className="absolute top-4 left-4 z-[1000] flex gap-1 pointer-events-auto">
          {(["all", "padat", "jarang"] as const).map((f) => ('''
new_maps = '''function MapsPage() {
  const [selected, setSelected] = useState<KecamatanRow | DesaRow | null>(
    null,
  );
  const [filter, setFilter] = useState<
    "all" | "padat" | "jarang"
  >("all");
  const [category, setCategory] = useState<Category>("penduduk");
  const [viewLevel, setViewLevel] = useState<"kecamatan" | "desa">("kecamatan");

  const handleSelect = useCallback(
    (k: KecamatanRow | DesaRow) => setSelected(k),
    [],
  );

  return (
    <div className="flex h-full min-h-0">
      {/* Map container */}
      <div className="flex-1 relative min-h-[640px]">
        <LeafletMap
          filter={filter}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
          viewLevel={viewLevel}
        />

        {/* Filter overlay */}
        <div className="absolute top-4 left-4 z-[1000] flex gap-1 pointer-events-auto">
          <div className="flex bg-card/90 border border-border rounded-full shadow-lg" style={{ backdropFilter: "blur(8px)" }}>
            <button
              onClick={() => { setViewLevel("kecamatan"); setSelected(null); }}
              className={`text-[11px] px-3 py-1.5 rounded-l-full font-medium transition-colors ${
                viewLevel === "kecamatan" ? "bg-primary text-white" : "hover:bg-secondary text-foreground"
              }`}
            >
              Kecamatan
            </button>
            <button
              onClick={() => { setViewLevel("desa"); setSelected(null); }}
              className={`text-[11px] px-3 py-1.5 rounded-r-full font-medium transition-colors border-l border-border ${
                viewLevel === "desa" ? "bg-primary text-white" : "hover:bg-secondary text-foreground"
              }`}
            >
              Desa
            </button>
          </div>
          {(["all", "padat", "jarang"] as const).map((f) => ('''
content = content.replace(old_maps, new_maps)

old_leaflet_sig = '''function LeafletMap({
  filter,
  selectedId,
  onSelect,
}: {
  filter: "all" | "padat" | "jarang";
  selectedId: number | null;
  onSelect: (k: KecamatanRow) => void;
}) {'''
new_leaflet_sig = '''function LeafletMap({
  filter,
  selectedId,
  onSelect,
  viewLevel = "kecamatan",
}: {
  filter: "all" | "padat" | "jarang";
  selectedId: number | null;
  onSelect: (k: any) => void;
  viewLevel?: "kecamatan" | "desa";
}) {'''
content = content.replace(old_leaflet_sig, new_leaflet_sig)

old_leaflet_effect = '''    // Sync markers when filter or selectedId changes
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;'''
new_leaflet_effect = '''    useEffect(() => {
      if (!mapRef.current) return;
      if (viewLevel === "desa") {
        mapRef.current.flyTo([-8.6605, 116.5806], 13, { duration: 1.5 });
      } else {
        mapRef.current.flyTo([-8.58, 116.53], 10, { duration: 1.5 });
      }
    }, [viewLevel]);

    // Sync markers when filter or selectedId changes
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;'''
content = content.replace(old_leaflet_effect, new_leaflet_effect)

old_leaflet_markers = '''      const visible = kecamatan.filter((k) => {
        if (filter === "padat") return k.density > 500;
        if (filter === "jarang") return k.density <= 500;
        return true;
      });'''
new_leaflet_markers = '''      const activeDataSrc = viewLevel === "kecamatan" ? kecamatan : desaLabuhanHaji;
      const visible = activeDataSrc.filter((k) => {
        if (filter === "padat") return k.density > 500;
        if (filter === "jarang") return k.density <= 500;
        return true;
      });'''
content = content.replace(old_leaflet_markers, new_leaflet_markers)

with open('app/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
