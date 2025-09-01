import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Church, Key } from 'lucide-react';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChurchForm {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export default function Settings() {
  const { profile, isAdmin } = useAuth();
  const { tenant, refetch: refetchTenant } = useTenant();
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingChurch, setIsUpdatingChurch] = useState(false);

  const passwordForm = useForm<PasswordForm>();
  const churchForm = useForm<ChurchForm>({
    defaultValues: {
      name: tenant?.name || '',
      address: tenant?.address || '',
      phone: tenant?.phone || '',
      email: tenant?.email || '',
      website: tenant?.website || '',
    }
  });

  // Reset church form when tenant data loads
  React.useEffect(() => {
    if (tenant) {
      churchForm.reset({
        name: tenant.name || '',
        address: tenant.address || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        website: tenant.website || '',
      });
    }
  }, [tenant, churchForm]);

  const onPasswordSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (data.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      });
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar senha",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const onChurchSubmit = async (data: ChurchForm) => {
    if (!isAdmin || !tenant) return;

    setIsUpdatingChurch(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tenant.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Dados da igreja atualizados com sucesso!",
      });
      refetchTenant();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar dados da igreja",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingChurch(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas configurações pessoais{isAdmin && ' e da igreja'}
        </p>
      </div>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Atualize sua senha de acesso ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                {...passwordForm.register('currentPassword', { required: true })}
                disabled={isUpdatingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register('newPassword', { required: true, minLength: 6 })}
                disabled={isUpdatingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register('confirmPassword', { required: true })}
                disabled={isUpdatingPassword}
              />
            </div>
            <Button type="submit" disabled={isUpdatingPassword}>
              {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Alterar Senha
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Church Settings - Only for Admins */}
      {isAdmin && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Church className="h-5 w-5" />
                Dados da Igreja
              </CardTitle>
              <CardDescription>
                Configure as informações da sua igreja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={churchForm.handleSubmit(onChurchSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Igreja</Label>
                    <Input
                      id="name"
                      {...churchForm.register('name', { required: true })}
                      disabled={isUpdatingChurch}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      {...churchForm.register('phone')}
                      disabled={isUpdatingChurch}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    {...churchForm.register('email')}
                    disabled={isUpdatingChurch}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    {...churchForm.register('address')}
                    disabled={isUpdatingChurch}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    {...churchForm.register('website')}
                    disabled={isUpdatingChurch}
                  />
                </div>
                <Button type="submit" disabled={isUpdatingChurch}>
                  {isUpdatingChurch && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}