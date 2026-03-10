// src/components/Filters/FilterSidebar.tsx
"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface FilterSection {
  title: string;
  options: string[];
  filterKey: string;
}

interface FilterSidebarProps {
  filterSections: FilterSection[];
  activeFilters: Record<string, string | null>;
  onFilterChange: (filterKey: string, value: string | null) => void;
  onClearAllFilters: () => void;
  productCount: number;
}

const FilterAccordionItem: React.FC<{
  title: string;
  options: string[];
  filterKey: string;
  activeFilter: string | null;
  onFilterChange: (filterKey: string, value: string | null) => void;
  defaultOpen?: boolean;
}> = ({
  title,
  options,
  filterKey,
  activeFilter,
  onFilterChange,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleOptionClick = (option: string) => {
    onFilterChange(filterKey, activeFilter === option ? null : option);
  };

  return (
    <div className="border-b border-gray-200 py-4 sm:py-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left group"
      >
        <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
          {title}
        </h3>
        {isOpen ? (
          <ChevronUp
            size={20}
            className="text-gray-400 group-hover:text-gray-600 transition-colors"
          />
        ) : (
          <ChevronDown
            size={20}
            className="text-gray-400 group-hover:text-gray-600 transition-colors"
          />
        )}
      </button>
      {isOpen && (
        <div className="mt-4 space-y-3">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                  activeFilter === option
                    ? "border-black"
                    : "border-gray-300 group-hover:border-gray-500"
                }`}
                onClick={() => handleOptionClick(option)}
              >
                {activeFilter === option && (
                  <div className="w-2.5 h-2.5 bg-black rounded-full" />
                )}
              </div>
              <span
                className={`text-sm transition-colors ${
                  activeFilter === option
                    ? "text-black font-medium"
                    : "text-gray-600 group-hover:text-gray-900"
                }`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </span>
            </label>
          ))}
          {options.length === 0 && (
            <p className="text-xs text-gray-400">No options available.</p>
          )}
        </div>
      )}
    </div>
  );
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filterSections,
  activeFilters,
  onFilterChange,
  onClearAllFilters,
  productCount,
}) => {
  return (
    // Added max-h and overflow-y-auto for scrollable content
    // The max-h value (e.g., 80vh or calc(100vh - offset)) should be adjusted
    // based on your header height and the sticky top offset of the sidebar.
    // Assuming a sticky top offset of top-16 (4rem or 64px) and some header height.
    <aside
      className="space-y-5 bg-slate-50 p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm overflow-y-auto max-h-[calc(100vh-8rem)]"
      // 8rem is an example: 4rem for sticky-top + 4rem for header/margins. Adjust as needed.
    >
      <div className="flex justify-between items-center pb-2 border-b border-gray-300">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Filters
        </h2>
        <button
          onClick={onClearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear All
        </button>
      </div>
      <div className="text-sm text-gray-600">
        Showing {productCount} products
      </div>
      {filterSections.map((section, index) => (
        <FilterAccordionItem
          key={section.title}
          title={section.title}
          options={section.options}
          filterKey={section.filterKey}
          activeFilter={activeFilters[section.filterKey] || null}
          onFilterChange={onFilterChange}
          defaultOpen={index < 3}
        />
      ))}
    </aside>
  );
};

export default FilterSidebar;
