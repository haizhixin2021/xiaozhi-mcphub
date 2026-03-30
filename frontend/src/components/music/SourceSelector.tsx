import React from 'react';

interface Source {
  id: string;
  label: string;
}

interface SourceSelectorProps {
  source: Source;
  selected: boolean;
  onToggle: () => void;
}

const SourceSelector: React.FC<SourceSelectorProps> = ({
  source,
  selected,
  onToggle,
}) => {
  const getSourceIcon = (id: string) => {
    const icons: Record<string, string> = {
      netease: '🎵',
      qq: '🎶',
      kugou: '🐕',
      kuwo: '🎤',
      migu: '📱',
      fivesing: '5️⃣',
      jamendo: '🌍',
      joox: '🎧',
      qianqian: '🌸',
      soda: '🥤',
      bilibili: '📺',
    };
    return icons[id] || '🎵';
  };

  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
      }`}
    >
      <span className="text-lg">{getSourceIcon(source.id)}</span>
      <span className="text-sm font-medium">{source.label}</span>
    </button>
  );
};

export default SourceSelector;
