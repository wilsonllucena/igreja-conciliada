import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Leader {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'Pastor' | 'Líder de Louvor' | 'Líder de Jovens' | 'Líder Infantil' | 'Diácono' | 'Presbítero';
  permissions: string[];
  tenant_id: string;
  is_available_for_appointments: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export function useLeaders() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchLeaders = async () => {
    if (!profile?.tenant_id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('leaders')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os líderes.",
        variant: "destructive",
      });
    } else {
      setLeaders(data || []);
    }
    setLoading(false);
  };

  const createLeader = async (leaderData: Omit<Leader, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
    if (!profile?.tenant_id) return { error: new Error('Usuário não autenticado') };

    const { data, error } = await supabase
      .from('leaders')
      .insert([{
        ...leaderData,
        tenant_id: profile.tenant_id,
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o líder.",
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Sucesso",
      description: "Líder criado com sucesso!",
    });

    fetchLeaders();
    return { data };
  };

  const createUserForLeader = async (leaderId: string, password: string) => {
    const leader = leaders.find(l => l.id === leaderId);
    if (!leader) return { error: new Error('Líder não encontrado') };

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: leader.email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: leader.name,
            role: 'leader',
            tenant_id: leader.tenant_id
          }
        }
      });

      if (authError) {
        toast({
          title: "Erro",
          description: "Não foi possível criar o usuário.",
          variant: "destructive",
        });
        console.error('Error creating user:', authError);
        return { error: authError };
      }

      if (!authData.user) {
        toast({
          title: "Erro",
          description: "Usuário não foi criado corretamente.",
          variant: "destructive",
        });
        return { error: new Error('Usuário não foi criado') };
      }

      // Update leader with user_id
      const { error: updateError } = await supabase
        .from('leaders')
        .update({ user_id: authData.user.id })
        .eq('id', leaderId);

      if (updateError) {
        toast({
          title: "Erro",
          description: "Não foi possível vincular o usuário ao líder.",
          variant: "destructive",
        });
        return { error: updateError };
      }

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso! O líder deve confirmar o email para acessar o sistema.",
      });

      fetchLeaders();
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

  const updateLeader = async (id: string, leaderData: Partial<Leader>) => {
    const { data, error } = await supabase
      .from('leaders')
      .update(leaderData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o líder.",
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Sucesso",
      description: "Líder atualizado com sucesso!",
    });

    fetchLeaders();
    return { data };
  };

  const deleteLeader = async (id: string) => {
    const { error } = await supabase
      .from('leaders')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o líder.",
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Sucesso",
      description: "Líder deletado com sucesso!",
    });

    fetchLeaders();
    return { data: true };
  };

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchLeaders();
    }
  }, [profile]);

  return {
    leaders,
    loading,
    createLeader,
    updateLeader,
    deleteLeader,
    createUserForLeader,
    refetch: fetchLeaders,
  };
}