"use client";
import { updateCouponsAction } from "@/app/bets/actions";
import { useState } from "react";

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
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [filter, setFilter] = useState<"all" | "1" | "won" | "lost">("all");
  const [updating, setUpdating] = useState(false);

  // 🔒 LOGIKA BLOKADY: Sprawdzamy, czy istnieje jakikolwiek kupon "W grze" (status === "1")
  // Jeśli nie, nie ma sensu strzelać do API.
  const hasPendingCoupons = coupons.some((c) => c.status === "1");

  const handleUpdate = async () => {
    // Dodatkowe zabezpieczenie funkcji
    if (!hasPendingCoupons) return;

    setUpdating(true);
    try {
      await updateCouponsAction();

      const res = await fetch("/api/bets");
      const freshData = await res.json();

      setCoupons(freshData);
    } catch (err) {
      console.error("Błąd aktualizacji:", err);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = coupons.filter((c) =>
    filter === "all" ? true : c.status === filter,
  );

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

        <div className="flex flex-col items-end">
          <button
            onClick={handleUpdate}
            // 🔒 BLOKADA PRZYCISKU
            disabled={updating || !hasPendingCoupons}
            className={`
              px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2
              ${
                updating || !hasPendingCoupons
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600"
                  : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 shadow-lg shadow-blue-600/20"
              }
            `}
          >
            {updating ? (
              <>
                <span className="animate-spin">↻</span> Sprawdzam...
              </>
            ) : (
              <>↻ Odśwież Wyniki</>
            )}
          </button>

          {/* Informacja dla użytkownika dlaczego przycisk nie działa */}
          {!hasPendingCoupons && coupons.length > 0 && (
            <span className="text-[10px] text-gray-500 mt-1">
              Brak aktywnych kuponów do sprawdzenia
            </span>
          )}
        </div>
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

function CouponCard({ coupon }: { coupon: Coupon }) {
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
      className={`bg-[#242424] rounded-xl p-4 border ${
        coupon.status === "won" ? "border-green-500/50" : "border-gray-800"
      } relative overflow-hidden group hover:border-gray-700 transition-colors`}
    >
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
      </div>

      <div className="space-y-2">
        {coupon.selections.map((sel: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  sel.status === "won"
                    ? "bg-green-500"
                    : sel.status === "lost"
                      ? "bg-red-500"
                      : "bg-gray-600"
                }`}
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
