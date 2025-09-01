import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEvents } from '@/hooks/useEvents';
import { 
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  DollarSign,
  Globe,
  Image,
  Plus,
  X,
  Save,
  Eye,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface EventFormData {
  title: string;
  description: string;
  scheduledAt: Date | undefined;
  location: string;
  isPublic: boolean;
  requiresPayment: boolean;
  price: string;
  maxAttendees: string;
  speakers: string[];
  currentSpeaker: string;
}

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getEventById, updateEvent, deleteEvent } = useEvents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerFile, setBannerFile] = useState<File | undefined>();
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    scheduledAt: undefined,
    location: '',
    isPublic: true,
    requiresPayment: false,
    price: '',
    maxAttendees: '',
    speakers: [],
    currentSpeaker: ''
  });

  // Load event data
  useEffect(() => {
    const loadEventData = async () => {
      if (!id) {
        navigate('/events');
        return;
      }

      const result = await getEventById(id);
      
      if (result.error || !result.data) {
        toast({
          title: "Evento não encontrado",
          description: "O evento que você está tentando editar não existe.",
          variant: "destructive"
        });
        navigate('/events');
        return;
      }

      const event = result.data;

      // Populate form with existing data
      setFormData({
        title: event.title,
        description: event.description,
        scheduledAt: new Date(event.scheduled_at),
        location: event.location,
        isPublic: event.is_public,
        requiresPayment: event.requires_payment,
        price: event.price ? event.price.toString() : '',
        maxAttendees: event.max_attendees ? event.max_attendees.toString() : '',
        speakers: [...event.speakers],
        currentSpeaker: ''
      });

      setIsLoading(false);
    };

    loadEventData();
  }, [id, navigate, toast, getEventById]);

  const handleInputChange = (field: keyof EventFormData, value: string | boolean | Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSpeaker = () => {
    if (formData.currentSpeaker.trim()) {
      setFormData(prev => ({
        ...prev,
        speakers: [...prev.speakers, prev.currentSpeaker.trim()],
        currentSpeaker: ''
      }));
    }
  };

  const removeSpeaker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.title || !formData.description || !formData.scheduledAt || !formData.location || !id) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    const eventData = {
      title: formData.title,
      description: formData.description,
      scheduled_at: formData.scheduledAt.toISOString(),
      location: formData.location,
      is_public: formData.isPublic,
      requires_payment: formData.requiresPayment,
      price: formData.requiresPayment && formData.price ? parseFloat(formData.price) : undefined,
      max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
      speakers: formData.speakers,
    };

    const result = await updateEvent(id, eventData, bannerFile);
    
    if (result.error) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    navigate('/events');
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      const result = await deleteEvent(id);
      
      if (!result.error) {
        navigate('/events');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados do evento...</p>
        </div>
      </div>
    );
  }

  const isFormValid = formData.title && formData.description && formData.scheduledAt && formData.location;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link to="/events">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Eventos
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
              <Button variant="outline" disabled={!isFormValid}>
                <Eye className="h-4 w-4 mr-2" />
                Pré-visualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Editar Evento</h1>
            <p className="text-muted-foreground">
              Faça as alterações necessárias nas informações do evento
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Form - Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título do Evento *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Ex: Conferência de Jovens 2024"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Descreva o evento, sua programação e objetivos..."
                        rows={4}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Date, Time and Location */}
                <Card>
                  <CardHeader>
                    <CardTitle>Data, Hora e Local</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Data e Hora *</Label>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.scheduledAt && "text-muted-foreground"
                              )}
                            >
                              <CalendarDays className="h-4 w-4 mr-2" />
                              {formData.scheduledAt ? (
                                format(formData.scheduledAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                              ) : (
                                "Selecione data e hora"
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.scheduledAt}
                              onSelect={(date) => {
                                if (date) {
                                  // Preserve existing time or set default
                                  const newDate = new Date(date);
                                  if (formData.scheduledAt) {
                                    newDate.setHours(
                                      formData.scheduledAt.getHours(),
                                      formData.scheduledAt.getMinutes(),
                                      0,
                                      0
                                    );
                                  } else {
                                    newDate.setHours(19, 0, 0, 0);
                                  }
                                  handleInputChange('scheduledAt', newDate);
                                }
                                setIsCalendarOpen(false);
                              }}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Local *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            placeholder="Ex: Igreja Central - Rua das Flores, 123"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Event Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Evento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Evento Público</Label>
                        <p className="text-sm text-muted-foreground">
                          Permite inscrições de visitantes externos
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.isPublic}
                          onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                        />
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Cobrança de Taxa</Label>
                        <p className="text-sm text-muted-foreground">
                          Evento requer pagamento para inscrição
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.requiresPayment}
                          onCheckedChange={(checked) => handleInputChange('requiresPayment', checked)}
                        />
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    {formData.requiresPayment && (
                      <div className="space-y-2">
                        <Label htmlFor="price">Valor da Inscrição (R$)</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="maxAttendees">Limite de Participantes</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="maxAttendees"
                          type="number"
                          min="1"
                          value={formData.maxAttendees}
                          onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                          placeholder="Deixe vazio para ilimitado"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Speakers */}
                <Card>
                  <CardHeader>
                    <CardTitle>Palestrantes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        value={formData.currentSpeaker}
                        onChange={(e) => handleInputChange('currentSpeaker', e.target.value)}
                        placeholder="Nome do palestrante"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSpeaker();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addSpeaker}
                        disabled={!formData.currentSpeaker.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {formData.speakers.length > 0 && (
                      <div className="space-y-2">
                        <Label>Palestrantes Adicionados:</Label>
                        <div className="flex flex-wrap gap-2">
                          {formData.speakers.map((speaker, index) => (
                            <Badge key={index} variant="secondary" className="text-sm">
                              {speaker}
                              <button
                                type="button"
                                onClick={() => removeSpeaker(index)}
                                className="ml-2 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Preview & Actions - Right Column */}
              <div className="space-y-6">
                {/* Event Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pré-visualização</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Banner Placeholder */}
                      <div className="relative h-32 rounded-lg bg-gradient-to-br from-primary to-accent overflow-hidden">
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Image className="h-8 w-8 mx-auto mb-2 opacity-60" />
                            <p className="text-xs opacity-80">Banner do evento</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold line-clamp-2">
                          {formData.title || 'Título do evento aparecerá aqui'}
                        </h3>
                        
                        {formData.scheduledAt && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            {format(formData.scheduledAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                        )}

                        {formData.location && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="line-clamp-1">{formData.location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          {formData.isPublic && (
                            <Badge variant="secondary" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              Público
                            </Badge>
                          )}
                          {formData.requiresPayment && formData.price && (
                            <Badge variant="secondary" className="text-xs">
                              <DollarSign className="h-3 w-3 mr-1" />
                              R$ {formData.price}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upload Banner */}
                <Card>
                  <CardHeader>
                    <CardTitle>Banner do Evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Alterar banner</p>
                        <p className="text-xs text-muted-foreground">
                          Formato recomendado: 16:9
                        </p>
                        <Button variant="outline" size="sm" type="button">
                          Selecionar Arquivo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Form Actions */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={!isFormValid || isSubmitting}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Salvando Alterações...' : 'Salvar Alterações'}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/events')}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditEvent;