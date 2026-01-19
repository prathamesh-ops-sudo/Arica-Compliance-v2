import { Link } from "wouter";
import { Shield, CheckCircle2, BarChart3, FileCheck, Users, ArrowRight, ClipboardList, Zap, Download, Quote } from "lucide-react";
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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-32">
        <div className="absolute inset-0 bg-grid-pattern animate-grid-slow opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 shadow-md shadow-primary/10">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight" data-testid="text-hero-title">
              Achieve ISO 27001/27002 Compliance with Confidence
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Arica Toucan simplifies your compliance journey with intelligent assessments,
              comprehensive reports, and expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/questionnaire/user">
                <Button size="lg" className="gap-2" data-testid="button-get-started">
                  Start Assessment
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/dashboard">
                <Button size="lg" variant="outline" data-testid="button-view-dashboard">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-600">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Arica Toucan?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides everything you need to assess, track, and improve
              your organization&apos;s security compliance.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="hover-elevate border-border/50 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-500"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-card border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8 md:grid-cols-3 text-center motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-600">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Organizations Assessed</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <p className="text-muted-foreground">Compliance Improvement</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Expert Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trusted by security professionals and compliance teams worldwide.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-border/50 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <p className="text-muted-foreground mb-6 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Start Your Compliance Journey?
            </h2>
            <p className="text-muted-foreground mb-8">
              Take the first step towards ISO 27001/27002 compliance with our comprehensive assessment tool.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="gap-2" data-testid="button-cta-login">
                  Login to Get Started
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
