// src/app/bets/page.tsx
import prisma from "@/lib/db";
import Link from "next/link";
import { updateCouponsAction } from "./actions";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default async function BetsPage() {
  // Pobieramy wszystkie kupony (również te rozliczone), aby mieć pełną historię
  const coupons = await prisma.coupon.findMany({
    include: { selections: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-4 lg:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Górny Bar: Nawigacja i Akcje */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-xs font-black uppercase transition-colors flex items-center gap-2"
            >
              ← Powrót do meczów
            </Link>
            <h1 className="text-2xl font-black uppercase tracking-tighter border-l-4 border-yellow-500 pl-4 italic">
              Moje Kupony
            </h1>
          </div>

          <form action={updateCouponsAction}>
            <button
              type="submit"
              className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-yellow-500/10 active:scale-95"
            >
              🔄 Aktualizuj wyniki z bazy
            </button>
          </form>
        </div>

        <div className="grid gap-8">
          {coupons.length === 0 && (
            <div className="text-center py-24 bg-[#242424] rounded-2xl border border-dashed border-gray-800 opacity-50">
              <span className="text-4xl block mb-4">📋</span>
              <p className="text-xs uppercase font-black tracking-widest text-gray-500 italic">
                Brak zapisanych kuponów w systemie.
              </p>
            </div>
          )}

          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-[#242424] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative group"
            >
              {/* Header kuponu */}
              <div className="bg-[#2d2d2d] px-6 py-4 flex justify-between items-center border-b border-gray-800/50">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase font-black block tracking-widest mb-1">
                      ID Kuponu
                    </span>
                    <span className="text-[11px] font-mono text-yellow-500 font-bold opacity-80 uppercase tracking-tighter">
                      #{coupon.id.split("-")[0]}
                    </span>
                  </div>
                  <div className="h-8 w-px bg-gray-800 hidden sm:block"></div>
                  <div className="hidden sm:block">
                    <span className="text-[9px] text-gray-500 uppercase font-black block tracking-widest mb-1">
                      Data zawarcia
                    </span>
                    <span className="text-[11px] font-bold text-gray-300">
                      {format(
                        new Date(coupon.createdAt),
                        "d MMMM yyyy, HH:mm",
                        { locale: pl },
                      )}
                    </span>
                  </div>
                </div>

                <div
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                    coupon.status === "1"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : coupon.status === "won"
                        ? "bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                        : coupon.status === "lost"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                  }`}
                >
                  {coupon.status === "1"
                    ? "W grze"
                    : coupon.status === "won"
                      ? "Wygrany"
                      : coupon.status === "lost"
                        ? "Przegrany"
                        : "Anulowany"}
                </div>
              </div>

              {/* Lista meczów */}
              <div className="divide-y divide-gray-800/30">
                {coupon.selections.map((sel, idx) => (
                  <div
                    key={sel.id}
                    className="p-5 flex justify-between items-center hover:bg-white/[0.01] transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="text-[8px] text-gray-600 font-black uppercase mb-1 tracking-widest opacity-70">
                        {sel.market.replace(/_/g, " ")}
                      </div>
                      <div className="text-sm font-black text-gray-200 truncate italic">
                        {sel.home}{" "}
                        <span className="text-gray-700 mx-1">vs</span>{" "}
                        {sel.away}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-gray-600 font-black mb-1 uppercase tracking-tighter">
                        Twój Typ
                      </div>
                      <div className="bg-[#1a1a1a] text-yellow-500 px-4 py-1.5 rounded-lg border border-gray-800 font-black text-[11px] min-w-[90px] text-center shadow-inner">
                        {sel.pick.replace(/_/g, " ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer kuponu z akcją anulowania */}
              <div className="bg-[#1e1e1e] px-6 py-4 flex justify-between items-center border-t border-gray-800/20">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${coupon.status === "1" ? "bg-yellow-500 animate-pulse" : "bg-gray-600"}`}
                  ></div>
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    Weryfikacja automatyczna
                  </span>
                </div>
                {coupon.status === "1" && (
                  <button className="text-[9px] bg-red-500/5 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 px-3 py-2 rounded-lg font-black transition-all uppercase tracking-widest border border-red-500/10 hover:border-red-500/30">
                    Anuluj Zakład (X)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
