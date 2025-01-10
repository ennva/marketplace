import React, { useState } from 'react';
import { BarChart2, Users, DollarSign, MessageCircle, FileSearch } from 'lucide-react';
import type { DigitalAsset } from '../types';
import { PurchaseModal } from './transaction/PurchaseModal';
import { ChatModal } from './chat/ChatModal';
import { DueDiligenceModal } from './due-diligence/DueDiligenceModal';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface AssetCardProps {
  asset: DigitalAsset;
}

export function AssetCard({ asset }: AssetCardProps) {
  const { user } = useAuth();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isDueDiligenceModalOpen, setIsDueDiligenceModalOpen] = useState(false);

  const handlePurchaseClick = () => {
    if (!user) {
      toast.error('Please sign in to purchase assets');
      return;
    }
    if (user.id === asset.seller.id) {
      toast.error('You cannot purchase your own asset');
      return;
    }
    setIsPurchaseModalOpen(true);
  };

  const handleChatClick = () => {
    if (!user) {
      toast.error('Please sign in to message sellers');
      return;
    }
    if (user.id === asset.seller.id) {
      toast.error('You cannot message yourself');
      return;
    }
    setIsChatModalOpen(true);
  };

  const handleDueDiligenceClick = () => {
    if (!user) {
      toast.error('Please sign in to request due diligence');
      return;
    }
    if (user.id === asset.seller.id) {
      toast.error('You cannot perform due diligence on your own asset');
      return;
    }
    setIsDueDiligenceModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{asset.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{asset.category}</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ${asset.price.toLocaleString()}
            </span>
          </div>
          
          <p className="mt-4 text-gray-600 text-sm line-clamp-2">{asset.description}</p>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <span className="ml-2 text-sm text-gray-600">
                ${asset.monthlyRevenue?.toLocaleString()}/mo
              </span>
            </div>
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 text-gray-400" />
              <span className="ml-2 text-sm text-gray-600">
                {asset.trafficStats?.monthlyVisitors.toLocaleString()} visits/mo
              </span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="ml-2 text-sm text-gray-600">
                {asset.seller.rating.toFixed(1)} rating
              </span>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={asset.seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(asset.seller.name)}`}
                alt={asset.seller.name}
                className="h-8 w-8 rounded-full"
              />
              <span className="ml-2 text-sm font-medium text-gray-900">{asset.seller.name}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDueDiligenceClick}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <FileSearch className="h-5 w-5" />
              </button>
              <button
                onClick={handleChatClick}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <button
                onClick={handlePurchaseClick}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      </div>

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        asset={asset}
      />

      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        asset={asset}
        otherUser={asset.seller}
      />

      <DueDiligenceModal
        isOpen={isDueDiligenceModalOpen}
        onClose={() => setIsDueDiligenceModalOpen(false)}
        asset={asset}
      />
    </>
  );
}