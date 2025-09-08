import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, Store } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const LoginPage = () => {
  const { signIn, signInWithUsername, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [accessCode, setAccessCode] = useState('');

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check if outside operating hours and validate access code
    if (!isOperatingHours()) {
      if (accessCode !== '165432') {
        setError('Kode akses diperlukan untuk login diluar jam operasional');
        setIsLoading(false);
        return;
      }
    }

    let result;
    if (formData.email.includes('@')) {
      result = await signIn(formData.email, formData.password);
    } else {
      result = await signInWithUsername(formData.email, formData.password);
    }
    
    if (result.error) {
      setError(result.error.message);
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await signUp(formData.email, formData.username, formData.password);
    if (error) {
      setError(error.message);
    } else {
      toast.success('Pendaftaran berhasil. Silakan cek email untuk konfirmasi.');
      setShowSignUp(false);
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const redirectTo = `${window.location.origin}/login`;
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo,
      });
      if (error) throw error;
      toast.success('Email reset password telah dikirim. Periksa inbox Anda.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat mengirim email reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if current time is within operating hours (06:00 - 17:00)
  const isOperatingHours = () => {
    const currentHour = currentTime.getHours();
    return currentHour >= 6 && currentHour < 17;
  };

  // Format time to Indonesian locale
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (showSignUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Daftar Akun</CardTitle>
            <CardDescription>
              Buat akun baru untuk menggunakan aplikasi kasir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@contoh.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newUsername">Username</Label>
                <Input
                  id="newUsername"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Mendaftarkan...' : 'Daftar'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => { setShowSignUp(false); setError(''); }}
                >
                  Kembali ke Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Lupa Password</CardTitle>
            <CardDescription>
              Masukkan email untuk reset password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Mengirim...' : 'Kirim Email Reset'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError('');
                    setResetEmail('');
                  }}
                >
                  Kembali ke Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <div className="text-left">
              <CardTitle className="text-xl font-bold text-foreground">Kasir Toko Anjar</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Sistem Point of Sale
              </CardDescription>
            </div>
          </div>
          
          {/* Status Toko dan Waktu */}
          <div className="space-y-2">
            <div className={`flex items-center justify-center px-4 py-2 rounded-lg border transition-all duration-500 ${
              isOperatingHours() 
                ? 'bg-green-500/10 border-green-500/20 animate-fade-in' 
                : 'bg-red-500/10 border-red-500/20 animate-fade-in'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full animate-pulse ${
                  isOperatingHours() ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className={`text-xs font-semibold ${
                  isOperatingHours() ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                }`}>
                  {isOperatingHours() ? 'TOKO BUKA' : 'TOKO TUTUP'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-center px-4 py-2 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-primary" />
                <span className="font-mono text-sm font-medium">
                  {formatTime(currentTime)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2">
            {formatDate(currentTime)}
          </div>
          
          {/* Development Note */}
         {/* <div className="mt-4 p-3 bg-info/10 border border-info/20 rounded-lg">
          {/*  <p className="text-xs text-muted-foreground text-center">
              💡 <strong>Tips:</strong> Untuk testing yang lebih cepat, nonaktifkan "Confirm email" 
              di Supabase Dashboard → Auth → Settings
            </p>
          </div> */}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Email atau Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  email: e.target.value 
                })}
                placeholder="Masukkan email atau username"
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Masukkan password"
                className="h-11"
                required
              />
            </div>

            {!isOperatingHours() && (
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-sm font-medium">Kode Akses</Label>
                <Input
                  id="accessCode"
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Masukkan kode akses"
                  className="h-11"
                  required
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3 pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-primary to-primary-light hover:from-primary/90 hover:to-primary-light/90" 
                disabled={isLoading || (!isOperatingHours() && !accessCode)}
              >
                {isLoading ? 'Memproses...' : 'Masuk ke Sistem'}
              </Button>
              
              {!isOperatingHours() && (
                <Button 
                  type="submit" 
                  variant="outline"
                  className="w-full h-11 border-orange-500 text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-400 dark:hover:bg-orange-950" 
                  disabled={isLoading}
                  onClick={(e) => {
                    e.preventDefault();
                    setAccessCode('165432'); // Set access code automatically
                    setTimeout(() => {
                      const form = e.currentTarget.closest('form');
                      if (form) {
                        form.requestSubmit();
                      }
                    }, 100);
                  }}
                >
                  ⚠️ Paksa Login (Diluar Jam Operasional)
                </Button>
              )}
              
              <div className="flex gap-2">
               {/*  <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 text-sm" 
                  onClick={() => { setShowSignUp(true); setError(''); }}
                >
                  Daftar Akun
                </Button> */}
              
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 text-sm text-muted-foreground hover:text-primary" 
                  onClick={() => setShowForgotPassword(true)}
                >
                  Lupa Password?
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};