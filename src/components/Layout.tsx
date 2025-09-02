import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Home, 
  Users, 
  UserCheck, 
  Calendar, 
  CalendarDays,
  LogOut,
  Settings,
  Church,
  Menu,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/hooks/useTenant';
import ProtectedRoute from './ProtectedRoute';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { profile, signOut, isAdmin } = useAuth();
  const { tenant } = useTenant();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');  
  };
  
  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/members', label: 'Membros', icon: Users },
    { href: '/leaders', label: 'Líderes', icon: UserCheck },
    { href: '/appointments', label: 'Agendamentos', icon: Calendar },
    { href: '/events', label: 'Eventos', icon: CalendarDays },
    ...(isAdmin ? [{ href: '/users', label: 'Usuários', icon: Shield }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Logo and Church Name */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent overflow-hidden">
              {tenant?.logo ? (
                <img 
                  src={tenant.logo} 
                  alt={`Logo ${tenant.name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Church className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">{tenant?.name || 'ChurchOS'}</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestão</p>
            </div>
            <div className="block sm:hidden">
              <h1 className="text-base font-semibold text-foreground">{tenant?.name || 'ChurchOS'}</h1>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="ml-8 hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`inline-flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Navigation Button & User Menu */}
          <div className="ml-auto flex items-center space-x-2">
            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent overflow-hidden">
                    {tenant?.logo ? (
                      <img 
                        src={tenant.logo} 
                        alt={`Logo ${tenant.name}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Church className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-foreground">{tenant?.name || 'ChurchOS'}</h1>
                    <p className="text-sm text-muted-foreground">Sistema de Gestão</p>
                  </div>
                </div>
                
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                          isActive(item.href)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile?.name.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{profile?.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {profile?.email}
                    </p>
                    <p className="text-xs text-accent font-medium capitalize">
                      {profile?.role === 'admin' ? 'Administrador' : profile?.role === 'leader' ? 'Líder' : 'Membro'}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-6">
          {children}
        </div>
      </main>
      </div>
    </ProtectedRoute>
  );
};

export default Layout;