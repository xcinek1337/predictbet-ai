"use server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { execSync } from "child_process";

export async function updateCouponsAction() {
  console.log(">>> ROZPOCZĘTO ROZLICZANIE KUPONÓW (FINAL CURL) <<<");

  const coupons = await prisma.coupon.findMany({
    where: { status: "1" }, // Pobieramy tylko aktywne
    include: { selections: true },
  });

  if (coupons.length === 0) {
    console.log("Brak aktywnych kuponów.");
    return;
  }

  // Cache wyników, żeby nie męczyć API tymi samymi zapytaniami
  const resultsCache: Record<string, any[]> = {};

  for (const coupon of coupons) {
    let couponStatus = "won"; // Zakładamy sukces, szukamy porażki
    let allMatchesFinished = true;

    for (const sel of coupon.selections) {
      try {
        // 1. Budujemy URL do wyników
        // Zamieniamy 'fixtures' na 'results'. Reszta ścieżki (kraj, liga, rok) zostaje.
        // Format z bazy: "spain:176/laliga2:vZiPmPJi/2025-2026/fixtures"
        const leagueKey = sel.leagueSlug.replace("fixtures", "results");

        // Jeśli w cache pusto, pobieramy
        if (!resultsCache[leagueKey]) {
          const url = `https://api.sportdb.dev/api/flashscore/football/${leagueKey}`;
          const apiKey = process.env.FLASHSCORE_API_KEY || "";

          console.log(`>>> POBIERAM DLA: ${sel.leagueSlug}`);
          console.log(`>>> URL: ${url}`);

          // 2. Używamy CURL systemowego (najpewniejsza metoda)
          try {
            // Dodajemy -L (follow redirects) i -s (silent)
            // Ważne: cudzysłowy wokół URL, bo zawiera dwukropki!
            const cmd = `curl -s -L -H "X-API-Key: ${apiKey}" "${url}"`;

            const output = execSync(cmd).toString();

            if (!output || output.trim().startsWith("<html")) {
              console.error(
                `!!! API zwróciło HTML dla ${leagueKey}. Może zły URL?`,
              );
              throw new Error("Błąd API (HTML)");
            }

            // Parsujemy JSON
            const data = JSON.parse(output);

            // Obsługa różnych formatów (tablica vs obiekt z events)
            if (Array.isArray(data)) {
              resultsCache[leagueKey] = data;
            } else if (data.events) {
              resultsCache[leagueKey] = data.events;
            } else {
              resultsCache[leagueKey] = [];
            }

            console.log(
              `✅ POBRANO: ${resultsCache[leagueKey].length} wyników.`,
            );
          } catch (e: any) {
            console.error(`❌ Błąd CURL: ${e.message}`);
            throw e;
          }
        }

        // 3. Szukamy meczu w wynikach
        const matches = resultsCache[leagueKey] || [];
        const match = matches.find((m: any) => m.eventId === sel.matchId);

        if (!match) {
          console.log(`⚠️ Nie znaleziono meczu ${sel.matchId} w wynikach.`);
          allMatchesFinished = false; // Mecz może być jeszcze w "fixtures" (nie skończony)
          continue;
        }

        if (
          match.eventStage !== "FINISHED" &&
          match.eventStage !== "END_OF_GAME"
        ) {
          console.log(
            `⏳ Mecz ${match.homeName || match.homeFirstName} w trakcie/niezakończony.`,
          );
          allMatchesFinished = false;
          continue;
        }

        // 4. Mamy zakończony mecz - sprawdzamy wynik
        // Fallbacki na różne nazwy pól (czasem API zmienia API)
        const homeScore = parseInt(
          match.homeFullTimeScore ??
            match.homeScore?.current ??
            match.homeScore ??
            0,
        );
        const awayScore = parseInt(
          match.awayFullTimeScore ??
            match.awayScore?.current ??
            match.awayScore ??
            0,
        );

        console.log(
          `⚽ WYNIK: ${match.homeName} ${homeScore}:${awayScore} ${match.awayName} (Twój typ: ${sel.pick})`,
        );

        let selectionWon = false;

        if (sel.market === "1X2") {
          if (sel.pick === "1") selectionWon = homeScore > awayScore;
          else if (sel.pick === "2") selectionWon = awayScore > homeScore;
          else if (sel.pick === "X") selectionWon = homeScore === awayScore;
        } else if (sel.market === "BTTS") {
          // Obie strzelą
          const btts = homeScore > 0 && awayScore > 0;
          selectionWon =
            (sel.pick === "TAK" && btts) || (sel.pick === "NIE" && !btts);
        } else if (sel.market === "goals_over_under") {
          // Over/Under
          const total = homeScore + awayScore;
          // Format picku: "over_2_5" -> szukamy liczby
          const line = parseFloat(
            sel.pick
              .replace("over_", "")
              .replace("under_", "")
              .replace("_", "."),
          );
          const isOver = sel.pick.startsWith("over");

          if (isOver) selectionWon = total > line;
          else selectionWon = total < line;
        }
        else if (sel.market === "double_chance") {
          // Podwójna szansa: 1X, 12, X2
          if (sel.pick === "1X") {
            // Wygra gospodarz LUB remis
            selectionWon = homeScore >= awayScore;
          } else if (sel.pick === "X2") {
            // Wygra gość LUB remis
            selectionWon = awayScore >= homeScore;
          } else if (sel.pick === "12") {
            // Wygra gospodarz LUB gość (brak remisu)
            selectionWon = homeScore !== awayScore;
          }
        }

        if (!selectionWon) {
          console.log(`❌ PRZEGRANY ZAKŁAD: ${sel.matchId}`);
          couponStatus = "lost";
          break; // Koniec sprawdzania tego kuponu
        } else {
          console.log(`✅ TRAFIONY!`);
        }
      } catch (err: any) {
        console.error(
          `❌ Błąd krytyczny przy meczu ${sel.matchId}:`,
          err.message,
        );
        allMatchesFinished = false; // Zostawiamy kupon jako aktywny, żeby spróbować później
      }
    }

    // 5. Aktualizacja w bazie
    // Status zmieniamy tylko jeśli przegrany LUB wszystkie mecze zakończone sukcesem
    const finalStatus =
      couponStatus === "lost" ? "lost" : allMatchesFinished ? "won" : "1";

    if (finalStatus !== "1") {
      console.log(`💾 AKTUALIZACJA KUPONU ${coupon.id} -> ${finalStatus}`);
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { status: finalStatus },
      });
    } else {
      console.log(`🕒 Kupon ${coupon.id} nadal w grze.`);
    }
  }

  revalidatePath("/bets");
  console.log(">>> KONIEC ROZLICZANIA <<<");
}
