import React from 'react';
import { Filter } from 'lucide-react';
import type { AssetFilters } from '../types';

interface FiltersProps {
  filters: AssetFilters;
  onFilterChange: (filters: AssetFilters) => void;
}

export function Filters({ filters, onFilterChange }: FiltersProps) {
  const handleFilterChange = (key: keyof AssetFilters, value: any) => {
    // Clear the value if it's empty
    const newValue = value === '' ? undefined : value;
    onFilterChange({ ...filters, [key]: newValue });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <Filter className="h-5 w-5 text-gray-500" />
        <h2 className="ml-2 text-lg font-medium text-gray-900">Filters</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="website">Websites</option>
            <option value="app">Apps</option>
            <option value="domain">Domains</option>
            <option value="saas">SaaS</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Price Range</label>
          <div className="mt-1 grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Min"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
            />
            <input
              type="number"
              placeholder="Max"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Min Monthly Revenue</label>
          <input
            type="number"
            placeholder="Min Revenue"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={filters.minRevenue || ''}
            onChange={(e) => handleFilterChange('minRevenue', Number(e.target.value))}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Sort By</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={filters.sortBy || 'date'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value as AssetFilters['sortBy'])}
          >
            <option value="date">Most Recent</option>
            <option value="price">Price (High to Low)</option>
            <option value="revenue">Revenue (High to Low)</option>
          </select>
        </div>

        <button
          onClick={() => onFilterChange({ sortBy: 'date' })}
          className="w-full mt-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}