import { useState, useEffect, useReducer, useCallback, useMemo, useRef } from "react";
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Search, Plus, ArrowRightLeft, TrendingUp, Bell, Settings, Home, CreditCard, Plane,
  Hotel, Car, ChevronRight, ChevronDown, Edit3, Trash2, Star, ExternalLink, Filter,
  Download, Upload, Moon, Sun, X, Check, AlertTriangle, Zap, DollarSign, ArrowRight,
  Bookmark, BookmarkCheck, Eye, EyeOff, RefreshCw, Clock, Tag, ChevronUp, Sparkles,
  Globe, Wallet, Award, BarChart3, ArrowUpRight, ArrowDownRight, Info, Copy, Command
} from "lucide-react";

// ─── CONSTANTS & REFERENCE DATA ────────────────────────────────────────
const PROGRAM_TYPES = {
  credit_card: { label: "Credit Cards", icon: "💳", filterIcon: CreditCard },
  airline: { label: "Airlines", icon: "✈️", filterIcon: Plane },
  hotel: { label: "Hotels", icon: "🏨", filterIcon: Hotel },
  rental_car: { label: "Rental Cars", icon: "🚗", filterIcon: Car },
  other: { label: "Other", icon: "🎁", filterIcon: Award },
};

const REFERENCE_PROGRAMS = [
  { name: "Chase Ultimate Rewards", type: "credit_card", issuer: "Chase", logo: "💎", cppValue: 2.0, color: "#0A4DA2" },
  { name: "Amex Membership Rewards", type: "credit_card", issuer: "Amex", logo: "💠", cppValue: 2.0, color: "#006FCF" },
  { name: "Capital One Miles", type: "credit_card", issuer: "Capital One", logo: "🔷", cppValue: 1.7, color: "#D03027" },
  { name: "Citi ThankYou Points", type: "credit_card", issuer: "Citi", logo: "🔵", cppValue: 1.7, color: "#003DA5" },
  { name: "Bilt Rewards", type: "credit_card", issuer: "Bilt", logo: "🏠", cppValue: 2.0, color: "#1A1A2E" },
  { name: "Southwest Rapid Rewards", type: "airline", issuer: "Southwest", logo: "❤️", cppValue: 1.4, color: "#304CB2" },
  { name: "Delta SkyMiles", type: "airline", issuer: "Delta", logo: "🔺", cppValue: 1.2, color: "#C8102E" },
  { name: "United MileagePlus", type: "airline", issuer: "United", logo: "🌐", cppValue: 1.3, color: "#002244" },
  { name: "American Airlines AAdvantage", type: "airline", issuer: "American Airlines", logo: "🦅", cppValue: 1.4, color: "#0078D2" },
  { name: "JetBlue TrueBlue", type: "airline", issuer: "JetBlue", logo: "💙", cppValue: 1.3, color: "#003876" },
  { name: "Alaska Mileage Plan", type: "airline", issuer: "Alaska", logo: "🏔️", cppValue: 1.8, color: "#01426A" },
  { name: "Virgin Atlantic Flying Club", type: "airline", issuer: "Virgin Atlantic", logo: "🔴", cppValue: 1.5, color: "#E10A0A" },
  { name: "Air Canada Aeroplan", type: "airline", issuer: "Air Canada", logo: "🍁", cppValue: 1.5, color: "#F01428" },
  { name: "ANA Mileage Club", type: "airline", issuer: "ANA", logo: "🇯🇵", cppValue: 3.2, color: "#00205C" },
  { name: "Marriott Bonvoy", type: "hotel", issuer: "Marriott", logo: "🏰", cppValue: 0.9, color: "#862633" },
  { name: "Hilton Honors", type: "hotel", issuer: "Hilton", logo: "🌟", cppValue: 0.6, color: "#003E6B" },
  { name: "World of Hyatt", type: "hotel", issuer: "Hyatt", logo: "🏛️", cppValue: 2.1, color: "#D4A843" },
  { name: "IHG One Rewards", type: "hotel", issuer: "IHG", logo: "🔑", cppValue: 0.5, color: "#005F3B" },
  { name: "Hertz Gold Plus Rewards", type: "rental_car", issuer: "Hertz", logo: "🚙", cppValue: 0.8, color: "#FFD100" },
  { name: "National Emerald Club", type: "rental_car", issuer: "National", logo: "🟢", cppValue: 0.7, color: "#006835" },
];

