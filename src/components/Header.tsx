import React, { useState } from 'react';
import { Search, PlusCircle, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './auth/AuthModal';
import { CreateAssetModal } from './asset/CreateAssetModal';
import { SearchModal } from './search/SearchModal';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export function Header() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateAssetModalOpen, setIsCreateAssetModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">MarketPlace</h1>
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <a href="#" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  Websites
                </a>
                <a href="#" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  Apps
                </a>
                <a href="#" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  Domains
                </a>
                <a href="#" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                  SaaS
                </a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsSearchModalOpen(true)}
                className="p-2 text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md"
              >
                <Search className="h-5 w-5" />
              </button>
              {user ? (
                <>
                  <button 
                    onClick={() => setIsCreateAssetModalOpen(true)}
                    className="flex items-center text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    <span>List Asset</span>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-indigo-600">
                    <Bell className="h-5 w-5" />
                  </button>
                  <div className="relative group">
                    <button className="p-2 text-gray-600 hover:text-indigo-600">
                      <User className="h-5 w-5" />
                    </button>
                    <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl hidden group-hover:block">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md"
                >
                  <User className="h-5 w-5 mr-2" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      
      <CreateAssetModal
        isOpen={isCreateAssetModalOpen}
        onClose={() => setIsCreateAssetModalOpen(false)}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}