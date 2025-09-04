import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Event, EventSchema } from '@/types';
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';

// Database insert type
type EventInsert = Database['public']['Tables']['events']['Insert'];

// Zod schema for event creation/update with database field names
const EventCreateSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  scheduled_at: z.string().datetime("Data deve estar em formato ISO"),
  location: z.string().min(1, "Local é obrigatório"),
  banner: z.string().optional(),
  speakers: z.array(z.string()).default([]),
  max_attendees: z.number().positive().optional(),
  current_attendees: z.number().nonnegative().default(0),
  requires_payment: z.boolean().default(false),
  price: z.number().nonnegative().optional(),
  is_public: z.boolean().default(true),
  tenant_id: z.string()
});

type EventCreate = z.infer<typeof EventCreateSchema>;

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const fetchEvents = useCallback(async () => {
    if (!profile?.tenant_id) return;

    console.log('fetchEvents - tenant_id:', profile.tenant_id);
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('fetchEvents error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos.",
        variant: "destructive",
      });
    } else {
      console.log('fetchEvents success - events found:', data?.length || 0);
      setEvents(data || []);
    }
    setLoading(false);
  }, [profile?.tenant_id]);

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

  const createEvent = async (eventData: Omit<EventCreate, 'tenant_id'>, bannerFile?: File) => {
    if (!profile?.tenant_id) return { error: new Error('Usuário não autenticado') };

    try {
      // Validate data with Zod
      const validatedData = EventCreateSchema.parse({
        ...eventData,
        tenant_id: profile.tenant_id,
        current_attendees: 0,
      });

      console.log('createEvent - validated data:', validatedData);

      const { data, error } = await supabase
        .from('events')
        .insert([validatedData as EventInsert])
        .select()
        .single();

      if (error) throw error;

      console.log('createEvent success - event created:', data);

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
      
      console.error('createEvent error:', validationError);
      toast({
        title: "Erro",
        description: "Não foi possível criar o evento.",
        variant: "destructive",
      });
      return { error: validationError };
    }
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
  }, [profile?.tenant_id, fetchEvents]);

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