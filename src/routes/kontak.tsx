import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  MessageCircle,
  PenLine,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/page-hero";
import { CartoonButton, CartoonLink, Eyebrow } from "@/components/cartoon-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AgentKey = "customer-service" | "booking" | "civil";
type ChatMessage = { role: "user" | "agent"; text: string };

const agents = [
  {
    key: "customer-service",
    name: "Bibi Customer Service",
    role: "Balas chat pelanggan 24/7",
    icon: Bot,
    tone: "mint",
    greeting:
      "Halo Kak! Aku Bibi Customer Service. Coba tanya soal produk, komplain, refund, atau follow-up pelanggan.",
    prompts: [
      "Pelanggan tanya stok dan minta rekomendasi produk",
      "Pelanggan komplain barang belum sampai",
      "Buat balasan ramah untuk pelanggan yang minta refund",
    ],
  },
  {
    key: "booking",
    name: "Bibi Booking Agent",
    role: "Cek jadwal dan bantu reservasi",
    icon: MessageCircle,
    tone: "sun",
    greeting:
      "Siap bantu simulasi booking. Coba tanya ketersediaan kamar, jadwal layanan, atau format reservasi.",
    prompts: [
      "Ada kamar untuk 2 orang tanggal 12-14 Agustus?",
      "Tamu ingin check-in malam, buatkan balasan",
      "Buat alur booking dari WhatsApp sampai pembayaran DP",
    ],
  },
  {
    key: "civil",
    name: "Baboo Civil CAD Agent",
    role: "Bantu gambar teknik dan konsep CAD",
    icon: Building2,
    tone: "coral",
    greeting:
      "Saya Baboo Civil. Coba minta denah, detail pondasi, pembesian, atau konsep gambar kerja. Untuk output AutoLISP/DXF asli, masuk ke CAD Agent.",
    prompts: [
      "Gambar denah kamar 3x4 meter dengan pintu 80cm",
      "Buat detail pondasi batu kali tinggi 70cm",
      "Buat konsep gambar kerja rumah sederhana 6x9 meter",
    ],
  },
] as const;

const valueProps = [
  "User bisa memilih jenis agent",
  "Bisa mengetik skenario sendiri",
  "Ada contoh prompt siap klik",
  "CTA lanjut ke agent asli / dashboard",
];

const agentReplies: Record<AgentKey, (message: string) => string> = {
  "customer-service": (message) => {
    if (/komplain|refund|belum sampai|telat/i.test(message)) {
      return "Baik Kak, saya bantu dengan nada ramah: 'Mohon maaf atas kendalanya ya Kak. Saya cek dulu status pesanan Kakak, lalu saya bantu pilih solusi tercepat: pengiriman ulang, refund, atau eskalasi ke tim terkait.'";
    }
    if (/stok|produk|rekomendasi/i.test(message)) {
      return "Siap. Agent akan cek kebutuhan pelanggan dulu, lalu memberi rekomendasi singkat: produk paling cocok, alasan, harga/paket, dan tombol lanjut order. Jadi bukan cuma jawab, tapi bantu closing juga. Tipis-tipis jadi sales, tapi tetap sopan 😄";
    }
    return "Saya akan membalas dengan struktur: sapaan → pahami kebutuhan → jawab singkat → tawarkan langkah berikutnya. Contoh: 'Siap Kak, boleh saya bantu cek dulu detail kebutuhannya?'";
  },
  booking: (message) => {
    if (/kamar|tanggal|check|reservasi|booking/i.test(message)) {
      return "Untuk mode live, Booking Agent akan cek database ketersediaan, hitung malam menginap, lalu membuat ringkasan booking. Di demo ini alurnya: tanggal → jumlah tamu → tipe kamar → data tamu → konfirmasi DP.";
    }
    if (/dp|bayar|pembayaran/i.test(message)) {
      return "Agent akan mengirim instruksi pembayaran, nomor rekening, batas waktu DP, lalu menandai booking sebagai pending sampai bukti transfer diverifikasi.";
    }
    return "Booking Agent cocok untuk alur yang berulang: tanya jadwal, cek slot, kumpulkan data, lalu kirim konfirmasi. Admin tinggal pantau, bukan jadi satpam chat 24 jam.";
  },
  civil: (message) => {
    if (/denah|gambar|cad|autolisp|dxf|pondasi|struktur|pembesian/i.test(message)) {
      return "Baboo Civil akan mengubah instruksi menjadi langkah gambar teknik: satuan mm, layer CAD, garis objek, ukuran, notasi, lalu output AutoLISP/DXF pada mode agent asli. Untuk hasil yang bisa dijalankan di AutoCAD, lanjut buka CAD Agent.";
    }
    return "Untuk pekerjaan sipil, tulis kebutuhan seperti ukuran ruang, posisi pintu/jendela, jenis detail, dan standar gambar. Makin lengkap datanya, makin sedikit drama revisi. AutoCAD juga suka kejelasan, sama seperti manusia 😄";
  },
};

