import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import MatchList from '@/components/MatchList';

async function getLocalMatches() {
  const filePath = join(process.cwd(), 'data', 'all_matches.json');
  if (!existsSync(filePath)) return [];
  const fileContent = readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent).matches || [];
}

export default async function Home() {
  const matches = await getLocalMatches();

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">FLASHBET AI 🤖</h1>
            <p className="text-gray-500 mt-2">Wybierz mecz i postaw swój typ</p>
          </div>
          <a href="/api/matches" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            Odśwież bazę (API)
          </a>
        </div>

        {matches.length > 0 ? (
          <MatchList matches={matches} />
        ) : (
          <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500">Brak meczów w bazie. Kliknij "Odśwież bazę", aby pobrać dane.</p>
          </div>
        )}
      </div>
    </main>
  );
}
