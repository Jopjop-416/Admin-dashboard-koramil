import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import logo from "../components/asset/image/logo.png";
import foto3 from "../components/asset/image/foto3.jpg";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Populasi from "./menu/populasi";
import Geographic from "./menu/geographic";
import Ekonomi from "./menu/ekonomi";
import Sosial from "./menu/sosial";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  Map,
  FileText,
  Users,
  TrendingUp,
  Download,
  Search,
  Filter,
  X,
  Building2,
  GraduationCap,
  Heart,
  Briefcase,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Layers,
  MapPin,
  Table2,
  BarChart3,
  Activity,
} from "lucide-react";

// ─── DATA ──────────────────────────────────────────────────────────────────────

type KecamatanRow = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  population: number;
  area: number;
  villages: number;
  male: number;
  female: number;
  density: number;
  literacy: number;
  unemployment: number;
  growth: number;
  gridCol: number;
  gridRow: number;
  // Extended fields
  households: number;      // jumlah KK
  schoolCount: number;     // total sekolah SD+SMP+SMA
  healthFacility: number;  // puskesmas + pustu
  posyandu: number;
  worshipPlace: number;    // masjid, musala, dll.
  roadLength: number;      // km
  elevation: number;       // mdpl
  avgSchooling: number;    // rata-rata lama sekolah (tahun)
  industry: number;        // industri kecil/RT
  markets: number;         // pasar
  cooperatives: number;    // koperasi
  pdrb: number;            // ribu rupiah per kapita
  hamlets: number;         // dusun
  distanceToCapital: number; // km ke ibukota kabupaten
  sawahPct: number;        // % lahan sawah
  aps: number;             // angka partisipasi sekolah (%)
};

const kecamatan: KecamatanRow[] = [
  { id: 1,  name: "Keruak",         lat: -8.7509, lng: 116.5063, population: 52340,  area: 72.26,  villages: 15, male: 25800, female: 26540, density: 724,  literacy: 82.4, unemployment: 5.2, growth: 1.8, gridCol: 2, gridRow: 7, households: 14200, schoolCount: 38, healthFacility: 6,  posyandu: 28, worshipPlace: 52,  roadLength: 48,  elevation: 5,   avgSchooling: 6.8, industry: 85,  markets: 3, cooperatives: 4,  pdrb: 14200, hamlets: 42, distanceToCapital: 38, sawahPct: 35, aps: 78.2 },
  { id: 2,  name: "Jerowaru",       lat: -8.7831, lng: 116.4727, population: 44820,  area: 147.32, villages: 11, male: 21900, female: 22920, density: 304,  literacy: 79.8, unemployment: 6.1, growth: 1.4, gridCol: 1, gridRow: 7, households: 12100, schoolCount: 29, healthFacility: 5,  posyandu: 22, worshipPlace: 44,  roadLength: 62,  elevation: 8,   avgSchooling: 6.2, industry: 68,  markets: 2, cooperatives: 3,  pdrb: 12800, hamlets: 35, distanceToCapital: 42, sawahPct: 18, aps: 74.5 },
  { id: 3,  name: "Sakra",          lat: -8.6726, lng: 116.4871, population: 61500,  area: 30.25,  villages: 14, male: 30100, female: 31400, density: 2033, literacy: 88.1, unemployment: 4.3, growth: 2.1, gridCol: 2, gridRow: 6, households: 16600, schoolCount: 42, healthFacility: 7,  posyandu: 32, worshipPlace: 58,  roadLength: 35,  elevation: 12,  avgSchooling: 7.4, industry: 110, markets: 4, cooperatives: 5,  pdrb: 16500, hamlets: 48, distanceToCapital: 18, sawahPct: 52, aps: 83.4 },
  { id: 4,  name: "Sakra Barat",    lat: -8.6930, lng: 116.4520, population: 43800,  area: 49.35,  villages: 12, male: 21400, female: 22400, density: 888,  literacy: 84.6, unemployment: 4.9, growth: 1.6, gridCol: 1, gridRow: 6, households: 11800, schoolCount: 31, healthFacility: 5,  posyandu: 25, worshipPlace: 46,  roadLength: 40,  elevation: 15,  avgSchooling: 7.1, industry: 90,  markets: 3, cooperatives: 3,  pdrb: 15100, hamlets: 36, distanceToCapital: 22, sawahPct: 45, aps: 80.1 },
  { id: 5,  name: "Sakra Timur",    lat: -8.6940, lng: 116.5160, population: 37600,  area: 40.15,  villages: 10, male: 18400, female: 19200, density: 936,  literacy: 83.2, unemployment: 5.5, growth: 1.5, gridCol: 3, gridRow: 6, households: 10100, schoolCount: 26, healthFacility: 4,  posyandu: 20, worshipPlace: 38,  roadLength: 38,  elevation: 10,  avgSchooling: 6.9, industry: 75,  markets: 2, cooperatives: 3,  pdrb: 14600, hamlets: 30, distanceToCapital: 25, sawahPct: 40, aps: 79.2 },
  { id: 6,  name: "Terara",         lat: -8.6517, lng: 116.4232, population: 54200,  area: 39.58,  villages: 14, male: 26500, female: 27700, density: 1370, literacy: 86.5, unemployment: 4.7, growth: 1.9, gridCol: 1, gridRow: 5, households: 14600, schoolCount: 38, healthFacility: 6,  posyandu: 29, worshipPlace: 54,  roadLength: 42,  elevation: 20,  avgSchooling: 7.2, industry: 95,  markets: 3, cooperatives: 4,  pdrb: 15800, hamlets: 44, distanceToCapital: 15, sawahPct: 48, aps: 81.6 },
  { id: 7,  name: "Montong Gading", lat: -8.6010, lng: 116.4380, population: 34900,  area: 52.78,  villages: 9,  male: 17100, female: 17800, density: 661,  literacy: 81.3, unemployment: 6.3, growth: 1.3, gridCol: 3, gridRow: 5, households: 9400,  schoolCount: 24, healthFacility: 4,  posyandu: 18, worshipPlace: 36,  roadLength: 45,  elevation: 25,  avgSchooling: 6.7, industry: 60,  markets: 2, cooperatives: 2,  pdrb: 13200, hamlets: 28, distanceToCapital: 20, sawahPct: 38, aps: 76.8 },
  { id: 8,  name: "Sikur",          lat: -8.6258, lng: 116.4365, population: 57800,  area: 87.05,  villages: 15, male: 28300, female: 29500, density: 664,  literacy: 85.9, unemployment: 4.8, growth: 1.7, gridCol: 2, gridRow: 5, households: 15600, schoolCount: 41, healthFacility: 7,  posyandu: 31, worshipPlace: 55,  roadLength: 58,  elevation: 30,  avgSchooling: 7.3, industry: 100, markets: 3, cooperatives: 4,  pdrb: 15400, hamlets: 46, distanceToCapital: 12, sawahPct: 42, aps: 82.1 },
  { id: 9,  name: "Masbagik",       lat: -8.6231, lng: 116.4695, population: 94200,  area: 26.24,  villages: 9,  male: 46000, female: 48200, density: 3590, literacy: 91.2, unemployment: 3.4, growth: 2.8, gridCol: 3, gridRow: 4, households: 25400, schoolCount: 52, healthFacility: 9,  posyandu: 40, worshipPlace: 72,  roadLength: 32,  elevation: 18,  avgSchooling: 8.1, industry: 180, markets: 6, cooperatives: 8,  pdrb: 21200, hamlets: 62, distanceToCapital: 8,  sawahPct: 55, aps: 88.4 },
  { id: 10, name: "Pringgasela",    lat: -8.5750, lng: 116.4950, population: 41300,  area: 121.68, villages: 8,  male: 20200, female: 21100, density: 339,  literacy: 83.7, unemployment: 5.6, growth: 1.5, gridCol: 2, gridRow: 4, households: 11100, schoolCount: 28, healthFacility: 5,  posyandu: 22, worshipPlace: 42,  roadLength: 65,  elevation: 45,  avgSchooling: 7.0, industry: 78,  markets: 2, cooperatives: 3,  pdrb: 14000, hamlets: 34, distanceToCapital: 14, sawahPct: 30, aps: 79.5 },
  { id: 11, name: "Sukamulia",      lat: -8.6210, lng: 116.5180, population: 38400,  area: 16.32,  villages: 7,  male: 18800, female: 19600, density: 2353, literacy: 89.4, unemployment: 3.8, growth: 2.0, gridCol: 4, gridRow: 4, households: 10300, schoolCount: 25, healthFacility: 4,  posyandu: 19, worshipPlace: 38,  roadLength: 22,  elevation: 10,  avgSchooling: 7.8, industry: 85,  markets: 3, cooperatives: 3,  pdrb: 18200, hamlets: 30, distanceToCapital: 5,  sawahPct: 62, aps: 85.6 },
  { id: 12, name: "Suralaga",       lat: -8.5830, lng: 116.5360, population: 47600,  area: 19.51,  villages: 10, male: 23300, female: 24300, density: 2440, literacy: 90.1, unemployment: 3.6, growth: 2.2, gridCol: 4, gridRow: 3, households: 12800, schoolCount: 32, healthFacility: 5,  posyandu: 24, worshipPlace: 46,  roadLength: 28,  elevation: 12,  avgSchooling: 7.9, industry: 98,  markets: 3, cooperatives: 4,  pdrb: 19000, hamlets: 38, distanceToCapital: 4,  sawahPct: 58, aps: 86.2 },
  { id: 13, name: "Selong",         lat: -8.6500, lng: 116.5330, population: 78300,  area: 17.09,  villages: 11, male: 38200, female: 40100, density: 4581, literacy: 93.8, unemployment: 2.9, growth: 2.5, gridCol: 3, gridRow: 3, households: 21100, schoolCount: 68, healthFacility: 12, posyandu: 46, worshipPlace: 88,  roadLength: 35,  elevation: 15,  avgSchooling: 9.2, industry: 220, markets: 8, cooperatives: 12, pdrb: 28500, hamlets: 72, distanceToCapital: 0,  sawahPct: 45, aps: 92.1 },
  { id: 14, name: "Labuhan Haji",   lat: -8.6800, lng: 116.5600, population: 57900,  area: 34.41,  villages: 11, male: 28300, female: 29600, density: 1683, literacy: 87.6, unemployment: 4.1, growth: 1.8, gridCol: 5, gridRow: 4, households: 15600, schoolCount: 42, healthFacility: 8,  posyandu: 35, worshipPlace: 62,  roadLength: 45,  elevation: 20,  avgSchooling: 7.6, industry: 120, markets: 4, cooperatives: 5,  pdrb: 18500, hamlets: 52, distanceToCapital: 6,  sawahPct: 48, aps: 84.2 },
  { id: 15, name: "Pringgabaya",    lat: -8.5570, lng: 116.6319, population: 68200,  area: 125.35, villages: 14, male: 33400, female: 34800, density: 544,  literacy: 86.3, unemployment: 4.5, growth: 1.9, gridCol: 5, gridRow: 2, households: 18400, schoolCount: 45, healthFacility: 8,  posyandu: 36, worshipPlace: 65,  roadLength: 72,  elevation: 12,  avgSchooling: 7.5, industry: 115, markets: 4, cooperatives: 5,  pdrb: 17200, hamlets: 55, distanceToCapital: 24, sawahPct: 40, aps: 83.6 },
  { id: 16, name: "Suela",          lat: -8.5080, lng: 116.6060, population: 27800,  area: 121.26, villages: 7,  male: 13600, female: 14200, density: 229,  literacy: 78.5, unemployment: 7.2, growth: 1.1, gridCol: 6, gridRow: 2, households: 7500,  schoolCount: 21, healthFacility: 4,  posyandu: 16, worshipPlace: 32,  roadLength: 68,  elevation: 80,  avgSchooling: 6.4, industry: 52,  markets: 1, cooperatives: 2,  pdrb: 11800, hamlets: 25, distanceToCapital: 30, sawahPct: 22, aps: 73.8 },
  { id: 17, name: "Aikmel",         lat: -8.5610, lng: 116.5510, population: 72400,  area: 109.47, villages: 14, male: 35400, female: 37000, density: 661,  literacy: 88.9, unemployment: 4.0, growth: 2.1, gridCol: 4, gridRow: 2, households: 19500, schoolCount: 48, healthFacility: 8,  posyandu: 38, worshipPlace: 68,  roadLength: 62,  elevation: 25,  avgSchooling: 7.8, industry: 130, markets: 4, cooperatives: 6,  pdrb: 18800, hamlets: 58, distanceToCapital: 12, sawahPct: 52, aps: 85.8 },
  { id: 18, name: "Wanasaba",       lat: -8.5580, lng: 116.5810, population: 60800,  area: 56.62,  villages: 12, male: 29700, female: 31100, density: 1074, literacy: 87.2, unemployment: 4.4, growth: 1.9, gridCol: 2, gridRow: 2, households: 16400, schoolCount: 42, healthFacility: 7,  posyandu: 33, worshipPlace: 60,  roadLength: 50,  elevation: 30,  avgSchooling: 7.5, industry: 108, markets: 3, cooperatives: 5,  pdrb: 17600, hamlets: 50, distanceToCapital: 10, sawahPct: 45, aps: 84.0 },
  { id: 19, name: "Sembalun",       lat: -8.3791, lng: 116.5055, population: 17600,  area: 218.84, villages: 6,  male: 8600,  female: 9000,  density: 80,   literacy: 76.3, unemployment: 8.1, growth: 0.9, gridCol: 7, gridRow: 1, households: 4700,  schoolCount: 16, healthFacility: 3,  posyandu: 12, worshipPlace: 24,  roadLength: 85,  elevation: 900, avgSchooling: 6.1, industry: 38,  markets: 1, cooperatives: 2,  pdrb: 13500, hamlets: 18, distanceToCapital: 55, sawahPct: 15, aps: 71.2 },
  { id: 20, name: "Sambelia",       lat: -8.3240, lng: 116.6660, population: 21900,  area: 229.77, villages: 8,  male: 10700, female: 11200, density: 95,   literacy: 77.9, unemployment: 7.6, growth: 1.0, gridCol: 7, gridRow: 0, households: 5900,  schoolCount: 18, healthFacility: 3,  posyandu: 14, worshipPlace: 28,  roadLength: 95,  elevation: 10,  avgSchooling: 6.3, industry: 45,  markets: 1, cooperatives: 2,  pdrb: 12400, hamlets: 22, distanceToCapital: 65, sawahPct: 20, aps: 72.5 },
  { id: 21, name: "Lenek",          lat: -8.5630, lng: 116.5310, population: 32400,  area: 45.23,  villages: 8,  male: 15800, female: 16600, density: 716,  literacy: 84.1, unemployment: 5.3, growth: 1.6, gridCol: 5, gridRow: 3, households: 8700,  schoolCount: 22, healthFacility: 4,  posyandu: 18, worshipPlace: 35,  roadLength: 38,  elevation: 18,  avgSchooling: 7.2, industry: 65,  markets: 2, cooperatives: 3,  pdrb: 15800, hamlets: 28, distanceToCapital: 8,  sawahPct: 42, aps: 80.5 },
];

