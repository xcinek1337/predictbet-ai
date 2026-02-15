"use client";

import { useState } from "react";

interface Bet {
  matchId: string;
  home: string;
  away: string;
  market: string; // Dodano rynek (np. 1X2, Gole, BTTS)
  pick: string; // Wybór (np. 1, Powyżej 2.5, Tak)
}

interface BetslipProps {
  bets: Bet[];
  onRemove: (matchId: string, market: string) => void; // Usuwanie po parze ID + Rynek
}

export default function Betslip({ bets, onRemove }: BetslipProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (bets.length === 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Wysyłamy status "1" zgodnie z Twoją informacją
          status: "1",
          selections: bets,
        }),
      });

      if (!response.ok) throw new Error("Błąd zapisu kuponu");

      const result = await response.json();
      console.log("✅ KUPON ZAPISANY W BAZIE:", result);

      alert("Kupon został pomyślnie wysłany!");

      // Opcjonalnie: przeładuj stronę lub wyczyść kupon
      window.location.href = "/bets";
    } catch (error) {
      console.error("❌ BŁĄD API:", error);
      alert("Nie udało się zapisać kuponu. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full lg:w-72 bg-white dark:bg-[#242424] rounded-lg p-3 h-fit lg:sticky lg:top-2 shadow-2xl border dark:border-gray-800">
      {/* Nagłówek kuponu */}
      <div className="flex justify-between items-center border-b dark:border-gray-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-black text-xs uppercase tracking-tight text-gray-400">
            Twój Kupon
          </h2>
          <span className="bg-yellow-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-sm">
            {bets.length}
          </span>
        </div>
        <span className="text-red-500 text-[10px] font-black uppercase bg-red-500/10 px-2 py-0.5 rounded">
          AKO
        </span>
      </div>

      {/* Lista zdarzeń */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
        {bets.map((bet) => (
          <div
            key={`${bet.matchId}-${bet.market}`}
            className="bg-gray-50 dark:bg-[#2a2a2a] p-3 rounded-lg border dark:border-gray-800 relative group animate-in fade-in slide-in-from-right-2"
          >
            {/* Przycisk usuwania */}
            <button
              onClick={() => onRemove(bet.matchId, bet.market)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors text-lg leading-none"
            >
              &times;
            </button>

            {/* Informacje o meczu */}
            <div className="flex flex-col mb-2">
              <span className="text-[10px] text-gray-500 font-bold truncate pr-4">
                {bet.home} - {bet.away}
              </span>
            </div>

            {/* Szczegóły zakładu */}
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[9px] text-gray-400 uppercase font-black tracking-tighter opacity-70">
                  {bet.market}
                </div>
                <div className="font-black text-sm text-yellow-500">
                  {bet.pick}
                </div>
              </div>
              <div className="text-[9px] font-mono text-gray-600 bg-black/20 px-1 rounded">
                ID: {bet.matchId.slice(-4)}
              </div>
            </div>
          </div>
        ))}

        {/* Stan pusty */}
        {bets.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-gray-600 text-[20px] mb-2 opacity-20">📋</div>
            <div className="text-gray-500 text-[10px] italic leading-relaxed">
              Twój kupon jest pusty.
              <br />
              Wybierz typy z listy meczów lub "Więcej".
            </div>
          </div>
        )}
      </div>

      {/* Stopka z przyciskiem zatwierdzenia */}
      {bets.length > 0 && (
        <div className="mt-4 pt-3 border-t dark:border-gray-800">
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase">
              Łączny status
            </span>
            <span className="text-xs font-black text-white">
              {isSubmitting ? "WYSYŁANIE..." : "OCZEKUJĄCY"}
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full font-black py-4 rounded-xl text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-yellow-500/10 ${
              isSubmitting
                ? "bg-gray-600 cursor-not-allowed text-gray-400"
                : "bg-yellow-500 hover:bg-yellow-600 text-black"
            }`}
          >
            {isSubmitting ? "Proszę czekać..." : "Zatwierdź Typy"}
          </button>
        </div>
      )}
    </div>
  );
}
