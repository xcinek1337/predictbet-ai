import { readFileSync, existsSync } from "fs";
import { join } from "path";
import prisma from "@/lib/db"; // Dodaj import

import AppContent from "@/components/AppContent"; // Importuj nowy komponent
import InfoModal from "@/components/InfoModal";

// Funkcja pomocnicza do pobierania meczów (Server Side)
async function getLocalMatches() {
  const filePath = join(process.cwd(), "data", "all_matches.json");
  if (!existsSync(filePath)) return [];

  try {
    const fileContent = readFileSync(filePath, "utf8");
    return JSON.parse(fileContent).matches || [];
  } catch (e) {
    console.error("Błąd parsowania pliku meczów:", e);
    return [];
  }
}

export default async function Home() {
  const matches = await getLocalMatches();

  const initialCoupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { selections: true },
  });

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white font-sans">
      {/* Header (wspólny) */}
      <div className="bg-[#242424] border-b border-gray-800 py-6 px-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              FLASHBET <span className="text-yellow-500">PRO</span> 🚀
            </h1>
            <p className="text-gray-400 text-xs md:text-sm mt-1">
              Twój osobisty asystent bukmacherski
            </p>
          </div>
          <a
            href="/api/matches"
            className="bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-gray-700"
          >
            ↻ Odśwież API
          </a>
        </div>
      </div>

      {/* Przekazujemy mecze do komponentu klienckiego z zakładkami */}
      <AppContent matches={matches} initialCoupons={initialCoupons} />
      <InfoModal />
    </main>
  );
}
