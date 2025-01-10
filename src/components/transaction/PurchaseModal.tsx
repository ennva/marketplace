import React, { useState } from 'react';
import { X, AlertCircle, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import type { DigitalAsset } from '../../types';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: DigitalAsset;
}

export function PurchaseModal({ isOpen, onClose, asset }: PurchaseModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!user) {
      toast.error('You must be logged in to make a purchase');
      return;
    }

    if (!agreed) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          asset_id: asset.id,
          buyer_id: user.id,
          seller_id: asset.seller.id,
          amount: asset.price,
          status: 'pending'
        });

      if (transactionError) throw transactionError;

      // Update asset status
      const { error: assetError } = await supabase
        .from('assets')
        .update({ status: 'pending' })
        .eq('id', asset.id);

      if (assetError) throw assetError;

      toast.success('Purchase initiated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to process purchase. Please try again.');
      console.error('Purchase error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Purchase Asset</h2>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{asset.title}</h3>
            <p className="text-2xl font-bold text-indigo-600">
              ${asset.price.toLocaleString()}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
              <div>
                <h4 className="font-medium text-yellow-800">Important Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  This transaction will be held in escrow until both parties confirm the transfer is complete.
                  The marketplace will facilitate the safe transfer of the asset.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the marketplace terms and conditions, including the escrow service agreement
                and transfer protocol.
              </span>
            </label>
          </div>

          <button
            onClick={handlePurchase}
            disabled={loading || !agreed}
            className="w-full flex items-center justify-center bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            {loading ? 'Processing...' : 'Purchase Asset'}
          </button>
        </div>
      </div>
    </div>
  );
}