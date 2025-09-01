import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  CalendarDays, 
  MapPin,
  Users,
  DollarSign,
  Globe,
  Eye,
  Edit,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Events = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { events, loading, getPublicEventLink } = useEvents();
  
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestão de Eventos</h1>
          <p className="text-muted-foreground">
            Crie e gerencie eventos da sua igreja
          </p>
        </div>
        <Link to="/events/new">
          <Button className="shadow-lg w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos por título ou local..."
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

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            {/* Event Banner Placeholder */}
            <div className="h-48 bg-gradient-to-br from-primary to-accent relative">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                <div>
                  {event.is_public && (
                    <Badge className="bg-white/20 text-white border-white/30 mb-2">
                      <Globe className="h-3 w-3 mr-1" />
                      Público
                    </Badge>
                  )}
                  {event.requires_payment && (
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
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white text-xl font-bold mb-2">{event.title}</h3>
                <div className="flex items-center text-white/90 text-sm">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {format(new Date(event.scheduled_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </div>
              </div>
            </div>

            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.current_attendees} inscritos</span>
                  </div>
                  {event.max_attendees && (
                    <span className="text-xs text-muted-foreground">
                      {getAttendancePercentage(event.current_attendees, event.max_attendees)}% ocupado
                    </span>
                  )}
                </div>

                {event.max_attendees && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(getAttendancePercentage(event.current_attendees, event.max_attendees), 100)}%` 
                      }}
                    />
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>

              {/* Speakers */}
              {event.speakers.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Palestrantes:</p>
                  <div className="flex flex-wrap gap-1">
                    {event.speakers.slice(0, 2).map((speaker) => (
                      <Badge key={speaker} variant="secondary" className="text-xs">
                        {speaker}
                      </Badge>
                    ))}
                    {event.speakers.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{event.speakers.length - 2} mais
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <Link to={`/events/${event.id}/edit`}>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
                <div className="flex space-x-1 flex-1">
                  <Link to={getPublicEventLink(event.id)} target="_blank" className="flex-1">
                    <Button variant="default" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Página
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const publicUrl = getPublicEventLink(event.id);
                      navigator.clipboard.writeText(publicUrl);
                      toast({
                        title: "Link copiado!",
                        description: "O link público do evento foi copiado para a área de transferência.",
                      });
                    }}
                    title="Copiar link público"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Tente ajustar os termos de busca.' : 'Comece criando seu primeiro evento.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Events;