import React, { useState } from 'react';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { AssetCard } from './components/AssetCard';
import type { DigitalAsset, AssetFilters } from './types';

// Mock data for demonstration
const mockAssets: DigitalAsset[] = [
  {
    id: '1',
    title: 'E-commerce Fashion Store',
    description: 'Established fashion e-commerce store with steady revenue and growing customer base.',
    category: 'website',
    price: 85000,
    monthlyRevenue: 12000,
    monthlyProfit: 4000,
    trafficStats: {
      monthlyVisitors: 25000,
      pageViews: 75000
    },
    createdAt: new Date(),
    seller: {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      rating: 4.8,
      verified: true,
      joinedAt: new Date()
    },
    status: 'active'
  },
  {
    id: '2',
    title: 'Fitness Tracking App',
    description: 'Popular fitness tracking application with premium subscription model.',
    category: 'app',
    price: 120000,
    monthlyRevenue: 18000,
    monthlyProfit: 8000,
    trafficStats: {
      monthlyVisitors: 50000,
      pageViews: 150000
    },
    createdAt: new Date(),
    seller: {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      rating: 4.9,
      verified: true,
      joinedAt: new Date()
    },
    status: 'active'
  }
];

function App() {
  const [filters, setFilters] = useState<AssetFilters>({
    sortBy: 'date'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-1">
            <Filters filters={filters} onFilterChange={setFilters} />
          </div>
          
          <div className="col-span-3">
            <div className="grid grid-cols-1 gap-6">
              {mockAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;