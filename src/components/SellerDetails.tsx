
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SellerDetailsProps {
  sellerId: string;
}

interface SellerProfile {
  id: string;
  full_name: string | null;
  company_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  updated_at?: string;
  created_at?: string;
  role?: string | null;
}

const SellerDetails: React.FC<SellerDetailsProps> = ({ sellerId }) => {
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [sellerProductCount, setSellerProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        setLoading(true);
        // Fetch seller profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sellerId)
          .single();

        if (profileError) {
          console.error('Error fetching seller profile:', profileError);
          return;
        }

        // Fetch seller product count
        const { count, error: countError } = await supabase
          .from('products' as any)
          .select('*', { count: 'exact' })
          .eq('seller_id' as any, sellerId);

        if (countError) {
          console.error('Error fetching seller product count:', countError);
          return;
        }

        setSellerProfile(profileData);
        setSellerProductCount(count || 0);
      } catch (err) {
        console.error('Failed to fetch seller details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerDetails();
  }, [sellerId]);

  if (loading) return <div className="p-4 animate-pulse">Loading seller information...</div>;
  if (!sellerProfile) return null;

  return (
    <div className="bg-white p-4 rounded-md shadow-sm mb-4">
      <h3 className="text-lg font-semibold mb-2">Seller Information</h3>
      <div className="flex items-center mb-2">
        <div className="mr-4">
          <img 
            src={sellerProfile.avatar_url || 'https://via.placeholder.com/50'} 
            alt={sellerProfile.full_name || 'Seller'} 
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>
        <div>
          <p className="font-medium">{sellerProfile.full_name || 'Seller'}</p>
          {sellerProfile.company_name && (
            <p className="text-sm text-gray-600">{sellerProfile.company_name}</p>
          )}
        </div>
      </div>
      {sellerProfile.bio && (
        <p className="text-sm text-gray-700 mb-2">{sellerProfile.bio}</p>
      )}
      <div className="text-sm text-gray-600">
        Products listed: {sellerProductCount}
      </div>
      <button 
        onClick={() => navigate(`/seller/${sellerId}`)}
        className="mt-2 text-sm text-blue-600 hover:underline"
      >
        View Seller Profile
      </button>
    </div>
  );
};

export default SellerDetails;
