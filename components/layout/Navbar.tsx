'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Calendar, Menu, User, Plus, Sun, Moon, X, LayoutDashboard, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession, signOut } from '@/lib/auth-client';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  useEffect(() => setMounted(true), []);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              CityPulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Événements
            </Link>
            {session?.user && (
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
            )}
            <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Tarifs
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}
            {session?.user ? (
              <>
                <Link href="/events/create">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => signOut()}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Se connecter</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="md:hidden flex items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )}
            <button className="p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t">
            <Link href="/" className="block py-2 text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
              Événements
            </Link>
            {session?.user && (
              <Link href="/dashboard" className="block py-2 text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
            )}
            <Link href="/pricing" className="block py-2 text-sm font-medium hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
              Tarifs
            </Link>
            {session?.user ? (
              <>
                <Link href="/events/create" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0" size="sm">
                    <Plus className="h-4 w-4 mr-2" />Créer un événement
                  </Button>
                </Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">
                    <User className="h-4 w-4 mr-2" />Profil
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full" size="sm" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-2" />Se déconnecter
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">Se connecter</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0" size="sm">S'inscrire</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
