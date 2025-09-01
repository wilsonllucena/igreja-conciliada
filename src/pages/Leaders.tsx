import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockLeaders } from '@/data/mockData';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Shield,
  Calendar,
  UserCheck,
  Crown
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Leaders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredLeaders = mockLeaders.filter(leader =>
    leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leader.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leader.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLeaderTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Pastor': 'bg-purple-100 text-purple-800',
      'Líder de Louvor': 'bg-blue-100 text-blue-800',
      'Líder de Jovens': 'bg-green-100 text-green-800',
      'Líder Infantil': 'bg-yellow-100 text-yellow-800',
      'Diácono': 'bg-orange-100 text-orange-800',
      'Presbítero': 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getLeaderIcon = (type: string) => {
    switch (type) {
      case 'Pastor':
        return Crown;
      case 'Líder de Louvor':
      case 'Líder de Jovens':
      case 'Líder Infantil':
        return UserCheck;
      default:
        return Shield;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestão de Líderes</h1>
          <p className="text-muted-foreground">
            Gerencie os líderes e suas responsabilidades
          </p>
        </div>
        <Button className="shadow-lg w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Líder
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar líderes por nome, email ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Shield className="h-4 w-4 mr-2" />
              Filtrar Tipo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leaders Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLeaders.map((leader) => {
          const LeaderIcon = getLeaderIcon(leader.type);
          return (
            <Card key={leader.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                      <LeaderIcon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{leader.name}</CardTitle>
                      <Badge className={getLeaderTypeColor(leader.type)}>
                        {leader.type}
                      </Badge>
                    </div>
                  </div>
                  {leader.isAvailableForAppointments && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Disponível
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {leader.email}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    {leader.phone}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Líder desde {format(leader.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <p className="text-sm font-medium mb-2">Permissões:</p>
                  <div className="flex flex-wrap gap-2">
                    {leader.permissions.slice(0, 2).map((permission) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission.replace('_', ' ')}
                      </Badge>
                    ))}
                    {leader.permissions.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{leader.permissions.length - 2} mais
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Agenda
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredLeaders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum líder encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Tente ajustar os termos de busca.' : 'Comece adicionando seu primeiro líder.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Leaders;