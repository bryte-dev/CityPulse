'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Calendar, MapPin, Users, Clock, ArrowLeft, Star, Send, Trash2, MessageCircle, UserCheck, UserMinus
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import {
  getEvent, getEventRegistrations, getRegistration, createRegistration, deleteRegistration,
  getEventComments, createComment, deleteComment
} from '@/lib/db';
import type { Event, Registration, Comment } from '@/types';
import { formatDate } from '@/lib/utils';

function useSession() {
  const [session, setSession] = useState<{ user: any } | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setSession(user ? { user } : null);
    });
    return () => unsubscribe();
  }, []);
  return { data: session };
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [myRegistration, setMyRegistration] = useState<Registration | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [ev, regs, comms] = await Promise.all([
        getEvent(id),
        getEventRegistrations(id),
        getEventComments(id),
      ]);
      setEvent(ev);
      setRegistrations(regs);
      setComments(comms);
      if (session?.user) {
        const myReg = await getRegistration(id, session.user.id);
        setMyRegistration(myReg);
      }
      setLoading(false);
    };
    load();
  }, [id, session?.user?.id]);

  const handleRegister = async () => {
    if (!session?.user) { router.push('/sign-in'); return; }
    setRegistering(true);
    try {
      if (myRegistration) {
        await deleteRegistration(myRegistration.id, id);
        setMyRegistration(null);
        setRegistrations((r) => r.filter((x) => x.id !== myRegistration.id));
        setEvent((e) => e ? { ...e, participantCount: Math.max(0, e.participantCount - 1) } : e);
        toast.success('Désinscription effectuée');
      } else {
        if (event?.maxParticipants && registrations.length >= event.maxParticipants) {
          toast.error('Événement complet');
          return;
        }
        const regId = await createRegistration({
          eventId: id,
          userId: session.user.id,
          userName: session.user.name,
          userAvatar: session.user.image || undefined,
          registeredAt: new Date(),
        });
        if (regId) {
          const reg: Registration = {
            id: regId, eventId: id, userId: session.user.id,
            userName: session.user.name, userAvatar: session.user.image || undefined,
            registeredAt: new Date(),
          };
          setMyRegistration(reg);
          setRegistrations((r) => [...r, reg]);
          setEvent((e) => e ? { ...e, participantCount: e.participantCount + 1 } : e);
          toast.success('Inscrit ! À bientôt 🎉');
        }
      }
    } catch {
      toast.error('Erreur lors de l\'opération');
    } finally {
      setRegistering(false);
    }
  };

  const handleComment = async (parentId?: string) => {
    if (!session?.user) { router.push('/sign-in'); return; }
    const text = parentId ? replyText : commentText;
    if (!text.trim()) return;
    setSubmittingComment(true);
    try {
      const commentId = await createComment({
        eventId: id,
        userId: session.user.id,
        userName: session.user.name,
        userAvatar: session.user.image || undefined,
        text: text.trim(),
        rating: parentId ? undefined : rating,
        parentCommentId: parentId || null,
        createdAt: new Date(),
      });
      if (commentId) {
        const newComment: Comment = {
          id: commentId, eventId: id, userId: session.user.id,
          userName: session.user.name, userAvatar: session.user.image || undefined,
          text: text.trim(), rating: parentId ? undefined : rating,
          parentCommentId: parentId || null, createdAt: new Date(),
        };
        setComments((c) => [newComment, ...c]);
        if (parentId) { setReplyText(''); setReplyTo(null); } else { setCommentText(''); setRating(5); }
        toast.success('Commentaire ajouté !');
      }
    } catch {
      toast.error('Erreur');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
    setComments((c) => c.filter((x) => x.id !== commentId));
    toast.success('Commentaire supprimé');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Événement introuvable</h2>
            <Link href="/"><Button><ArrowLeft className="h-4 w-4 mr-2" />Retour</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const topComments = comments.filter((c) => !c.parentCommentId);
  const replies = comments.filter((c) => c.parentCommentId);
  const isFull = !!(event.maxParticipants && registrations.length >= event.maxParticipants);
  const ratedComments = topComments.filter((c) => c.rating);
  const avgRating = ratedComments.length > 0
    ? ratedComments.reduce((a, c) => a + (c.rating || 0), 0) / ratedComments.length
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Cover */}
        <div className="h-64 md:h-80 relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
          {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover absolute inset-0" />}
          <div className="absolute inset-0 bg-black/30 flex items-end p-6">
            <div className="text-white">
              <Link href="/" className="flex items-center text-sm mb-3 opacity-80 hover:opacity-100">
                <ArrowLeft className="h-4 w-4 mr-1" />Retour
              </Link>
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs uppercase tracking-wider">{event.category}</span>
              <h1 className="text-2xl md:text-4xl font-bold mt-2 drop-shadow">{event.title}</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                </CardContent>
              </Card>

              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Avis & Commentaires
                    {avgRating > 0 && (
                      <span className="flex items-center gap-1 text-sm font-normal text-yellow-500">
                        <Star className="h-4 w-4 fill-yellow-500" />{avgRating.toFixed(1)}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add comment */}
                  {session?.user ? (
                    <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map((s) => (
                          <button key={s} type="button" onClick={() => setRating(s)}>
                            <Star className={`h-5 w-5 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Laisse ton avis..."
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none h-20"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <Button size="sm" onClick={() => handleComment()} disabled={submittingComment || !commentText.trim()}>
                        <Send className="h-4 w-4 mr-2" />Publier
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      <Link href="/sign-in" className="text-primary hover:underline">Connecte-toi</Link> pour laisser un avis
                    </p>
                  )}

                  {/* Comments list */}
                  {topComments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Sois le premier à donner ton avis !</p>
                  ) : (
                    <div className="space-y-4">
                      {topComments.map((comment) => {
                        const commentReplies = replies.filter((r) => r.parentCommentId === comment.id);
                        return (
                          <div key={comment.id} className="border-b border-border/50 pb-4 last:border-0">
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {comment.userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{comment.userName}</span>
                                  {comment.rating && (
                                    <div className="flex">{Array.from({length:comment.rating}).map((_,i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}</div>
                                  )}
                                  <span className="text-xs text-muted-foreground ml-auto">{formatDate(comment.createdAt)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{comment.text}</p>
                                <div className="flex gap-3 mt-2">
                                  {session?.user && (
                                    <button className="text-xs text-primary hover:underline" onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}>
                                      Répondre
                                    </button>
                                  )}
                                  {session?.user?.id === comment.userId && (
                                    <button className="text-xs text-destructive hover:underline" onClick={() => handleDeleteComment(comment.id)}>
                                      <Trash2 className="h-3 w-3 inline mr-1" />Supprimer
                                    </button>
                                  )}
                                </div>

                                {/* Reply input */}
                                {replyTo === comment.id && (
                                  <div className="mt-3 flex gap-2">
                                    <input
                                      className="flex-1 px-3 py-1.5 rounded-md border border-input bg-background text-sm"
                                      placeholder="Répondre..."
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                    />
                                    <Button size="sm" onClick={() => handleComment(comment.id)} disabled={submittingComment || !replyText.trim()}>
                                      <Send className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                )}

                                {/* Replies */}
                                {commentReplies.map((reply) => (
                                  <div key={reply.id} className="mt-3 ml-4 flex items-start gap-2 border-l-2 border-primary/20 pl-3">
                                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                      {reply.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-medium text-xs">{reply.userName}</span>
                                        <span className="text-xs text-muted-foreground ml-auto">{formatDate(reply.createdAt)}</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">{reply.text}</p>
                                      {session?.user?.id === reply.userId && (
                                        <button className="text-xs text-destructive hover:underline mt-1" onClick={() => handleDeleteComment(reply.id)}>
                                          <Trash2 className="h-3 w-3 inline mr-1" />Supprimer
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Event Info */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  {event.startTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{event.participantCount}{event.maxParticipants ? ` / ${event.maxParticipants}` : ''} participants</span>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <span className="text-lg font-bold">
                      {event.isFree ? <span className="text-green-500">Gratuit</span> : <span className="text-purple-600">{event.price} CHF</span>}
                    </span>
                  </div>
                  <Button
                    className={`w-full ${myRegistration ? 'bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive border border-border' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0'}`}
                    onClick={handleRegister}
                    disabled={registering || (isFull && !myRegistration)}
                  >
                    {registering ? 'En cours...' : myRegistration ? (
                      <><UserMinus className="h-4 w-4 mr-2" />Se désinscrire</>
                    ) : isFull ? 'Complet' : (
                      <><UserCheck className="h-4 w-4 mr-2" />S'inscrire</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Organizer */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Organisateur</CardTitle></CardHeader>
                <CardContent>
                  <Link href={`/profile/${event.organizerId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                      {event.organizerName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm">{event.organizerName}</span>
                  </Link>
                </CardContent>
              </Card>

              {/* Participants */}
              {registrations.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">Participants ({registrations.length})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {registrations.slice(0, 10).map((r) => (
                        <div key={r.id} title={r.userName} className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                          {r.userName.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {registrations.length > 10 && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          +{registrations.length - 10}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
