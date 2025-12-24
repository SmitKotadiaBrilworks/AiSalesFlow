"use client";
import { ChatWidget } from "@/components/chat-widget/ChatWidget";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AppLogo, AppName } from "@/components/ui/appLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function LandingPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2">
          <AppLogo logoClassName="h-12 md:h-10" />
          <AppName className="hidden sm:inline" />
        </Link>
        <nav className="flex gap-4 items-center">
          <div className="flex sm:hidden order-2">
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger>
                <Menu size={25} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {navItems.map((item, index) => (
                  <>
                    {index ? (
                      <DropdownMenuSeparator className="bg-gray-200 mx-1" />
                    ) : null}

                    <DropdownMenuItem key={item.href} asChild className="py-2">
                      <Link href={item.href} scroll={true}>
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  </>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="hidden sm:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost">{item.label}</Button>
              </Link>
            ))}
          </div>

          <Link href="/login">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              Sign In
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <HeroSection />
        <div id="features">
          <FeatureGrid />
        </div>
        <div id="how-it-works">
          <HowItWorks />
        </div>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Sales?
            </h2>
            <p className="text-xl mb-8 text-indigo-100">
              Join hundreds of companies already using AI SalesFlow to capture
              and convert more leads.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-slate-100 px-8 py-6 text-lg shadow-xl"
              >
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-7 bg-slate-900 text-slate-400 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm">
            {`© ${new Date().getFullYear()} AI SalesFlow. All rights reserved. Built with ❤️ by
            Brilworks.`}
          </p>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
