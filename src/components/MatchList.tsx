"use client";
import { useState, useMemo } from "react";
import Betslip from "./Betslip";
import MatchRow from "./MatchRow";
import MarketModal from "./MarketModal";

export default function MatchList({ matches }: { matches: any[] }) {
  // 1. Wyciągamy unikalne ligi z przekazanych meczów
  const leagues = useMemo(
    () => Array.from(new Set(matches.map((m) => m.league))),
    [matches],
  );

  const [selectedLeague, setSelectedLeague] = useState(leagues[0] || "");
  const [showFullWeek, setShowFullWeek] = useState(false);
  const [betslip, setBetslip] = useState<any[]>([]);
  const [activeMatch, setActiveMatch] = useState<any>(null);

  const toggleBet = (match: any, market: string, pick: string) => {
    // DIAGNOSTYKA: Sprawdźmy co wchodzi
    if (!match.leagueSlug) {
      console.error("CRITICAL: Brak leagueSlug w obiekcie meczu!", match);
      alert("Błąd danych: Nie można dodać zakładu (brak identyfikatora ligi)");
      return;
    }

    setBetslip((prev) => {
      const exactMatch = prev.find(
        (b) => b.matchId === match.id && b.market === market && b.pick === pick,
      );

      if (exactMatch) {
        return prev.filter(
          (b) => !(b.matchId === match.id && b.market === market),
        );
      }

      const hasThisMatchAlready = prev.some((b) => b.matchId === match.id);

      if (hasThisMatchAlready) {
        alert(
          `Nie możesz dodać dwóch zdarzeń z meczu ${match.home} - ${match.away} na jeden kupon AKO!`,
        );
        return prev;
      }

      return [
        ...prev,
        {
          matchId: match.id,
          home: match.home,
          away: match.away,
          market,
          leagueSlug: match.leagueSlug,
          pick,
        },
      ];
    });
  };

  const displayMatches = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return matches.filter((m) => {
      if (m.league !== selectedLeague) return false;
      return showFullWeek || m.datetime.split("T")[0] === todayStr;
    });
  }, [matches, selectedLeague, showFullWeek]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 bg-[#1a1a1a] min-h-screen text-gray-200 p-2 font-sans">
      {/* SIDEBAR LIG */}
      <div className="w-full lg:w-52 bg-[#242424] rounded-lg p-2 h-fit lg:sticky lg:top-2 border border-gray-800/30">
        <h2 className="text-[10px] font-bold text-gray-600 uppercase px-3 py-2 border-b border-gray-800 tracking-widest mb-2 italic">
          🏆 Top Ligi
        </h2>
        {leagues.map((l) => (
          <button
            key={l}
            onClick={() => setSelectedLeague(l)}
            className={`w-full text-left px-3 py-2 rounded text-[11px] font-bold transition-all mb-0.5 ${
              selectedLeague === l
                ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                : "text-gray-400 hover:bg-[#2d2d2d]"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ŚRODEK: LISTA MECZÓW */}
      <div className="flex-1 space-y-0.5">
        <div className="bg-[#242424] p-3 rounded-t-lg border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
            {selectedLeague}
          </h1>
        </div>
        {displayMatches.map((m) => (
          <MatchRow
            key={m.id}
            match={m}
            currentPick={betslip.find((b) => b.matchId === m.id)?.pick}
            // Ważne: onBet dla MatchRow (przyciski 1X2)
            onBet={(match: any, type: string) => toggleBet(match, "1X2", type)}
            onMore={(match: any) => setActiveMatch(match)}
          />
        ))}
        {!showFullWeek && (
          <button
            onClick={() => setShowFullWeek(true)}
            className="w-full py-4 bg-[#242424] text-yellow-500 text-[10px] font-black uppercase tracking-widest hover:bg-[#2a2a2a] transition-colors rounded-b-lg border-t border-gray-800"
          >
            Pokaż pełny tydzień ↓
          </button>
        )}
      </div>

      {/* PRAWA: KUPON */}
      <Betslip
        bets={betslip}
        onRemove={(matchId) =>
          setBetslip((prev) => prev.filter((b) => b.matchId !== matchId))
        }
      />

      {/* MODAL Z RYNKAMI */}
      {activeMatch && (
        <MarketModal
          match={activeMatch}
          onClose={() => setActiveMatch(null)}
          onBet={(match, market, pick) => {
            toggleBet(match, market, pick);
          }}
          currentBets={betslip}
        />
      )}
    </div>
  );
}
