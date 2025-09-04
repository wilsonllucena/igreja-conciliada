import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import StatCard from '@/components/StatCard';
import { useMembers } from '@/hooks/useMembers';
import { useLeaders } from '@/hooks/useLeaders';
import { useEvents } from '@/hooks/useEvents';
import { useAppointments } from '@/hooks/useAppointments';
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
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { members } = useMembers();
  const { leaders } = useLeaders();
  const { events } = useEvents();
  const { appointments } = useAppointments();

  // Get authenticated user information
  const { user, profile } = useAuth();

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'scheduled' && new Date(apt.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 3);

  const upcomingEvents = events
    .filter(event => new Date(event.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3);

  const activeLeaders = leaders.filter(leader => leader.is_available_for_appointments);
  const activeMembers = members.filter(member => member.status === 'active');

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-accent shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Bem-vindo(a) {profile?.name.split(' ')[0]}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6">
              Gerencie sua igreja de forma simples com iGestor
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link to="/events/new">
                <Button variant="secondary" size="lg" className="shadow-lg w-full sm:w-auto">
                  <Plus className="h-5 w-5 mr-2" />
                  Novo Evento
                </Button>
              </Link>
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
          value={activeMembers.length}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Líderes Ativos"
          value={activeLeaders.length}
          icon={UserCheck}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Agendamentos Pendentes"
          value={upcomingAppointments.length}
          icon={Calendar}
        />
        <StatCard
          title="Próximos Eventos"
          value={upcomingEvents.length}
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
                      {format(new Date(appointment.scheduled_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
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
                      <span>{format(new Date(event.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
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