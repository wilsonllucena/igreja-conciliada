import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockAppointments, mockLeaders, mockMembers } from '@/data/mockData';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const getLeaderName = (leaderId: string) => {
    const leader = mockLeaders.find(l => l.id === leaderId);
    return leader?.name || 'Líder não encontrado';
  };

  const getMemberName = (memberId: string) => {
    const member = mockMembers.find(m => m.id === memberId);
    return member?.name || 'Membro não encontrado';
  };

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = 
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLeaderName(appointment.leaderId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getMemberName(appointment.memberId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'scheduled' && appointment.status === 'scheduled') ||
      (activeTab === 'completed' && appointment.status === 'completed') ||
      (activeTab === 'cancelled' && appointment.status === 'cancelled');
    
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Calendar;
    }
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      'scheduled': 'Agendado',
      'completed': 'Concluído',
      'cancelled': 'Cancelado',
    };
    return texts[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie agendamentos entre líderes e membros
          </p>
        </div>
        <Button className="shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar agendamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <CalendarDays className="h-4 w-4 mr-2" />
              Filtrar Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="scheduled">Agendados</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => {
                const StatusIcon = getStatusIcon(appointment.status);
                return (
                  <Card key={appointment.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <StatusIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold">{appointment.title}</h3>
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusText(appointment.status)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>Líder: {getLeaderName(appointment.leaderId)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>Membro: {getMemberName(appointment.memberId)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>{format(appointment.scheduledAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>{format(appointment.scheduledAt, "HH:mm", { locale: ptBR })} ({appointment.duration}min)</span>
                              </div>
                            </div>

                            {appointment.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {appointment.description}
                              </p>
                            )}

                            {appointment.visitHistory && (
                              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">Histórico da Visita:</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.visitHistory}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <Button variant="outline" size="sm">
                                Editar
                              </Button>
                              <Button variant="default" size="sm">
                                Concluir
                              </Button>
                            </>
                          )}
                          {appointment.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              Ver Detalhes
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum agendamento encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Tente ajustar os termos de busca.' : 'Comece criando seu primeiro agendamento.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Appointments;