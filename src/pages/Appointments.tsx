import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppointments, type Appointment } from '@/hooks/useAppointments';
import { useLeaders } from '@/hooks/useLeaders';
import { useMembers } from '@/hooks/useMembers';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  CalendarDays,
  Edit,
  Trash
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    leader_id: '',
    member_id: '',
    scheduled_at: '',
    duration: 60,
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
    visit_history: ''
  });
  
  const { appointments, loading, createAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const { leaders } = useLeaders();
  const { members } = useMembers();
  
  const getLeaderName = (leaderId: string) => {
    const leader = leaders.find(l => l.id === leaderId);
    return leader?.name || 'Líder não encontrado';
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member?.name || 'Membro não encontrado';
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLeaderName(appointment.leader_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getMemberName(appointment.member_id).toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      leader_id: '',
      member_id: '',
      scheduled_at: '',
      duration: 60,
      status: 'scheduled',
      visit_history: ''
    });
  };

  const handleCreate = () => {
    resetForm();
    setEditingAppointment(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setFormData({
      title: appointment.title,
      description: appointment.description || '',
      leader_id: appointment.leader_id,
      member_id: appointment.member_id,
      scheduled_at: appointment.scheduled_at.replace('Z', ''),
      duration: appointment.duration,
      status: appointment.status,
      visit_history: appointment.visit_history || ''
    });
    setEditingAppointment(appointment);
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const appointmentData = {
      ...formData,
      scheduled_at: new Date(formData.scheduled_at).toISOString()
    };
    
    if (editingAppointment) {
      await updateAppointment(editingAppointment.id, appointmentData);
    } else {
      await createAppointment(appointmentData);
    }
    
    setIsCreateOpen(false);
    resetForm();
    setEditingAppointment(null);
  };

  const handleDelete = async (appointment: Appointment) => {
    if (window.confirm(`Tem certeza que deseja excluir o agendamento "${appointment.title}"?`)) {
      await deleteAppointment(appointment.id);
    }
  };

  const handleComplete = async (appointment: Appointment) => {
    await updateAppointment(appointment.id, { status: 'completed' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie agendamentos entre líderes e membros
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="shadow-lg w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="leader_id">Líder *</Label>
                  <Select value={formData.leader_id} onValueChange={(value) => setFormData({ ...formData, leader_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um líder" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaders.map((leader) => (
                        <SelectItem key={leader.id} value={leader.id}>
                          {leader.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="member_id">Membro *</Label>
                  <Select value={formData.member_id} onValueChange={(value) => setFormData({ ...formData, member_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um membro" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduled_at">Data e Hora *</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {editingAppointment && (
                <div>
                  <Label htmlFor="visit_history">Histórico da Visita</Label>
                  <Textarea
                    id="visit_history"
                    value={formData.visit_history}
                    onChange={(e) => setFormData({ ...formData, visit_history: e.target.value })}
                    rows={3}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingAppointment ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar agendamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
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
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAppointments.length > 0 ? (
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
                                 <span>Líder: {getLeaderName(appointment.leader_id)}</span>
                               </div>
                               <div className="flex items-center space-x-2">
                                 <User className="h-4 w-4" />
                                 <span>Membro: {getMemberName(appointment.member_id)}</span>
                               </div>
                               <div className="flex items-center space-x-2">
                                 <Calendar className="h-4 w-4" />
                                 <span>{format(new Date(appointment.scheduled_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                               </div>
                               <div className="flex items-center space-x-2">
                                 <Clock className="h-4 w-4" />
                                 <span>{format(new Date(appointment.scheduled_at), "HH:mm", { locale: ptBR })} ({appointment.duration}min)</span>
                               </div>
                             </div>

                            {appointment.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {appointment.description}
                              </p>
                            )}

                           {appointment.visit_history && (
                             <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                               <div className="flex items-center space-x-2 mb-2">
                                 <FileText className="h-4 w-4 text-muted-foreground" />
                                 <span className="text-sm font-medium">Histórico da Visita:</span>
                               </div>
                               <p className="text-sm text-muted-foreground">
                                 {appointment.visit_history}
                               </p>
                             </div>
                           )}
                          </div>
                        </div>

                         <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                           {appointment.status === 'scheduled' && (
                             <>
                               <Button variant="outline" size="sm" onClick={() => handleEdit(appointment)} className="w-full sm:w-auto">
                                 <Edit className="h-4 w-4 mr-1" />
                                 Editar
                               </Button>
                               <Button variant="default" size="sm" onClick={() => handleComplete(appointment)} className="w-full sm:w-auto">
                                 <CheckCircle className="h-4 w-4 mr-1" />
                                 Concluir
                               </Button>
                             </>
                           )}
                           {appointment.status !== 'scheduled' && (
                             <Button variant="outline" size="sm" onClick={() => handleEdit(appointment)} className="w-full sm:w-auto">
                               <Edit className="h-4 w-4 mr-1" />
                               Editar
                             </Button>
                           )}
                           <Button variant="outline" size="sm" onClick={() => handleDelete(appointment)} className="text-red-600 hover:text-red-700 w-full sm:w-auto">
                             <Trash className="h-4 w-4 mr-1" />
                             Excluir
                           </Button>
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