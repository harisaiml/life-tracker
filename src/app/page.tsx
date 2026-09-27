'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Eye, EyeOff, Mail, Lock, User, Chrome } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message || 'Invalid credentials. Please check your email and password.');
        } else {
          // Wait a moment for state to update
          await new Promise(resolve => setTimeout(resolve, 500));
          router.push('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message || 'Sign up failed. Please try again.');
        } else {
          setError('');
          alert('Account created! Please check your email to confirm your account, then sign in.');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message || 'Google sign in failed');
      setIsLoading(false);
    }
    // If successful, user will be redirected
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Activity className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-lg w-full max-w-md p-8 border border-border">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-primary p-3 rounded-xl">
            <Activity className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-foreground mb-2">Life Tracker</h1>
        <p className="text-center text-muted-foreground mb-8">
          {isLogin ? 'Welcome back!' : 'Create your account'}
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                  className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background outline-none transition" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background outline-none transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required minLength={6}
                className="w-full pl-10 pr-12 py-3 border border-input rounded-lg bg-background outline-none transition" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">or continue with</span>
          </div>
        </div>

        <button onClick={handleGoogleSignIn} disabled={isLoading}
          className="w-full border border-border hover:bg-muted text-foreground font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50">
          <Chrome className="w-5 h-5" /> Google
        </button>

        <p className="mt-6 text-center text-muted-foreground">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-primary hover:opacity-80 font-semibold">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
