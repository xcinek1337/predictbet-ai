import { NextResponse } from "next/server";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { leagues } from "@/data/leauges";

const API_KEY = process.env.FLASHSCORE_API_KEY || "";

export async function GET() {
  if (!API_KEY)
    return NextResponse.json({ error: "Brak API_KEY" }, { status: 500 });

  const allResults: any[] = [];
  const errors: string[] = [];

  for (const country of leagues) {
    for (const comp of country.competitions) {
      try {
        // BUDUJEMY DOKŁADNIE TAKI SAM LINK JAK W CURLU
        const url = `https://api.sportdb.dev/api/flashscore/football/${comp.path}`;
        console.log(`Pobieram curlem: ${url}`);

        // WYKONUJEMY CURL SYSTEMOWY (tak jak z konsoli)
        const cmd = `curl -s -H "X-API-Key: ${API_KEY}" "${url}"`;
        const output = execSync(cmd).toString();

        if (!output || output.startsWith("<html>")) {
          throw new Error("404 lub błąd odpowiedzi");
        }
        const events = JSON.parse(output);

        const mappedMatches = events.map((event: any) => ({
          id: event.eventId,
          home: event.homeName || event.homeFirstName,
          away: event.awayName || event.awayFirstName,
          datetime: event.startDateTimeUtc,
          league: comp.name,
          country: country.country,
          leagueSlug: comp.path.split("?")[0],
          score: { home: event.homeScore ?? 0, away: event.awayScore ?? 0 },
        }));

        allResults.push(...mappedMatches);
        console.log(
          `✅ Pobrano ${mappedMatches.length} meczów dla ${comp.name}`,
        );
      } catch (err: any) {
        console.error(`❌ Błąd dla ${comp.name}:`, err.message);
        errors.push(`${comp.name}: ${err.message}`);
      }
    }
  }

  const dataDir = join(process.cwd(), "data");
  if (!existsSync(dataDir)) mkdirSync(dataDir);
  writeFileSync(
    join(dataDir, "all_matches.json"),
    JSON.stringify({ matches: allResults }, null, 2),
  );

  return NextResponse.json({
    success: true,
    total: allResults.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
