"use client";
import { useState } from "react";
import MatchList from "@/components/MatchList";
import BetsHistory from "@/components/BetsHistory";

export default function AppContent({
  matches,
  initialCoupons,
}: {
  matches: any[];
  initialCoupons: any[];
}) {
  const [activeTab, setActiveTab] = useState<"matches" | "history">("matches");
  console.log(activeTab);
  return (
    <>
      {/* Nawigacja */}
      <nav className="sticky top-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-gray-800 mb-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center gap-2 py-3">
            <button
              onClick={() => setActiveTab("matches")}
              className={`flex-1 cursor-pointer max-w-[160px] py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === "matches"
                  ? "bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                  : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
              }`}
            >
              ⚽ Oferta
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 cursor-pointer max-w-[160px] py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === "history"
                  ? "bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                  : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
              }`}
            >
              📊 Mój Excel
            </button>
          </div>
        </div>
      </nav>

      {/* Główna zawartość */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        {activeTab === "matches" ? (
          matches.length > 0 ? (
            <MatchList matches={matches} />
          ) : (
            <div className="bg-[#242424] p-12 rounded-3xl border-2 border-dashed border-gray-800 text-center">
              <p className="text-gray-500">
                Brak meczów w bazie. Kliknij "Odśwież bazę" powyżej.
              </p>
            </div>
          )
        ) : (
          <BetsHistory initialCoupons={initialCoupons} />
        )}
      </div>
    </>
  );
}
