'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Upload, Plus, X } from 'lucide-react';
import type { CreateEventFormData, EventCategory } from '@/types';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateEventFormData>>({
    isFree: true,
    visibility: 'public',
    category: 'other',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implement actual event creation with Firebase
    console.log('Creating event:', formData);
    
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 1000);
  };

  const addTag = () => {
    if (tagInput && !formData.tags?.includes(tagInput)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag),
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Créer un événement</h1>
            <p className="text-muted-foreground">
              Partagez votre événement avec la communauté
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Détails de l'événement</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'événement *</Label>
                  <Input
                    id="title"
                    required
                    placeholder="Ex: Concert de musique électronique"
                    value={formData.title || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    required
                    rows={5}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Décrivez votre événement..."
                    value={formData.description || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Heure *</Label>
                    <Input
                      id="time"
                      type="time"
                      required
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const date = formData.date || new Date();
                        date.setHours(parseInt(hours), parseInt(minutes));
                        setFormData({ ...formData, date });
                      }}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <Input
                    id="address"
                    required
                    placeholder="Rue et numéro"
                    value={formData.address || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    required
                    placeholder="Ex: Lausanne"
                    value={formData.city || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <select
                    id="category"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as EventCategory,
                      })
                    }
                  >
                    <option value="music">Musique</option>
                    <option value="sport">Sport</option>
                    <option value="art">Art</option>
                    <option value="food">Food</option>
                    <option value="networking">Networking</option>
                    <option value="party">Soirée</option>
                    <option value="outdoor">Extérieur</option>
                    <option value="gaming">Gaming</option>
                    <option value="education">Éducation</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Ajouter un tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Max Participants */}
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">
                    Nombre maximum de participants (optionnel)
                  </Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="1"
                    placeholder="Illimité"
                    value={formData.maxParticipants || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxParticipants: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={formData.isFree}
                      onChange={(e) =>
                        setFormData({ ...formData, isFree: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isFree">Événement gratuit</Label>
                  </div>

                  {!formData.isFree && (
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="price">Prix (CHF) *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        required={!formData.isFree}
                        value={formData.price || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Visibility */}
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibilité</Label>
                  <select
                    id="visibility"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.visibility}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        visibility: e.target.value as 'public' | 'private',
                      })
                    }
                  >
                    <option value="public">Public</option>
                    <option value="private">Privé (sur invitation)</option>
                  </select>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image">Image de couverture</Label>
                  <div className="border-2 border-dashed border-input rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Glissez-déposez une image ou cliquez pour parcourir
                    </p>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="max-w-xs mx-auto"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, image: file });
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Création...' : 'Publier l\'événement'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                  >
                    Annuler
                  </Button>
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