const TRANSFER_PARTNERS = [
  // Chase UR transfers
  { from: "Chase Ultimate Rewards", to: "World of Hyatt", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  { from: "Chase Ultimate Rewards", to: "Southwest Rapid Rewards", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  { from: "Chase Ultimate Rewards", to: "United MileagePlus", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  { from: "Chase Ultimate Rewards", to: "British Airways Avios", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  { from: "Chase Ultimate Rewards", to: "Air Canada Aeroplan", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  { from: "Chase Ultimate Rewards", to: "IHG One Rewards", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  { from: "Chase Ultimate Rewards", to: "Marriott Bonvoy", ratio: "1:1", ratioValue: 1.0, time: "1-2 days" },
  // Amex MR transfers
  { from: "Amex Membership Rewards", to: "Delta SkyMiles", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  { from: "Amex Membership Rewards", to: "ANA Mileage Club", ratio: "1:1", ratioValue: 1.0, time: "2-3 days" },
  { from: "Amex Membership Rewards", to: "Virgin Atlantic Flying Club", ratio: "1:1", ratioValue: 1.0, time: "Instant", bonused: true, bonusDetails: "30% bonus through Mar 31" },
  { from: "Amex Membership Rewards", to: "Hilton Honors", ratio: "1:2", ratioValue: 2.0, time: "Instant" },
  { from: "Amex Membership Rewards", to: "Marriott Bonvoy", ratio: "1:1", ratioValue: 1.0, time: "1-2 days" },
  { from: "Amex Membership Rewards", to: "JetBlue TrueBlue", ratio: "1:0.8", ratioValue: 0.8, time: "Instant" },
  { from: "Amex Membership Rewards", to: "Air Canada Aeroplan", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  // Capital One transfers
  { from: "Capital One Miles", to: "Air Canada Aeroplan", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  { from: "Capital One Miles", to: "Virgin Atlantic Flying Club", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  { from: "Capital One Miles", to: "Turkish Miles&Smiles", ratio: "1:1", ratioValue: 1.0, time: "1-2 days" },
  // Citi transfers
  { from: "Citi ThankYou Points", to: "JetBlue TrueBlue", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  { from: "Citi ThankYou Points", to: "Virgin Atlantic Flying Club", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  { from: "Citi ThankYou Points", to: "Turkish Miles&Smiles", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  // Bilt transfers
  { from: "Bilt Rewards", to: "World of Hyatt", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  { from: "Bilt Rewards", to: "American Airlines AAdvantage", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  { from: "Bilt Rewards", to: "United MileagePlus", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  { from: "Bilt Rewards", to: "Alaska Mileage Plan", ratio: "1:1", ratioValue: 1.0, time: "1-2 days" },
  { from: "Bilt Rewards", to: "IHG One Rewards", ratio: "1:1", ratioValue: 1.0, time: "Instant" },
  // Marriott to airlines
  { from: "Marriott Bonvoy", to: "Alaska Mileage Plan", ratio: "3:1", ratioValue: 0.333, time: "3-5 days", bonusNote: "+5k bonus per 60k transferred" },
  { from: "Marriott Bonvoy", to: "Delta SkyMiles", ratio: "3:1", ratioValue: 0.333, time: "3-5 days", bonusNote: "+5k bonus per 60k transferred" },
  { from: "Marriott Bonvoy", to: "United MileagePlus", ratio: "3:1", ratioValue: 0.333, time: "3-5 days", bonusNote: "+5k bonus per 60k transferred" },
  { from: "Marriott Bonvoy", to: "American Airlines AAdvantage", ratio: "3:1", ratioValue: 0.333, time: "3-5 days", bonusNote: "+5k bonus per 60k transferred" },
  { from: "Marriott Bonvoy", to: "Southwest Rapid Rewards", ratio: "3:1", ratioValue: 0.333, time: "3-5 days", bonusNote: "+5k bonus per 60k transferred" },
];

const SAMPLE_DEALS = [
  { id: "d1", title: "Amex Transfer Bonus: 30% to Virgin Atlantic", source: "The Points Guy", url: "#", category: "transfer_bonus", summary: "Amex is offering a 30% bonus on transfers to Virgin Atlantic Flying Club through March 31. This is a great opportunity to book premium cabin flights to London and Tokyo.", relevantPrograms: ["Amex Membership Rewards", "Virgin Atlantic Flying Club"], postedDate: "2026-02-10", expirationDate: "2026-03-31", valuationImpact: "positive", isRead: false, isSaved: false },
  { id: "d2", title: "Marriott Bonvoy: 50% Off Award Nights in Europe", source: "Doctor of Credit", url: "#", category: "redemption_sweet_spot", summary: "Select Marriott properties across Europe are offering 50% off award night pricing through April. Properties in Spain, Italy, and Greece are included.", relevantPrograms: ["Marriott Bonvoy"], postedDate: "2026-02-12", expirationDate: "2026-04-15", valuationImpact: "positive", isRead: false, isSaved: false },
  { id: "d3", title: "Chase UR → Hyatt: Still the Best Transfer at 2.1 cpp", source: "The Points Guy", url: "#", category: "redemption_sweet_spot", summary: "World of Hyatt continues to deliver outsized value. Category 1-4 hotels offer 2-3 cpp, making Chase-to-Hyatt the gold standard of point transfers.", relevantPrograms: ["Chase Ultimate Rewards", "World of Hyatt"], postedDate: "2026-02-08", expirationDate: null, valuationImpact: "positive", isRead: true, isSaved: true },
  { id: "d4", title: "Southwest Companion Pass: Earn Through Feb 2027", source: "Doctor of Credit", url: "#", category: "earning_opportunity", summary: "Earn the Southwest Companion Pass by accumulating 135,000 qualifying points in a calendar year. The pass lets a designated companion fly free on every flight.", relevantPrograms: ["Southwest Rapid Rewards"], postedDate: "2026-02-05", expirationDate: "2026-12-31", valuationImpact: "positive", isRead: false, isSaved: false },
  { id: "d5", title: "Delta SkyMiles: Partner Award Chart Changes March 1", source: "The Points Guy", url: "#", category: "devaluation_alert", summary: "Delta is increasing partner award rates by 10-20% on key routes starting March 1. Book existing partner awards before the change takes effect.", relevantPrograms: ["Delta SkyMiles"], postedDate: "2026-02-11", expirationDate: "2026-03-01", valuationImpact: "negative", isRead: false, isSaved: false },
  { id: "d6", title: "Capital One: Air Canada Aeroplan Now at 1:1", source: "Doctor of Credit", url: "#", category: "transfer_bonus", summary: "Capital One has added Air Canada Aeroplan as a transfer partner at a 1:1 ratio. Aeroplan offers excellent Star Alliance award availability and mixed-cabin routing.", relevantPrograms: ["Capital One Miles", "Air Canada Aeroplan"], postedDate: "2026-02-09", expirationDate: null, valuationImpact: "positive", isRead: true, isSaved: false },
  { id: "d7", title: "IHG One Rewards: 4th Night Free on Award Stays", source: "The Points Guy", url: "#", category: "redemption_sweet_spot", summary: "IHG Platinum Elite and above get the 4th night free on award stays, effectively giving you 25% more value from your IHG points on 4+ night bookings.", relevantPrograms: ["IHG One Rewards"], postedDate: "2026-02-06", expirationDate: null, valuationImpact: "positive", isRead: false, isSaved: false },
  { id: "d8", title: "Amex Gold: 4x on Restaurants + Groceries Remains Best in Class", source: "Doctor of Credit", url: "#", category: "earning_opportunity", summary: "The Amex Gold card continues to dominate dining and grocery earning at 4x MR points. Stack with Amex Offers for additional savings.", relevantPrograms: ["Amex Membership Rewards"], postedDate: "2026-02-13", expirationDate: null, valuationImpact: "positive", isRead: false, isSaved: false },
  { id: "d9", title: "Hilton Honors: Targeted 100% Bonus on Purchases", source: "Doctor of Credit", url: "#", category: "earning_opportunity", summary: "Check your Hilton Honors account for a targeted offer to earn 100% bonus points on stays through April. Registration required.", relevantPrograms: ["Hilton Honors"], postedDate: "2026-02-07", expirationDate: "2026-04-30", valuationImpact: "positive", isRead: false, isSaved: false },
  { id: "d10", title: "Hyatt Globalist Challenge: Fast Track to Top Status", source: "The Points Guy", url: "#", category: "earning_opportunity", summary: "World of Hyatt is offering a targeted Globalist status challenge — earn top-tier status with just 20 qualifying nights in 90 days.", relevantPrograms: ["World of Hyatt"], postedDate: "2026-02-14", expirationDate: "2026-05-15", valuationImpact: "positive", isRead: false, isSaved: false },
];

const DEAL_CATEGORIES = {
  transfer_bonus: { label: "Transfer Bonus", color: "#3ECFB4", icon: ArrowRightLeft },
  sign_up_bonus: { label: "Sign-Up Bonus", color: "#5B8DEF", icon: CreditCard },
  earning_opportunity: { label: "Earning Opportunity", color: "#D4A843", icon: TrendingUp },
  redemption_sweet_spot: { label: "Sweet Spot", color: "#A78BFA", icon: Sparkles },
  devaluation_alert: { label: "Devaluation", color: "#E5534B", icon: AlertTriangle },
};

// ─── UTILITY FUNCTIONS ─────────────────────────────────────────────────
const genId = () => Math.random().toString(36).substr(2, 9);
const formatNum = (n) => n?.toLocaleString("en-US") ?? "0";
const formatMoney = (n) => `$${(n / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const daysAgo = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${Math.floor(diff / 30)}mo ago`;
};

const generateHistory = (current) => {
  const history = [];
  let val = Math.max(0, current - Math.floor(Math.random() * current * 0.4));
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    history.push({ date: d.toISOString().slice(0, 10), balance: val });
    val = Math.min(current, val + Math.floor(Math.random() * (current * 0.15)));
  }
  history[history.length - 1].balance = current;
  return history;
};

// ─── ANIMATED NUMBER COMPONENT ─────────────────────────────────────────
function AnimatedNumber({ value, prefix = "", suffix = "", duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = display;
    const end = value;
    if (start === end) return;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(start + (end - start) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  return <span>{prefix}{formatNum(display)}{suffix}</span>;
}

// ─── SPARKLINE COMPONENT ───────────────────────────────────────────────
function Sparkline({ data, color = "#D4A843", height = 32, width = 80 }) {
  if (!data || data.length < 2) return null;
  const values = data.map(d => d.balance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) =>
    `${(i / (values.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`
  ).join(" ");
  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────
const STORAGE_KEY = "rewards-tracker-data";
const VIEWS = ["dashboard", "programs", "transfers", "deals", "settings"];
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "programs", label: "Programs", icon: Wallet },
  { id: "transfers", label: "Transfers", icon: ArrowRightLeft },
  { id: "deals", label: "Deals", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function RewardsTracker() {
  const [activeView, setActiveView] = useState("dashboard");
  const [programs, setPrograms] = useState([]);
  const [deals, setDeals] = useState(SAMPLE_DEALS);
  const [showModal, setShowModal] = useState(null);
  const [editingProgram, setEditingProgram] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [programFilter, setProgramFilter] = useState("all");
  const [programSort, setProgramSort] = useState("balance_desc");
  const [dealFilter, setDealFilter] = useState("all");
  const [dealRelevantOnly, setDealRelevantOnly] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [mounted, setMounted] = useState(false);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res?.value) {
          const data = JSON.parse(res.value);
          if (data.programs) setPrograms(data.programs);
          if (data.deals) setDeals(data.deals);
          if (data.darkMode !== undefined) setDarkMode(data.darkMode);
        }
      } catch (e) { /* first load */ }
      setLoaded(true);
      setTimeout(() => setMounted(true), 50);
    })();
  }, []);

  // Save to storage
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify({ programs, deals, darkMode }));
      } catch (e) { /* storage write failed */ }
    })();
  }, [programs, deals, darkMode, loaded]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ─── COMPUTED VALUES ──────────────────────────────────────────
  const totalPoints = useMemo(() => programs.reduce((s, p) => s + (p.currentBalance || 0), 0), [programs]);
  const totalValue = useMemo(() => programs.reduce((s, p) => s + (p.currentBalance || 0) * (p.cppValue || 0), 0), [programs]);
  const unreadDeals = useMemo(() => deals.filter(d => !d.isRead).length, [deals]);

  const userProgramNames = useMemo(() => programs.map(p => p.name), [programs]);
  const relevantTransfers = useMemo(() =>
    TRANSFER_PARTNERS.filter(t => userProgramNames.includes(t.from) || userProgramNames.includes(t.to)),
    [userProgramNames]
  );

  const filteredPrograms = useMemo(() => {
    let list = [...programs];
    if (programFilter !== "all") list = list.filter(p => p.type === programFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.issuer?.toLowerCase().includes(q));
    }
    switch (programSort) {
      case "balance_desc": list.sort((a, b) => b.currentBalance - a.currentBalance); break;
      case "balance_asc": list.sort((a, b) => a.currentBalance - b.currentBalance); break;
      case "value_desc": list.sort((a, b) => (b.currentBalance * b.cppValue) - (a.currentBalance * a.cppValue)); break;
      case "name_asc": list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "updated": list.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)); break;
    }
    return list;
  }, [programs, programFilter, programSort, searchQuery]);

  const filteredDeals = useMemo(() => {
    let list = [...deals];
    if (dealFilter !== "all") list = list.filter(d => d.category === dealFilter);
    if (dealRelevantOnly) list = list.filter(d => d.relevantPrograms.some(rp => userProgramNames.includes(rp)));
    if (searchQuery && activeView === "deals") {
      const q = searchQuery.toLowerCase();
      list = list.filter(d => d.title.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
  }, [deals, dealFilter, dealRelevantOnly, userProgramNames, searchQuery, activeView]);

  // Optimization recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    programs.forEach(prog => {
      if (prog.type !== "credit_card" || prog.currentBalance < 5000) return;
      const transfers = TRANSFER_PARTNERS.filter(t => t.from === prog.name);
      transfers.forEach(t => {
        const refTo = REFERENCE_PROGRAMS.find(r => r.name === t.to);
        if (!refTo) return;
        const fromValue = prog.currentBalance * prog.cppValue;
        const toPoints = Math.floor(prog.currentBalance * t.ratioValue);
        let bonusPoints = 0;
        if (t.bonused) bonusPoints = Math.floor(toPoints * 0.3);
        if (t.from === "Marriott Bonvoy" && prog.currentBalance >= 60000) bonusPoints = Math.floor(prog.currentBalance / 60000) * 5000;
        const toValue = (toPoints + bonusPoints) * refTo.cppValue;
        const valueGain = toValue - fromValue;
        if (valueGain > 0 || t.bonused) {
          recs.push({
            id: `${prog.id}-${t.to}`,
            from: prog,
            to: refTo,
            transfer: t,
            pointsIn: prog.currentBalance,
            pointsOut: toPoints + bonusPoints,
            valueIn: fromValue,
            valueOut: toValue,
            gain: valueGain,
            bonused: t.bonused,
            bonusDetails: t.bonusDetails || t.bonusNote,
          });
        }
      });
    });
    return recs.sort((a, b) => b.gain - a.gain).slice(0, 8);
  }, [programs]);

  // Transfer calculator
  const transferResult = useMemo(() => {
    if (!transferFrom || !transferTo || !transferAmount) return null;
    const partner = TRANSFER_PARTNERS.find(t => t.from === transferFrom && t.to === transferTo);
    if (!partner) return null;
    const amount = parseInt(transferAmount) || 0;
    const received = Math.floor(amount * partner.ratioValue);
    let bonus = 0;
    if (partner.bonused) bonus = Math.floor(received * 0.3);
    if (partner.bonusNote?.includes("60k") && amount >= 60000) bonus = Math.floor(amount / 60000) * 5000;
    const fromProg = REFERENCE_PROGRAMS.find(r => r.name === transferFrom);
    const toProg = REFERENCE_PROGRAMS.find(r => r.name === transferTo);
    const fromValue = amount * (fromProg?.cppValue || 1);
    const toValue = (received + bonus) * (toProg?.cppValue || 1);
    return { received, bonus, total: received + bonus, fromValue, toValue, gain: toValue - fromValue, partner, fromProg, toProg };
  }, [transferFrom, transferTo, transferAmount]);

  // Possible transfer destinations for selected "from"
  const transferDestinations = useMemo(() => {
    if (!transferFrom) return [];
    return TRANSFER_PARTNERS.filter(t => t.from === transferFrom);
  }, [transferFrom]);

  // ─── HANDLERS ─────────────────────────────────────────────────
  const addProgram = (data) => {
    const ref = REFERENCE_PROGRAMS.find(r => r.name === data.name) || {};
    const prog = {
      id: genId(),
      name: data.name,
      type: data.type || ref.type || "other",
      issuer: data.issuer || ref.issuer || "",
      logo: ref.logo || "🎁",
      currentBalance: parseInt(data.currentBalance) || 0,
      balanceHistory: generateHistory(parseInt(data.currentBalance) || 0),
      cppValue: ref.cppValue || parseFloat(data.cppValue) || 1.0,
      color: ref.color || "#666",
      notes: data.notes || "",
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    setPrograms(prev => [...prev, prog]);
    setShowModal(null);
  };

  const updateProgram = (id, updates) => {
    setPrograms(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, ...updates, lastUpdated: new Date().toISOString().slice(0, 10) };
      if (updates.currentBalance !== undefined && updates.currentBalance !== p.currentBalance) {
        updated.balanceHistory = [...(p.balanceHistory || []), { date: updated.lastUpdated, balance: updates.currentBalance }].slice(-12);
      }
      return updated;
    }));
  };

  const deleteProgram = (id) => {
    setPrograms(prev => prev.filter(p => p.id !== id));
  };

  const toggleDealRead = (id) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, isRead: !d.isRead } : d));
  };

  const toggleDealSaved = (id) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, isSaved: !d.isSaved } : d));
  };

  const exportData = () => {
    const data = JSON.stringify({ programs, deals, exportDate: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rewards-tracker-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.programs) setPrograms(data.programs);
        if (data.deals) setDeals(data.deals);
      } catch (err) { alert("Invalid file format"); }
    };
    reader.readAsText(file);
  };

  // Theme
  const t = darkMode ? {
    bg: "#0D0F14", bgCard: "#161922", bgCardHover: "#1C2030", bgSidebar: "#10121A",
    border: "#2A2D3A", text: "#F0F0F5", textSec: "#8B8FA3", textMuted: "#555872",
    gold: "#D4A843", teal: "#3ECFB4", red: "#E5534B", blue: "#5B8DEF", purple: "#A78BFA",
    inputBg: "#1C2030", modalBg: "#161922", overlay: "rgba(0,0,0,0.7)",
  } : {
    bg: "#F5F3EF", bgCard: "#FFFFFF", bgCardHover: "#F9F8F5", bgSidebar: "#FEFDFB",
    border: "#E5E0D8", text: "#1A1A2E", textSec: "#6B6880", textMuted: "#9E9BB0",
    gold: "#B8922F", teal: "#2DA88F", red: "#D4443D", blue: "#4A7AD4", purple: "#8B6FD4",
    inputBg: "#F5F3EF", modalBg: "#FFFFFF", overlay: "rgba(0,0,0,0.4)",
  };

  // ─── RENDER HELPERS ───────────────────────────────────────────

  const ProgramCard = ({ prog, compact = false }) => {
    const [editing, setEditing] = useState(false);
    const [bal, setBal] = useState(prog.currentBalance);
    const value = (prog.currentBalance * prog.cppValue);
    const daysSinceUpdate = Math.floor((new Date() - new Date(prog.lastUpdated)) / 86400000);

    return (
      <div
        style={{
          background: t.bgCard, border: `1px solid ${t.border}`, borderLeft: `3px solid ${prog.color}`,
          borderRadius: 12, padding: compact ? "14px 16px" : "20px 24px", transition: "all 0.2s",
          cursor: "pointer", position: "relative",
        }}
        onMouseEnter={e => e.currentTarget.style.background = t.bgCardHover}
        onMouseLeave={e => e.currentTarget.style.background = t.bgCard}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: compact ? 20 : 26 }}>{prog.logo}</span>
            <div>
              <div style={{ color: t.text, fontWeight: 600, fontSize: compact ? 13 : 15, fontFamily: "'Outfit', sans-serif" }}>{prog.name}</div>
              <div style={{ color: t.textSec, fontSize: 11, marginTop: 2 }}>{PROGRAM_TYPES[prog.type]?.label} • {prog.issuer}</div>
            </div>
          </div>
          {!compact && (
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={(e) => { e.stopPropagation(); setEditing(!editing); }}
                style={{ background: "transparent", border: "none", color: t.textSec, cursor: "pointer", padding: 4 }}>
                <Edit3 size={14} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); deleteProgram(prog.id); }}
                style={{ background: "transparent", border: "none", color: t.textSec, cursor: "pointer", padding: 4 }}>
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
        <div style={{ marginTop: compact ? 10 : 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            {editing ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="number" value={bal} onChange={e => setBal(parseInt(e.target.value) || 0)}
                  style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 6, color: t.gold, fontSize: 20, fontWeight: 700, width: 140, padding: "4px 8px", fontFamily: "'Outfit', sans-serif" }} />
                <button onClick={() => { updateProgram(prog.id, { currentBalance: bal }); setEditing(false); }}
                  style={{ background: t.gold, border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", color: "#0D0F14", fontWeight: 600, fontSize: 12 }}>
                  Save
                </button>
              </div>
            ) : (
              <div style={{ color: t.gold, fontSize: compact ? 22 : 28, fontWeight: 700, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
                <AnimatedNumber value={prog.currentBalance} />
              </div>
            )}
            <div style={{ color: t.textSec, fontSize: 11, marginTop: 4 }}>
              ≈ {formatMoney(value)} at {prog.cppValue}¢/pt
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Sparkline data={prog.balanceHistory} color={prog.color} />
            <div style={{ color: daysSinceUpdate > 30 ? t.red : t.textMuted, fontSize: 10, marginTop: 4 }}>
              {daysSinceUpdate > 30 && <AlertTriangle size={10} style={{ marginRight: 2, display: "inline" }} />}
              Updated {daysAgo(prog.lastUpdated)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DealCard = ({ deal, compact = false }) => {
    const cat = DEAL_CATEGORIES[deal.category];
    const isRelevant = deal.relevantPrograms.some(rp => userProgramNames.includes(rp));
    const CatIcon = cat.icon;
    return (
      <div style={{
        background: t.bgCard,
        border: `1px solid ${deal.valuationImpact === "negative" ? t.red + "40" : t.border}`,
        borderRadius: 12, padding: compact ? "14px 16px" : "18px 20px",
        transition: "all 0.2s", opacity: deal.isRead ? 0.7 : 1,
        minWidth: compact ? 280 : "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{
                background: cat.color + "20", color: cat.color, fontSize: 10, fontWeight: 600,
                padding: "3px 8px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4,
                fontFamily: "'Outfit', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px",
              }}>
                <CatIcon size={10} /> {cat.label}
              </span>
              {isRelevant && <span style={{ background: t.gold + "20", color: t.gold, fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 20, fontFamily: "'Outfit', sans-serif" }}>YOUR PROGRAM</span>}
              {deal.expirationDate && (
                <span style={{ color: t.textMuted, fontSize: 10 }}>
                  <Clock size={9} style={{ display: "inline", marginRight: 2 }} />
                  Expires {new Date(deal.expirationDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
            <div style={{ color: t.text, fontWeight: 600, fontSize: compact ? 13 : 14, lineHeight: 1.3, fontFamily: "'Outfit', sans-serif" }}>{deal.title}</div>
            {!compact && <div style={{ color: t.textSec, fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>{deal.summary}</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <span style={{ color: t.textMuted, fontSize: 10 }}>{deal.source} • {daysAgo(deal.postedDate)}</span>
              {deal.relevantPrograms.map(rp => (
                <span key={rp} style={{ color: t.textSec, fontSize: 10, background: t.bgCardHover, padding: "2px 6px", borderRadius: 4 }}>{rp}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
            <button onClick={() => toggleDealRead(deal.id)}
              style={{ background: "transparent", border: "none", color: t.textSec, cursor: "pointer", padding: 4 }}>
              {deal.isRead ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button onClick={() => toggleDealSaved(deal.id)}
              style={{ background: "transparent", border: "none", color: deal.isSaved ? t.gold : t.textSec, cursor: "pointer", padding: 4 }}>
              {deal.isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ icon: Icon, label, value, sub, color = t.gold }) => (
    <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 160 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ background: color + "15", borderRadius: 8, padding: 8, display: "flex" }}>
          <Icon size={16} color={color} />
        </div>
        <span style={{ color: t.textSec, fontSize: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ color: t.text, fontSize: 28, fontWeight: 700, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: t.textSec, fontSize: 11, marginTop: 6 }}>{sub}</div>}
    </div>
  );

  // ─── ADD PROGRAM MODAL ────────────────────────────────────────
  const AddProgramModal = () => {
    const [name, setName] = useState(editingProgram?.name || "");
    const [type, setType] = useState(editingProgram?.type || "credit_card");
    const [balance, setBalance] = useState(editingProgram?.currentBalance?.toString() || "");
    const [notes, setNotes] = useState(editingProgram?.notes || "");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestions = REFERENCE_PROGRAMS.filter(r =>
      r.name.toLowerCase().includes(name.toLowerCase()) && !programs.some(p => p.name === r.name)
    ).slice(0, 6);

    return (
      <div style={{ position: "fixed", inset: 0, background: t.overlay, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        onClick={() => { setShowModal(null); setEditingProgram(null); }}>
        <div style={{ background: t.modalBg, border: `1px solid ${t.border}`, borderRadius: 16, padding: 32, maxWidth: 480, width: "100%", position: "relative" }}
          onClick={e => e.stopPropagation()}>
          <h2 style={{ color: t.text, fontSize: 20, fontWeight: 700, fontFamily: "'Outfit', sans-serif", marginBottom: 24 }}>
            {editingProgram ? "Edit Program" : "Add Program"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <label style={{ color: t.textSec, fontSize: 12, fontWeight: 500, marginBottom: 6, display: "block" }}>Program Name</label>
              <input value={name} onChange={e => { setName(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="e.g. Chase Ultimate Rewards"
                style={{ width: "100%", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 14px", color: t.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8, marginTop: 4, zIndex: 10, overflow: "hidden" }}>
                  {suggestions.map(s => (
                    <div key={s.name} onClick={() => { setName(s.name); setType(s.type); setShowSuggestions(false); }}
                      style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: t.text, fontSize: 13, borderBottom: `1px solid ${t.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = t.bgCardHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <span>{s.logo}</span> {s.name}
                      <span style={{ color: t.textMuted, fontSize: 11, marginLeft: "auto" }}>{s.cppValue}¢/pt</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={{ color: t.textSec, fontSize: 12, fontWeight: 500, marginBottom: 6, display: "block" }}>Type</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(PROGRAM_TYPES).map(([key, val]) => (
                  <button key={key} onClick={() => setType(key)}
                    style={{
                      background: type === key ? t.gold + "20" : t.inputBg, border: `1px solid ${type === key ? t.gold : t.border}`,
                      borderRadius: 8, padding: "8px 14px", color: type === key ? t.gold : t.textSec, fontSize: 12, cursor: "pointer",
                      fontWeight: 500, transition: "all 0.15s",
                    }}>
                    {val.icon} {val.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ color: t.textSec, fontSize: 12, fontWeight: 500, marginBottom: 6, display: "block" }}>Current Balance</label>
              <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0"
                style={{ width: "100%", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 14px", color: t.gold, fontSize: 22, fontWeight: 700, outline: "none", fontFamily: "'Outfit', sans-serif", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ color: t.textSec, fontSize: 12, fontWeight: 500, marginBottom: 6, display: "block" }}>Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any notes about this program..."
                style={{ width: "100%", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 14px", color: t.text, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <button onClick={() => {
              if (!name) return;
              if (editingProgram) {
                updateProgram(editingProgram.id, { name, type, currentBalance: parseInt(balance) || 0, notes });
                setEditingProgram(null);
              } else {
                addProgram({ name, type, currentBalance: balance, notes });
              }
              setShowModal(null);
            }}
              style={{
                background: `linear-gradient(135deg, ${t.gold}, ${t.gold}dd)`, border: "none", borderRadius: 10, padding: "12px 24px",
                color: "#0D0F14", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                marginTop: 8, transition: "transform 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              {editingProgram ? "Update Program" : "Add Program"}
            </button>
          </div>
          <button onClick={() => { setShowModal(null); setEditingProgram(null); }}
            style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: t.textSec, cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>
      </div>
    );
  };

  // ─── SEARCH OVERLAY ───────────────────────────────────────────
  const SearchOverlay = () => {
    const [q, setQ] = useState("");
    const results = useMemo(() => {
      if (!q) return { programs: [], deals: [], partners: [] };
      const lower = q.toLowerCase();
      return {
        programs: programs.filter(p => p.name.toLowerCase().includes(lower) || p.issuer?.toLowerCase().includes(lower)),
        deals: deals.filter(d => d.title.toLowerCase().includes(lower) || d.summary.toLowerCase().includes(lower)),
        partners: TRANSFER_PARTNERS.filter(t => t.from.toLowerCase().includes(lower) || t.to.toLowerCase().includes(lower)),
      };
    }, [q, programs, deals]);
    const hasResults = results.programs.length + results.deals.length + results.partners.length > 0;

    return (
      <div style={{ position: "fixed", inset: 0, background: t.overlay, zIndex: 1100, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 100 }}
        onClick={() => setSearchOpen(false)}>
        <div style={{ background: t.modalBg, border: `1px solid ${t.border}`, borderRadius: 16, maxWidth: 560, width: "100%", overflow: "hidden" }}
          onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: `1px solid ${t.border}` }}>
            <Search size={18} color={t.textSec} />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search programs, deals, partners..."
              style={{ flex: 1, background: "transparent", border: "none", color: t.text, fontSize: 15, outline: "none" }} />
            <kbd style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 4, padding: "2px 6px", color: t.textMuted, fontSize: 10 }}>ESC</kbd>
          </div>
          {q && (
            <div style={{ maxHeight: 400, overflowY: "auto", padding: "8px 0" }}>
              {!hasResults && <div style={{ padding: "20px", color: t.textSec, textAlign: "center", fontSize: 13 }}>No results found</div>}
              {results.programs.length > 0 && (
                <div>
                  <div style={{ padding: "8px 20px", color: t.textMuted, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Programs</div>
                  {results.programs.map(p => (
                    <div key={p.id} onClick={() => { setSearchOpen(false); setActiveView("programs"); }}
                      style={{ padding: "10px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, color: t.text, fontSize: 13 }}
                      onMouseEnter={e => e.currentTarget.style.background = t.bgCardHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <span>{p.logo}</span> {p.name}
                      <span style={{ color: t.gold, marginLeft: "auto", fontWeight: 600 }}>{formatNum(p.currentBalance)}</span>
                    </div>
                  ))}
                </div>
              )}
              {results.deals.length > 0 && (
                <div>
                  <div style={{ padding: "8px 20px", color: t.textMuted, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginTop: 4 }}>Deals</div>
                  {results.deals.slice(0, 5).map(d => (
                    <div key={d.id} onClick={() => { setSearchOpen(false); setActiveView("deals"); }}
                      style={{ padding: "10px 20px", cursor: "pointer", color: t.text, fontSize: 13 }}
                      onMouseEnter={e => e.currentTarget.style.background = t.bgCardHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <span style={{ color: DEAL_CATEGORIES[d.category]?.color, marginRight: 8 }}>●</span>
                      {d.title}
                    </div>
                  ))}
                </div>
              )}
              {results.partners.length > 0 && (
                <div>
                  <div style={{ padding: "8px 20px", color: t.textMuted, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginTop: 4 }}>Transfer Partners</div>
                  {results.partners.slice(0, 5).map((tp, i) => (
                    <div key={i} onClick={() => { setSearchOpen(false); setActiveView("transfers"); }}
                      style={{ padding: "10px 20px", cursor: "pointer", color: t.text, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = t.bgCardHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {tp.from} <ArrowRight size={12} color={t.teal} /> {tp.to}
                      <span style={{ color: t.textMuted, marginLeft: "auto", fontSize: 11 }}>{tp.ratio}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── DASHBOARD VIEW ───────────────────────────────────────────
  const DashboardView = () => {
    const pieData = programs.map(p => ({ name: p.name, value: p.currentBalance, color: p.color })).sort((a, b) => b.value - a.value);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Stats Row */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <StatCard icon={Award} label="Total Points" value={<AnimatedNumber value={totalPoints} />} sub={`Across ${programs.length} programs`} />
          <StatCard icon={DollarSign} label="Estimated Value" value={<AnimatedNumber value={Math.round(totalValue / 100)} prefix="$" />} sub="Based on cpp valuations" color={t.teal} />
          <StatCard icon={Wallet} label="Active Programs" value={programs.length} sub={`${programs.filter(p => p.type === 'credit_card').length} cards, ${programs.filter(p => p.type !== 'credit_card').length} loyalty`} color={t.blue} />
          <StatCard icon={Bell} label="New Deals" value={unreadDeals} sub={unreadDeals > 0 ? "Requiring attention" : "All caught up"} color={unreadDeals > 0 ? t.red : t.teal} />
        </div>

        {/* Portfolio + Programs */}
        <div style={{ display: "grid", gridTemplateColumns: programs.length > 0 ? "300px 1fr" : "1fr", gap: 24 }}>
          {/* Donut Chart */}
          {programs.length > 0 && (
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24 }}>
              <h3 style={{ color: t.text, fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>Portfolio Breakdown</h3>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2} dataKey="value" stroke="none">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 12 }}
                      formatter={(val) => [formatNum(val) + " pts", ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                {pieData.slice(0, 6).map(p => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: t.textSec }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                    <span style={{ color: t.text, fontWeight: 500 }}>{formatNum(p.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Programs Grid */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ color: t.text, fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>My Programs</h3>
              <button onClick={() => setActiveView("programs")} style={{ background: "transparent", border: "none", color: t.gold, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                View All <ChevronRight size={14} />
              </button>
            </div>
            {programs.length === 0 ? (
              <div style={{ background: t.bgCard, border: `2px dashed ${t.border}`, borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
                <div style={{ color: t.text, fontSize: 16, fontWeight: 600, fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>Welcome to Your Points Command Center</div>
                <div style={{ color: t.textSec, fontSize: 13, marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>Start by adding your credit card and loyalty programs. We'll handle the intelligence — transfer ratios, valuations, and deal alerts.</div>
                <button onClick={() => setShowModal("add")}
                  style={{ background: t.gold, border: "none", borderRadius: 10, padding: "12px 24px", color: "#0D0F14", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                  <Plus size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "text-bottom" }} />
                  Add Your First Program
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {programs.slice(0, 6).map(p => <ProgramCard key={p.id} prog={p} />)}
                <div onClick={() => setShowModal("add")}
                  style={{
                    border: `2px dashed ${t.border}`, borderRadius: 12, padding: 24, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", minHeight: 120,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.gold; e.currentTarget.style.background = t.gold + "08"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = "transparent"; }}>
                  <Plus size={24} color={t.textSec} />
                  <span style={{ color: t.textSec, fontSize: 12, marginTop: 8, fontWeight: 500 }}>Add Program</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Sparkles size={16} color={t.gold} />
              <h3 style={{ color: t.text, fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Optimization Recommendations</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
              {recommendations.slice(0, 4).map(rec => (
                <div key={rec.id} style={{ background: t.bgCard, border: `1px solid ${rec.bonused ? t.teal + "40" : t.border}`, borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>{rec.from.logo}</span>
                    <ArrowRight size={14} color={t.teal} />
                    <span style={{ fontSize: 18 }}>{rec.to.logo}</span>
                    {rec.bonused && <span style={{ background: t.teal + "20", color: t.teal, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>Bonus Active</span>}
                  </div>
                  <div style={{ color: t.text, fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>
                    Transfer {formatNum(rec.pointsIn)} {rec.from.name.split(" ")[0]} → {formatNum(rec.pointsOut)} {rec.to.name.split(" ")[0]}
                  </div>
                  {rec.bonusDetails && <div style={{ color: t.teal, fontSize: 11, marginTop: 4 }}>{rec.bonusDetails}</div>}
                  <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                    <div style={{ color: t.textSec, fontSize: 11 }}>From: {formatMoney(rec.valueIn)}</div>
                    <div style={{ color: t.textSec, fontSize: 11 }}>To: {formatMoney(rec.valueOut)}</div>
                    <div style={{ color: rec.gain > 0 ? t.teal : t.red, fontSize: 11, fontWeight: 600 }}>
                      {rec.gain > 0 ? <ArrowUpRight size={11} style={{ display: "inline" }} /> : <ArrowDownRight size={11} style={{ display: "inline" }} />}
                      {formatMoney(Math.abs(rec.gain))} {rec.gain > 0 ? "gain" : "loss"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Deals */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: t.text, fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Recent Deals & Alerts</h3>
            <button onClick={() => setActiveView("deals")} style={{ background: "transparent", border: "none", color: t.gold, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {deals.filter(d => !d.isRead).slice(0, 6).map(d => <DealCard key={d.id} deal={d} compact />)}
          </div>
        </div>
      </div>
    );
  };

  // ─── PROGRAMS VIEW ────────────────────────────────────────────
  const ProgramsView = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ color: t.text, fontSize: 22, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>My Programs</h2>
        <button onClick={() => setShowModal("add")}
          style={{ background: t.gold, border: "none", borderRadius: 10, padding: "10px 20px", color: "#0D0F14", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={15} /> Add Program
        </button>
      </div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {["all", ...Object.keys(PROGRAM_TYPES)].map(key => (
          <button key={key} onClick={() => setProgramFilter(key)}
            style={{
              background: programFilter === key ? t.gold + "20" : "transparent", border: `1px solid ${programFilter === key ? t.gold : t.border}`,
              borderRadius: 8, padding: "6px 14px", color: programFilter === key ? t.gold : t.textSec, fontSize: 12, cursor: "pointer", fontWeight: 500, transition: "all 0.15s",
            }}>
            {key === "all" ? "All" : PROGRAM_TYPES[key].icon + " " + PROGRAM_TYPES[key].label}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <select value={programSort} onChange={e => setProgramSort(e.target.value)}
            style={{ background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 12px", color: t.textSec, fontSize: 12, outline: "none", cursor: "pointer" }}>
            <option value="balance_desc">Balance ↓</option>
            <option value="balance_asc">Balance ↑</option>
            <option value="value_desc">Value ↓</option>
            <option value="name_asc">A → Z</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      </div>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <Search size={16} color={t.textSec} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search programs..."
          style={{ width: "100%", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px 10px 40px", color: t.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      </div>
      {/* Grid */}
      {filteredPrograms.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", color: t.textSec }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>No programs found</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your filters or add a new program</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
          {filteredPrograms.map(p => (
            <div key={p.id}>
              <ProgramCard prog={p} />
              {/* Transfer partners for this program */}
              {(() => {
                const partners = TRANSFER_PARTNERS.filter(tp => tp.from === p.name);
                if (partners.length === 0) return null;
                return (
                  <div style={{ padding: "8px 12px 12px 16px", marginTop: -4, background: t.bgCard + "80", borderRadius: "0 0 12px 12px", borderLeft: `3px solid ${p.color}30` }}>
                    <div style={{ color: t.textMuted, fontSize: 10, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Transfer Partners</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {partners.map((tp, i) => (
                        <span key={i} style={{
                          background: tp.bonused ? t.teal + "15" : t.bgCardHover, border: `1px solid ${tp.bonused ? t.teal + "30" : t.border}`,
                          borderRadius: 6, padding: "3px 8px", fontSize: 10, color: tp.bonused ? t.teal : t.textSec,
                          display: "inline-flex", alignItems: "center", gap: 4,
                        }}>
                          {tp.to.split(" ")[0]} <span style={{ opacity: 0.6 }}>{tp.ratio}</span>
                          {tp.bonused && <Zap size={8} />}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── TRANSFERS VIEW ───────────────────────────────────────────
  const TransfersView = () => {
    const creditCards = programs.filter(p => p.type === "credit_card");
    return (
      <div>
        <h2 style={{ color: t.text, fontSize: 22, fontWeight: 700, fontFamily: "'Outfit', sans-serif", marginBottom: 20 }}>Transfer Partners & Optimizer</h2>

        {/* Calculator */}
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 28, marginBottom: 24 }}>
          <h3 style={{ color: t.text, fontSize: 16, fontWeight: 600, fontFamily: "'Outfit', sans-serif", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart3 size={18} color={t.gold} /> Transfer Calculator
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "end", marginBottom: 20 }}>
            <div>
              <label style={{ color: t.textSec, fontSize: 11, fontWeight: 500, marginBottom: 6, display: "block" }}>From</label>
              <select value={transferFrom} onChange={e => { setTransferFrom(e.target.value); setTransferTo(""); }}
                style={{ width: "100%", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 12px", color: t.text, fontSize: 13, outline: "none", cursor: "pointer" }}>
                <option value="">Select program...</option>
                {REFERENCE_PROGRAMS.filter(r => TRANSFER_PARTNERS.some(tp => tp.from === r.name)).map(r => (
                  <option key={r.name} value={r.name}>{r.logo} {r.name}</option>
                ))}
              </select>
            </div>
            <div style={{ padding: "0 8px 10px", color: t.teal }}>
              <ArrowRight size={20} />
            </div>
            <div>
              <label style={{ color: t.textSec, fontSize: 11, fontWeight: 500, marginBottom: 6, display: "block" }}>To</label>
              <select value={transferTo} onChange={e => setTransferTo(e.target.value)}
                style={{ width: "100%", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 12px", color: t.text, fontSize: 13, outline: "none", cursor: "pointer" }}>
                <option value="">Select destination...</option>
                {transferDestinations.map(td => (
                  <option key={td.to} value={td.to}>{td.to} ({td.ratio}{td.bonused ? " ⚡ BONUS" : ""})</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: t.textSec, fontSize: 11, fontWeight: 500, marginBottom: 6, display: "block" }}>Points to Transfer</label>
            <input type="number" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="e.g. 50000"
              style={{ width: 240, background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 14px", color: t.gold, fontSize: 20, fontWeight: 700, outline: "none", fontFamily: "'Outfit', sans-serif", boxSizing: "border-box" }} />
          </div>
          {/* Result */}
          {transferResult && (
            <div style={{ background: t.bg, borderRadius: 12, padding: 20, border: `1px solid ${transferResult.gain >= 0 ? t.teal + "30" : t.red + "30"}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 20, alignItems: "center", marginBottom: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: t.textSec, fontSize: 11, marginBottom: 4 }}>You Send</div>
                  <div style={{ color: t.text, fontSize: 24, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{formatNum(parseInt(transferAmount))}</div>
                  <div style={{ color: t.textMuted, fontSize: 11 }}>{transferFrom.split(" ")[0]} pts</div>
                  <div style={{ color: t.textSec, fontSize: 12, marginTop: 4 }}>≈ {formatMoney(transferResult.fromValue)}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <ArrowRight size={24} color={t.teal} />
                  <div style={{ color: t.textMuted, fontSize: 10, marginTop: 2 }}>{transferResult.partner.ratio}</div>
                  <div style={{ color: t.textMuted, fontSize: 10 }}>{transferResult.partner.time}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: t.textSec, fontSize: 11, marginBottom: 4 }}>You Receive</div>
                  <div style={{ color: t.gold, fontSize: 24, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{formatNum(transferResult.total)}</div>
                  {transferResult.bonus > 0 && <div style={{ color: t.teal, fontSize: 11 }}>includes +{formatNum(transferResult.bonus)} bonus</div>}
                  <div style={{ color: t.textMuted, fontSize: 11 }}>{transferTo.split(" ")[0]} pts</div>
                  <div style={{ color: t.textSec, fontSize: 12, marginTop: 4 }}>≈ {formatMoney(transferResult.toValue)}</div>
                </div>
              </div>
              <div style={{
                textAlign: "center", padding: "10px 16px", borderRadius: 8,
                background: transferResult.gain >= 0 ? t.teal + "12" : t.red + "12",
                color: transferResult.gain >= 0 ? t.teal : t.red,
                fontSize: 13, fontWeight: 600,
              }}>
                {transferResult.gain >= 0 ? "✓" : "⚠"} {transferResult.gain >= 0 ? "Good Transfer" : "Poor Value"} — {transferResult.gain >= 0 ? "+" : ""}{formatMoney(transferResult.gain)} value {transferResult.gain >= 0 ? "gain" : "loss"}
              </div>
            </div>
          )}
        </div>

        {/* Transfer Map */}
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 28, marginBottom: 24 }}>
          <h3 style={{ color: t.text, fontSize: 16, fontWeight: 600, fontFamily: "'Outfit', sans-serif", marginBottom: 20 }}>Your Transfer Map</h3>
          {creditCards.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: t.textSec, fontSize: 13 }}>
              Add credit card programs to see your transfer partner network
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {creditCards.map(card => {
                const partners = TRANSFER_PARTNERS.filter(tp => tp.from === card.name);
                return (
                  <div key={card.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 22 }}>{card.logo}</span>
                      <div>
                        <div style={{ color: t.text, fontWeight: 600, fontSize: 14, fontFamily: "'Outfit', sans-serif" }}>{card.name}</div>
                        <div style={{ color: t.gold, fontSize: 12 }}>{formatNum(card.currentBalance)} pts</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginLeft: 32 }}>
                      {partners.map((tp, i) => {
                        const ref = REFERENCE_PROGRAMS.find(r => r.name === tp.to);
                        return (
                          <div key={i} style={{
                            background: tp.bonused ? t.teal + "08" : t.bg, border: `1px solid ${tp.bonused ? t.teal + "30" : t.border}`,
                            borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
                          }}>
                            <div style={{ width: 3, height: 28, borderRadius: 2, background: tp.bonused ? t.teal : (ref?.color || t.border) }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ color: t.text, fontSize: 12, fontWeight: 500 }}>{tp.to}</div>
                              <div style={{ color: t.textMuted, fontSize: 10, marginTop: 2 }}>
                                {tp.ratio} • {tp.time}
                                {tp.bonused && <span style={{ color: t.teal, marginLeft: 4 }}>⚡ {tp.bonusDetails}</span>}
                                {tp.bonusNote && <span style={{ color: t.textSec, marginLeft: 4 }}>{tp.bonusNote}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 28 }}>
            <h3 style={{ color: t.text, fontSize: 16, fontWeight: 600, fontFamily: "'Outfit', sans-serif", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={18} color={t.gold} /> Top Recommendations
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recommendations.map((rec, i) => (
                <div key={rec.id} style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "14px 18px",
                  background: t.bg, borderRadius: 10, border: `1px solid ${rec.bonused ? t.teal + "30" : t.border}`,
                }}>
                  <div style={{ color: t.textMuted, fontSize: 14, fontWeight: 700, fontFamily: "'Outfit', sans-serif", width: 20 }}>#{i + 1}</div>
                  <span style={{ fontSize: 20 }}>{rec.from.logo}</span>
                  <ArrowRight size={14} color={t.teal} />
                  <span style={{ fontSize: 20 }}>{rec.to.logo}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: t.text, fontSize: 13, fontWeight: 500 }}>
                      {formatNum(rec.pointsIn)} → {formatNum(rec.pointsOut)} {rec.to.name.split(" ")[0]}
                    </div>
                    {rec.bonusDetails && <div style={{ color: t.teal, fontSize: 10 }}>{rec.bonusDetails}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: rec.gain > 0 ? t.teal : t.red, fontSize: 13, fontWeight: 600 }}>
                      {rec.gain > 0 ? "+" : ""}{formatMoney(rec.gain)}
                    </div>
                    <div style={{ color: t.textMuted, fontSize: 10 }}>value {rec.gain > 0 ? "gain" : "loss"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── DEALS VIEW ───────────────────────────────────────────────
  const DealsView = () => (
    <div>
      <h2 style={{ color: t.text, fontSize: 22, fontWeight: 700, fontFamily: "'Outfit', sans-serif", marginBottom: 20 }}>Deals & Alerts</h2>
      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setDealFilter("all")}
          style={{
            background: dealFilter === "all" ? t.gold + "20" : "transparent", border: `1px solid ${dealFilter === "all" ? t.gold : t.border}`,
            borderRadius: 8, padding: "6px 14px", color: dealFilter === "all" ? t.gold : t.textSec, fontSize: 12, cursor: "pointer", fontWeight: 500,
          }}>
          🔥 All
        </button>
        {Object.entries(DEAL_CATEGORIES).map(([key, val]) => (
          <button key={key} onClick={() => setDealFilter(key)}
            style={{
              background: dealFilter === key ? val.color + "20" : "transparent", border: `1px solid ${dealFilter === key ? val.color : t.border}`,
              borderRadius: 8, padding: "6px 14px", color: dealFilter === key ? val.color : t.textSec, fontSize: 12, cursor: "pointer", fontWeight: 500,
            }}>
            {val.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setDealRelevantOnly(!dealRelevantOnly)}
            style={{
              background: dealRelevantOnly ? t.gold + "15" : "transparent", border: `1px solid ${dealRelevantOnly ? t.gold : t.border}`,
              borderRadius: 8, padding: "6px 14px", color: dealRelevantOnly ? t.gold : t.textSec, fontSize: 12, cursor: "pointer", fontWeight: 500,
              display: "flex", alignItems: "center", gap: 4,
            }}>
            <Filter size={12} /> My Programs Only
          </button>
        </div>
      </div>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <Search size={16} color={t.textSec} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input value={activeView === "deals" ? searchQuery : ""} onChange={e => setSearchQuery(e.target.value)} placeholder="Search deals..."
          style={{ width: "100%", background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 10, padding: "10px 14px 10px 40px", color: t.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      </div>
      {/* Deals List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredDeals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: t.textSec }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📰</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>No deals match your filters</div>
          </div>
        ) : (
          filteredDeals.map(d => <DealCard key={d.id} deal={d} />)
        )}
      </div>
    </div>
  );

  // ─── SETTINGS VIEW ────────────────────────────────────────────
  const SettingsView = () => (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ color: t.text, fontSize: 22, fontWeight: 700, fontFamily: "'Outfit', sans-serif", marginBottom: 24 }}>Settings</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Theme */}
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: t.text, fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Theme</div>
            <div style={{ color: t.textSec, fontSize: 12, marginTop: 2 }}>{darkMode ? "Dark mode" : "Light mode"}</div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)}
            style={{
              background: darkMode ? t.gold + "20" : t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8,
              padding: "8px 16px", color: t.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12,
            }}>
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>
        {/* Export */}
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: t.text, fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Export Data</div>
            <div style={{ color: t.textSec, fontSize: 12, marginTop: 2 }}>Download all programs and settings as JSON</div>
          </div>
          <button onClick={exportData}
            style={{ background: t.gold + "20", border: `1px solid ${t.gold}40`, borderRadius: 8, padding: "8px 16px", color: t.gold, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500 }}>
            <Download size={14} /> Export
          </button>
        </div>
        {/* Import */}
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: t.text, fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Import Data</div>
            <div style={{ color: t.textSec, fontSize: 12, marginTop: 2 }}>Load from a previously exported JSON file</div>
          </div>
          <label style={{ background: t.blue + "20", border: `1px solid ${t.blue}40`, borderRadius: 8, padding: "8px 16px", color: t.blue, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500 }}>
            <Upload size={14} /> Import
            <input type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
          </label>
        </div>
        {/* Reset */}
        <div style={{ background: t.bgCard, border: `1px solid ${t.red}30`, borderRadius: 12, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: t.text, fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Reset All Data</div>
            <div style={{ color: t.textSec, fontSize: 12, marginTop: 2 }}>Clear all programs, deals, and preferences</div>
          </div>
          <button onClick={() => { if (confirm("Are you sure? This cannot be undone.")) { setPrograms([]); setDeals(SAMPLE_DEALS); } }}
            style={{ background: t.red + "20", border: `1px solid ${t.red}40`, borderRadius: 8, padding: "8px 16px", color: t.red, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500 }}>
            <Trash2 size={14} /> Reset
          </button>
        </div>
        {/* Program count */}
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: "18px 22px" }}>
          <div style={{ color: t.text, fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif", marginBottom: 12 }}>Program Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Object.entries(PROGRAM_TYPES).map(([key, val]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", color: t.textSec, fontSize: 12, padding: "4px 0" }}>
                <span>{val.icon} {val.label}</span>
                <span style={{ color: t.text, fontWeight: 500 }}>{programs.filter(p => p.type === key).length}</span>
              </div>
            ))}
          </div>
        </div>
        {/* About */}
        <div style={{ color: t.textMuted, fontSize: 11, textAlign: "center", padding: "16px 0" }}>
          Rewards Tracker v1.0 — Your personal points command center
        </div>
      </div>
    </div>
  );

  // ─── MAIN LAYOUT ──────────────────────────────────────────────
  const views = { dashboard: DashboardView, programs: ProgramsView, transfers: TransfersView, deals: DealsView, settings: SettingsView };
  const ActiveViewComponent = views[activeView];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${t.textMuted}; }
        ::selection { background: ${t.gold}40; color: ${t.text}; }
        input::placeholder, textarea::placeholder { color: ${t.textMuted}; }
        select { appearance: auto; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'DM Sans', sans-serif" }}>
        {/* Sidebar */}
        <div style={{
          width: sidebarCollapsed ? 64 : 220, background: t.bgSidebar, borderRight: `1px solid ${t.border}`,
          display: "flex", flexDirection: "column", transition: "width 0.2s ease", flexShrink: 0,
          position: "sticky", top: 0, height: "100vh", overflow: "hidden",
        }}>
          {/* Logo */}
          <div style={{ padding: sidebarCollapsed ? "20px 12px" : "20px 22px", borderBottom: `1px solid ${t.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${t.gold}, ${t.gold}88)`,
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#0D0F14",
                fontFamily: "'Outfit', sans-serif", flexShrink: 0,
              }}>R</div>
              {!sidebarCollapsed && (
                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, color: t.text, lineHeight: 1.1 }}>Rewards</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 10, color: t.textMuted, letterSpacing: "0.5px" }}>COMMAND CENTER</div>
                </div>
              )}
            </div>
          </div>

          {/* Nav */}
          <div style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button key={item.id} onClick={() => { setActiveView(item.id); setSearchQuery(""); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: sidebarCollapsed ? "10px 14px" : "10px 14px",
                    borderRadius: 10, border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                    background: isActive ? t.gold + "15" : "transparent",
                    color: isActive ? t.gold : t.textSec,
                    transition: "all 0.15s", fontSize: 13, fontWeight: isActive ? 600 : 400,
                    justifyContent: sidebarCollapsed ? "center" : "flex-start", position: "relative",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = t.bgCardHover; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                  <Icon size={18} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {item.id === "deals" && unreadDeals > 0 && (
                    <span style={{
                      background: t.red, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 10,
                      padding: "1px 5px", position: sidebarCollapsed ? "absolute" : "static",
                      top: sidebarCollapsed ? 4 : undefined, right: sidebarCollapsed ? 4 : undefined,
                      marginLeft: sidebarCollapsed ? 0 : "auto",
                    }}>{unreadDeals}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search hint */}
          {!sidebarCollapsed && (
            <div style={{ padding: "12px 14px", borderTop: `1px solid ${t.border}` }}>
              <button onClick={() => setSearchOpen(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px",
                  background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: 8,
                  color: t.textMuted, fontSize: 12, cursor: "pointer", justifyContent: "space-between",
                }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Search size={13} /> Search...
                </span>
                <kbd style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 3, padding: "1px 4px", fontSize: 9 }}>⌘K</kbd>
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {/* Header */}
          <div style={{
            padding: "16px 32px", borderBottom: `1px solid ${t.border}`, display: "flex",
            justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0,
            background: t.bg + "ee", backdropFilter: "blur(12px)", zIndex: 100,
          }}>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: t.text }}>
              {NAV_ITEMS.find(n => n.id === activeView)?.label}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setSearchOpen(true)}
                style={{ background: "transparent", border: `1px solid ${t.border}`, borderRadius: 8, padding: "6px 8px", color: t.textSec, cursor: "pointer", display: "flex" }}>
                <Search size={16} />
              </button>
              <button onClick={() => setShowModal("add")}
                style={{
                  background: t.gold, border: "none", borderRadius: 8, padding: "6px 14px",
                  color: "#0D0F14", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                  fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
                }}>
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* View Content */}
          <div className="fade-in" key={activeView} style={{ padding: "24px 32px", maxWidth: 1200 }}>
            <ActiveViewComponent />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal === "add" && <AddProgramModal />}
      {searchOpen && <SearchOverlay />}
    </>
  );
}