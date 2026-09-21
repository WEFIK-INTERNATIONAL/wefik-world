import React from 'react';
import Image from 'next/image';
import { Sparkles, ArrowUpRight, Zap, ShieldCheck } from 'lucide-react';

export function HeroPoster() {
  return (
    <div className="relative w-full h-[460px] sm:h-[540px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#202124] via-[#1A2E1C] to-[#0A0D0B] border border-white/10 p-6 sm:p-10 flex flex-col justify-between shadow-2xl select-none group">
      {/* Background Ambient Glows */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-lime/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-deep-green/30 blur-3xl pointer-events-none" />

      {/* Subtle Geometric Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Floating Badges */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime/20 text-lime text-[11px] font-extrabold border border-lime/30 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Gutenberg FSE & Clean CSS</span>
        </span>
        <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
          Core Web Vitals: 100/100
        </span>
      </div>

      {/* Centerpiece: Art-Directed Glassmorphic Product Stack */}
      <div className="relative z-10 my-auto flex items-center justify-center">
        {/* Back Card (Rotated slightly) */}
        <div className="absolute w-64 sm:w-80 h-40 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg -rotate-6 translate-y-3 pointer-events-none" />

        {/* Middle Card */}
        <div className="absolute w-64 sm:w-80 h-40 rounded-2xl bg-white/8 border border-white/15 backdrop-blur-md shadow-xl rotate-3 -translate-y-2 pointer-events-none" />

        {/* Foreground Hero Card */}
        <div className="relative w-72 sm:w-96 p-5 sm:p-6 rounded-2xl bg-[#202124]/90 border border-lime/40 backdrop-blur-xl shadow-2xl shadow-lime/10 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-lime text-ink flex items-center justify-center font-black text-xs">
                W
              </div>
              <div>
                <span className="font-bold text-xs text-white block">AgencyPro FSE</span>
                <span className="text-[10px] text-slate-400 font-mono">v1.2.0 • Gutenberg Native</span>
              </div>
            </div>
            <span className="text-xs font-mono font-extrabold text-lime">₹999</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Engineered with zero page builder bloat. Achieves sub-second LCP and flawless mobile interactivity.
          </p>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
            <span className="text-deep-green-light font-bold flex items-center gap-1">
              <Zap className="w-3 h-3 text-lime" /> Single & Unlimited Licenses
            </span>
            <span className="text-white font-bold">Wefik.world</span>
          </div>
        </div>
      </div>

      {/* Bottom Features Strip */}
      <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-white/10">
        <span>Instant UPI & Card Payments</span>
        <span className="text-lime font-semibold flex items-center gap-1">
          Explore Catalog <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
