import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import { mockStats, mockAppointments, mockEvents } from '@/data/mockData';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  CalendarDays,
  Clock,
  MapPin,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import heroImage from '@/assets/church-hero.jpg';

const Dashboard = () => {
  const upcomingAppointments = mockAppointments
    .filter(apt => apt.status === 'scheduled' && apt.scheduledAt > new Date())
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
    .slice(0, 3);

  const upcomingEvents = mockEvents
    .filter(event => event.scheduledAt > new Date())
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-accent shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative px-8 py-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-white mb-4">
              Bem-vindo ao Dashboard
            </h1>
            <p className="text-xl text-white/90 mb-6">
              Gerencie sua igreja de forma simples e eficiente
            </p>
            <div className="flex items-center space-x-4">
              <Button variant="secondary" size="lg" className="shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Novo Evento
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Ver Relatórios
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Membros"
          value={mockStats.totalMembers}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Líderes Ativos"
          value={mockStats.totalLeaders}
          icon={UserCheck}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Agendamentos Pendentes"
          value={mockStats.upcomingAppointments}
          icon={Calendar}
        />
        <StatCard
          title="Próximos Eventos"
          value={mockStats.upcomingEvents}
          icon={CalendarDays}
          trend={{ value: 25, isPositive: true }}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Próximos Agendamentos</CardTitle>
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center space-x-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{appointment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(appointment.scheduledAt, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{appointment.duration}min</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum agendamento próximo
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Próximos Eventos</CardTitle>
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <CalendarDays className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{format(event.scheduledAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                      <span>•</span>
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{event.currentAttendees}</p>
                    <p className="text-xs text-muted-foreground">inscritos</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum evento próximo
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;