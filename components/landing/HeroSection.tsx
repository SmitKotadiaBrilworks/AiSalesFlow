"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 mt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-6"
        >
          <Sparkles className="h-4 w-4" />
          AI-Powered Sales Automation
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
        >
          <span className="text-slate-900">Never Miss a</span>
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Lead Again
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          AI SalesFlow captures, qualifies, and responds to every lead
          instantly—24/7. Turn website visitors into conversations with zero
          manual work.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-row gap-4 justify-center items-center"
        >
          <Link href="/login">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-5 md:px-8 md:py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 md:!h-5 md:!w-5" />
            </Button>
          </Link>
          <Link href="#demo">
            <Button
              size="lg"
              variant="outline"
              className="px-6 py-5 md:px-8 md:py-6 text-base md:text-lg border-2 border-slate-300 hover:border-indigo-600 hover:text-indigo-600 transition-all"
            >
              Watch Demo
            </Button>
          </Link>
        </motion.div>

        {/* Floating cards animation */}
        <div className="relative mt-16 h-40 md:h-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2 w-full max-w-4xl"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  AI
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm text-slate-500 mb-1">
                    New Lead Captured
                  </div>
                  <div className="text-slate-900 font-medium">
                    &quot;Hi! I&apos;m interested in your services for
                    enterprise clients...&quot;
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  Qualified
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
