'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function PresentationLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/presentation/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Accès accordé');
        router.push('/');
      } else {
        toast.error(data?.error || 'Mot de passe incorrect');
      }
    } catch (e) {
      toast.error('Erreur');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-sm p-6 bg-white rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Accès présentation</h2>
        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" type="password" />
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={loading}>{loading ? 'Vérification...' : 'Se connecter'}</Button>
        </div>
      </form>
    </div>
  );
}