const populationTrend = [
  { year: "2019", penduduk: 1183400, laju: 1.8 },
  { year: "2020", penduduk: 1201700, laju: 1.5 },
  { year: "2021", penduduk: 1224300, laju: 1.9 },
  { year: "2022", penduduk: 1248600, laju: 2.0 },
  { year: "2023", penduduk: 1270940, laju: 1.8 },
  { year: "2024", penduduk: 1293040, laju: 1.7 },
];

const ageGroups = [
  { name: "0–14 Tahun", value: 312400, color: "#3b82f6" },
  { name: "15–64 Tahun", value: 852800, color: "#10b981" },
  { name: "65+ Tahun", value: 127840, color: "#f59e0b" },
];

const topDistricts = [...kecamatan]
  .sort((a, b) => b.population - a.population)
  .slice(0, 8);

const monthlyData = [
  { month: "Jan", kelahiran: 1840, kematian: 620 },
  { month: "Feb", kelahiran: 1720, kematian: 590 },
  { month: "Mar", kelahiran: 1890, kematian: 640 },
  { month: "Apr", kelahiran: 1780, kematian: 580 },
  { month: "Mei", kelahiran: 1950, kematian: 610 },
  { month: "Jun", kelahiran: 1820, kematian: 570 },
  { month: "Jul", kelahiran: 1940, kematian: 630 },
  { month: "Agt", kelahiran: 1870, kematian: 590 },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("id-ID");
}

function fmtK(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + " jt";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + " rb";
  return String(n);
}

function populationColor(pop: number): string {
  if (pop > 70000) return "#1d4ed8";
  if (pop > 50000) return "#2563eb";
  if (pop > 35000) return "#3b82f6";
  if (pop > 20000) return "#60a5fa";
  return "#93c5fd";
}

function normalizeSearch(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/[aiueo]/g, "");
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

type Page = "dashboard" | "maps" | "laporan" | "populasi" | "geographic" | "ekonomi" | "sosial";

const navItems: {
  id: Page;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: "maps",
    label: "Peta Wilayah",
    icon: <Map size={18} />,
  },
  {
    id: "laporan",
    label: "Data Laporan",
    icon: <FileText size={18} />,
  },
  {
    id: "populasi",
    label: "Data Populasi",
    icon: <Users size={18} />,
  },
  {
    id: "geographic",
    label: "Data Geographic",
    icon: <MapPin size={18} />,
  },
  {
    id: "ekonomi",
    label: "Data Ekonomi",
    icon: <TrendingUp size={18} />,
  },
  {
    id: "sosial",
    label: "Data Sosial",
    icon: <Heart size={18} />,
  },
];

