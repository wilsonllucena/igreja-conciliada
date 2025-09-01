import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'leader' | 'member';
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchUsers = async () => {
    if (!profile?.tenant_id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const createUser = async (userData: { name: string; email: string; password: string; role: 'admin' | 'leader' | 'member'; phone?: string }) => {
    if (!profile?.tenant_id) return { error: new Error('Usuário não autenticado') };

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: userData.name,
            role: userData.role,
            tenant_id: profile.tenant_id
          }
        }
      });

      if (authError) {
        toast({
          title: "Erro",
          description: "Não foi possível criar o usuário.",
          variant: "destructive",
        });
        return { error: authError };
      }

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso! Um email de confirmação foi enviado.",
      });

      fetchUsers();
      return { data: authData.user };
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar usuário.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Sucesso",
      description: "Usuário atualizado com sucesso!",
    });

    fetchUsers();
    return { data };
  };

  const deleteUser = async (id: string) => {
    // Note: We don't actually delete from auth.users as that's managed by Supabase
    // We only update the profile status or remove from profiles table
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o usuário.",
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Sucesso",
      description: "Usuário removido com sucesso!",
    });

    fetchUsers();
    return { data: true };
  };

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchUsers();
    }
  }, [profile]);

  return {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
}