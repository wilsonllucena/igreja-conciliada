import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  leader_id: string;
  member_id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  visit_history?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchAppointments = async () => {
    if (!profile?.tenant_id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('scheduled_at', { ascending: true });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>) => {
    if (!profile?.tenant_id) return { error: new Error('Usuário não autenticado') };

    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        ...appointmentData,
        tenant_id: profile.tenant_id,
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Sucesso",
      description: "Agendamento criado com sucesso!",
    });

    fetchAppointments();
    return { data };
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    const { data, error } = await supabase
      .from('appointments')
      .update(appointmentData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento.",
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Sucesso",
      description: "Agendamento atualizado com sucesso!",
    });

    fetchAppointments();
    return { data };
  };

  const deleteAppointment = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o agendamento.",
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Sucesso",
      description: "Agendamento deletado com sucesso!",
    });

    fetchAppointments();
    return { data: true };
  };

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchAppointments();
    }
  }, [profile]);

  return {
    appointments,
    loading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch: fetchAppointments,
  };
}