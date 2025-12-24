"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { setAuthToken } from "@/lib/auth-client";
import Image from "next/image";
import { AppLogo, AppName } from "@/components/ui/appLogo";

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters")
      .max(150, "Company name is too long"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
        "Password must contain upper, lower case letters and a number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const router = useRouter();

  const handleSignUp = async (values: SignUpFormValues) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: values.fullName,
          companyName: values.companyName,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      // Store token in localStorage (cookie is already set by API)
      if (data.token) {
        setAuthToken(data.token);
      }

      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="flex flex-col items-center gap-1">
            <AppLogo height={70} width={70} logoClassName="h-14" />
            <AppName />
          </Link>
        </div>

        <Card className="border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Get Started Free </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Company Name
                </label>
                <Input
                  type="text"
                  placeholder="Acme Inc."
                  {...register("companyName")}
                />
                {errors.companyName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.companyName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Work Email
                </label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register("password")}
                />
                <p className="text-xs text-slate-500 mt-1">
                  At least 8 characters, including upper & lower case and a
                  number
                </p>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-8">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