function Sidebar({
  page,
  onNavigate,
}: {
  page: Page;
  onNavigate: (p: Page) => void;
}) {
  return (
    <aside className="w-60 shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={logo}
              alt="Logo Koramil 08"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <p className="text-md font-semibold text-foreground leading-none text-[16px]">
              Koramil 08
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${ active ? "bg-black text-white" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" } mx-[0px] mt-[0px] mb-[2px] px-[11px] py-[10px]`}
            >
              <span
                className={
                  active
                    ? "text-white"
                    : "text-muted-foreground"
                }
              >
                {item.icon}
              </span>
              {item.label}
              {active && (
                <ChevronRight
                  size={14}
                  className="ml-auto text-primary"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Users size={14} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              Admin Dinas
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              Lombok Timur
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────

function TopBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const now = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <header className="shrink-0 h-14 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur px-[23px] py-[40px]">
      <div>
        <h1 className="text-sm font-semibold text-foreground leading-none">
          {title}
        </h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-muted-foreground hidden sm:block font-sans">
          {now}
        </span>
      </div>
    </header>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
  trend?: number;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span className="flex items-center gap-0.5 text-[11px] font-sans text-muted-foreground">
            <ArrowUpRight size={12} />
            {trend}%
          </span>
        )}
      </div>
      <p className="text-xl font-semibold text-foreground tracking-tight font-sans">
        {value}
      </p>
      <p className="text-[11px] font-medium text-foreground mt-0.5">
        {label}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">
        {sub}
      </p>
    </div>
  );
}

// ─── MINI MAP (SVG Grid) ───────────────────────────────────────────────────────

function MiniMap({
  onSelect,
  title = "Peta Kecamatan",
  subtitle = "Klik untuk detail",
  maxHeight = 280,
}: {
  onSelect: (k: KecamatanRow) => void;
  title?: string;
  subtitle?: string;
  maxHeight?: number;
}) {
  const COLS = 8;
  const ROWS = 8;
  const CW = 52;
  const CH = 36;
  const PAD = 3;

  const grid: (KecamatanRow | null)[][] = Array.from(
    { length: ROWS },
    () => Array(COLS).fill(null),
  );
  kecamatan.forEach((k) => {
    if (k.gridRow < ROWS && k.gridCol < COLS) {
      grid[k.gridRow][k.gridCol] = k;
    }
  });

  return (
    <div className="bg-card border border-border rounded-xl p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-foreground">{title}</p>
          <p className="text-[10px] text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: "#1d4ed8" }}
            />{" "}
            &gt;70rb
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: "#60a5fa" }}
            />{" "}
            &gt;35rb
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: "#bfdbfe" }}
            />{" "}
            lainnya
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${COLS * (CW + PAD) + PAD} ${ROWS * (CH + PAD) + PAD}`}
        className="w-full h-full"
        style={{ maxHeight }}
      >
        {grid.map((row, ri) =>
          row.map((cell, ci) => {
            if (!cell) return null;
            const x = PAD + ci * (CW + PAD);
            const y = PAD + ri * (CH + PAD);
            const col = populationColor(cell.population);
            return (
              <g
                key={cell.id}
                onClick={() => onSelect(cell)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={y}
                  width={CW}
                  height={CH}
                  rx={4}
                  ry={4}
                  fill={col}
                  fillOpacity={0.18}
                  stroke={col}
                  strokeOpacity={0.5}
                  strokeWidth={1}
                />
                <rect
                  x={x}
                  y={y}
                  width={CW}
                  height={CH}
                  rx={4}
                  ry={4}
                  fill="transparent"
                  stroke={col}
                  strokeOpacity={0}
                  strokeWidth={2}
                  className="hover:stroke-opacity-100 transition-all"
                />
                <text
                  x={x + CW / 2}
                  y={y + CH / 2 - 5}
                  textAnchor="middle"
                  fontSize="7.5"
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                  fill="#ffffff"
                  fillOpacity={0.95}
                >
                  {cell.name.length > 9
                    ? cell.name.slice(0, 8) + "…"
                    : cell.name}
                </text>
                <text
                  x={x + CW / 2}
                  y={y + CH / 2 + 7}
                  textAnchor="middle"
                  fontSize="7"
                  fontFamily="Inter, sans-serif"
                  fill={col}
                  fillOpacity={0.9}
                >
                  {fmtK(cell.population)}
                </text>
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}

// ─── DISTRICT MODAL ───────────────────────────────────────────────────────────

function DistrictModal({
  k,
  onClose,
}: {
  k: KecamatanRow;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <MapPin size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Kec. {k.name}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Kabupaten Lombok Timur
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border hover:bg-secondary transition-colors"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Total Penduduk",
              value: fmt(k.population) + " jiwa",
              icon: <Users size={14} />,
              col: "text-foreground",
            },
            {
              label: "Laki-laki",
              value: fmt(k.male) + " jiwa",
              icon: <Users size={14} />,
              col: "text-foreground",
            },
            {
              label: "Perempuan",
              value: fmt(k.female) + " jiwa",
              icon: <Users size={14} />,
              col: "text-foreground",
            },
            {
              label: "Luas Wilayah",
              value: k.area.toFixed(2) + " km²",
              icon: <Map size={14} />,
              col: "text-foreground",
            },
            {
              label: "Kepadatan",
              value: fmt(k.density) + "/km²",
              icon: <Building2 size={14} />,
              col: "text-foreground",
            },
            {
              label: "Jumlah Desa",
              value: k.villages + " Desa/Kel.",
              icon: <Layers size={14} />,
              col: "text-foreground",
            },
            {
              label: "Melek Huruf",
              value: k.literacy.toFixed(1) + "%",
              icon: <GraduationCap size={14} />,
              col: "text-foreground",
            },
            {
              label: "Pengangguran",
              value: k.unemployment.toFixed(1) + "%",
              icon: <Briefcase size={14} />,
              col: "text-muted-foreground",
            },
          ].map((d) => (
            <div
              key={d.label}
              className="bg-secondary/50 border border-border rounded-lg p-3"
            >
              <div
                className={`flex items-center gap-1.5 mb-1 ${d.col}`}
              >
                {d.icon}
                <span className="text-[10px] font-medium text-muted-foreground">
                  {d.label}
                </span>
              </div>
              <p className="text-sm font-semibold font-sans text-foreground">
                {d.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp size={13} className="text-primary" />
            <span className="text-[11px] text-muted-foreground">
              Laju pertumbuhan penduduk
            </span>
            <span className="ml-auto text-xs font-sans font-semibold text-primary">
              +{k.growth}%/thn
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TOOLTIP ──────────────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">
        {label}
      </p>
      {payload.map((p) => (
        <div
          key={p.name}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span>{p.name}:</span>
          <span className="font-sans font-semibold text-foreground">
            {fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function PopulationAreaChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={populationTrend}>
        <defs>
          <linearGradient
            id="popGrad"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#3b82f6"
              stopOpacity={0.25}
            />
            <stop
              offset="100%"
              stopColor="#3b82f6"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(0,0,0,0.07)"
        />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 10, fill: "#888" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#888" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => fmtK(v)}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="penduduk"
          name="Penduduk"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#popGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function BirthDeathBarChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={monthlyData}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(0,0,0,0.07)"
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: "#888" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#888" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar
          dataKey="kelahiran"
          name="Kelahiran"
          fill="#10b981"
          radius={[3, 3, 0, 0]}
        />
        <Bar
          dataKey="kematian"
          name="Kematian"
          fill="#f43f5e"
          radius={[3, 3, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function DistrictBarChart() {
  const colors = [
    "#1d4ed8",
    "#2563eb",
    "#3b82f6",
    "#0ea5e9",
    "#06b6d4",
    "#0891b2",
    "#0284c7",
    "#0369a1",
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={topDistricts} layout="vertical">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(0,0,0,0.07)"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: "#888" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={fmtK}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 10, fill: "#555" }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar
          dataKey="population"
          name="Penduduk"
          radius={[0, 4, 4, 0]}
          maxBarSize={18}
        >
          {topDistricts.map((_, i) => (
            <Cell
              key={`bar-${i}`}
              fill={colors[i % colors.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── EXTRA ANALYTICS DATA ────────────────────────────────────────────────────

const pdrbTrend5yr = [
  { yr: "2019", RataRata: 15800, Selong: 24200, Masbagik: 18600, Suralaga: 17200 },
  { yr: "2020", RataRata: 15100, Selong: 23100, Masbagik: 17800, Suralaga: 16400 },
  { yr: "2021", RataRata: 15600, Selong: 24000, Masbagik: 18200, Suralaga: 16800 },
  { yr: "2022", RataRata: 16800, Selong: 25900, Masbagik: 19600, Suralaga: 17900 },
  { yr: "2023", RataRata: 17600, Selong: 27200, Masbagik: 20400, Suralaga: 18600 },
  { yr: "2024", RataRata: 16100, Selong: 28500, Masbagik: 21200, Suralaga: 19000 },
];

const literacyTrend6yr = [
  { yr: "2019", rate: 83.2 }, { yr: "2020", rate: 83.8 }, { yr: "2021", rate: 84.2 },
  { yr: "2022", rate: 84.6 }, { yr: "2023", rate: 85.1 }, { yr: "2024", rate: 85.6 },
];

const LINE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f43f5e", "#84cc16"];

// ─── ANALYTICS HELPERS ────────────────────────────────────────────────────────

type ColDef = { key: string; label: string; render?: (row: KecamatanRow) => React.ReactNode };

function buildDistrictTrend(districts: KecamatanRow[]): Record<string, number | string>[] {
  return [2020, 2021, 2022, 2023, 2024].map((yr) => {
    const row: Record<string, number | string> = { yr: String(yr) };
    districts.forEach((k) => {
      const back = 2024 - yr;
      row[k.name] = Math.round(k.population / Math.pow(1 + k.growth / 100, back));
    });
    return row;
  });
}

function DonutRing({ pct, label, sublabel, color }: { pct: number; label: string; sublabel: string; color: string }) {
  const r = 34, cx = 46, cy = 46;
  const circ = 2 * Math.PI * r;
  const safePct = Math.max(0, Math.min(100, pct));
  const dash = (safePct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <div className="relative shrink-0">
        <svg width={92} height={92}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth={10} />
          <circle
            cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
            strokeDasharray={dash + " " + circ} strokeLinecap="round"
            transform={"rotate(-90 " + cx + " " + cy + ")"}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[15px] font-bold text-foreground leading-none">{safePct}%</span>
        </div>
      </div>
      <p className="text-[11px] font-semibold text-center leading-tight text-foreground px-1">{label}</p>
      <p className="text-[10px] text-muted-foreground text-center leading-tight px-1">{sublabel}</p>
    </div>
  );
}

function MetricRing({
  value,
  max,
  label,
  sublabel,
  color,
  display,
  unit,
}: {
  value: number;
  max: number;
  label: string;
  sublabel: string;
  color: string;
  display: string;
  unit?: string;
}) {
  const r = 34;
  const cx = 46;
  const cy = 46;
  const circ = 2 * Math.PI * r;
  const safePct = Math.max(0, Math.min(100, (value / max) * 100));
  const dash = (safePct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <div className="relative shrink-0">
        <svg width={92} height={92}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth={10} />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeDasharray={dash + " " + circ}
            strokeLinecap="round"
            transform={"rotate(-90 " + cx + " " + cy + ")"}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[15px] font-bold text-foreground leading-none">{display}</span>
          {unit && <span className="text-[9px] font-medium text-muted-foreground leading-none mt-0.5">{unit}</span>}
        </div>
      </div>
      <p className="text-[11px] font-semibold text-center leading-tight text-foreground px-1">{label}</p>
      <p className="text-[10px] text-muted-foreground text-center leading-tight px-1">{sublabel}</p>
    </div>
  );
}

function ThreeDonutCard({
  title,
  sub,
  donuts,
}: {
  title: string;
  sub: string;
  donuts: { pct: number; label: string; sublabel: string; color: string }[];
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5 mb-5">{sub}</p>
      <div className="flex items-start justify-around gap-2 flex-1">
        {donuts.map((d, i) => <DonutRing key={i} {...d} />)}
      </div>
    </div>
  );
}

function PopulationPieCard({
  title,
  sub,
  data,
}: {
  title: string;
  sub: string;
  data: { name: string; value: number; color: string }[];
}) {
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.58;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[13px] font-bold"
      >
        {value}%
      </text>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5 mb-3">{sub}</p>
      <div className="h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              outerRadius={92}
              paddingAngle={4}
              stroke="#fff"
              strokeWidth={8}
              labelLine={false}
              label={renderLabel}
            >
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 min-w-0">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="truncate text-[10px] font-medium text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataTable({ cols, rows }: { cols: ColDef[]; rows: KecamatanRow[] }) {
  const headerCount = cols.length + 1;

  return (
    <div className="overflow-auto max-h-[350px] pb-3">
      <table className="w-full text-xs">
        <thead className="sticky top-0 z-10 bg-card backdrop-blur-sm">
          <tr className="bg-card shadow-[inset_0_-1px_0_rgba(0,0,0,0.18)]">
            <th className="pl-5 pr-3 py-2.5 text-center text-[10px] font-semibold text-muted-foreground uppercase w-12 tracking-wider bg-card">
              No
            </th>
            {cols.map((c) => (
              <th
                key={c.key}
                className="px-3 py-2.5 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap bg-card"
              >
                {c.label}
              </th>
            ))}
          </tr>
          <tr aria-hidden="true">
            <th colSpan={headerCount} className="p-0">
              <div className="h-px bg-border/70" />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className="border-b border-border/40 last:border-b-0 hover:bg-secondary/30 transition-colors">
              <td className="pl-5 pr-3 py-2.5 text-[10px] text-center text-muted-foreground font-sans">{i + 1}</td>
              {cols.map((c) => (
                <td key={c.key} className="px-3 py-2.5 font-sans text-[11px] text-foreground whitespace-nowrap">
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── POPULATION ANALYTICS ─────────────────────────────────────────────────────

function PopulationAnalytics({
  D,
  scaleFactor,
  onDistrict,
  selectedDistrict,
  onClearFocus,
}: {
  D: KecamatanRow[];
  scaleFactor: number;
  onDistrict: (k: KecamatanRow) => void;
  selectedDistrict: KecamatanRow | null;
  onClearFocus: () => void;
}) {
  const activeRows = selectedDistrict ? [selectedDistrict] : D;
  const n = activeRows.length || 1;
  const totalPop    = activeRows.reduce((s, k) => s + k.population, 0);
  const totalMale   = activeRows.reduce((s, k) => s + k.male, 0);
  const totalFemale = activeRows.reduce((s, k) => s + k.female, 0);
  const totalArea   = activeRows.reduce((s, k) => s + k.area, 0);
  const totalVillages = activeRows.reduce((s, k) => s + k.villages, 0);
  const totalHamlets  = activeRows.reduce((s, k) => s + k.hamlets, 0);
  const totalRoad     = activeRows.reduce((s, k) => s + k.roadLength, 0);
  const totalSchools  = activeRows.reduce((s, k) => s + k.schoolCount, 0);
  const totalHealth   = activeRows.reduce((s, k) => s + k.healthFacility, 0);
  const avgLiteracy   = (activeRows.reduce((s, k) => s + k.literacy, 0) / n).toFixed(1);
  const avgPdrb       = Math.round(activeRows.reduce((s, k) => s + k.pdrb, 0) / n);
  const popPerSchool  = totalSchools > 0 ? Math.round(totalPop / totalSchools) : 0;
  const popPerHealth  = totalHealth > 0 ? Math.round(totalPop / totalHealth) : 0;
  const schoolHealthMix = totalSchools + totalHealth > 0 ? Math.round((totalSchools / (totalSchools + totalHealth)) * 100) : 0;

  const pctProduktif = 66;
  const pctPerempuan = totalPop > 0 ? Math.round((totalFemale / totalPop) * 100) : 51;
  const pctGrowthPos = Math.round((activeRows.filter((k) => k.growth >= 1.5).length / n) * 100);

  const trendScaleFactor = selectedDistrict
    ? selectedDistrict.population / 1293040
    : scaleFactor;
  const scaledTrend = populationTrend.map((r) => ({ ...r, penduduk: Math.round(r.penduduk * trendScaleFactor) }));
  const scaledVital = monthlyData.map((r) => ({ ...r, kelahiran: Math.round(r.kelahiran * trendScaleFactor), kematian: Math.round(r.kematian * trendScaleFactor) }));
  const top5 = [...activeRows].sort((a, b) => b.population - a.population).slice(0, 5);
  const trendData = buildDistrictTrend(top5);

  const popCols: ColDef[] = [
    { key: "name",       label: "Kecamatan",    render: (k) => <span className="font-semibold">{k.name}</span> },
    { key: "population", label: "Penduduk",     render: (k) => fmt(k.population) },
    { key: "male",       label: "Laki-laki",    render: (k) => fmt(k.male) },
    { key: "female",     label: "Perempuan",    render: (k) => fmt(k.female) },
    { key: "density",    label: "Kepadatan/km²",render: (k) => fmt(k.density) },
    { key: "households", label: "Jml KK",       render: (k) => fmt(k.households) },
    { key: "growth",     label: "Laju (%)",     render: (k) => <span className={k.growth >= 2 ? "text-green-600 font-semibold" : "text-muted-foreground"}>{k.growth.toFixed(1)}%</span> },
  ];

  return (
    <div className="space-y-5">
      {selectedDistrict && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
          <div>
            <p className="text-xs font-semibold text-foreground">
              Fokus wilayah: {selectedDistrict.name}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Grafik di bawah mengikuti wilayah yang dipilih dari peta
            </p>
          </div>
          <button
            onClick={onClearFocus}
            className="text-[11px] font-medium px-3 py-1.5 rounded-lg border border-border bg-secondary hover:bg-secondary/80 transition-colors"
          >
            Tampilkan semua
          </button>
        </div>
      )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        <div className="space-y-5">
          <ThreeDonutCard
            title="Komposisi Kependudukan"
            sub="Tiga indikator demografis utama"
            donuts={[
              { pct: pctProduktif, label: "Usia Produktif", sublabel: "15–64 tahun dari total", color: "#3b82f6" },
              { pct: pctPerempuan, label: "Perempuan", sublabel: "% dari total penduduk", color: "#ec4899" },
              { pct: pctGrowthPos, label: "Laju Positif", sublabel: "Kec. tumbuh ≥ 1.5%/thn", color: "#10b981" },
            ]}
          />

          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-semibold text-foreground">Statistik Wilayah</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 mb-4">
              {selectedDistrict ? `Ringkasan Kecamatan ${selectedDistrict.name}` : "Ringkasan seluruh kecamatan"}
            </p>
            <div className="space-y-4">
              <div
                className="relative overflow-hidden rounded-lg border border-blue-100 p-4"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.72), rgba(255,255,255,0.72)), url(${foto3})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-700">Luas Wilayah</p>
                    <p className="mt-1 text-2xl font-medium leading-none text-slate-900">
                      {totalArea.toFixed(selectedDistrict ? 1 : 0)}<span className="text-sm text-slate-700 ml-0.5">km²</span>
                    </p>
                  </div>
                  <div className="flex h-12 items-end gap-1">
                    <span className="w-2.5 rounded-t bg-blue-300 border border-white" style={{ height: `${Math.max(18, Math.min(100, totalVillages / (selectedDistrict ? 18 : 260) * 100))}%` }} />
                    <span className="w-2.5 rounded-t bg-blue-500 border border-white" style={{ height: `${Math.max(18, Math.min(100, totalHamlets / (selectedDistrict ? 60 : 900) * 100))}%` }} />
                    <span className="w-2.5 rounded-t bg-blue-700 border border-white" style={{ height: `${Math.max(18, Math.min(100, totalRoad / (selectedDistrict ? 100 : 1200) * 100))}%` }} />
                  </div>
                </div>
              </div>

              {[
                { label: "Desa/Kel.", value: fmt(totalVillages), note: "unit administrasi", pct: Math.min(100, totalVillages / (selectedDistrict ? 18 : 260) * 100), color: "#f59e0b" },
                { label: "Dusun", value: fmt(totalHamlets), note: "sebaran permukiman", pct: Math.min(100, totalHamlets / (selectedDistrict ? 60 : 900) * 100), color: "#14b8a6" },
                { label: "Panjang Jalan", value: `${fmt(totalRoad)} km`, note: "akses wilayah", pct: Math.min(100, totalRoad / (selectedDistrict ? 100 : 1200) * 100), color: "#0ea5e9" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold text-foreground">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.note}</p>
                    </div>
                    <p className="text-xs font-normal text-foreground">{item.value}</p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(8, item.pct)}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}

              <div className="rounded-lg border border-border bg-secondary/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold text-foreground">Sorotan Cepat</p>
                    <p className="text-[10px] text-muted-foreground">Rasio layanan pada wilayah aktif</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-normal text-foreground">{selectedDistrict ? selectedDistrict.name : "Semua kecamatan"}</p>
                    <p className="text-[10px] text-muted-foreground">{n} wilayah terpilih</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-md bg-card px-2.5 py-2">
                    <p className="text-[9px] text-muted-foreground">Penduduk / sekolah</p>
                    <p className="mt-1 text-xs font-normal text-foreground">{fmt(popPerSchool)}</p>
                  </div>
                  <div className="rounded-md bg-card px-2.5 py-2">
                    <p className="text-[9px] text-muted-foreground">Penduduk / faskes</p>
                    <p className="mt-1 text-xs font-normal text-foreground">{fmt(popPerHealth)}</p>
                  </div>
                  <div className="rounded-md bg-card px-2.5 py-2">
                    <p className="text-[9px] text-muted-foreground">Komposisi sekolah</p>
                    <p className="mt-1 text-xs font-normal text-foreground">{schoolHealthMix}%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden">
              <div className="absolute inset-x-0 top-2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="absolute left-1/2 top-[98px] h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/25 flex flex-col items-center justify-center">
                <span className="text-[21px] font-bold leading-none">{totalArea.toFixed(selectedDistrict ? 1 : 0)}</span>
                <span className="text-[10px] font-semibold mt-1">km2 wilayah</span>
              </div>
              <div className="absolute left-0 top-9 h-[86px] w-[86px] rounded-full bg-amber-400 text-amber-950 shadow-sm flex flex-col items-center justify-center">
                <span className="text-lg font-bold leading-none">{fmt(totalVillages)}</span>
                <span className="text-[10px] font-semibold mt-1">desa/kel.</span>
              </div>
              <div className="absolute right-2 top-8 h-[78px] w-[78px] rounded-full bg-teal-500 text-white shadow-sm flex flex-col items-center justify-center">
                <span className="text-lg font-bold leading-none">{fmt(totalHamlets)}</span>
                <span className="text-[10px] font-semibold mt-1">dusun</span>
              </div>
              <div className="absolute bottom-9 left-8 h-[74px] w-[74px] rounded-full bg-sky-500 text-white shadow-sm flex flex-col items-center justify-center">
                <span className="text-base font-bold leading-none">{fmt(totalRoad)}</span>
                <span className="text-[10px] font-semibold mt-1">km jalan</span>
              </div>
              <div className="absolute bottom-7 right-0 w-[132px]">
                <div className="flex items-end gap-1.5 h-16">
                  <span className="w-5 rounded-t bg-amber-400" style={{ height: `${Math.max(20, Math.min(100, totalVillages / (selectedDistrict ? 18 : 260) * 100))}%` }} />
                  <span className="w-5 rounded-t bg-teal-500" style={{ height: `${Math.max(20, Math.min(100, totalHamlets / (selectedDistrict ? 60 : 900) * 100))}%` }} />
                  <span className="w-5 rounded-t bg-sky-500" style={{ height: `${Math.max(20, Math.min(100, totalRoad / (selectedDistrict ? 100 : 1200) * 100))}%` }} />
                </div>
                <p className="mt-2 text-[10px] leading-tight text-muted-foreground">Rasio desa, dusun, dan jalan pada wilayah aktif</p>
              </div>
            </div>
            <div className="hidden">
              <MetricRing
                value={totalArea}
                max={100}
                display={totalArea.toFixed(selectedDistrict ? 2 : 0)}
                unit="km²"
                label="Luas Wilayah"
                sublabel="Luas area yang aktif"
                color="#3b82f6"
              />
              <MetricRing
                value={totalVillages}
                max={20}
                display={fmt(totalVillages)}
                unit="desa"
                label="Desa/Kel."
                sublabel="Unit administrasi aktif"
                color="#14b8a6"
              />
              <MetricRing
                value={totalHamlets}
                max={60}
                display={fmt(totalHamlets)}
                unit="dusun"
                label="Dusun"
                sublabel="Sebaran permukiman"
                color="#0ea5e9"
              />
              <MetricRing
                value={totalRoad}
                max={100}
                display={fmt(totalRoad)}
                unit="km"
                label="Panjang Jalan"
                sublabel="Jaringan jalan wilayah"
                color="#8b5cf6"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-semibold text-foreground">Indikator Layanan</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 mb-4">
              Pendidikan, kesehatan, dan ekonomi wilayah
            </p>
              <div className="space-y-3">
              {[
                { label: "Sekolah", value: fmt(totalSchools), note: "fasilitas", pct: Math.min(100, totalSchools / (selectedDistrict ? 50 : 760) * 100), color: "#10b981" },
                { label: "Faskes", value: fmt(totalHealth), note: "layanan", pct: Math.min(100, totalHealth / (selectedDistrict ? 10 : 130) * 100), color: "#f43f5e" },
                { label: "Melek Huruf", value: `${avgLiteracy}%`, note: "literasi", pct: Number(avgLiteracy), color: "#14b8a6" },
                { label: "PDRB/Kapita", value: `Rp ${(avgPdrb / 1000).toFixed(2)} jt`, note: "ekonomi", pct: Math.min(100, (avgPdrb / 20000) * 100), color: "#f59e0b" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-foreground leading-tight">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{item.note}</p>
                    </div>
                    <p className="text-[11px] font-normal text-foreground whitespace-nowrap">{item.value}</p>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(8, item.pct)}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden">
              <MetricRing
                value={totalSchools}
                max={50}
                display={fmt(totalSchools)}
                unit="sekolah"
                label="Sekolah"
                sublabel="Fasilitas pendidikan"
                color="#10b981"
              />
              <MetricRing
                value={totalHealth}
                max={10}
                display={fmt(totalHealth)}
                unit="faskes"
                label="Faskes"
                sublabel="Layanan kesehatan"
                color="#f43f5e"
              />
              <MetricRing
                value={Number(avgLiteracy)}
                max={100}
                display={avgLiteracy}
                unit="%"
                label="Melek Huruf"
                sublabel="Persentase literasi"
                color="#4876ecff"
              />
              <MetricRing
                value={avgPdrb / 1000}
                max={20}
                display={(avgPdrb / 1000).toFixed(2)}
                unit="jt"
                label="PDRB/Kapita"
                sublabel="Rata-rata per kapita"
                color="#f59e0b"
              />
            </div>
          </div>
        </div>
        <div className="xl:col-span-2 space-y-5">
        <PopulationBubbleMap
          selectedId={selectedDistrict?.id ?? null}
          onSelect={(k) => {
            onDistrict(k);
          }}
          onClearFocus={() => {
            onClearFocus();
          }}
          height={360}
        />

        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-foreground">Perbandingan 5 Kecamatan Terpadat 2020–2024</p>
          <p className="text-[10px] text-muted-foreground mb-2">Tren populasi multi-kecamatan</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
            {top5.map((k, i) => (
              <div key={k.id} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: LINE_COLORS[i] }} />
                <span className="text-[10px] text-muted-foreground">{k.name}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={185}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="yr" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
              <Tooltip formatter={(v, name) => [fmt(Number(v)), String(name)]} />
              {top5.map((k, i) => (
                <Line key={k.id} type="monotone" dataKey={k.name} stroke={LINE_COLORS[i]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 min-h-[312px]">
          <p className="text-xs font-semibold text-foreground">Kelahiran vs Kematian 2024</p>
          <p className="text-[10px] text-muted-foreground mb-2">Vital statistik bulanan kabupaten</p>
          <div className="flex gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-3 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Kelahiran</div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-3 h-2.5 rounded-sm bg-rose-500 inline-block" /> Kematian</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scaledVital}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="kelahiran" name="Kelahiran" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="kematian"  name="Kematian"  fill="#f43f5e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">Tabel Rekapitulasi Kependudukan</p>
            <p className="text-[10px] text-muted-foreground">{D.length} kecamatan — diurutkan berdasarkan populasi</p>
          </div>
          <span className="text-[10px] font-sans font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded">{fmt(totalPop)} jiwa</span>
        </div>
        <DataTable cols={popCols} rows={[...D].sort((a, b) => b.population - a.population)} />
      </div>
    </div>
  );
}

// ─── GEOGRAFIS ANALYTICS ──────────────────────────────────────────────────────

function GeografisAnalytics({ D }: { D: KecamatanRow[] }) {
  const n = D.length || 1;
  const avgSawah  = D.reduce((s, k) => s + k.sawahPct, 0) / n;
  const totalArea = D.reduce((s, k) => s + k.area, 0);

  const pctSawah   = Math.round(avgSawah);
  const pctBesar   = Math.round((D.filter((k) => k.villages > 8).length / n) * 100);
  const pctDataran = Math.round((D.filter((k) => k.elevation < 100).length / n) * 100);

  const byArea     = [...D].sort((a, b) => b.area - a.area);
  const byDensity  = [...D].sort((a, b) => b.density - a.density).slice(0, 8);
  const roadVsArea = [...D].sort((a, b) => b.area - a.area).slice(0, 8).map((k) => ({
    name: k.name, area: Math.round(k.area), road: k.roadLength,
  }));

  const geoCols: ColDef[] = [
    { key: "name",              label: "Kecamatan",      render: (k) => <span className="font-semibold">{k.name}</span> },
    { key: "area",              label: "Luas (km²)",     render: (k) => k.area.toFixed(2) },
    { key: "villages",          label: "Desa/Kel",       render: (k) => String(k.villages) },
    { key: "hamlets",           label: "Dusun",          render: (k) => String(k.hamlets) },
    { key: "roadLength",        label: "Jalan (km)",     render: (k) => String(k.roadLength) },
    { key: "elevation",         label: "Elevasi (m)",    render: (k) => String(k.elevation) },
    { key: "sawahPct",          label: "Sawah (%)",      render: (k) => k.sawahPct.toFixed(0) + "%" },
    { key: "distanceToCapital", label: "Jarak Kab (km)", render: (k) => String(k.distanceToCapital) },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <ThreeDonutCard
          title="Karakteristik Wilayah"
          sub="Distribusi lahan dan topografi"
          donuts={[
            { pct: pctSawah,   label: "Lahan Sawah",    sublabel: "Rata-rata dari total lahan",   color: "#10b981" },
            { pct: pctBesar,   label: "Kec. Besar",     sublabel: "Kecamatan dgn lebih dari 8 desa", color: "#0ea5e9" },
            { pct: pctDataran, label: "Dataran Rendah", sublabel: "Elevasi di bawah 100 mdpl",    color: "#f59e0b" },
          ]}
        />
        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-foreground">Luas Wilayah per Kecamatan</p>
          <p className="text-[10px] text-muted-foreground mb-3">{D.length} kecamatan — total {totalArea.toFixed(0)} km²</p>
          <ResponsiveContainer width="100%" height={195}>
            <BarChart data={byArea} layout="vertical" margin={{ left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 8.5, fill: "#555" }} axisLine={false} tickLine={false} width={76} />
              <Tooltip formatter={(v: number) => [v.toFixed(2) + " km²", "Luas"]} />
              <Bar dataKey="area" name="Luas" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={11}>
                {byArea.map((_, i) => <Cell key={i} fill={i < 3 ? "#059669" : i < 7 ? "#10b981" : "#6ee7b7"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-foreground">Kepadatan Penduduk (Jiwa / km²)</p>
          <p className="text-[10px] text-muted-foreground mb-3">8 kecamatan dengan kepadatan tertinggi</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={byDensity} layout="vertical" margin={{ left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 8.5, fill: "#555" }} axisLine={false} tickLine={false} width={76} />
              <Tooltip formatter={(v: number) => [fmt(v) + " jiwa/km²", "Kepadatan"]} />
              <Bar dataKey="density" name="Kepadatan" fill="#0ea5e9" radius={[0, 4, 4, 0]} maxBarSize={16}>
                {byDensity.map((_, i) => <Cell key={i} fill={i === 0 ? "#0284c7" : i < 3 ? "#0ea5e9" : "#38bdf8"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-foreground">Luas Wilayah vs Panjang Jalan</p>
          <p className="text-[10px] text-muted-foreground mb-2">8 kecamatan terluas — infrastruktur jalan</p>
          <div className="flex gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-3 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Luas (km²)</div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-3 h-2.5 rounded-sm bg-sky-500 inline-block" /> Jalan (km)</div>
          </div>
          <ResponsiveContainer width="100%" height={195}>
            <BarChart data={roadVsArea}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 8, fill: "#888" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="area" name="Luas (km²)" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={16} />
              <Bar dataKey="road" name="Jalan (km)" fill="#0ea5e9" radius={[3, 3, 0, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">Tabel Rekapitulasi Data Geografis</p>
            <p className="text-[10px] text-muted-foreground">{D.length} kecamatan — diurutkan berdasarkan luas wilayah</p>
          </div>
          <span className="text-[10px] font-sans font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded">{totalArea.toFixed(1)} km²</span>
        </div>
        <DataTable cols={geoCols} rows={[...D].sort((a, b) => b.area - a.area)} />
      </div>
    </div>
  );
}

// ─── EKONOMI ANALYTICS ────────────────────────────────────────────────────────

function EkonomiAnalytics({ D }: { D: KecamatanRow[] }) {
  const n = D.length || 1;
  const avgPdrb = Math.round(D.reduce((s, k) => s + k.pdrb, 0) / n);

  const byPdrb  = [...D].sort((a, b) => b.pdrb - a.pdrb).slice(0, 8);
  const byUnemp = [...D].sort((a, b) => b.unemployment - a.unemployment).slice(0, 8);
  const mixedEko = [...D].sort((a, b) => b.pdrb - a.pdrb).slice(0, 8).map((k) => ({
    name: k.name,
    pengangguran: k.unemployment,
    pasar: k.markets * 5,
    industri: Math.round(k.industry / 10),
  }));

  const ekoCols: ColDef[] = [
    { key: "name",         label: "Kecamatan",        render: (k) => <span className="font-semibold">{k.name}</span> },
    { key: "pdrb",         label: "PDRB (ribu Rp)",   render: (k) => fmt(k.pdrb) },
    { key: "unemployment", label: "Pengangguran (%)",  render: (k) => <span className={k.unemployment > 6 ? "text-red-500 font-semibold" : ""}>{k.unemployment.toFixed(1)}%</span> },
    { key: "markets",      label: "Pasar",            render: (k) => String(k.markets) },
    { key: "industry",     label: "Industri RT",      render: (k) => String(k.industry) },
    { key: "cooperatives", label: "Koperasi",         render: (k) => String(k.cooperatives) },
    { key: "growth",       label: "Laju Pop (%)",     render: (k) => k.growth.toFixed(1) + "%" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <ThreeDonutCard
          title="Struktur Ekonomi Kabupaten"
          sub="Komposisi sektor dan tenaga kerja"
          donuts={[
            { pct: 42, label: "Sektor Primer",     sublabel: "Pertanian & perikanan",   color: "#f59e0b" },
            { pct: 65, label: "Partisipasi Kerja", sublabel: "Angkatan kerja aktif",    color: "#10b981" },
            { pct: 58, label: "Kontribusi UMKM",   sublabel: "Terhadap PDRB lokal",     color: "#8b5cf6" },
          ]}
        />
        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-foreground">Tren PDRB Per Kapita 2019–2024</p>
          <p className="text-[10px] text-muted-foreground mb-3">Ribu rupiah — Selong, Masbagik, Suralaga vs rata-rata kabupaten</p>
          <ResponsiveContainer width="100%" height={195}>
            <LineChart data={pdrbTrend5yr}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="yr" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
              <Tooltip formatter={(v, name) => ["Rp " + fmt(Number(v)) + " rb", String(name)]} />
              <Legend wrapperStyle={{ fontSize: 10 }} iconSize={10} />
              <Line type="monotone" dataKey="RataRata" name="Rata-rata Kab" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="Selong"   name="Selong"       stroke="#f59e0b" strokeWidth={2}   dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Masbagik" name="Masbagik"     stroke="#10b981" strokeWidth={2}   dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Suralaga" name="Suralaga"     stroke="#8b5cf6" strokeWidth={2}   dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-foreground">PDRB Per Kapita Tertinggi</p>
          <p className="text-[10px] text-muted-foreground mb-3">Ribu rupiah per kapita — 8 kecamatan</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={byPdrb} layout="vertical" margin={{ left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 8.5, fill: "#555" }} axisLine={false} tickLine={false} width={76} />
              <Tooltip formatter={(v: number) => ["Rp " + fmt(v) + " rb", "PDRB/kapita"]} />
              <Bar dataKey="pdrb" name="PDRB" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={16}>
                {byPdrb.map((_, i) => <Cell key={i} fill={i === 0 ? "#d97706" : i < 3 ? "#f59e0b" : "#fcd34d"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-foreground">Pengangguran, Pasar & Industri RT</p>
          <p className="text-[10px] text-muted-foreground mb-2">Multi-indikator ekonomi — 8 kec PDRB tertinggi</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-3 h-2.5 rounded-sm bg-rose-500 inline-block" /> Pengangguran (%)</div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-3 h-2.5 rounded-sm bg-amber-400 inline-block" /> Pasar ×5</div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-3 h-2.5 rounded-sm bg-violet-500 inline-block" /> Industri ÷10</div>
          </div>
          <ResponsiveContainer width="100%" height={195}>
            <BarChart data={mixedEko}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 7.5, fill: "#888" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="pengangguran" name="Pengangguran" fill="#f43f5e" radius={[3, 3, 0, 0]} maxBarSize={12} />
              <Bar dataKey="pasar"        name="Pasar x5"    fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={12} />
              <Bar dataKey="industri"     name="Industri /10" fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">Tabel Rekapitulasi Data Ekonomi</p>
            <p className="text-[10px] text-muted-foreground">{D.length} kecamatan — diurutkan berdasarkan PDRB</p>
          </div>
          <span className="text-[10px] font-sans font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded">Rp {fmt(avgPdrb)} rb avg</span>
        </div>
        <DataTable cols={ekoCols} rows={[...D].sort((a, b) => b.pdrb - a.pdrb)} />
      </div>
    </div>
  );
}

// ─── SOSIAL ANALYTICS ─────────────────────────────────────────────────────────

function SosialAnalytics({ D }: { D: KecamatanRow[] }) {
  const n = D.length || 1;
  const avgLit = D.reduce((s, k) => s + k.literacy, 0) / n;
  const avgAps = D.reduce((s, k) => s + k.aps, 0) / n;

  const byAps    = [...D].sort((a, b) => b.aps - a.aps).slice(0, 8);
  const byHealth = [...D].sort((a, b) => b.posyandu - a.posyandu).slice(0, 8).map((k) => ({
    name: k.name, posyandu: k.posyandu, healthFacility: k.healthFacility, worshipPlace: Math.round(k.worshipPlace / 3),
  }));
  const bySchool = [...D].sort((a, b) => b.schoolCount - a.schoolCount).slice(0, 8);

  const sosialCols: ColDef[] = [
    { key: "name",           label: "Kecamatan",           render: (k) => <span className="font-semibold">{k.name}</span> },
    { key: "literacy",       label: "Melek Huruf (%)",      render: (k) => <span className={k.literacy >= 90 ? "text-violet-600 font-semibold" : ""}>{k.literacy.toFixed(1)}%</span> },
    { key: "avgSchooling",   label: "Lama Sekolah (thn)",   render: (k) => k.avgSchooling.toFixed(1) },
    { key: "schoolCount",    label: "Sekolah",              render: (k) => String(k.schoolCount) },
    { key: "healthFacility", label: "Puskesmas/Pustu",      render: (k) => String(k.healthFacility) },
    { key: "posyandu",       label: "Posyandu",             render: (k) => String(k.posyandu) },
    { key: "aps",            label: "APS (%)",              render: (k) => k.aps.toFixed(1) + "%" },
    { key: "worshipPlace",   label: "Tempat Ibadah",        render: (k) => String(k.worshipPlace) },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <ThreeDonutCard
          title="Indikator Sosial Utama"
          sub="Pendidikan, kesehatan & partisipasi"
          donuts={[
            { pct: Math.round(avgLit), label: "Melek Huruf",      sublabel: "Rata-rata kecamatan",     color: "#8b5cf6" },
            { pct: Math.round(avgAps), label: "APS Rata-rata",    sublabel: "Angka partisipasi sekolah", color: "#3b82f6" },
            { pct: 78,                 label: "Cakupan Posyandu", sublabel: "Estimasi cakupan aktif",   color: "#ec4899" },
          ]}
        />
        <div className="xl:col-span-2 bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-foreground">Tren Melek Huruf Kabupaten 2019–2024</p>
          <p className="text-[10px] text-muted-foreground mb-3">Rata-rata tingkat melek huruf kabupaten (%)</p>
          <ResponsiveContainer width="100%" height={195}>
            <AreaChart data={literacyTrend6yr}>
              <defs>
                <linearGradient id="litG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="yr" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} domain={[78, 95]} tickFormatter={(v) => v + "%"} />
              <Tooltip formatter={(v: number) => [v.toFixed(1) + "%", "Melek Huruf"]} />
              <Area type="monotone" dataKey="rate" name="Melek Huruf" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#litG)" dot={{ r: 4, fill: "#8b5cf6" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-foreground">Angka Partisipasi Sekolah (APS)</p>
          <p className="text-[10px] text-muted-foreground mb-3">8 kecamatan dengan APS tertinggi (%)</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={byAps} layout="vertical" margin={{ left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} tickFormatter={(v) => v + "%"} domain={[65, 100]} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 8.5, fill: "#555" }} axisLine={false} tickLine={false} width={76} />
              <Tooltip formatter={(v: number) => [v.toFixed(1) + "%", "APS"]} />
              <Bar dataKey="aps" name="APS (%)" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={16}>
                {byAps.map((_, i) => <Cell key={i} fill={i === 0 ? "#7c3aed" : i < 3 ? "#8b5cf6" : "#a78bfa"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-foreground">Posyandu, Puskesmas & Tempat Ibadah</p>
          <p className="text-[10px] text-muted-foreground mb-2">Fasilitas sosial per kecamatan (8 teratas)</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-3 h-2.5 rounded-sm bg-pink-500 inline-block" /> Posyandu</div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-3 h-2.5 rounded-sm bg-rose-500 inline-block" /> Puskesmas+</div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-3 h-2.5 rounded-sm bg-violet-500 inline-block" /> Ibadah div3</div>
          </div>
          <ResponsiveContainer width="100%" height={195}>
            <BarChart data={byHealth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 8, fill: "#888" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="posyandu"       name="Posyandu"    fill="#ec4899" radius={[3, 3, 0, 0]} maxBarSize={12} />
              <Bar dataKey="healthFacility" name="Puskesmas+"  fill="#f43f5e" radius={[3, 3, 0, 0]} maxBarSize={12} />
              <Bar dataKey="worshipPlace"   name="Ibadah /3"   fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">Tabel Rekapitulasi Data Sosial</p>
            <p className="text-[10px] text-muted-foreground">{D.length} kecamatan — diurutkan berdasarkan melek huruf</p>
          </div>
          <span className="text-[10px] font-sans font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded">{avgLit.toFixed(1)}% avg</span>
        </div>
        <DataTable cols={sosialCols} rows={[...D].sort((a, b) => b.literacy - a.literacy)} />
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────

type Category = "penduduk" | "geografis" | "ekonomi" | "sosial";

const CATEGORY_LABELS: Record<Category, string> = {
  penduduk:  "Population",
  geografis: "Geographic",
  ekonomi:   "Ekonomi",
  sosial:    "Sosial",
};

function DashboardPage({ onDistrict }: { onDistrict: (k: KecamatanRow) => void }) {
  const [category, setCategory] = useState<Category>("penduduk");
  const [search, setSearch]     = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);

  const filteredKec = useMemo(
    () => {
      const q = search.trim().toLowerCase();
      const normalizedQ = normalizeSearch(search);
      if (!q) return kecamatan;

      return kecamatan.filter((k) => {
        const name = k.name.toLowerCase();
        return name.includes(q) || (!!normalizedQ && normalizeSearch(k.name).includes(normalizedQ));
      });
    },
    [search],
  );

  const selectedDistrict = useMemo(
    () => kecamatan.find((k) => k.id === selectedDistrictId) ?? null,
    [selectedDistrictId],
  );

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setSelectedDistrictId(null);
      return;
    }

    const normalizedQ = normalizeSearch(search);
    const exact = kecamatan.find(
      (k) => k.name.toLowerCase() === q || (!!normalizedQ && normalizeSearch(k.name) === normalizedQ),
    );
    const matches = kecamatan.filter((k) =>
      k.name.toLowerCase().includes(q) || (!!normalizedQ && normalizeSearch(k.name).includes(normalizedQ)),
    );
    const next = exact ?? (matches.length === 1 ? matches[0] : null);

    setSelectedDistrictId((prev) => (next ? next.id : prev === null ? prev : null));
  }, [search]);

  const D = filteredKec;
  const statRows = selectedDistrict ? [selectedDistrict] : filteredKec;
  const n = statRows.length || 1;

  const totalPop       = statRows.reduce((s, k) => s + k.population, 0);
  const totalMale      = statRows.reduce((s, k) => s + k.male, 0);
  const totalFemale    = statRows.reduce((s, k) => s + k.female, 0);
  const totalArea      = statRows.reduce((s, k) => s + k.area, 0);
  const totalVillages  = statRows.reduce((s, k) => s + k.villages, 0);
  const totalHH        = statRows.reduce((s, k) => s + k.households, 0);
  const totalSchools   = statRows.reduce((s, k) => s + k.schoolCount, 0);
  const totalHealth    = statRows.reduce((s, k) => s + k.healthFacility, 0);
  const totalPostyandu = statRows.reduce((s, k) => s + k.posyandu, 0);
  const totalWorship   = statRows.reduce((s, k) => s + k.worshipPlace, 0);
  const totalIndustry  = statRows.reduce((s, k) => s + k.industry, 0);
  const totalMarkets   = statRows.reduce((s, k) => s + k.markets, 0);
  const totalCoops     = statRows.reduce((s, k) => s + k.cooperatives, 0);
  const totalHamlets   = statRows.reduce((s, k) => s + k.hamlets, 0);
  const totalRoad      = statRows.reduce((s, k) => s + k.roadLength, 0);

  const avgDensity  = totalArea > 0 ? Math.round(totalPop / totalArea) : 0;
  const avgLiteracy = (statRows.reduce((s, k) => s + k.literacy, 0) / n).toFixed(1);
  const avgUnemp    = (statRows.reduce((s, k) => s + k.unemployment, 0) / n).toFixed(1);
  const avgGrowth   = (statRows.reduce((s, k) => s + k.growth, 0) / n).toFixed(1);
  const avgSchool   = (statRows.reduce((s, k) => s + k.avgSchooling, 0) / n).toFixed(1);
  const avgPdrb     = Math.round(statRows.reduce((s, k) => s + k.pdrb, 0) / n);
  const avgAps      = (statRows.reduce((s, k) => s + k.aps, 0) / n).toFixed(1);
  const avgElev     = Math.round(statRows.reduce((s, k) => s + k.elevation, 0) / n);
  const avgSawah    = (statRows.reduce((s, k) => s + k.sawahPct, 0) / n).toFixed(1);
  const sexRatio    = totalFemale > 0 ? (totalMale / totalFemale * 100).toFixed(1) : "0";
  const scaleFactor = statRows.length === 1 ? statRows[0].population / 1293040 : 1;

  type CardDef = { icon: React.ReactNode; label: string; value: string; sub: string; color: string; iconColor: string; trend?: number };

  const cards: Record<Category, CardDef[]> = {
    penduduk: [
      { icon: <Users size={17} />,      label: "Total Penduduk",         value: fmtK(totalPop),                            sub: "Jiwa terdaftar 2024",                                       color: "bg-blue-50",   iconColor: "text-blue-600",   trend: parseFloat(avgGrowth) },
      { icon: <Users size={17} />,      label: "Laki-laki",              value: fmtK(totalMale),                           sub: (totalPop ? ((totalMale / totalPop) * 100).toFixed(1) : "0") + "% dari total",  color: "bg-sky-50",    iconColor: "text-sky-600"   },
      { icon: <Heart size={17} />,      label: "Perempuan",              value: fmtK(totalFemale),                         sub: (totalPop ? ((totalFemale / totalPop) * 100).toFixed(1) : "0") + "% dari total", color: "bg-rose-50",   iconColor: "text-rose-500"  },
      { icon: <Activity size={17} />,   label: "Rasio Jenis Kelamin",    value: sexRatio,                                  sub: "Laki per 100 perempuan",                                    color: "bg-purple-50", iconColor: "text-purple-600" },
      { icon: <Building2 size={17} />,  label: "Kepadatan Penduduk",     value: fmt(avgDensity) + "/km²",             sub: "Jiwa per km persegi",                                       color: "bg-cyan-50",   iconColor: "text-cyan-600"   },
      { icon: <Layers size={17} />,     label: "Jumlah KK",              value: fmtK(totalHH),                             sub: "Kepala keluarga terdaftar",                                 color: "bg-amber-50",  iconColor: "text-amber-600"  },
      { icon: <TrendingUp size={17} />, label: "Laju Pertumbuhan",       value: "+" + avgGrowth + "%",                     sub: "Per tahun 2023–2024",                                  color: "bg-teal-50",   iconColor: "text-teal-600",  trend: parseFloat(avgGrowth) },
      { icon: <Users size={17} />,      label: "Usia Produktif 15–64", value: fmtK(Math.round(totalPop * 0.659)),   sub: "65.9% dari total penduduk",                                 color: "bg-indigo-50", iconColor: "text-indigo-600" },
    ],
    geografis: [
      { icon: <Map size={17} />,        label: "Luas Wilayah Total",     value: totalArea.toFixed(0) + " km²",        sub: "Wilayah yang dipilih",               color: "bg-green-50",  iconColor: "text-green-600"  },
      { icon: <Building2 size={17} />,  label: "Jumlah Desa/Kel.",       value: String(totalVillages),                     sub: "Desa dan kelurahan aktif",           color: "bg-teal-50",   iconColor: "text-teal-600"   },
      { icon: <MapPin size={17} />,     label: "Jumlah Dusun",           value: String(totalHamlets),                      sub: "Dusun/lingkungan",                   color: "bg-sky-50",    iconColor: "text-sky-600"    },
      { icon: <Activity size={17} />,   label: "Panjang Jalan",          value: totalRoad.toFixed(0) + " km",              sub: "Total jaringan jalan",               color: "bg-blue-50",   iconColor: "text-blue-600"   },
      { icon: <Layers size={17} />,     label: "Ketinggian Rata-rata",   value: avgElev + " mdpl",                         sub: "Di atas permukaan laut",             color: "bg-violet-50", iconColor: "text-violet-600" },
      { icon: <MapPin size={17} />,     label: "Jumlah Kecamatan",       value: String(statRows.length),                   sub: "Wilayah kecamatan aktif",            color: "bg-amber-50",  iconColor: "text-amber-600"  },
      { icon: <Building2 size={17} />,  label: "% Lahan Sawah",          value: avgSawah + "%",                            sub: "Rata-rata dari total lahan",         color: "bg-lime-50",   iconColor: "text-lime-600"   },
      { icon: <Activity size={17} />,   label: "Kepadatan Penduduk",     value: fmt(avgDensity) + "/km²",             sub: "Jiwa per km persegi",                color: "bg-rose-50",   iconColor: "text-rose-500"   },
    ],
    ekonomi: [
      { icon: <Briefcase size={17} />,  label: "Tingkat Pengangguran",   value: avgUnemp + "%",                            sub: "Rata-rata kecamatan 2024",           color: "bg-red-50",    iconColor: "text-red-500"    },
      { icon: <TrendingUp size={17} />, label: "PDRB Per Kapita",        value: "Rp " + fmtK(avgPdrb * 1000),             sub: "Rata-rata per kapita / tahun",       color: "bg-green-50",  iconColor: "text-green-600", trend: 3.2 },
      { icon: <Building2 size={17} />,  label: "Jumlah Pasar",           value: String(totalMarkets),                      sub: "Pasar tradisional & modern",         color: "bg-amber-50",  iconColor: "text-amber-600"  },
      { icon: <Layers size={17} />,     label: "Industri Kecil/RT",      value: String(totalIndustry),                     sub: "Usaha industri rumahan",             color: "bg-orange-50", iconColor: "text-orange-600" },
      { icon: <Briefcase size={17} />,  label: "Jumlah Koperasi",        value: String(totalCoops),                        sub: "Koperasi aktif",                     color: "bg-blue-50",   iconColor: "text-blue-600"   },
      { icon: <Users size={17} />,      label: "Angkatan Kerja",         value: fmtK(Math.round(totalPop * 0.55)),         sub: "Estimasi 55% dari penduduk",         color: "bg-indigo-50", iconColor: "text-indigo-600" },
      { icon: <Activity size={17} />,   label: "Sektor Pertanian",       value: "42.3%",                                   sub: "Tenaga kerja di pertanian",          color: "bg-lime-50",   iconColor: "text-lime-600"   },
      { icon: <TrendingUp size={17} />, label: "Pertumbuhan Ekonomi",    value: "+5.2%",                                   sub: "PDRB riil 2023–2024",           color: "bg-teal-50",   iconColor: "text-teal-600",  trend: 5.2 },
    ],
    sosial: [
      { icon: <GraduationCap size={17} />, label: "Melek Huruf",         value: avgLiteracy + "%",                         sub: "Rata-rata kecamatan",                color: "bg-violet-50", iconColor: "text-violet-600", trend: 0.8 },
      { icon: <GraduationCap size={17} />, label: "Rata-rata Lama Sekolah", value: avgSchool + " thn",                    sub: "Mean years of schooling",            color: "bg-blue-50",   iconColor: "text-blue-600"   },
      { icon: <Building2 size={17} />,  label: "Jumlah Sekolah",         value: String(totalSchools),                      sub: "SD + SMP + SMA/K sederajat",         color: "bg-sky-50",    iconColor: "text-sky-600",   trend: 0.3 },
      { icon: <Heart size={17} />,      label: "Fasilitas Kesehatan",    value: String(totalHealth),                       sub: "Puskesmas + Pustu aktif",            color: "bg-rose-50",   iconColor: "text-rose-500"   },
      { icon: <Heart size={17} />,      label: "Posyandu",               value: String(totalPostyandu),                    sub: "Pos Pelayanan Terpadu",              color: "bg-pink-50",   iconColor: "text-pink-500"   },
      { icon: <Layers size={17} />,     label: "Tempat Ibadah",          value: String(totalWorship),                      sub: "Masjid, musala, gereja, dll.",       color: "bg-amber-50",  iconColor: "text-amber-600"  },
      { icon: <GraduationCap size={17} />, label: "Angka Partisipasi Sek.", value: avgAps + "%",                           sub: "Rata-rata APS kecamatan",            color: "bg-teal-50",   iconColor: "text-teal-600"   },
      { icon: <Users size={17} />,      label: "Jumlah KK",              value: fmtK(totalHH),                             sub: "Kepala keluarga terdaftar",          color: "bg-indigo-50", iconColor: "text-indigo-600" },
    ],
  };

  const activeCards = cards[category];

  return (
    <div className="space-y-5 p-[23px]">

      {/* Category selector + Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-secondary rounded-md p-1 border border-border">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={"text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all " + (category === cat ? "bg-black text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kecamatan..."
            className="pl-8 pr-7 py-1.5 text-xs bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 w-52 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X size={12} className="text-muted-foreground" />
            </button>
          )}
        </div>
        {search && (
          <span className={"text-[11px] px-2.5 py-1 rounded-md border " + (filteredKec.length === 0 ? "bg-red-50 border-red-200 text-red-600" : "border-border text-white bg-black")}>
            {filteredKec.length === 0 ? "Tidak ditemukan" : filteredKec.length === 1 ? ("Kec. " + filteredKec[0].name) : (filteredKec.length + " kecamatan")}
          </span>
        )}
      </div>

      {/* 8 Stat Cards in 2 rows */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {activeCards.slice(0, 4).map((c, i) => (
          <StatCard key={i} icon={<span className={c.iconColor}>{c.icon}</span>} label={c.label} value={c.value} sub={c.sub} color={c.color} trend={c.trend} />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {activeCards.slice(4).map((c, i) => (
          <StatCard key={i + 4} icon={<span className={c.iconColor}>{c.icon}</span>} label={c.label} value={c.value} sub={c.sub} color={c.color} trend={c.trend} />
        ))}
      </div>

      {/* Analytics section divider */}

      {/* Per-category rich analytics */}
      {category === "penduduk"  && (
        <PopulationAnalytics
          D={D}
          scaleFactor={scaleFactor}
          onDistrict={(k) => {
            setSelectedDistrictId(k.id);
            setSearch(k.name);
          }}
          selectedDistrict={selectedDistrict}
          onClearFocus={() => {
            setSelectedDistrictId(null);
            setSearch("");
          }}
        />
      )}
      {category === "geografis" && <GeografisAnalytics  D={D} />}
      {category === "ekonomi"   && <EkonomiAnalytics    D={D} />}
      {category === "sosial"    && <SosialAnalytics     D={D} />}
    </div>
  );
}

// ─── VANILLA LEAFLET MAP ──────────────────────────────────────────────────────

function LeafletMap({
  filter,
  selectedId,
  onSelect,
}: {
  filter: "all" | "padat" | "jarang";
  selectedId: number | null;
  onSelect: (k: KecamatanRow) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(
    new globalThis.Map(),
  );

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [-8.58, 116.53],
      zoom: 10,
      zoomControl: true,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { attribution: "&copy; OpenStreetMap &copy; CARTO" },
    ).addTo(map);
    mapRef.current = map;

    requestAnimationFrame(() => {
      map.invalidateSize();
    });

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // Sync markers when filter or selectedId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    const visible = kecamatan.filter((k) => {
      if (filter === "padat") return k.density > 500;
      if (filter === "jarang") return k.density <= 500;
      return true;
    });

    visible.forEach((k) => {
      const isSel = selectedId === k.id;
      
      const pinColor = isSel ? '#f59e0b' : populationColor(k.population);
      const pinHtml = `<div style="color: ${pinColor}; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.4)); transform: scale(${isSel ? '1.2' : '1.0'}); transition: transform 0.2s;">
                         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1">
                           <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                           <circle cx="12" cy="10" r="3" fill="white"/>
                         </svg>
                       </div>`;
                       
      const customIcon = L.divIcon({
        html: pinHtml,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([k.lat, k.lng], {
        icon: customIcon,
        zIndexOffset: isSel ? 1000 : 0
      }).addTo(map);

      marker.bindPopup(
        `<div style="font-family:Inter,sans-serif;min-width:150px">
          <strong style="font-size:13px;color:#111">${k.name}</strong>
          <div style="font-size:11px;margin-top:4px;color:#666">
            <div>Penduduk: <strong style="color:#111">${fmt(k.population)}</strong></div>
            <div>Luas: ${k.area} km²</div>
            <div>Kepadatan: ${fmt(k.density)}/km²</div>
            <div>Melek huruf: ${k.literacy}%</div>
          </div>
        </div>`,
      );

      marker.bindTooltip(
        `<strong>${k.name}</strong><br/>${fmt(k.population)} jiwa`,
        {
          direction: "top",
          sticky: true,
          opacity: 0.95,
        },
      );

      marker.on("click", () => onSelect(k));
      markersRef.current.set(k.id, marker);

      if (isSel) {
        map.flyTo([k.lat, k.lng], Math.max(map.getZoom(), 12.4), {
          animate: true,
          duration: 0.75,
        });
      }
    });
  }, [filter, selectedId, onSelect]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ width: "100%" }}
    />
  );
}

function PopulationBubbleMap({
  selectedId = null,
  onSelect,
  onClearFocus,
  height = 380,
}: {
  selectedId?: number | null;
  onSelect: (k: KecamatanRow) => void;
  onClearFocus: () => void;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new globalThis.Map());
  const hasFitRef = useRef(false);
  const lastSelectedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-8.56, 116.53],
      zoom: 10.2,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      },
    ).addTo(map);

    mapRef.current = map;

    requestAnimationFrame(() => {
      map.invalidateSize();
    });

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    const bounds = L.latLngBounds([]);
    const visible = [...kecamatan].sort((a, b) => a.population - b.population);

    visible.forEach((k) => {
      const isSelected = selectedId === k.id;
      
      const pinColor = isSelected ? '#f59e0b' : populationColor(k.population);
      const pinHtml = `<div style="color: ${pinColor}; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.4)); transform: scale(${isSelected ? '1.2' : '1.0'}); transition: transform 0.2s;">
                         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1">
                           <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                           <circle cx="12" cy="10" r="3" fill="white"/>
                         </svg>
                       </div>`;
                       
      const customIcon = L.divIcon({
        html: pinHtml,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([k.lat, k.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 0
      }).addTo(map);

      marker.bindTooltip(
        `<strong>${k.name}</strong><br/>${fmt(k.population)} jiwa`,
        {
          direction: "top",
          sticky: true,
          opacity: 0.95,
        },
      );

      marker.on("click", () => onSelect(k));
      markersRef.current.set(k.id, marker);
      bounds.extend([k.lat, k.lng]);
    });

    const selected = selectedId
      ? kecamatan.find((k) => k.id === selectedId) ?? null
      : null;

    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 12.4), {
        animate: true,
        duration: 0.75,
      });
    } else if (bounds.isValid() && (!hasFitRef.current || lastSelectedRef.current !== null)) {
      map.fitBounds(bounds.pad(0.18), { animate: true });
      hasFitRef.current = true;
    }

    lastSelectedRef.current = selectedId;
  }, [selectedId, onSelect]);

  const selectedLabel = selectedId
    ? kecamatan.find((k) => k.id === selectedId)?.name
    : null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-[#eef2f7]">
      <div className="pointer-events-none absolute top-4 left-4 z-[1000] rounded-xl border border-border bg-card/90 px-3 py-2 shadow-lg backdrop-blur-sm">
        <p className="text-xs font-semibold text-foreground">Peta Wilayah Kecamatan</p>
        <p className="text-[10px] text-muted-foreground">Klik titik biru untuk zoom dan ubah grafik</p>
      </div>

      <div className="pointer-events-none absolute top-4 right-4 z-[1000] rounded-xl border border-border bg-card/90 px-3 py-2 shadow-lg backdrop-blur-sm">
        <p className="text-[10px] font-semibold text-foreground mb-1">Legenda Penduduk</p>
        <div className="space-y-1 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1d4ed8] inline-block" /> &gt;70rb</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#2563eb] inline-block" /> &gt;50rb</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#3b82f6] inline-block" /> &gt;35rb</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#60a5fa] inline-block" /> &gt;20rb</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#bfdbfe] inline-block" /> lainnya</div>
        </div>
      </div>

      {selectedLabel && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] rounded-xl border border-border bg-card/90 px-3 py-2 shadow-lg backdrop-blur-sm">
          <p className="text-[10px] font-semibold text-foreground">{selectedLabel}</p>
          <button
            onClick={onClearFocus}
            className="pointer-events-auto mt-1 text-[10px] font-medium text-primary hover:underline"
          >
            Tampilkan semua wilayah
          </button>
        </div>
      )}

      <div ref={containerRef} className="w-full" style={{ height }} />
    </div>
  );
}

// ─── MAPS PAGE ────────────────────────────────────────────────────────────────

function MapsPage() {
  const [selected, setSelected] = useState<KecamatanRow | null>(
    null,
  );
  const [filter, setFilter] = useState<
    "all" | "padat" | "jarang"
  >("all");

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
          {(["all", "padat", "jarang"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] px-3 py-1.5 rounded-full font-medium border transition-colors shadow-lg ${
                filter === f
                  ? "bg-primary text-white border-primary"
                  : "bg-card/90 text-foreground border-border hover:border-primary/50"
              }`}
              style={{ backdropFilter: "blur(8px)" }}
            >
              {f === "all"
                ? "Semua"
                : f === "padat"
                  ? "Padat (>500/km²)"
                  : "Jarang (≤500/km²)"}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div
          className="absolute bottom-4 left-4 z-[1000] bg-card/90 border border-border rounded-xl p-3 text-[10px] space-y-1.5"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <p className="font-semibold text-foreground mb-2">
            Legenda Penduduk
          </p>
          {[
            { label: "> 70.000 jiwa", color: "#1d4ed8" },
            { label: "> 50.000 jiwa", color: "#2563eb" },
            { label: "> 35.000 jiwa", color: "#3b82f6" },
            { label: "> 20.000 jiwa", color: "#60a5fa" },
            { label: "≤ 20.000 jiwa", color: "#93c5fd" },
          ].map((l) => (
            <div
              key={l.label}
              className="flex items-center gap-2"
            >
              <span
                className="w-3 h-3 rounded-full inline-block shrink-0"
                style={{ background: l.color }}
              />
              <span className="text-muted-foreground">
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="w-72 shrink-0 bg-card border-l border-border overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-border">
          <p className="text-xs font-semibold text-foreground">
            Detail Kecamatan
          </p>
          <p className="text-[10px] text-muted-foreground">
            Klik penanda di peta untuk detail
          </p>
        </div>

        {selected ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <MapPin size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Kec. {selected.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Lombok Timur, NTB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Penduduk",
                  value: fmt(selected.population),
                  unit: "jiwa",
                },
                {
                  label: "Laki-laki",
                  value: fmt(selected.male),
                  unit: "jiwa",
                },
                {
                  label: "Perempuan",
                  value: fmt(selected.female),
                  unit: "jiwa",
                },
                {
                  label: "Luas",
                  value: selected.area.toFixed(2),
                  unit: "km²",
                },
                {
                  label: "Kepadatan",
                  value: fmt(selected.density),
                  unit: "/km²",
                },
                {
                  label: "Desa/Kel.",
                  value: String(selected.villages),
                  unit: "wil.",
                },
                {
                  label: "Melek Huruf",
                  value: selected.literacy.toFixed(1),
                  unit: "%",
                },
                {
                  label: "Pengangguran",
                  value: selected.unemployment.toFixed(1),
                  unit: "%",
                },
              ].map((d) => (
                <div
                  key={d.label}
                  className="bg-secondary/50 border border-border rounded-lg p-2.5"
                >
                  <p className="text-[9px] text-muted-foreground mb-0.5">
                    {d.label}
                  </p>
                  <p className="text-xs font-semibold font-sans text-foreground">
                    {d.value}{" "}
                    <span className="text-[9px] font-normal text-muted-foreground">
                      {d.unit}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-accent/5 border border-accent/20 rounded-lg flex items-center gap-2">
              <TrendingUp
                size={12}
                className="text-muted-foreground"
              />
              <span className="text-[10px] text-muted-foreground">
                Laju pertumbuhan
              </span>
              <span className="ml-auto text-[11px] font-sans font-semibold text-foreground">
                +{selected.growth}%
              </span>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="w-full text-[11px] py-2 rounded-lg border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
            >
              Tutup Detail
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-3">
              <Map
                size={20}
                className="text-muted-foreground"
              />
            </div>
            <p className="text-xs font-medium text-foreground">
              Belum ada kecamatan dipilih
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Klik salah satu lingkaran di peta untuk melihat
              detail informasi
            </p>
          </div>
        )}

        {/* Districts list */}
        <div className="border-t border-border p-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Daftar Kecamatan
          </p>
          <div className="space-y-1">
            {kecamatan.map((k) => (
              <button
                key={k.id}
                onClick={() => setSelected(k)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                  selected?.id === k.id
                    ? "bg-primary/15 border border-primary/30"
                    : "hover:bg-secondary border border-transparent"
                }`}
              >
                <span className="text-[11px] text-foreground">
                  {k.name}
                </span>
                <span className="text-[10px] font-sans text-muted-foreground">
                  {fmtK(k.population)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DATA LAPORAN PAGE ────────────────────────────────────────────────────────

function DataLaporanPage() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] =
    useState<keyof KecamatanRow>("population");
  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    "desc",
  );

  const filtered = kecamatan
    .filter((k) =>
      k.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const va = a[sortKey] as number;
      const vb = b[sortKey] as number;
      return sortDir === "asc" ? va - vb : vb - va;
    });

  const totalPop = kecamatan.reduce(
    (s, k) => s + k.population,
    0,
  );
  const totalArea = kecamatan.reduce((s, k) => s + k.area, 0);
  const totalVill = kecamatan.reduce(
    (s, k) => s + k.villages,
    0,
  );

  function exportCSV() {
    const header = [
      "No",
      "Kecamatan",
      "Penduduk",
      "Laki-laki",
      "Perempuan",
      "Luas (km²)",
      "Kepadatan",
      "Desa/Kel",
      "Melek Huruf (%)",
      "Pengangguran (%)",
    ];
    const rows = kecamatan.map((k, i) => [
      i + 1,
      k.name,
      k.population,
      k.male,
      k.female,
      k.area,
      k.density,
      k.villages,
      k.literacy,
      k.unemployment,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data-kependudukan-lotim-2024.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    window.print();
  }

  function toggleSort(key: keyof KecamatanRow) {
    if (sortKey === key)
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const cols: {
    key: keyof KecamatanRow;
    label: string;
    fmt: (k: KecamatanRow) => string;
  }[] = [
    { key: "name", label: "Kecamatan", fmt: (k) => k.name },
    {
      key: "population",
      label: "Penduduk",
      fmt: (k) => fmt(k.population),
    },
    {
      key: "male",
      label: "Laki-laki",
      fmt: (k) => fmt(k.male),
    },
    {
      key: "female",
      label: "Perempuan",
      fmt: (k) => fmt(k.female),
    },
    {
      key: "area",
      label: "Luas (km²)",
      fmt: (k) => k.area.toFixed(2),
    },
    {
      key: "density",
      label: "Kepadatan",
      fmt: (k) => fmt(k.density),
    },
    {
      key: "villages",
      label: "Desa/Kel",
      fmt: (k) => String(k.villages),
    },
    {
      key: "literacy",
      label: "Melek Huruf",
      fmt: (k) => k.literacy.toFixed(1) + "%",
    },
    {
      key: "unemployment",
      label: "Pengangguran",
      fmt: (k) => k.unemployment.toFixed(1) + "%",
    },
    {
      key: "growth",
      label: "Pertumbuhan",
      fmt: (k) => "+" + k.growth + "%",
    },
  ];

  return (
    <div className="px-6 pt-4 pb-6 space-y-5">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users size={17} className="text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">
              {fmtK(totalPop)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Total Penduduk
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <Map size={17} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">
              {totalArea.toFixed(0)} km²
            </p>
            <p className="text-[10px] text-muted-foreground">
              Total Luas Wilayah
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-amber-400/10 flex items-center justify-center">
            <Building2 size={17} className="text-amber-400" />
          </div>
          <div>
            <p className="text-lg font-semibold font-sans text-foreground">
              {totalVill}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Total Desa / Kelurahan
            </p>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kecamatan…"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground border border-border rounded-lg px-2.5 py-1.5">
            <Filter size={11} />
            <span>
              {filtered.length} dari {kecamatan.length}{" "}
              kecamatan
            </span>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-[#217346] border border-[#217346] text-white hover:opacity-90 transition-colors"
            >
              <Download size={12} className="text-white" /> Excel (CSV)
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white border border-[#EC1C24] text-[#EC1C24] hover:bg-red-50 transition-colors"
            >
              <Download size={12} className="text-[#EC1C24]" /> PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary/40 border-b-2 border-border/70">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-8 border-b-2 border-border/70 bg-secondary/40">
                  No
                </th>
                {cols.map((c) => (
                  <th
                    key={c.key}
                    onClick={() => toggleSort(c.key)}
                    className="text-left px-3 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors whitespace-nowrap select-none border-b-2 border-border/70 bg-secondary/40"
                  >
                    <span className="flex items-center gap-1">
                      {c.label}
                      {sortKey === c.key && (
                        <span className="text-primary">
                          {sortDir === "desc" ? "↓" : "↑"}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((k, i) => (
                <tr
                  key={k.id}
                  className="border-b border-border/50 hover:bg-secondary/40 transition-colors"
                >
                  <td className="px-4 py-3 font-sans text-muted-foreground text-[10px]">
                    {i + 1}
                  </td>
                  {cols.map((c) => (
                    <td
                      key={c.key}
                      className="px-3 py-3 font-sans text-foreground whitespace-nowrap"
                    >
                      {c.key === "name" ? (
                        <span className="font-medium text-foreground">
                          {c.fmt(k)}
                        </span>
                      ) : c.key === "growth" ? (
                        <span className="text-muted-foreground">
                          {c.fmt(k)}
                        </span>
                      ) : c.key === "population" ? (
                        <span className="font-semibold">
                          {c.fmt(k)}
                        </span>
                      ) : (
                        c.fmt(k)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {/* Footer totals */}
            <tfoot>
              <tr className="border-t border-border bg-secondary/30">
                <td className="px-4 py-3 text-[10px] font-semibold text-muted-foreground" />
                <td className="px-3 py-3 text-[10px] font-semibold text-muted-foreground">
                  TOTAL / RATA-RATA
                </td>
                <td className="px-3 py-3 font-sans font-semibold text-primary">
                  {fmt(totalPop)}
                </td>
                <td className="px-3 py-3 font-sans text-muted-foreground">
                  {fmt(
                    kecamatan.reduce((s, k) => s + k.male, 0),
                  )}
                </td>
                <td className="px-3 py-3 font-sans text-muted-foreground">
                  {fmt(
                    kecamatan.reduce((s, k) => s + k.female, 0),
                  )}
                </td>
                <td className="px-3 py-3 font-sans text-muted-foreground">
                  {totalArea.toFixed(2)}
                </td>
                <td className="px-3 py-3 font-sans text-muted-foreground">
                  809
                </td>
                <td className="px-3 py-3 font-sans text-muted-foreground">
                  {totalVill}
                </td>
                <td className="px-3 py-3 font-sans text-muted-foreground">
                  {(
                    kecamatan.reduce(
                      (s, k) => s + k.literacy,
                      0,
                    ) / kecamatan.length
                  ).toFixed(1)}
                  %
                </td>
                <td className="px-3 py-3 font-sans text-muted-foreground">
                  {(
                    kecamatan.reduce(
                      (s, k) => s + k.unemployment,
                      0,
                    ) / kecamatan.length
                  ).toFixed(1)}
                  %
                </td>
                <td className="px-3 py-3 font-sans text-muted-foreground">
                  +
                  {(
                    kecamatan.reduce(
                      (s, k) => s + k.growth,
                      0,
                    ) / kecamatan.length
                  ).toFixed(1)}
                  %
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

const PAGE_META: Record<
  Page,
  { title: string; subtitle: string }
> = {
  dashboard: {
    title: "Dashboard Statistik",
    subtitle:
      "Sistem Informasi Penduduk Kabupaten Lombok Timur",
  },
  maps: {
    title: "Peta Wilayah Interaktif",
    subtitle: "Visualisasi GIS Kecamatan — Lombok Timur, NTB",
  },
  laporan: {
    title: "Data Laporan Kependudukan",
    subtitle: "Rekapitulasi Data Statistik Seluruh Kecamatan",
  },
};

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [modal, setModal] = useState<KecamatanRow | null>(null);

  const handleDistrict = useCallback(
    (k: KecamatanRow) => setModal(k),
    [],
  );

  return (
    <div
      className="flex h-screen bg-background text-foreground overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <Sidebar page={page} onNavigate={setPage} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar {...PAGE_META[page]} />

        <main className="flex-1 overflow-auto min-h-0">
          {page === "dashboard" && (
            <DashboardPage onDistrict={handleDistrict} />
          )}
          {page === "maps" && <MapsPage />}
          {page === "laporan" && <DataLaporanPage />}
        </main>
      </div>

      {modal && (
        <DistrictModal
          k={modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
