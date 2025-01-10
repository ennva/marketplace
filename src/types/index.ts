export interface DigitalAsset {
  id: string;
  title: string;
  description: string;
  category: 'website' | 'app' | 'domain' | 'saas';
  price: number;
  monthlyRevenue?: number;
  monthlyProfit?: number;
  trafficStats?: {
    monthlyVisitors: number;
    pageViews: number;
  };
  createdAt: Date;
  seller: User;
  status: 'active' | 'pending' | 'sold';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rating: number;
  verified: boolean;
  joinedAt: Date;
}

export interface AssetFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRevenue?: number;
  sortBy?: 'price' | 'revenue' | 'date';
}

export interface Transaction {
  id: string;
  assetId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}