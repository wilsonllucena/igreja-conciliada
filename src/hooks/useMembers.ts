import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Member, MemberSchema } from '@/types';
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';

// Database insert type
type MemberInsert = Database['public']['Tables']['members']['Insert'];

// Zod schema for member creation/update with database field names  
const MemberCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  groups: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
  tenant_id: z.string()
});

type MemberCreate = z.infer<typeof MemberCreateSchema>;

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchMembers = useCallback(async () => {
    if (!profile?.tenant_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setMembers(data || []);
    } catch (error) {
      console.error('fetchMembers error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [profile?.tenant_id]);

  const createMember = async (memberData: Omit<MemberCreate, 'tenant_id'>) => {
    if (!profile?.tenant_id) return { error: new Error('Usuário não autenticado') };

    try {
      // Validate data with Zod
      const validatedData = MemberCreateSchema.parse({
        ...memberData,
        tenant_id: profile.tenant_id,
      });

      const { data, error } = await supabase
        .from('members')
        .insert([validatedData as MemberInsert])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Membro criado com sucesso!",
      });

      fetchMembers();
      return { data };
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorMessages = validationError.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        toast({
          title: "Erro de Validação",
          description: errorMessages,
          variant: "destructive",
        });
        return { error: validationError };
      }
      
      console.error('createMember error:', validationError);
      toast({
        title: "Erro",
        description: "Não foi possível criar o membro.",
        variant: "destructive",
      });
      return { error: validationError };
    }
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
  }, [profile?.tenant_id, fetchMembers]);

  return {
    members,
    loading,
    createMember,
    updateMember,
    deleteMember,
    refetch: fetchMembers,
  };
}