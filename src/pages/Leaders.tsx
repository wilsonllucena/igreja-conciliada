import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaders, type Leader } from '@/hooks/useLeaders';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Shield,
  Calendar,
  UserCheck,
  Crown,
  Edit,
  Trash,
  Key
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Leaders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const [userPassword, setUserPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'Diácono' as Leader['type'],
    permissions: [] as string[],
    is_available_for_appointments: true
  });
  
  const { leaders, loading, createLeader, updateLeader, deleteLeader, createUserForLeader } = useLeaders();
  
  const filteredLeaders = leaders.filter(leader =>
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

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      type: 'Diácono',
      permissions: [],
      is_available_for_appointments: true
    });
  };

  const handleCreate = () => {
    resetForm();
    setEditingLeader(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (leader: Leader) => {
    setFormData({
      name: leader.name,
      email: leader.email,
      phone: leader.phone,
      type: leader.type,
      permissions: leader.permissions,
      is_available_for_appointments: leader.is_available_for_appointments
    });
    setEditingLeader(leader);
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLeader) {
      await updateLeader(editingLeader.id, formData);
    } else {
      await createLeader(formData);
    }
    
    setIsCreateOpen(false);
    resetForm();
    setEditingLeader(null);
  };

  const handleDelete = async (leader: Leader) => {
    if (window.confirm(`Tem certeza que deseja excluir ${leader.name}?`)) {
      await deleteLeader(leader.id);
    }
  };

  const handleCreateUser = (leader: Leader) => {
    setSelectedLeader(leader);
    setUserPassword('');
    setIsCreateUserOpen(true);
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeader || !userPassword) return;

    await createUserForLeader(selectedLeader.id, userPassword);
    setIsCreateUserOpen(false);
    setSelectedLeader(null);
    setUserPassword('');
  };

  const availablePermissions = [
    'manage_events',
    'manage_members',
    'manage_appointments',
    'view_reports',
    'manage_finances'
  ];

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
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="shadow-lg w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Líder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLeader ? 'Editar Líder' : 'Novo Líder'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Líder</Label>
                  <Select value={formData.type} onValueChange={(value: Leader['type']) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pastor">Pastor</SelectItem>
                      <SelectItem value="Líder de Louvor">Líder de Louvor</SelectItem>
                      <SelectItem value="Líder de Jovens">Líder de Jovens</SelectItem>
                      <SelectItem value="Líder Infantil">Líder Infantil</SelectItem>
                      <SelectItem value="Diácono">Diácono</SelectItem>
                      <SelectItem value="Presbítero">Presbítero</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Permissões</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={formData.permissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, permissions: [...formData.permissions, permission] });
                          } else {
                            setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== permission) });
                          }
                        }}
                      />
                      <Label htmlFor={permission} className="text-sm">
                        {permission.replace(/_/g, ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_available_for_appointments"
                  checked={formData.is_available_for_appointments}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available_for_appointments: Boolean(checked) })}
                />
                <Label htmlFor="is_available_for_appointments">
                  Disponível para agendamentos
                </Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingLeader ? 'Atualizar' : 'Criar'}
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
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
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
                   {leader.is_available_for_appointments && (
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
                     Líder desde {format(new Date(leader.created_at), "dd/MM/yyyy", { locale: ptBR })}
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

                 <div className="flex flex-wrap gap-2">
                   <Button variant="outline" size="sm" onClick={() => handleEdit(leader)}>
                     <Edit className="h-4 w-4 mr-1" />
                     Editar
                   </Button>
                   {!leader.user_id ? (
                     <Button variant="outline" size="sm" onClick={() => handleCreateUser(leader)} className="text-green-600 hover:text-green-700">
                       <Key className="h-4 w-4 mr-1" />
                       Criar Usuário
                     </Button>
                   ) : (
                     <Badge variant="secondary" className="text-green-600 border-green-600">
                       <UserCheck className="h-3 w-3 mr-1" />
                       Usuário Ativo
                     </Badge>
                   )}
                   <Button variant="outline" size="sm" onClick={() => handleDelete(leader)} className="text-red-600 hover:text-red-700">
                     <Trash className="h-4 w-4 mr-1" />
                     Excluir
                   </Button>
                 </div>
              </CardContent>
            </Card>
          );
         })}
       </div>
      )}

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

      {/* Create User Dialog */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Usuário para {selectedLeader?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUserSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={selectedLeader?.email || ''}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="password">Senha Temporária *</Label>
              <Input
                id="password"
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Digite uma senha temporária"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                O líder poderá alterar a senha no primeiro acesso
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Criar Usuário
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leaders;