"use client";

interface MarketModalProps {
  match: any;
  onClose: () => void;
  onBet: (match: any, market: string, pick: string) => void;
  currentBets: any[];
}

export default function MarketModal({ match, onClose, onBet, currentBets }: MarketModalProps) {
  const isSelected = (market: string, pick: string) => 
    currentBets.some(b => b.matchId === match.id && b.market === market && b.pick === pick);

  const MarketRow = ({ 
    title, 
    options, 
    marketKey 
  }: { 
    title: string, 
    options: { label: string, value: string }[], 
    marketKey: string 
  }) => (
    <div className="mb-4">
      <div className="bg-[#2a2a2a] px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-tight border-l-2 border-yellow-500 mb-1">
        {title}
      </div>
      <div className="grid grid-cols-2 gap-1 px-1">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onBet(match, marketKey, opt.value)}
            className={`py-2.5 rounded text-[11px] font-bold transition-all border ${
              isSelected(marketKey, opt.value)
              ? 'bg-yellow-500 text-black border-yellow-500'
              : 'bg-[#333] text-gray-300 border-gray-700 hover:border-gray-500'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl overflow-hidden shadow-2xl my-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-[#242424] p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 z-10">
          <div>
            <div className="text-[10px] text-yellow-500 font-black uppercase tracking-widest mb-1">Oferta rynkowa</div>
            <div className="text-sm font-bold text-white">{match.home} - {match.away}</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl font-light">&times;</button>
        </div>

        <div className="p-2 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* 1X2 */}
          <MarketRow 
            title="Wynik meczu" 
            marketKey="full_time_result" 
            options={[
              { label: '1', value: '1' },
              { label: 'X', value: 'X' },
              { label: '2', value: '2' }
            ]} 
          />

          {/* BTTS */}
          <MarketRow 
            title="Obie drużyny strzelą" 
            marketKey="btts" 
            options={[
              { label: 'Tak', value: 'yes' },
              { label: 'Nie', value: 'no' }
            ]} 
          />

          {/* GOLE */}
          <MarketRow 
            title="Suma goli" 
            marketKey="goals_over_under" 
            options={[
              { label: 'Poniżej 2.5', value: 'under_2_5' },
              { label: 'Powyżej 2.5', value: 'over_2_5' },
              { label: 'Poniżej 3.5', value: 'under_3_5' },
              { label: 'Powyżej 3.5', value: 'over_3_5' }
            ]} 
          />

          {/* RZUTY ROŻNE */}
          <MarketRow 
            title="Rzuty rożne" 
            marketKey="corners" 
            options={[
              { label: 'Poniżej 8.5', value: 'under_8_5' },
              { label: 'Powyżej 8.5', value: 'over_8_5' },
              { label: 'Poniżej 9.5', value: 'under_9_5' },
              { label: 'Powyżej 9.5', value: 'over_9_5' }
            ]} 
          />

          {/* HANDICAP */}
          <MarketRow 
            title="Handicap" 
            marketKey="handicap" 
            options={[
              { label: `${match.home} -1.5`, value: 'home_minus_1_5' },
              { label: `${match.away} +1.5`, value: 'away_plus_1_5' }
            ]} 
          />
        </div>

        <div className="p-4 bg-[#242424] border-t border-gray-800 text-center">
          <p className="text-[9px] text-gray-500 uppercase font-bold mb-4">Wybierz typ aby dodać do kuponu</p>
          <button onClick={onClose} className="w-full py-3 bg-yellow-500 text-black rounded-lg text-xs font-black uppercase tracking-widest">
            Gotowe
          </button>
        </div>
      </div>
    </div>
  );
}
