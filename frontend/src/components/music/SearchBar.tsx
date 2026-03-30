import React from 'react';

interface SearchBarProps {
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  onSearch: () => void;
  loading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  keyword,
  onKeywordChange,
  onSearch,
  loading,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    }
  };

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSearch();
  };

  return (
    <div className="flex gap-2 max-w-2xl mx-auto">
      <div className="flex-1 relative">
        <input
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="搜索歌曲、歌手、专辑..."
          className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <button
        onClick={handleSearchClick}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          '搜索'
        )}
      </button>
    </div>
  );
};

export default SearchBar;
