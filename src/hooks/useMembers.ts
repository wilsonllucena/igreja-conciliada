import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  date_of_birth?: string;
  groups: string[];
  tenant_id: string;
  status: 'active' | 'inactive';
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchMembers = async () => {
    if (!profile?.tenant_id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros.",
        variant: "destructive",
      });
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  };

  const createMember = async (memberData: Omit<Member, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
    if (!profile?.tenant_id) return { error: new Error('Usuário não autenticado') };

    const { data, error } = await supabase
      .from('members')
      .insert([{
        ...memberData,
        tenant_id: profile.tenant_id,
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o membro.",
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Sucesso",
      description: "Membro criado com sucesso!",
    });

    fetchMembers();
    return { data };
  };

  const updateMember = async (id: string, memberData: Partial<Member>) => {
    const { data, error } = await supabase
      .from('members')
      .update(memberData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o membro.",
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Sucesso",
      description: "Membro atualizado com sucesso!",
    });

    fetchMembers();
    return { data };
  };

  const deleteMember = async (id: string) => {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o membro.",
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Sucesso",
      description: "Membro deletado com sucesso!",
    });

    fetchMembers();
    return { data: true };
  };

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchMembers();
    }
  }, [profile]);

  return {
    members,
    loading,
    createMember,
    updateMember,
    deleteMember,
    refetch: fetchMembers,
  };
}