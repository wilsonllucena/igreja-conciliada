import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  location: string;
  banner?: string;
  speakers: string[];
  max_attendees?: number;
  current_attendees: number;
  requires_payment: boolean;
  price?: number;
  is_public: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchEvents = async () => {
    if (!profile?.tenant_id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('scheduled_at', { ascending: true });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos.",
        variant: "destructive",
      });
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const fetchPublicEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_public', true)
      .order('scheduled_at', { ascending: true });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos.",
        variant: "destructive",
      });
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const getEventById = async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { error };
    }

    return { data };
  };

  const uploadBanner = async (file: File, eventId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${eventId}-${Date.now()}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('event-banners')
      .upload(filePath, file);

    if (uploadError) {
      return { error: uploadError };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('event-banners')
      .getPublicUrl(filePath);

    return { data: publicUrl };
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'current_attendees'>, bannerFile?: File) => {
    if (!profile?.tenant_id) return { error: new Error('Usuário não autenticado') };

    const { data, error } = await supabase
      .from('events')
      .insert([{
        ...eventData,
        tenant_id: profile.tenant_id,
        current_attendees: 0,
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o evento.",
        variant: "destructive",
      });
      return { error };
    }

    // Upload banner if provided
    if (bannerFile && data) {
      const bannerResult = await uploadBanner(bannerFile, data.id);
      if (bannerResult.data) {
        await updateEvent(data.id, { banner: bannerResult.data });
      }
    }

    toast({
      title: "Sucesso",
      description: "Evento criado com sucesso!",
    });

    fetchEvents();
    return { data };
  };

  const updateEvent = async (id: string, eventData: Partial<Event>, bannerFile?: File) => {
    // Upload new banner if provided
    if (bannerFile) {
      const bannerResult = await uploadBanner(bannerFile, id);
      if (bannerResult.data) {
        eventData.banner = bannerResult.data;
      }
    }

    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o evento.",
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Sucesso",
      description: "Evento atualizado com sucesso!",
    });

    fetchEvents();
    return { data };
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o evento.",
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Sucesso",
      description: "Evento deletado com sucesso!",
    });

    fetchEvents();
    return { data: true };
  };

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchEvents();
    }
  }, [profile]);

  const getPublicEventLink = (eventId: string) => {
    return `${window.location.origin}/evento/${eventId}`;
  };

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    fetchPublicEvents,
    uploadBanner,
    getPublicEventLink,
    refetch: fetchEvents,
  };
}