import { Link } from "wouter";
import { Shield, CheckCircle2, BarChart3, FileCheck, Users, ArrowRight, ClipboardList, Zap, Download, Quote, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: ClipboardList,
    title: "Comprehensive Questionnaires",
    description: "Structured assessments aligned with ISO 27001/27002 controls to evaluate your security posture.",
  },
  {
    icon: BarChart3,
    title: "Detailed Compliance Reports",
    description: "Visual reports showing compliance scores, gaps, and actionable remediation steps.",
  },
  {
    icon: FileCheck,
    title: "AI-Powered Analysis",
    description: "Intelligent gap analysis and recommendations based on industry best practices.",
  },
  {
    icon: Users,
    title: "Multi-Organization Support",
    description: "Manage compliance across multiple organizations from a single dashboard.",
  },
  {
    icon: Zap,
    title: "Step-by-Step Plans",
    description: "Get actionable implementation plans with timelines to achieve compliance faster.",
  },
  {
    icon: Download,
    title: "PDF Export",
    description: "Download professional compliance reports to share with auditors and stakeholders.",
  },
];

const testimonials = [
  {
    quote: "Arica Toucan helped us achieve ISO 27001 certification in half the time we expected. The AI analysis identified gaps we would have missed.",
    author: "Sarah Chen",
    role: "CISO",
    company: "TechStart Inc.",
  },
  {
    quote: "The step-by-step remediation plans made it easy for our team to prioritize and address compliance gaps systematically.",
    author: "Michael Rodriguez",
    role: "IT Director",
    company: "FinanceFlow Ltd.",
  },
  {
    quote: "Finally, a compliance tool that doesn't require a PhD to use. Our team was up and running in minutes.",
    author: "Emily Watson",
    role: "Security Manager",
    company: "CloudSecure Systems",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-pattern animate-grid-slow opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-gradient" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-cyber mb-8 shadow-2xl shadow-primary/20 animate-float">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight" data-testid="text-hero-title">
              <span className="text-gradient">Achieve ISO 27001/27002</span>
              <br />
              <span className="text-foreground">Compliance with Confidence</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
              Arica Toucan simplifies your compliance journey with intelligent assessments,
              comprehensive reports, and expert guidance powered by AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <Link href="/questionnaire/user">
                <Button size="xl" variant="gradient" className="gap-3 min-w-[200px]" data-testid="button-get-started">
                  <Sparkles className="h-5 w-5" />
                  Start Assessment
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button size="xl" variant="outline" className="min-w-[200px]" data-testid="button-view-dashboard">
                  View Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Free Assessment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-600">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose <span className="text-gradient">Arica Toucan</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our platform provides everything you need to assess, track, and improve
              your organization's security compliance with cutting-edge technology.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-gradient hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-cyber flex items-center justify-center mb-6 group-hover:animate-pulse-glow transition-all duration-300">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-gradient-subtle border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-12 md:grid-cols-3 text-center motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-600">
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold text-gradient mb-4 group-hover:scale-110 transition-transform duration-300">500+</div>
                <p className="text-lg text-muted-foreground font-medium">Organizations Assessed</p>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold text-gradient mb-4 group-hover:scale-110 transition-transform duration-300">95%</div>
                <p className="text-lg text-muted-foreground font-medium">Compliance Improvement</p>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-bold text-gradient mb-4 group-hover:scale-110 transition-transform duration-300">24/7</div>
                <p className="text-lg text-muted-foreground font-medium">Expert Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              What Our <span className="text-gradient">Customers Say</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Trusted by security professionals and compliance teams worldwide.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-gradient hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-500"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="pt-8">
                  <Quote className="h-10 w-10 text-primary/30 mb-6" />
                  <p className="text-muted-foreground mb-8 italic text-lg leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="border-t pt-6">
                    <p className="font-bold text-foreground text-lg">{testimonial.author}</p>
                    <p className="text-muted-foreground font-medium">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Start Your <span className="text-gradient">Compliance Journey</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Take the first step towards ISO 27001/27002 compliance with our comprehensive assessment tool.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/login">
                <Button size="xl" variant="gradient" className="gap-3 min-w-[220px]" data-testid="button-cta-login">
                  <CheckCircle2 className="h-5 w-5" />
                  Login to Get Started
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="xl" variant="outline" className="min-w-[220px]">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
