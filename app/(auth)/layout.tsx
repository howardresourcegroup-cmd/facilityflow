import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#080811] px-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Logo */}
      <div className="mb-8 flex items-center gap-2.5 relative z-10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
          <Zap className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="text-lg font-bold text-zinc-100">FacilityFlow</span>
      </div>

      <div className="w-full max-w-sm relative z-10">{children}</div>

      <p className="mt-8 text-xs text-zinc-600 relative z-10">
        © 2025 FacilityFlow. All rights reserved.
      </p>
    </div>
  );
}
