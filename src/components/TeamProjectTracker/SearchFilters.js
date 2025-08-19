import React from 'react';
import { MagnifyingGlassIcon, MapPinIcon, EyeIcon } from "@heroicons/react/24/outline";

const SearchFilters = ({ search, setSearch }) => {
  return (
    <div className="glass-card rounded-xl p-6 mb-8 shadow-lg border border-white/20">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/70 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="nav-pop bg-white/70 hover:bg-white/90 text-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2">
            <MapPinIcon className="w-4 h-4" />
            Location
          </button>
          <button className="nav-pop bg-white/70 hover:bg-white/90 text-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2">
            <EyeIcon className="w-4 h-4" />
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
