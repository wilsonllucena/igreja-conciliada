import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockEvents, mockTenant } from '@/data/mockData';
import { 
  CalendarDays, 
  MapPin,
  Users,
  DollarSign,
  Clock,
  Check,
  Share2,
  Download,
  Church,
  Globe,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface RegistrationForm {
  name: string;
  email: string;
  phone: string;
  church?: string;
  comments?: string;
}

const EventDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
    name: '',
    email: '',
    phone: '',
    church: '',
    comments: ''
  });

  const event = mockEvents.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Evento não encontrado</h1>
            <p className="text-muted-foreground mb-6">
              O evento que você está procurando não existe ou foi removido.
            </p>
            <Link to="/events">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Eventos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getAttendancePercentage = (current: number, max?: number) => {
    if (!max) return 0;
    return Math.round((current / max) * 100);
  };

  const handleInputChange = (field: keyof RegistrationForm, value: string) => {
    setRegistrationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Inscrição realizada com sucesso!",
        description: `Sua inscrição para ${event.title} foi confirmada. Você receberá um email de confirmação em breve.`,
      });
      
      // Reset form
      setRegistrationForm({
        name: '',
        email: '',
        phone: '',
        church: '',
        comments: ''
      });
      
      setIsRegistering(false);
    }, 2000);
  };

  const isFormValid = registrationForm.name && registrationForm.email && registrationForm.phone;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Public Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            {/* Church Branding */}
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Church className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{mockTenant.name}</h1>
                <p className="text-sm text-muted-foreground">Evento Público</p>
              </div>
            </div>

            {/* Public Event Badge */}
            <Badge className="bg-church-gold text-white">
              <Globe className="h-3 w-3 mr-1" />
              Aberto ao Público
            </Badge>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Event Details - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent shadow-2xl h-80 lg:h-96">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
                <div className="space-y-2">
                  {event.isPublic && (
                    <Badge className="bg-white/20 text-white border-white/30">
                      Evento Público
                    </Badge>
                  )}
                  {event.requiresPayment && (
                    <Badge className="bg-church-gold text-white">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {formatCurrency(event.price || 0)}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-white text-3xl lg:text-4xl font-bold mb-4">{event.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2" />
                    {format(event.scheduledAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    {format(event.scheduledAt, "HH:mm", { locale: ptBR })}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Info Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="speakers">Palestrantes</TabsTrigger>
                <TabsTrigger value="location">Localização</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 mt-6">
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

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Participantes</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.currentAttendees} inscritos
                            {event.maxAttendees && ` de ${event.maxAttendees} vagas`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                          <MapPin className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Local</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.location}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="speakers" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Palestrantes Confirmados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {event.speakers.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {event.speakers.map((speaker, index) => (
                          <div key={index} className="flex items-center space-x-4 p-4 rounded-lg border">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                              <span className="text-lg font-semibold text-primary">
                                {speaker.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold">{speaker}</h4>
                              <p className="text-sm text-muted-foreground">Palestrante</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Palestrantes serão anunciados em breve.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Localização do Evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <h4 className="font-semibold">{event.location}</h4>
                          <p className="text-sm text-muted-foreground">
                            Endereço completo será enviado por email após a inscrição
                          </p>
                        </div>
                      </div>
                      
                      {/* Placeholder for map */}
                      <div className="h-64 rounded-lg bg-muted flex items-center justify-center">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Mapa será carregado aqui</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Registration Form - Right Column */}
          <div className="space-y-6">
            {/* Attendance Progress */}
            {event.maxAttendees && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Vagas Ocupadas</span>
                      <span className="text-sm text-muted-foreground">
                        {event.currentAttendees}/{event.maxAttendees}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(getAttendancePercentage(event.currentAttendees, event.maxAttendees), 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getAttendancePercentage(event.currentAttendees, event.maxAttendees)}% das vagas ocupadas
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Registration Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Fazer Inscrição</span>
                </CardTitle>
                {event.requiresPayment && (
                  <p className="text-sm text-muted-foreground">
                    Taxa de inscrição: {formatCurrency(event.price || 0)}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitRegistration} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={registrationForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={registrationForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={registrationForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="church">Igreja (opcional)</Label>
                    <Input
                      id="church"
                      value={registrationForm.church}
                      onChange={(e) => handleInputChange('church', e.target.value)}
                      placeholder="Nome da sua igreja"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments">Comentários (opcional)</Label>
                    <Textarea
                      id="comments"
                      value={registrationForm.comments}
                      onChange={(e) => handleInputChange('comments', e.target.value)}
                      placeholder="Alguma observação ou pergunta..."
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!isFormValid || isRegistering}
                  >
                    {isRegistering ? (
                      "Processando inscrição..."
                    ) : event.requiresPayment ? (
                      `Inscrever-se - ${formatCurrency(event.price || 0)}`
                    ) : (
                      "Inscrever-se Gratuitamente"
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Ao se inscrever, você concorda com nossos termos e condições.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Additional Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Programação
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar Evento
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Church Info */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent mx-auto">
                    <Church className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{mockTenant.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Promovendo eventos que transformam vidas
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este é um evento público. Venha participar conosco!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t mt-16">
          <div className="container py-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Church className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold">{mockTenant.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 {mockTenant.name}. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default EventDetail;