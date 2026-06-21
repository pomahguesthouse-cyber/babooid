import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, Instagram, Linkedin, MessageCircle, Send } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/kontak")({
  head: () => ({
    meta: [
      { title: "Kontak — Baboo.id" },
      {
        name: "description",
        content: "Hubungi tim Baboo.id untuk konsultasi gratis seputar AI Agent untuk bisnis Anda.",
      },
      { property: "og:title", content: "Kontak — Baboo.id" },
      { property: "og:description", content: "Hubungi tim Baboo.id untuk konsultasi gratis." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Terima kasih! Tim kami akan menghubungi Anda dalam 1x24 jam.");
    }, 800);
  };

  return (
    <SiteShell>
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Hubungi kami</h1>
          <p className="mt-4 text-lg text-white/70">
            Ceritakan kebutuhan bisnis Anda — kami siap bantu memetakan solusi AI yang tepat.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-2xl border border-border bg-card p-8 shadow-soft"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama lengkap</Label>
                  <Input id="name" required placeholder="Contoh: Andi Saputra" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Nama perusahaan</Label>
                  <Input id="company" placeholder="Contoh: Toko Aksara" />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required placeholder="nama@perusahaan.id" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">No. WhatsApp</Label>
                  <Input id="phone" required placeholder="+62 812 ..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Ceritakan kebutuhan Anda</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Misal: ingin otomatisasi balas chat WhatsApp untuk toko fashion."
                />
              </div>
              <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
                <Send className="mr-2 h-4 w-4" />
                {submitting ? "Mengirim..." : "Kirim pesan"}
              </Button>
            </form>
          </div>

          <aside className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold">Kontak langsung</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 h-4 w-4 text-teal" />
                  <a href="https://wa.me/6281200000000" className="hover:text-teal">
                    WhatsApp: +62 812 0000 0000
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-teal" />
                  <a href="mailto:halo@baboo.id" className="hover:text-teal">
                    halo@baboo.id
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-teal" />
                  <span>+62 21 0000 0000</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-teal" />
                  <span>Jakarta, Indonesia</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold">Ikuti kami</h3>
              <div className="mt-4 flex gap-3">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="grid h-10 w-10 place-items-center rounded-lg bg-muted hover:bg-navy hover:text-teal"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="grid h-10 w-10 place-items-center rounded-lg bg-muted hover:bg-navy hover:text-teal"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
