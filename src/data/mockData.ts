import { Member, Leader, Appointment, Event, User, Tenant } from '@/types';

export const mockTenant: Tenant = {
  id: '1',
  name: 'Igreja Conciliada',
  slug: 'igreja-conciliada',
  address: 'Rua das Flores, 123 - Centro',
  phone: '(11) 9999-9999',
  email: 'contato@igrejaconciliada.com.br',
  website: 'www.igrejaconciliada.com.br',
  createdAt: new Date('2024-01-01')
};

export const mockUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao@igrejaconciliada.com.br',
  role: 'admin',
  tenantId: '1',
  createdAt: new Date('2024-01-01')
};

export const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 9999-1111',
    address: 'Rua A, 123',
    dateOfBirth: new Date('1985-05-15'),
    groups: ['Louvor', 'Jovens'],
    tenantId: '1',
    status: 'active',
    joinedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Pedro Oliveira',
    email: 'pedro@email.com',
    phone: '(11) 9999-2222',
    address: 'Rua B, 456',
    dateOfBirth: new Date('1990-08-22'),
    groups: ['Jovens'],
    tenantId: '1',
    status: 'active',
    joinedAt: new Date('2024-02-01')
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana@email.com',
    phone: '(11) 9999-3333',
    address: 'Rua C, 789',
    dateOfBirth: new Date('1978-12-10'),
    groups: ['Infantil'],
    tenantId: '1',
    status: 'active',
    joinedAt: new Date('2024-01-20')
  }
];

export const mockLeaders: Leader[] = [
  {
    id: '1',
    name: 'Pastor João Silva',
    email: 'pastor@igrejaconciliada.com.br',
    phone: '(11) 9999-0001',
    type: 'Pastor',
    permissions: ['manage_all', 'view_reports', 'schedule_appointments'],
    tenantId: '1',
    isAvailableForAppointments: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Carlos Mendes',
    email: 'carlos@email.com',
    phone: '(11) 9999-0002',
    type: 'Líder de Louvor',
    permissions: ['manage_worship', 'schedule_appointments'],
    tenantId: '1',
    isAvailableForAppointments: true,
    createdAt: new Date('2024-01-05')
  },
  {
    id: '3',
    name: 'Julia Lima',
    email: 'julia@email.com',
    phone: '(11) 9999-0003',
    type: 'Líder de Jovens',
    permissions: ['manage_youth', 'schedule_appointments'],
    tenantId: '1',
    isAvailableForAppointments: true,
    createdAt: new Date('2024-01-10')
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    leaderId: '1',
    memberId: '1',
    title: 'Aconselhamento Pastoral',
    description: 'Conversa sobre questões pessoais e espirituais',
    scheduledAt: new Date('2024-01-20T14:00:00'),
    duration: 60,
    status: 'completed',
    visitHistory: 'Conversa muito produtiva sobre crescimento espiritual. Membro demonstrou interesse em participar mais ativamente dos ministérios.',
    tenantId: '1',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    leaderId: '2',
    memberId: '2',
    title: 'Ministério de Louvor',
    description: 'Conversa sobre participação no ministério de louvor',
    scheduledAt: new Date('2024-01-25T16:00:00'),
    duration: 45,
    status: 'scheduled',
    tenantId: '1',
    createdAt: new Date('2024-01-20')
  },
  {
    id: '3',
    leaderId: '3',
    memberId: '3',
    title: 'Atividades Jovens',
    description: 'Planejamento de atividades para o grupo de jovens',
    scheduledAt: new Date('2024-01-30T19:00:00'),
    duration: 30,
    status: 'scheduled',
    tenantId: '1',
    createdAt: new Date('2024-01-22')
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Conferência de Avivamento 2024',
    description: 'Uma poderosa conferência com pregadores renomados, focada no avivamento espiritual e renovação da fé.',
    scheduledAt: new Date('2024-03-15T19:00:00'),
    location: 'Templo Central - Rua das Flores, 123',
    speakers: ['Pastor João Silva', 'Pr. Carlos Andrade', 'Missionária Ana Lima'],
    maxAttendees: 500,
    currentAttendees: 245,
    requiresPayment: true,
    price: 25.00,
    isPublic: true,
    tenantId: '1',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'Retiro de Jovens',
    description: 'Um fim de semana de comunhão, diversão e crescimento espiritual para os jovens da igreja.',
    scheduledAt: new Date('2024-02-20T18:00:00'),
    location: 'Chácara Bela Vista - KM 25 Rodovia SP-001',
    speakers: ['Pr. Julia Lima', 'Líder Marcos Santos'],
    maxAttendees: 80,
    currentAttendees: 45,
    requiresPayment: true,
    price: 120.00,
    isPublic: false,
    tenantId: '1',
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    title: 'Culto de Ação de Graças',
    description: 'Culto especial de gratidão pelas bênçãos recebidas, com participação de todos os ministérios.',
    scheduledAt: new Date('2024-02-10T19:30:00'),
    location: 'Templo Central - Rua das Flores, 123',
    speakers: ['Pastor João Silva'],
    maxAttendees: 300,
    currentAttendees: 180,
    requiresPayment: false,
    isPublic: true,
    tenantId: '1',
    createdAt: new Date('2024-01-25')
  }
];

// Dashboard Statistics
export const mockStats = {
  totalMembers: mockMembers.length,
  totalLeaders: mockLeaders.length,
  upcomingAppointments: mockAppointments.filter(a => a.status === 'scheduled').length,
  upcomingEvents: mockEvents.filter(e => e.scheduledAt > new Date()).length,
  activeMembers: mockMembers.filter(m => m.status === 'active').length,
  totalEventRegistrations: mockEvents.reduce((acc, event) => acc + event.currentAttendees, 0)
};