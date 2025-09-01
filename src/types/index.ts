export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'leader' | 'member';
  tenantId: string;
  createdAt: Date;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: Date;
  groups: string[];
  tenantId: string;
  status: 'active' | 'inactive';
  joinedAt: Date;
}

export interface Leader {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'Pastor' | 'Líder de Louvor' | 'Líder de Jovens' | 'Líder Infantil' | 'Diácono' | 'Presbítero';
  permissions: string[];
  tenantId: string;
  isAvailableForAppointments: boolean;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  leaderId: string;
  memberId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  visitHistory?: string;
  tenantId: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  scheduledAt: Date;
  location: string;
  banner?: string;
  speakers: string[];
  maxAttendees?: number;
  currentAttendees: number;
  requiresPayment: boolean;
  price?: number;
  isPublic: boolean;
  tenantId: string;
  createdAt: Date;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  registeredAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  createdAt: Date;
}