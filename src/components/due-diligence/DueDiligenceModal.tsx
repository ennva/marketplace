import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import type { DigitalAsset } from '../../types';

interface VerificationItem {
  id: string;
  type: 'analytics' | 'financial' | 'legal' | 'technical';
  title: string;
  description: string;
  status: 'pending' | 'verified' | 'rejected';
  notes: string;
}

interface DueDiligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: DigitalAsset;
}

const defaultVerificationItems = [
  {
    type: 'analytics',
    title: 'Traffic Analytics Verification',
    description: 'Verify traffic sources, user engagement metrics, and growth trends.',
  },
  {
    type: 'financial',
    title: 'Revenue Verification',
    description: 'Verify revenue claims, payment processors, and financial statements.',
  },
  {
    type: 'legal',
    title: 'Legal Documentation',
    description: 'Review terms of service, privacy policy, and other legal documents.',
  },
  {
    type: 'technical',
    title: 'Technical Audit',
    description: 'Review codebase, infrastructure, and technical documentation.',
  }
];

export function DueDiligenceModal({ isOpen, onClose, asset }: DueDiligenceModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      loadOrCreateRequest();
    }
  }, [isOpen, user]);

  const loadOrCreateRequest = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Check for existing request
      const { data: existingRequest } = await supabase
        .from('due_diligence_requests')
        .select('id')
        .match({
          asset_id: asset.id,
          buyer_id: user.id
        })
        .single();

      if (existingRequest) {
        setRequestId(existingRequest.id);
        await loadVerificationItems(existingRequest.id);
      } else {
        // Create new request with default items
        const { data: newRequest, error: requestError } = await supabase
          .from('due_diligence_requests')
          .insert({
            asset_id: asset.id,
            buyer_id: user.id,
            status: 'pending'
          })
          .select()
          .single();

        if (requestError) throw requestError;

        // Create verification items
        const { error: itemsError } = await supabase
          .from('verification_items')
          .insert(
            defaultVerificationItems.map(item => ({
              request_id: newRequest.id,
              ...item,
              status: 'pending'
            }))
          );

        if (itemsError) throw itemsError;

        setRequestId(newRequest.id);
        await loadVerificationItems(newRequest.id);
      }
    } catch (error) {
      toast.error('Failed to initialize due diligence request');
    } finally {
      setLoading(false);
    }
  };

  const loadVerificationItems = async (reqId: string) => {
    const { data, error } = await supabase
      .from('verification_items')
      .select('*')
      .eq('request_id', reqId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Failed to load verification items');
    } else {
      setVerificationItems(data || []);
    }
  };

  const updateItemStatus = async (itemId: string, status: 'verified' | 'rejected', notes: string) => {
    try {
      const { error } = await supabase
        .from('verification_items')
        .update({ status, notes, updated_at: new Date().toISOString() })
        .eq('id', itemId);

      if (error) throw error;

      setVerificationItems(current =>
        current.map(item =>
          item.id === itemId ? { ...item, status, notes } : item
        )
      );

      toast.success(`Item marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update item status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col relative">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Due Diligence Request</h2>
            <p className="text-sm text-gray-500">{asset.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {verificationItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    {getStatusIcon(item.status)}
                  </div>

                  {item.status === 'pending' && user?.id === asset.seller.id && (
                    <div className="space-y-3">
                      <textarea
                        placeholder="Add verification notes..."
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateItemStatus(item.id, 'verified', 'Verified and approved')}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => updateItemStatus(item.id, 'rejected', 'Rejected - requires additional information')}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {item.notes && (
                    <div className="text-sm text-gray-600 bg-white p-3 rounded-md">
                      <p className="font-medium">Notes:</p>
                      <p>{item.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}