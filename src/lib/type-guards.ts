import { 
  UserSchema, 
  MemberSchema, 
  LeaderSchema, 
  AppointmentSchema, 
  EventSchema, 
  EventRegistrationSchema,
  TenantSchema 
} from '@/types';
import { z } from 'zod';

// Type guard utility function
function createTypeGuard<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): data is T => {
    try {
      schema.parse(data);
      return true;
    } catch {
      return false;
    }
  };
}

// Type guards for all main entities
export const isUser = createTypeGuard(UserSchema);
export const isMember = createTypeGuard(MemberSchema);
export const isLeader = createTypeGuard(LeaderSchema);
export const isAppointment = createTypeGuard(AppointmentSchema);
export const isEvent = createTypeGuard(EventSchema);
export const isEventRegistration = createTypeGuard(EventRegistrationSchema);
export const isTenant = createTypeGuard(TenantSchema);

// Utility functions for safe data parsing
export function safeParseUser(data: unknown) {
  return UserSchema.safeParse(data);
}

export function safeParseMember(data: unknown) {
  return MemberSchema.safeParse(data);
}

export function safeParseLeader(data: unknown) {
  return LeaderSchema.safeParse(data);
}

export function safeParseAppointment(data: unknown) {
  return AppointmentSchema.safeParse(data);
}

export function safeParseEvent(data: unknown) {
  return EventSchema.safeParse(data);
}

export function safeParseEventRegistration(data: unknown) {
  return EventRegistrationSchema.safeParse(data);
}

export function safeParseTenant(data: unknown) {
  return TenantSchema.safeParse(data);
}

// Array validation helpers
export function isUserArray(data: unknown): data is ReturnType<typeof UserSchema.parse>[] {
  return Array.isArray(data) && data.every(item => isUser(item));
}

export function isMemberArray(data: unknown): data is ReturnType<typeof MemberSchema.parse>[] {
  return Array.isArray(data) && data.every(item => isMember(item));
}

export function isLeaderArray(data: unknown): data is ReturnType<typeof LeaderSchema.parse>[] {
  return Array.isArray(data) && data.every(item => isLeader(item));
}

export function isAppointmentArray(data: unknown): data is ReturnType<typeof AppointmentSchema.parse>[] {
  return Array.isArray(data) && data.every(item => isAppointment(item));
}

export function isEventArray(data: unknown): data is ReturnType<typeof EventSchema.parse>[] {
  return Array.isArray(data) && data.every(item => isEvent(item));
}

// Validation helpers with error messages
export function validateAndParseUser(data: unknown) {
  const result = safeParseUser(data);
  if (!result.success) {
    const errorMessages = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    ).join(', ');
    throw new Error(`Dados de usuário inválidos: ${errorMessages}`);
  }
  return result.data;
}

export function validateAndParseMember(data: unknown) {
  const result = safeParseMember(data);
  if (!result.success) {
    const errorMessages = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    ).join(', ');
    throw new Error(`Dados de membro inválidos: ${errorMessages}`);
  }
  return result.data;
}

export function validateAndParseLeader(data: unknown) {
  const result = safeParseLeader(data);
  if (!result.success) {
    const errorMessages = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    ).join(', ');
    throw new Error(`Dados de líder inválidos: ${errorMessages}`);
  }
  return result.data;
}

export function validateAndParseEvent(data: unknown) {
  const result = safeParseEvent(data);
  if (!result.success) {
    const errorMessages = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    ).join(', ');
    throw new Error(`Dados de evento inválidos: ${errorMessages}`);
  }
  return result.data;
}

export function validateAndParseAppointment(data: unknown) {
  const result = safeParseAppointment(data);
  if (!result.success) {
    const errorMessages = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    ).join(', ');
    throw new Error(`Dados de agendamento inválidos: ${errorMessages}`);
  }
  return result.data;
}

// Runtime environment validation
export function isValidEnvironment(env: string): env is 'development' | 'test' | 'production' {
  return ['development', 'test', 'production'].includes(env);
}

// Database field validation helpers
export function hasRequiredSupabaseFields(data: any): boolean {
  return data && 
    typeof data.id === 'string' && 
    typeof data.created_at === 'string' &&
    typeof data.updated_at === 'string';
}

// Generic validation for API responses
export function isSupabaseResponse<T>(data: unknown, validator: (item: unknown) => item is T): data is T[] {
  return Array.isArray(data) && data.every(validator);
}
