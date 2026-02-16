"use client";
import { updateCouponsAction } from "@/app/bets/actions";
import { useState, useEffect } from "react";

// Prosty typ dla kuponu (rozszerz go o pola z Prisma jeśli trzeba)
interface Coupon {
  id: string;
  status: string;
  selections: any[];
  totalOdds?: number;
  potentialWin?: number;
}
interface BetsHistoryProps {
  initialCoupons: Coupon[];
}

export default function BetsHistory({ initialCoupons = [] }: BetsHistoryProps) {
  // Stan kuponów inicjalizujemy propsami
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [filter, setFilter] = useState<"all" | "1" | "won" | "lost">("all");
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      // 1. Wywołaj Server Action (sprawdzenie wyników w API Flashscore)
      await updateCouponsAction();

      // 2. Pobierz świeże dane z bazy (musisz mieć endpoint GET /api/bets)
      //    Nawet jeśli initialCoupons przyszły z serwera, po aktualizacji musisz
      //    pobrać nowe statusy (won/lost) asynchronicznie.
      const res = await fetch("/api/bets");
      const freshData = await res.json();

      setCoupons(freshData); // Aktualizuj stan, widok się przerysuje
    } catch (err) {
      console.error("Błąd aktualizacji:", err);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = coupons.filter((c) =>
    filter === "all" ? true : c.status === filter,
  );

  // Wspólne style dla przycisków filtrów
  const getBtnClass = (active: boolean) =>
    `px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
      active
        ? "bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20"
        : "bg-[#242424] text-gray-400 border-gray-700 hover:bg-[#2a2a2a] hover:border-gray-500"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Historia Kuponów</h2>

        <button
          onClick={handleUpdate}
          disabled={updating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {updating ? (
            <>
              <span className="animate-spin">↻</span> Sprawdzam...
            </>
          ) : (
            <>↻ Odśwież Wyniki</>
          )}
        </button>
      </div>

      {/* Filtry */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={getBtnClass(filter === "all")}
        >
          Wszystkie ({coupons.length})
        </button>
        <button
          onClick={() => setFilter("1")}
          className={getBtnClass(filter === "1")}
        >
          🕒 W grze ({coupons.filter((c) => c.status === "1").length})
        </button>
        <button
          onClick={() => setFilter("won")}
          className={getBtnClass(filter === "won")}
        >
          ✅ Wygrane ({coupons.filter((c) => c.status === "won").length})
        </button>
        <button
          onClick={() => setFilter("lost")}
          className={getBtnClass(filter === "lost")}
        >
          ❌ Przegrane ({coupons.filter((c) => c.status === "lost").length})
        </button>
      </div>

      {/* Lista kuponów */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 italic border border-dashed border-gray-800 rounded-xl">
            Brak kuponów w tej kategorii.
          </div>
        ) : (
          filtered.map((coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))
        )}
      </div>
    </div>
  );
}

// Sub-komponent karty kuponu (możesz go wydzielić do osobnego pliku)
function CouponCard({ coupon }: { coupon: Coupon }) {
  // Helper do kolorów statusu
  const statusColor =
    {
      "1": "text-blue-400 border-blue-500/30 bg-blue-500/10",
      won: "text-green-400 border-green-500/30 bg-green-500/10",
      lost: "text-red-400 border-red-500/30 bg-red-500/10",
    }[coupon.status] || "text-gray-400 border-gray-700 bg-gray-800";

  const statusLabel =
    {
      "1": "W GRZE",
      won: "WYGRANY",
      lost: "PRZEGRANY",
    }[coupon.status] || coupon.status;

  return (
    <div
      className={`bg-[#242424] rounded-xl p-4 border ${coupon.status === "won" ? "border-green-500/50" : "border-gray-800"} relative overflow-hidden group hover:border-gray-700 transition-colors`}
    >
      {/* Header kuponu */}
      <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-3">
        <div>
          <span
            className={`text-[10px] font-black px-2 py-1 rounded ${statusColor}`}
          >
            {statusLabel}
          </span>
          <div className="text-[10px] text-gray-500 mt-2 font-mono">
            ID: {coupon.id.slice(0, 8)}...
          </div>
        </div>
        {/* Tu możesz dodać np. datę czy potencjalną wygraną */}
      </div>

      {/* Lista zdarzeń na kuponie */}
      <div className="space-y-2">
        {coupon.selections.map((sel: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${sel.status === "won" ? "bg-green-500" : sel.status === "lost" ? "bg-red-500" : "bg-gray-600"}`}
              ></div>
              <span className="text-gray-300 font-medium">
                {sel.home} vs {sel.away}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-xs text-gray-500 uppercase">
                {sel.market}
              </span>
              <span className="font-bold text-yellow-500">{sel.pick}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
