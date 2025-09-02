import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import { Loader2, Church, Key, AlertCircle, User, Upload, Image } from 'lucide-react';
import { toast } from "sonner";

interface PasswordForm {
  newPassword: string;
  confirmPassword: string;
}

interface UserForm {
  name: string;
  phone: string;
}

interface ChurchForm {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export default function Settings() {
  const { isAdmin } = useAuth();
  const { 
    userSettings, 
    churchSettings, 
    loading, 
    error, 
    updatePassword,
    updateUserProfile,
    updateChurchSettings,
    uploadChurchLogo
  } = useSettings();
  
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isUpdatingChurch, setIsUpdatingChurch] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const passwordForm = useForm<PasswordForm>();
  const userForm = useForm<UserForm>({
    defaultValues: {
      name: userSettings?.name || '',
      phone: userSettings?.phone || '',
    }
  });
  const churchForm = useForm<ChurchForm>({
    defaultValues: {
      name: churchSettings?.name || '',
      address: churchSettings?.address || '',
      phone: churchSettings?.phone || '',
      email: churchSettings?.email || '',
      website: churchSettings?.website || '',
    }
  });

  // Reset forms when data loads
  React.useEffect(() => {
    if (userSettings) {
      userForm.reset({
        name: userSettings.name || '',
        phone: userSettings.phone || '',
      });
    }
  }, [userSettings, userForm]);

  React.useEffect(() => {
    if (churchSettings) {
      churchForm.reset({
        name: churchSettings.name || '',
        address: churchSettings.address || '',
        phone: churchSettings.phone || '',
        email: churchSettings.email || '',
        website: churchSettings.website || '',
      });
    }
  }, [churchSettings, churchForm]);

  const onPasswordSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', {
        type: 'manual',
        message: 'As senhas não coincidem'
      });
      return;
    }

    if (data.newPassword.length < 6) {
      passwordForm.setError('newPassword', {
        type: 'manual',
        message: 'A nova senha deve ter pelo menos 6 caracteres'
      });
      return;
    }

    setIsUpdatingPassword(true);
    const result = await updatePassword(data.newPassword);
    
    if (result.success) {
      passwordForm.reset();
    }
    setIsUpdatingPassword(false);
  };

  const onUserSubmit = async (data: UserForm) => {
    setIsUpdatingUser(true);
    await updateUserProfile(data);
    setIsUpdatingUser(false);
  };

  const onChurchSubmit = async (data: ChurchForm) => {
    setIsUpdatingChurch(true);
    await updateChurchSettings(data);
    setIsUpdatingChurch(false);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🖼️ Logo upload handler triggered');
    const file = event.target.files?.[0];
    
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log('📸 File selected:', { name: file.name, size: file.size, type: file.type });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('❌ Invalid file type:', file.type);
      toast.error('Por favor, selecione um arquivo de imagem');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('❌ File too large:', file.size);
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    console.log('✅ File validation passed, starting upload...');
    setIsUploadingLogo(true);
    
    try {
      const result = await uploadChurchLogo(file);
      console.log('🎯 Upload result:', result);
    } catch (error) {
      console.error('💥 Upload handler error:', error);
    }
    
    setIsUploadingLogo(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas configurações pessoais{isAdmin && ' e da igreja'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* User Profile Section */}
      {userSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil do Usuário
            </CardTitle>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Nome</Label>
                  <Input
                    id="userName"
                    {...userForm.register('name', { required: true })}
                    disabled={isUpdatingUser}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userPhone">Telefone</Label>
                  <Input
                    id="userPhone"
                    {...userForm.register('phone')}
                    disabled={isUpdatingUser}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={userSettings.email} disabled />
                <p className="text-sm text-muted-foreground">
                  O e-mail não pode ser alterado
                </p>
              </div>
              <div className="space-y-2">
                <Label>Função</Label>
                <Input 
                  value={userSettings.role === 'admin' ? 'Administrador' : userSettings.role === 'leader' ? 'Líder' : 'Membro'} 
                  disabled 
                />
              </div>
              <Button type="submit" disabled={isUpdatingUser}>
                {isUpdatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Perfil
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

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
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                {...passwordForm.register('newPassword', { required: true, minLength: 6 })}
                disabled={isUpdatingPassword}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register('confirmPassword', { required: true })}
                disabled={isUpdatingPassword}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
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
          {!churchSettings ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Nenhum dado da igreja encontrado
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
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
              <form onSubmit={churchForm.handleSubmit(onChurchSubmit)} className="space-y-6">
                {/* Logo Upload Section */}
                <div className="space-y-4">
                  <Label>Logo da Igreja</Label>
                  <div className="flex items-center space-x-4">
                    {churchSettings?.logo && (
                      <div className="flex-shrink-0">
                        <img
                          src={churchSettings.logo}
                          alt="Logo da Igreja"
                          className="h-16 w-16 rounded-lg object-cover border"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={isUploadingLogo}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="w-full sm:w-auto"
                      >
                        {isUploadingLogo ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            {churchSettings?.logo ? 'Alterar Logo' : 'Enviar Logo'}
                          </>
                        )}
                      </Button>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG ou JPEG até 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

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
          )}
        </>
      )}
    </div>
  );
}