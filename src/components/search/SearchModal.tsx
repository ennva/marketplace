import React, { useState, useEffect } from 'react';
import { X, Search as SearchIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { DigitalAsset } from '../../types';
import { AssetCard } from '../AssetCard';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DigitalAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    async function searchAssets() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
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
          .or(`
            title.ilike.%${debouncedQuery}%,
            description.ilike.%${debouncedQuery}%
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        const formattedResults = data.map(asset => ({
          ...asset,
          seller: {
            id: asset.seller.id,
            name: asset.seller.name,
            email: '', // We don't expose email in search results
            avatar: asset.seller.avatar_url,
            rating: asset.seller.rating,
            verified: asset.seller.verified,
            joinedAt: new Date(asset.seller.joined_at)
          },
          createdAt: new Date(asset.created_at),
          trafficStats: {
            monthlyVisitors: asset.monthly_visitors || 0,
            pageViews: asset.page_views || 0
          }
        }));

        setResults(formattedResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }

    searchAssets();
  }, [debouncedQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 sm:p-8">
      <div className="bg-white rounded-lg w-full max-w-3xl mt-16 relative">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <SearchIcon className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search digital assets..."
              className="ml-2 flex-1 outline-none text-lg"
              autoFocus
            />
            <button
              onClick={onClose}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-8 text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Start typing to search...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}