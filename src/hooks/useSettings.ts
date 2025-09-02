import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

export interface UserSettings {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'leader' | 'member';
}

export interface ChurchSettings {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  slug?: string;
}

export function useSettings() {
  const { profile, user } = useAuth();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [churchSettings, setChurchSettings] = useState<ChurchSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    if (!profile || !user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('Fetching settings for profile:', profile);

      // Get user settings from profile
      setUserSettings({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
      });

      // Get church settings if user is admin or leader
      if (profile.role === 'admin' || profile.role === 'leader') {
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profile.tenant_id)
          .maybeSingle();

        if (tenantError) {
          console.error('Error fetching tenant:', tenantError);
          setError(`Erro ao carregar dados da igreja: ${tenantError.message}`);
        } else if (tenantData) {
          console.log('Church settings loaded:', tenantData);
          setChurchSettings({
            id: tenantData.id,
            name: tenantData.name,
            address: tenantData.address,
            phone: tenantData.phone,
            email: tenantData.email,
            website: tenantData.website,
            logo: tenantData.logo,
            slug: tenantData.slug,
          });
        } else {
          console.log('No tenant data found');
          setChurchSettings(null);
        }
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      setError(`Erro ao carregar configurações: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      return { success: true };
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || "Erro ao alterar senha");
      return { success: false, error: error.message };
    }
  };

  const updateUserProfile = async (data: Partial<UserSettings>) => {
    if (!profile) return { success: false, error: 'Perfil não encontrado' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      // Update local state
      setUserSettings(prev => prev ? { ...prev, ...data } : null);

      toast.success("Perfil atualizado com sucesso!");
      return { success: true };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || "Erro ao atualizar perfil");
      return { success: false, error: error.message };
    }
  };

  const updateChurchSettings = async (data: Partial<ChurchSettings>) => {
    if (!profile || profile.role !== 'admin' || !churchSettings) {
      return { success: false, error: 'Você não tem permissão para alterar os dados da igreja' };
    }

    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', churchSettings.id);

      if (error) throw error;

      // Update local state
      setChurchSettings(prev => prev ? { ...prev, ...data } : null);

      toast.success("Dados da igreja atualizados com sucesso!");
      return { success: true };
    } catch (error: any) {
      console.error('Error updating church settings:', error);
      toast.error(error.message || "Erro ao atualizar dados da igreja");
      return { success: false, error: error.message };
    }
  };

  const uploadChurchLogo = async (file: File) => {
    console.log('🚀 Starting logo upload process...');
    console.log('Profile data:', profile);
    console.log('File info:', { name: file.name, size: file.size, type: file.type });
    
    if (!profile) {
      console.error('❌ No profile found');
      toast.error('Usuário não autenticado');
      return { success: false, url: null };
    }
    
    if (profile.role !== 'admin') {
      console.error('❌ User is not admin:', profile.role);
      toast.error('Sem permissão para alterar logo da igreja');
      return { success: false, url: null };
    }

    console.log('✅ User is admin, proceeding with upload...');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.tenant_id}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('📁 Upload details:', { fileName, filePath, tenantId: profile.tenant_id });

      // Upload file to storage
      console.log('📤 Uploading to Supabase storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('church-logos')
        .upload(filePath, file, { upsert: true });

      console.log('Upload result:', { uploadData, uploadError });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ File uploaded successfully');

      // Get public URL
      console.log('🔗 Getting public URL...');
      const { data: { publicUrl } } = supabase.storage
        .from('church-logos')
        .getPublicUrl(filePath);

      console.log('📎 Public URL:', publicUrl);

      // Update tenant with logo URL
      console.log('💾 Updating tenant record...');
      const { data: updateData, error: updateError } = await supabase
        .from('tenants')
        .update({ logo: publicUrl })
        .eq('id', profile.tenant_id);

      console.log('Update result:', { updateData, updateError });

      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw updateError;
      }

      console.log('✅ Logo upload completed successfully!');
      toast.success('Logo da igreja atualizada com sucesso!');
      await fetchSettings();
      
      // Force tenant data refresh to update logo throughout the app
      window.dispatchEvent(new CustomEvent('tenant-updated'));
      
      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('💥 Error in logo upload process:', error);
      toast.error(`Erro ao fazer upload da logo: ${error.message || 'Erro desconhecido'}`);
      return { success: false, url: null };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [profile?.id, profile?.tenant_id]);

  return {
    userSettings,
    churchSettings,
    loading,
    error,
    updatePassword,
    updateUserProfile,
    updateChurchSettings,
    uploadChurchLogo,
    refetch: fetchSettings,
  };
}