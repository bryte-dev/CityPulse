'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createSupportMessage } from '@/lib/db';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return toast.error('Message requis');
    setLoading(true);
    try {
      await createSupportMessage({ name: name || undefined, email: email || undefined, message });
      toast.success('Message envoyé — nous reviendrons vers vous.');
      setName(''); setEmail(''); setMessage('');
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de l\'envoi');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardContent>
              <CardTitle>Contact</CardTitle>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label>Nom (optionnel)</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label>Email (optionnel)</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label>Message</Label>
                  <textarea className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none h-28" value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>{loading ? 'Envoi...' : 'Envoyer'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
