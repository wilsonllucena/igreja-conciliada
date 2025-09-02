import { z } from 'zod';

// User Schema
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'leader', 'member']),
  tenantId: z.string(),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Member Schema
export const MemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string().optional(),
  dateOfBirth: z.date().optional(),
  groups: z.array(z.string()),
  tenantId: z.string(),
  status: z.enum(['active', 'inactive']),
  joinedAt: z.date(),
});

export type Member = z.infer<typeof MemberSchema>;

// Leader Schema
export const LeaderSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  type: z.enum(['Pastor', 'Líder de Louvor', 'Líder de Jovens', 'Líder Infantil', 'Diácono', 'Presbítero']),
  permissions: z.array(z.string()),
  tenantId: z.string(),
  isAvailableForAppointments: z.boolean(),
  createdAt: z.date(),
});

export type Leader = z.infer<typeof LeaderSchema>;

// Appointment Schema
export const AppointmentSchema = z.object({
  id: z.string(),
  leaderId: z.string(),
  memberId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  scheduledAt: z.date(),
  duration: z.number().positive(), // in minutes
  status: z.enum(['scheduled', 'completed', 'cancelled']),
  visitHistory: z.string().optional(),
  tenantId: z.string(),
  createdAt: z.date(),
});

export type Appointment = z.infer<typeof AppointmentSchema>;

// Event Schema
export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  scheduledAt: z.date(),
  location: z.string(),
  banner: z.string().optional(),
  speakers: z.array(z.string()),
  maxAttendees: z.number().positive().optional(),
  currentAttendees: z.number().nonnegative(),
  requiresPayment: z.boolean(),
  price: z.number().nonnegative().optional(),
  isPublic: z.boolean(),
  tenantId: z.string(),
  createdAt: z.date(),
});

export type Event = z.infer<typeof EventSchema>;

// Event Registration Schema
export const EventRegistrationSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  attendeeName: z.string(),
  attendeeEmail: z.string().email(),
  attendeePhone: z.string(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded']).optional(),
  registeredAt: z.date(),
});

export type EventRegistration = z.infer<typeof EventRegistrationSchema>;

// Tenant Schema
export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  createdAt: z.date(),
});

export type Tenant = z.infer<typeof TenantSchema>;