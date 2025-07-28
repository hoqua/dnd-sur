'use client';
import type { Player } from '@/lib/db/schema';

interface PlayerStatsProps {
  player: Player | null;
}

export function PlayerStats({ player }: PlayerStatsProps) {
  if (!player) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-4">⚔️</div>
          <h2 className="text-xl font-bold text-amber-200 mb-2">No Character</h2>
          <p className="text-amber-400/80 text-sm font-serif leading-relaxed">
            Create your legendary hero to begin your epic adventure in the realm of shadows and glory!
          </p>
        </div>
        
        <div className="border-t border-amber-600/30 pt-6">
          <div className="bg-slate-800/30 border border-amber-600/20 rounded-lg p-4">
            <div className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Awaiting Hero
            </div>
            <div className="text-slate-400 text-sm font-serif">
              The realm calls for champions...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const healthPercentage = (player.health / player.maxHealth) * 100;
  const stats = player.stats as any;

  const getClassIcon = (characterClass: string) => {
    switch (characterClass.toLowerCase()) {
      case 'warrior': return '⚔️';
      case 'mage': return '🔮';
      case 'rogue': return '🗡️';
      case 'cleric': return '✨';
      case 'ranger': return '🏹';
      default: return '🛡️';
    }
  };

  const getHealthColor = (percentage: number) => {
    if (percentage > 75) return 'from-emerald-500 to-green-400';
    if (percentage > 50) return 'from-yellow-500 to-amber-400';
    if (percentage > 25) return 'from-orange-500 to-red-400';
    return 'from-red-600 to-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Character Portrait */}
      <div className="text-center">
        <div className="text-6xl mb-4 drop-shadow-lg">
          {getClassIcon(player.characterClass)}
        </div>
        <h2 className="text-2xl font-bold text-amber-200 mb-1">{player.name}</h2>
        <div className="flex items-center justify-center gap-2">
          <span className="text-amber-400 font-serif">{player.characterClass}</span>
          <span className="text-amber-600">•</span>
          <span className="text-amber-300 font-semibold">Level {player.level}</span>
        </div>
      </div>

      {/* Health Bar */}
      <div className="bg-slate-800/40 border border-red-600/30 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-red-300 font-semibold text-sm">❤️ VITALITY</span>
          <span className="text-red-200 font-mono text-sm">{player.health}/{player.maxHealth}</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getHealthColor(healthPercentage)} transition-all duration-500 shadow-lg`}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      {/* Experience */}
      <div className="bg-slate-800/40 border border-blue-600/30 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-blue-300 font-semibold text-sm">⭐ EXPERIENCE</span>
          <span className="text-blue-200 font-mono text-sm">{player.experience} XP</span>
        </div>
      </div>

      {/* Location */}
      <div className="bg-slate-800/40 border border-green-600/30 rounded-lg p-4">
        <div className="text-green-300 font-semibold text-sm mb-2">🗺️ LOCATION</div>
        <div className="text-green-200 font-serif">{player.location}</div>
      </div>
      
      {/* Ability Scores */}
      {stats && (
        <div className="bg-slate-800/40 border border-amber-600/30 rounded-lg p-4">
          <h3 className="text-amber-300 font-bold text-sm mb-4 uppercase tracking-wider">
            📊 Abilities
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'STR', value: stats?.strength || 10, icon: '💪' },
              { name: 'DEX', value: stats?.dexterity || 10, icon: '🏃' },
              { name: 'INT', value: stats?.intelligence || 10, icon: '🧠' },
              { name: 'CON', value: stats?.constitution || 10, icon: '🛡️' },
            ].map((stat) => (
              <div key={stat.name} className="bg-slate-900/50 rounded p-3 text-center">
                <div className="text-lg mb-1">{stat.icon}</div>
                <div className="text-amber-300 text-xs font-semibold">{stat.name}</div>
                <div className="text-amber-200 font-bold">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 