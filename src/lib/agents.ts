import { HardHat, Ruler, Building2, Bot, type LucideIcon } from "lucide-react";

export type AgentKey = "mandor" | "civil" | "cad" | "architect";

export type AgentInfo = {
  key: AgentKey;
  name: string;
  role: string;
  desc: string;
  icon: LucideIcon;
  /** Tailwind classes untuk badge/aksen. */
  accent: string;
};

export const AGENTS: Record<AgentKey, AgentInfo> = {
  mandor: {
    key: "mandor",
    name: "Baboo Mandor",
    role: "Orchestrator",
    desc: "Mengoordinasi seluruh sub-agent dan menerima instruksi proyek dari Anda.",
    icon: Bot,
    accent: "bg-navy text-cream",
  },
  civil: {
    key: "civil",
    name: "Baboo Civil",
    role: "Insinyur Sipil",
    desc: "Struktur, pondasi, beban, material, dan analisis teknis konstruksi.",
    icon: HardHat,
    accent: "bg-sun text-navy-deep",
  },
  cad: {
    key: "cad",
    name: "Baboo CAD",
    role: "Drafter Teknik",
    desc: "Gambar kerja, denah, potongan, detail, dan konvensi penggambaran.",
    icon: Ruler,
    accent: "bg-mint text-navy-deep",
  },
  architect: {
    key: "architect",
    name: "Baboo Architect",
    role: "Arsitek",
    desc: "Konsep desain, tata ruang, fasad, sirkulasi, dan regulasi bangunan.",
    icon: Building2,
    accent: "bg-coral text-navy-deep",
  },
};

export const SUB_AGENTS: AgentInfo[] = [AGENTS.civil, AGENTS.cad, AGENTS.architect];

export function getAgent(key: string): AgentInfo {
  return AGENTS[(key as AgentKey) in AGENTS ? (key as AgentKey) : "mandor"];
}
