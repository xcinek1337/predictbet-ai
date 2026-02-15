// src/lib/settlement.ts
export function checkSelection(sel: any, matchData: any, statsData: any = null) {
  const homeScore = parseInt(matchData.homeFullTimeScore);
  const awayScore = parseInt(matchData.awayFullTimeScore);

  switch (sel.market) {
    case "1X2":
      if (sel.pick === "1") return homeScore > awayScore ? "won" : "lost";
      if (sel.pick === "2") return awayScore > homeScore ? "won" : "lost";
      if (sel.pick === "X") return homeScore === awayScore ? "won" : "lost";
      break;

    case "btts":
      const btts = homeScore > 0 && awayScore > 0;
      return (sel.pick === "yes" && btts) || (sel.pick === "no" && !btts) ? "won" : "lost";

    case "goals_over_under":
      const totalGoals = homeScore + awayScore;
      if (sel.pick === "over_2_5") return totalGoals > 2.5 ? "won" : "lost";
      if (sel.pick === "under_2_5") return totalGoals < 2.5 ? "won" : "lost";
      // Dodaj resztę progów...
      break;

    case "corners":
      if (!statsData) return "pending";
      const cornersStat = statsData.find((s: any) => s.statName === "Corner kicks");
      const totalCorners = parseInt(cornersStat.homeValue) + parseInt(cornersStat.awayValue);
      if (sel.pick === "over_8_5") return totalCorners > 8.5 ? "won" : "lost";
      if (sel.pick === "under_8_5") return totalCorners < 8.5 ? "won" : "lost";
      break;
  }
  return "pending";
}
