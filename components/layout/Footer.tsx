'use client';

import Link from 'next/link';
import { Github, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-4">CityPulse</h3>
            <p className="text-sm text-muted-foreground">
              Découvrez, créez et participez aux meilleurs événements de votre ville.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  Aide
                </a>
              </li>
              <li>
                <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Conditions d'utilisation
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Réseaux sociaux</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CityPulse. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
