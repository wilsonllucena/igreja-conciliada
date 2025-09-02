import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Phone, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Leader {
  id: string;
  name: string;
  type: string;
  tenant_id: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  tenant_id: string;
}

export default function PublicAppointments() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedLeader, setSelectedLeader] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('60');
  
  // New visitor fields
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [isNewVisitor, setIsNewVisitor] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch available leaders from all tenants
      const { data: leadersData, error: leadersError } = await supabase
        .from('leaders')
        .select('id, name, type, tenant_id')
        .eq('is_available_for_appointments', true);

      if (leadersError) throw leadersError;

      // Fetch members from all tenants
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, name, email, tenant_id')
        .eq('status', 'active');

      if (membersError) throw membersError;

      setLeaders(leadersData || []);
      setMembers(membersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLeader || !title || !selectedDate || !selectedTime) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMember && !isNewVisitor) {
      toast({
        title: "Erro",
        description: "Selecione um membro ou marque como novo visitante.",
        variant: "destructive",
      });
      return;
    }

    if (isNewVisitor && (!visitorName || !visitorEmail || !visitorPhone)) {
      toast({
        title: "Erro",
        description: "Para novos visitantes, preencha nome, email e telefone.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const leader = leaders.find(l => l.id === selectedLeader);
      if (!leader) throw new Error('Líder não encontrado');

      let memberId = selectedMember;

      // If new visitor, create member record first
      if (isNewVisitor) {
        const { data: newMember, error: memberError } = await supabase
          .from('members')
          .insert({
            name: visitorName,
            email: visitorEmail,
            phone: visitorPhone,
            tenant_id: leader.tenant_id,
            status: 'active'
          })
          .select()
          .single();

        if (memberError) throw memberError;
        memberId = newMember.id;
      }

      // Create appointment
      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes));

      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          leader_id: selectedLeader,
          member_id: memberId,
          title,
          description,
          scheduled_at: scheduledAt.toISOString(),
          duration: parseInt(duration),
          status: 'scheduled',
          tenant_id: leader.tenant_id
        });

      if (appointmentError) throw appointmentError;

      toast({
        title: "Sucesso!",
        description: "Agendamento criado com sucesso! Você receberá uma confirmação em breve.",
      });

      // Reset form
      setSelectedLeader('');
      setSelectedMember('');
      setTitle('');
      setDescription('');
      setSelectedDate(undefined);
      setSelectedTime('');
      setDuration('60');
      setVisitorName('');
      setVisitorEmail('');
      setVisitorPhone('');
      setIsNewVisitor(false);

    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Agendar Compromisso
            </h1>
            <p className="text-muted-foreground">
              Agende um horário com nossos líderes
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Novo Agendamento
            </CardTitle>
            <CardDescription>
              Preencha os dados abaixo para agendar seu compromisso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Leader Selection */}
              <div className="space-y-2">
                <Label htmlFor="leader">Líder *</Label>
                <Select value={selectedLeader} onValueChange={setSelectedLeader}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um líder" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaders.map((leader) => (
                      <SelectItem key={leader.id} value={leader.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {leader.name} - {leader.type}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Member or New Visitor */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="newVisitor"
                    checked={isNewVisitor}
                    onChange={(e) => setIsNewVisitor(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="newVisitor">Sou um novo visitante</Label>
                </div>

                {isNewVisitor ? (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label htmlFor="visitorName">Nome Completo *</Label>
                      <Input
                        id="visitorName"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visitorEmail">Email *</Label>
                      <Input
                        id="visitorEmail"
                        type="email"
                        value={visitorEmail}
                        onChange={(e) => setVisitorEmail(e.target.value)}
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visitorPhone">Telefone *</Label>
                      <Input
                        id="visitorPhone"
                        value={visitorPhone}
                        onChange={(e) => setVisitorPhone(e.target.value)}
                        placeholder="(11) 99999-1234"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="member">Membro</Label>
                    <Select value={selectedMember} onValueChange={setSelectedMember}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um membro (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {member.name} - {member.email}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Assunto *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Aconselhamento, Oração, Conversa..."
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva brevemente o motivo do agendamento (opcional)"
                  rows={3}
                />
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Data *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Horário *</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {time}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (min)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1h 30min</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar Compromisso
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}