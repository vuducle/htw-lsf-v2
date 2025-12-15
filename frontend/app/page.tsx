import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, BookOpen, Zap, Users, Code } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary" />
            <span className="font-bold text-lg">Dzemals</span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <a
              href="#features"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Docs
            </a>
            <a
              href="#"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center gap-4 py-20 md:py-28 lg:py-40">
        <Badge variant="outline" className="mb-4">
          <Zap className="w-3 h-3 mr-1" />
          Jetzt live
        </Badge>

        <h1 className="max-w-3xl text-center text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
          Deine moderne Lernplattform
        </h1>

        <p className="max-w-2xl text-center text-lg text-muted-foreground md:text-xl">
          Eine umfassende Plattform für Schüler und Lehrer. Verwalte Kurse,
          verfolge Fortschritte und verbessere das Lernen mit modernen Tools.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row pt-4">
          <Button size="lg" className="gap-2">
            Jetzt starten
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            Dokumentation
            <BookOpen className="w-4 h-4" />
          </Button>
        </div>
      </section>

      <Separator className="my-12" />

      {/* Features Section */}
      <section
        id="features"
        className="container mx-auto py-12 md:py-24 lg:py-32"
      >
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="secondary">Features</Badge>
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl">
            Alles, was du brauchst
          </h2>
          <p className="text-lg text-muted-foreground">
            Moderne Features für deine Lernplattform
          </p>
        </div>

        <div className="mx-auto grid gap-6 md:gap-12 py-12 md:max-w-4xl md:grid-cols-2 lg:grid-cols-3">
          {/* Feature Cards */}
          {features.map((feature, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg border border-border/50 bg-background p-6 hover:border-border transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      {/* CTA Section */}
      <section className="container mx-auto flex flex-col items-center justify-center gap-4 py-20 md:py-28 text-center">
        <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl max-w-2xl">
          Bereit, dein Lernen zu transformieren?
        </h2>
        <p className="max-w-xl text-lg text-muted-foreground">
          Schließ dich tausenden von Schülern und Lehrern an, die bereits ihre
          Lernziele mit Dzemals erreichen.
        </p>
        <Button size="lg" className="mt-4 gap-2">
          Kostenlos anfangen
          <ArrowRight className="w-4 h-4" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t mx-auto border-border/40 bg-muted/50 py-12">
        <div className="container mx-auto flex flex-col gap-8 md:gap-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-primary" />
                <span className="font-bold">Dzemals</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Moderne Lernplattform für die Zukunft
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              © 2025 Dzemals. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Kursverwaltung",
    description: "Erstelle und verwalte Kurse einfach",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    title: "Schüler Tracking",
    description: "Verfolge den Fortschritt deiner Schüler",
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: "Echtzeit Updates",
    description: "Live Updates für alle Teilnehmer",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    title: "Modern API",
    description: "RESTful API für Integrationen",
    icon: <Code className="w-5 h-5" />,
  },
  {
    title: "Responsive Design",
    description: "Funktioniert auf allen Geräten",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    title: "Sicher & Schnell",
    description: "Enterprise-Grade Sicherheit",
    icon: <Zap className="w-5 h-5" />,
  },
];
