import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import { isUser, isMember, isLeader, isEvent, isAppointment } from './type-guards';

// Enhanced error handling for Supabase operations
export class SupabaseError extends Error {
  constructor(
    message: string, 
    public code?: string, 
    public details?: string,
    public hint?: string
  ) {
    super(message);
    this.name = 'SupabaseError';
  }

  static fromPostgrestError(error: PostgrestError): SupabaseError {
    return new SupabaseError(
      error.message,
      error.code,
      error.details,
      error.hint
    );
  }
}

// Generic query builder with better error handling
export async function executeQuery<T>(
  queryBuilder: () => Promise<{ data: T | null, error: PostgrestError | null }>,
  entityName: string
): Promise<T> {
  try {
    const { data, error } = await queryBuilder();
    
    if (error) {
      throw SupabaseError.fromPostgrestError(error);
    }

    if (data === null) {
      throw new SupabaseError(`${entityName} não encontrado`);
    }

    return data;
  } catch (error) {
    if (error instanceof SupabaseError) {
      throw error;
    }
    throw new SupabaseError(
      `Erro ao consultar ${entityName}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

// Optimized queries with select specific fields
export const optimizedQueries = {
  // Get user profile with minimal fields
  getUserProfile: async (userId: string) => {
    return executeQuery(
      () => supabase
        .from('profiles')
        .select('id, name, email, role, tenant_id')
        .eq('id', userId)
        .single(),
      'Perfil do usuário'
    );
  },

  // Get members with pagination and search
  getMembers: async (tenantId: string, options: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: 'active' | 'inactive';
  } = {}) => {
    let query = supabase
      .from('members')
      .select('id, name, email, phone, status, created_at')
      .eq('tenant_id', tenantId);

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
    }

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    return executeQuery(
      () => query.order('created_at', { ascending: false }),
      'Membros'
    );
  },

  // Get leaders available for appointments
  getAvailableLeaders: async (tenantId: string) => {
    return executeQuery(
      () => supabase
        .from('leaders')
        .select('id, name, email, type, is_available_for_appointments')
        .eq('tenant_id', tenantId)
        .eq('is_available_for_appointments', true)
        .order('name'),
      'Líderes disponíveis'
    );
  },

  // Get upcoming events (public or for tenant)
  getUpcomingEvents: async (tenantId?: string, isPublic = false) => {
    let query = supabase
      .from('events')
      .select('id, title, description, scheduled_at, location, is_public, current_attendees, max_attendees')
      .gte('scheduled_at', new Date().toISOString());

    if (isPublic) {
      query = query.eq('is_public', true);
    } else if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    return executeQuery(
      () => query.order('scheduled_at', { ascending: true }).limit(10),
      'Próximos eventos'
    );
  },

  // Get appointments for a specific date range
  getAppointmentsByDateRange: async (
    tenantId: string,
    startDate: string,
    endDate: string,
    leaderId?: string
  ) => {
    let query = supabase
      .from('appointments')
      .select(`
        id, title, scheduled_at, duration, status,
        leaders:leader_id (id, name),
        members:member_id (id, name)
      `)
      .eq('tenant_id', tenantId)
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate);

    if (leaderId) {
      query = query.eq('leader_id', leaderId);
    }

    return executeQuery(
      () => query.order('scheduled_at', { ascending: true }),
      'Agendamentos'
    );
  },

  // Get tenant statistics
  getTenantStats: async (tenantId: string) => {
    const [membersCount, leadersCount, eventsCount, appointmentsCount] = await Promise.all([
      supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'active'),
      
      supabase
        .from('leaders')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId),
      
      supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('scheduled_at', new Date().toISOString()),
      
      supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('scheduled_at', new Date().toISOString())
    ]);

    return {
      activeMembers: membersCount.count || 0,
      leaders: leadersCount.count || 0,
      upcomingEvents: eventsCount.count || 0,
      upcomingAppointments: appointmentsCount.count || 0
    };
  }
};

// Bulk operations with transaction-like behavior
export const bulkOperations = {
  // Create multiple members with validation
  createMembers: async (tenantId: string, membersData: any[]) => {
    // Validate all data first
    const validatedMembers = membersData.map(member => {
      if (!isMember({ ...member, id: 'temp', tenantId, createdAt: new Date() })) {
        throw new SupabaseError(`Dados inválidos para membro: ${JSON.stringify(member)}`);
      }
      return { ...member, tenant_id: tenantId };
    });

    return executeQuery(
      () => supabase
        .from('members')
        .insert(validatedMembers)
        .select(),
      'Criação de membros em lote'
    );
  },

  // Update multiple appointments status
  updateAppointmentsStatus: async (
    appointmentIds: string[], 
    status: 'scheduled' | 'completed' | 'cancelled'
  ) => {
    return executeQuery(
      () => supabase
        .from('appointments')
        .update({ status })
        .in('id', appointmentIds)
        .select(),
      'Atualização de status de agendamentos'
    );
  }
};

// Cache utilities for frequently accessed data
export class SupabaseCache {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  static async get<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttlMinutes: number = 5
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: ttlMinutes * 60 * 1000
    });

    return data;
  }

  static clear(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  static clearExpired() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= value.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Real-time subscriptions helpers
export const subscriptions = {
  // Subscribe to tenant-specific table changes
  subscribeToTenantTable: <T>(
    tableName: string,
    tenantId: string,
    onUpdate: (payload: T) => void,
    onError?: (error: Error) => void
  ) => {
    return supabase
      .channel(`${tableName}_${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload) => onUpdate(payload as T)
      )
      .on('error', (error) => {
        console.error(`Subscription error for ${tableName}:`, error);
        onError?.(new Error(`Erro na subscrição: ${error.message}`));
      })
      .subscribe();
  },

  // Subscribe to user-specific changes
  subscribeToUserChanges: (
    userId: string,
    onUpdate: (payload: any) => void
  ) => {
    return supabase
      .channel(`user_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        onUpdate
      )
      .subscribe();
  }
};
