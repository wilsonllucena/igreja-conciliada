import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export function useTenant() {
  const { profile } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTenant = async () => {
    if (!profile?.tenant_id) {
      console.log('No tenant_id in profile:', profile);
      setLoading(false);
      return;
    }

    console.log('Fetching tenant for tenant_id:', profile.tenant_id);
    
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching tenant:', error);
      } else {
        console.log('Tenant data fetched:', data);
        setTenant(data);
      }
    } catch (error) {
      console.error('Error fetching tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenant();
  }, [profile?.tenant_id]);

  // Listen for tenant updates to refresh data
  useEffect(() => {
    const handleTenantUpdate = () => {
      fetchTenant();
    };

    window.addEventListener('tenant-updated', handleTenantUpdate);
    return () => window.removeEventListener('tenant-updated', handleTenantUpdate);
  }, []);

  return {
    tenant,
    loading,
    refetch: fetchTenant,
  };
}