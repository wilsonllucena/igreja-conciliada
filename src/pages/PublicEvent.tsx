import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Phone,
  Mail,
  User,
  CheckCircle,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useEvents } from '@/hooks/useEvents';
import { supabase } from '@/integrations/supabase/client';

interface RegistrationData {
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
}

const PublicEvent = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { getEventById } = useEvents();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    attendeeName: '',
    attendeeEmail: '',
    attendeePhone: ''
  });

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;

      try {
        const result = await getEventById(id);
        if (result.data && result.data.is_public) {
          setEvent(result.data);
        } else {
          toast({
            title: "Evento não encontrado",
            description: "Este evento não está disponível publicamente.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading event:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar o evento.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, getEventById, toast]);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !id) return;

    if (!registrationData.attendeeName || !registrationData.attendeeEmail || !registrationData.attendeePhone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setRegistering(true);

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert([{
          event_id: id,
          attendee_name: registrationData.attendeeName,
          attendee_email: registrationData.attendeeEmail,
          attendee_phone: registrationData.attendeePhone,
          payment_status: event.requires_payment ? 'pending' : null
        }]);

      if (error) {
        throw error;
      }

      setRegistered(true);
      toast({
        title: "Inscrição realizada com sucesso!",
        description: event.requires_payment 
          ? "Você receberá instruções de pagamento por email."
          : "Sua inscrição foi confirmada. Nos vemos no evento!",
      });
    } catch (error) {
      console.error('Error registering:', error);
      toast({
        title: "Erro na inscrição",
        description: "Não foi possível realizar sua inscrição. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Evento não encontrado</h1>
            <p className="text-muted-foreground mb-6">
              Este evento não está disponível ou foi removido.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao início
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.scheduled_at);
  const isEventFull = event.max_attendees && event.current_attendees >= event.max_attendees;
  const canRegister = !registered && !isEventFull && eventDate > new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          {/* Event Banner */}
          {event.banner && (
            <div className="mb-8">
              <img
                src={event.banner}
                alt={`Banner do evento ${event.title}`}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    {format(eventDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    {format(eventDate, "HH:mm", { locale: ptBR })}
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Sobre o Evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </CardContent>
              </Card>

              {event.speakers && event.speakers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Palestrantes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {event.speakers.map((speaker: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                          {speaker}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Local</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Participantes</p>
                      <p className="text-sm text-muted-foreground">
                        {event.current_attendees} inscritos
                        {event.max_attendees && ` de ${event.max_attendees}`}
                      </p>
                      {isEventFull && (
                        <Badge variant="destructive" className="mt-1">Lotado</Badge>
                      )}
                    </div>
                  </div>

                  {event.requires_payment && event.price > 0 && (
                    <div className="flex items-start space-x-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Investimento</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {event.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Registration Form */}
              {registered ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Inscrição Confirmada!</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.requires_payment 
                          ? "Você receberá instruções de pagamento por email."
                          : "Sua inscrição foi confirmada. Nos vemos no evento!"
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : canRegister ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Inscreva-se</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegistration} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome completo *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={registrationData.attendeeName}
                          onChange={(e) => setRegistrationData(prev => ({
                            ...prev,
                            attendeeName: e.target.value
                          }))}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={registrationData.attendeeEmail}
                          onChange={(e) => setRegistrationData(prev => ({
                            ...prev,
                            attendeeEmail: e.target.value
                          }))}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={registrationData.attendeePhone}
                          onChange={(e) => setRegistrationData(prev => ({
                            ...prev,
                            attendeePhone: e.target.value
                          }))}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={registering}>
                        {registering ? 'Inscrevendo...' : 'Confirmar Inscrição'}
                      </Button>

                      {event.requires_payment && event.price > 0 && (
                        <p className="text-xs text-muted-foreground text-center">
                          * Após a inscrição, você receberá instruções para pagamento de R$ {event.price.toFixed(2).replace('.', ',')}
                        </p>
                      )}
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <h3 className="font-semibold mb-2">
                      {isEventFull ? 'Evento Lotado' : 'Inscrições Encerradas'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isEventFull 
                        ? 'Este evento atingiu o limite máximo de participantes.'
                        : 'O período de inscrições para este evento foi encerrado.'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicEvent;