"use client";

export default function MatchRow({ match, onBet, onMore, currentPick }: any) {
  return (
    <div className="bg-[#242424] hover:bg-[#2d2d2d] p-3 flex items-center gap-3 border-b border-[#1a1a1a] transition-colors">
      <div className="w-14 text-[9px] text-gray-500 font-mono text-center">
        <div className="text-gray-400">{new Date(match.datetime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className={`text-xs font-bold truncate ${match.score.home > match.score.away ? 'text-white' : 'text-gray-400'}`}>{match.home}</span>
          <span className="text-yellow-500 font-mono font-black text-xs">{match.score.home}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-xs font-bold truncate ${match.score.away > match.score.home ? 'text-white' : 'text-gray-400'}`}>{match.away}</span>
          <span className="text-yellow-500 font-mono font-black text-xs">{match.score.away}</span>
        </div>
      </div>

      <div className="flex gap-1 ml-2">
        {['1', 'X', '2'].map((type) => (
          <button 
            key={type}
            onClick={() => onBet(match, "1X2",type)}
            className={`w-9 h-9 rounded text-[11px] font-black transition-all border ${
              currentPick === type 
              ? 'bg-yellow-500 text-black border-yellow-500' 
              : 'bg-[#333] text-gray-400 border-gray-700 hover:border-gray-500'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <button 
        onClick={() => onMore(match)}
        className="px-2 h-9 bg-[#2a2a2a] hover:bg-[#383838] rounded text-[9px] font-bold text-gray-500 uppercase border border-gray-800 transition-colors"
      >
        Więcej
      </button>
    </div>
  );
}