const toneClass: Record<(typeof agents)[number]["tone"], string> = {
  mint: "bg-mint text-navy-deep",
  sun: "bg-sun text-navy-deep",
  coral: "bg-coral text-navy-deep",
};

export const Route = createFileRoute("/kontak")({
  head: () => ({
    meta: [
      { title: "Coba Gratis Agent Baboo — Playground AI Agent | Baboo.id" },
      {
        name: "description",
        content:
          "Coba simulasi AI Agent Baboo secara gratis. Pilih agent, ketik skenario, dan lihat bagaimana Baboo membantu customer service, booking, dan pekerjaan CAD.",
      },
      { property: "og:title", content: "Coba Gratis Agent Baboo" },
      {
        property: "og:description",
        content: "Halaman playground untuk mencoba simulasi agent Baboo sebelum masuk ke dashboard.",
      },
    ],
  }),
  component: TryAgentPage,
});

function TryAgentPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentKey>("customer-service");
  const [input, setInput] = useState("");
  const [leadName, setLeadName] = useState("");
  const [leadBusiness, setLeadBusiness] = useState("");

  const activeAgent = useMemo(
    () => agents.find((agent) => agent.key === selectedAgent) ?? agents[0],
    [selectedAgent],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "agent", text: agents[0].greeting },
  ]);

  function changeAgent(agentKey: AgentKey) {
    const nextAgent = agents.find((agent) => agent.key === agentKey) ?? agents[0];
    setSelectedAgent(agentKey);
    setMessages([{ role: "agent", text: nextAgent.greeting }]);
    setInput("");
  }

  function sendMessage(message?: string) {
    const text = (message ?? input).trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "agent", text: agentReplies[selectedAgent](text) },
    ]);
    setInput("");
  }

  const ActiveIcon = activeAgent.icon;

  return (
    <SiteShell>
      <PageHero
        eyebrow="Coba Gratis"
        title={
          <>
            Coba agent Baboo <span className="text-mint-deep">langsung dari halaman ini</span>
          </>
        }
        desc="User bisa memilih agent, mengetik kebutuhan, dan melihat cara Baboo merespons sebelum masuk ke dashboard agent asli. Ini bukan lagi form kontak biasa — ini arena latihan kecil. Agent-nya pemanasan dulu, bukan angkat besi."
      />

      <section className="mx-auto grid max-w-[1180px] gap-8 px-7 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-5">
          <div className="card-pop p-6">
            <Eyebrow tone="sun">Pilih agent</Eyebrow>
            <h2 className="mt-3 font-display text-2xl font-extrabold text-navy">
              Mau coba Baboo yang mana?
            </h2>
            <p className="mt-2 text-sm opacity-75">
              Pilih satu agent, lalu gunakan contoh prompt atau tulis kebutuhan sendiri.
            </p>

            <div className="mt-5 space-y-3">
              {agents.map((agent) => {
                const Icon = agent.icon;
                const isActive = selectedAgent === agent.key;
                return (
                  <button
                    key={agent.key}
                    type="button"
                    onClick={() => changeAgent(agent.key)}
                    className={`w-full rounded-2xl border-[2.5px] p-4 text-left transition ${
                      isActive
                        ? "border-navy bg-cream shadow-[0_5px_0_rgba(11,27,46,0.18)]"
                        : "border-navy/15 bg-white hover:border-navy/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                          toneClass[agent.tone]
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-display text-base font-extrabold text-navy">
                          {agent.name}
                        </span>
                        <span className="mt-1 block text-sm opacity-70">{agent.role}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card-pop bg-cream-deep p-6">
            <h3 className="font-display text-lg font-extrabold text-navy">Yang user dapat</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {valueProps.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-deep" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="card-pop overflow-hidden">
          <header className="border-b-[2.5px] border-navy bg-navy px-5 py-4 text-cream">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${toneClass[activeAgent.tone]}`}>
                  <ActiveIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-extrabold">{activeAgent.name}</h2>
                  <p className="text-xs text-cream/70">Mode demo interaktif</p>
                </div>
              </div>
              <span className="rounded-full border border-cream/25 px-3 py-1 font-mono text-[11px] font-bold text-mint">
                ONLINE
              </span>
            </div>
          </header>

          <div className="grid gap-0 lg:grid-cols-[1fr_300px]">
            <section className="flex min-h-[560px] flex-col bg-white">
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {messages.map((message, index) => {
                  const isUser = message.role === "user";
                  return (
                    <div key={`${message.role}-${index}`} className={isUser ? "flex justify-end" : "flex justify-start"}>
                      <div
                        className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          isUser
                            ? "rounded-br-sm bg-sun text-navy-deep"
                            : "rounded-bl-sm border-2 border-navy/10 bg-cream text-navy"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t-2 border-navy/10 p-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  {activeAgent.prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="rounded-full border-2 border-navy/15 bg-cream-deep px-3 py-1.5 text-left text-xs font-semibold transition hover:border-mint-deep"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="flex items-end gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    rows={2}
                    placeholder="Tulis skenario yang ingin dicoba user..."
                    className="resize-none rounded-xl border-2 border-navy/15 bg-cream focus:border-mint-deep"
                  />
                  <CartoonButton type="button" onClick={() => sendMessage()}>
                    <Send className="h-4 w-4" />
                    Kirim
                  </CartoonButton>
                </div>
              </div>
            </section>

            <aside className="border-t-[2.5px] border-navy bg-cream-deep p-5 lg:border-l-[2.5px] lg:border-t-0">
              <div className="rounded-2xl border-2 border-dashed border-navy/35 bg-white p-4">
                <div className="flex items-center gap-2 font-display text-base font-extrabold text-navy">
                  <Sparkles className="h-4 w-4 text-mint-deep" />
                  Mode demo
                </div>
                <p className="mt-2 text-sm opacity-75">
                  Halaman ini untuk user mencoba rasa percakapan agent. Untuk menjalankan agent asli
                  dengan tools, knowledge, dan output CAD, user masuk ke dashboard.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <Label htmlFor="lead-name">Nama user</Label>
                  <Input
                    id="lead-name"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Contoh: Andi"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="lead-business">Bidang / kebutuhan</Label>
                  <Input
                    id="lead-business"
                    value={leadBusiness}
                    onChange={(e) => setLeadBusiness(e.target.value)}
                    placeholder="Guesthouse, toko, kontraktor..."
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="mt-5 rounded-2xl border-2 border-navy bg-navy p-4 text-cream">
                <div className="flex items-center gap-2 font-display text-base font-extrabold">
                  <PenLine className="h-4 w-4 text-mint" />
                  Ringkasan trial
                </div>
                <p className="mt-2 text-sm text-cream/75">
                  {leadName || "User"} mencoba {activeAgent.name}
                  {leadBusiness ? ` untuk kebutuhan ${leadBusiness}` : ""}. Data ini bisa dipakai
                  nanti untuk lead capture atau dikirim ke CRM.
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                <Link
                  to="/cad-agent"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-navy bg-sun px-5 py-3 font-display font-bold text-navy-deep shadow-[0_6px_0_rgba(11,27,46,0.25)] transition hover:-translate-y-0.5"
                >
                  Buka CAD Agent asli <ArrowRight className="h-4 w-4" />
                </Link>
                <CartoonLink to="/daftar-baboo" variant="ghost">
                  Lihat semua Baboo
                </CartoonLink>
              </div>
            </aside>
          </div>
        </main>
      </section>

      <section className="bg-navy py-18 text-cream">
        <div className="mx-auto grid max-w-[1180px] items-center gap-6 px-7 py-14 md:grid-cols-[1fr_auto]">
          <div>
            <Eyebrow tone="cream">Langkah berikutnya</Eyebrow>
            <h2 className="mt-3 font-display text-[clamp(26px,3vw,36px)] font-extrabold">
              Dari demo ke agent sungguhan tinggal satu klik.
            </h2>
            <p className="mt-2 max-w-2xl text-cream/70">
              Setelah user tertarik, arahkan ke dashboard untuk memakai tools, knowledge base, SOP,
              dan agent yang benar-benar terhubung ke workflow Baboo.
            </p>
          </div>
          <CartoonLink to="/masuk">Masuk dashboard →</CartoonLink>
        </div>
      </section>
    </SiteShell>
  );
}
