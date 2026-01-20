import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, Mail, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, type LoginInput } from "@shared/schema";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginInput) {
    setIsLoggingIn(true);
    try {
      await login(data.email, data.password);
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to dashboard...",
      });
      setTimeout(() => {
        setLocation("/admin/dashboard");
      }, 1000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
      setIsLoggingIn(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="absolute inset-0 bg-grid-pattern animate-grid-slow opacity-20" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-cyber mb-6 shadow-2xl shadow-primary/20 animate-float">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3" data-testid="text-login-title">
            Welcome to <span className="text-gradient">Arica Toucan</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Login to start your ISO compliance journey
          </p>
        </div>

        <Card className="border-gradient shadow-2xl shadow-primary/10 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:delay-200">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription className="text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="you@company.com"
                            type="email"
                            className="pl-10 h-11 border-2 focus:border-primary/50 transition-all duration-200"
                            data-testid="input-email"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter your password"
                            type="password"
                            className="pl-10 h-11 border-2 focus:border-primary/50 transition-all duration-200"
                            data-testid="input-password"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full gap-3"
                  disabled={isLoggingIn}
                  data-testid="button-login"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Sign In
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <a href="#" className="text-gradient hover:underline font-semibold transition-all duration-200">
                  Contact us for a demo
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 font-medium">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
