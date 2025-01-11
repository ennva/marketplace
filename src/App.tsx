import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { AssetCard } from './components/AssetCard';
import type { DigitalAsset, AssetFilters } from './types';
import { supabase } from './lib/supabase';
import { toast } from 'react-hot-toast';

function App() {
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [filters, setFilters] = useState<AssetFilters>({
    sortBy: 'date'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, [filters]); // Re-fetch when filters change

  // Listen for category filter events from Header
  useEffect(() => {
    const handleFilterAssets = (event: CustomEvent<{ filters: AssetFilters }>) => {
      setFilters(prevFilters => ({
        ...prevFilters,
        ...event.detail.filters
      }));
    };

    window.addEventListener('filterAssets', handleFilterAssets as EventListener);
    return () => {
      window.removeEventListener('filterAssets', handleFilterAssets as EventListener);
    };
  }, []);

  const formatAsset = (asset: any): DigitalAsset => ({
    id: asset.id,
    title: asset.title,
    description: asset.description,
    category: asset.category,
    price: asset.price,
    monthlyRevenue: asset.monthly_revenue,
    monthlyProfit: asset.monthly_profit,
    trafficStats: {
      monthlyVisitors: asset.monthly_visitors || 0,
      pageViews: asset.page_views || 0
    },
    createdAt: new Date(asset.created_at),
    seller: {
      id: asset.seller.id,
      name: asset.seller.name,
      email: '', // We don't expose email in listings
      avatar: asset.seller.avatar_url,
      rating: asset.seller.rating,
      verified: asset.seller.verified,
      joinedAt: new Date(asset.seller.joined_at)
    },
    status: asset.status
  });

  const loadAssets = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('assets')
        .select(`
          *,
          seller:profiles(
            id,
            name,
            avatar_url,
            rating,
            verified,
            joined_at
          )
        `)
        .eq('status', 'active');

      // Apply category filter
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      // Apply price range filters
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      // Apply revenue filter
      if (filters.minRevenue) {
        query = query.gte('monthly_revenue', filters.minRevenue);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price':
          query = query.order('price', { ascending: false });
          break;
        case 'revenue':
          query = query.order('monthly_revenue', { ascending: false, nullsLast: true });
          break;
        case 'date':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedAssets = data.map(formatAsset);
      setAssets(formattedAssets);
    } catch (error) {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCategorySelect={(category) => setFilters(prev => ({ ...prev, category }))} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-1">
            <Filters filters={filters} onFilterChange={setFilters} />
          </div>
          
          <div className="col-span-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading assets...</p>
              </div>
            ) : assets.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {assets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No assets found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;