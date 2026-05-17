"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks";
import { apiFetch } from "@/utils/api";
import { Loader2, AlertCircle } from "lucide-react";

export default function SignupForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signupError } = await apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    if (signupError) {
      setError(signupError);
      setLoading(false);
    } else {
      await refreshUser();
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {error && (
        <div className="p-4 bg-ordr-accent/5 border border-ordr-accent/10 rounded-xl flex items-center gap-3 text-ordr-accent text-xs font-bold uppercase tracking-wider">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Full Identity</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-5 bg-[#fcfaf7] border border-zinc-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-ordr-accent transition-all"
            placeholder="Identity Name"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Email Protocol</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-5 bg-[#fcfaf7] border border-zinc-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-ordr-accent transition-all"
            placeholder="name@example.com"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Security Token</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-5 bg-[#fcfaf7] border border-zinc-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-ordr-accent transition-all"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ordr-accent text-white py-5 rounded-xl text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-zinc-900 transition-all shadow-xl shadow-ordr-accent/20 flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : "Initialize Genesis"}
      </button>
    </form>
  );
}
