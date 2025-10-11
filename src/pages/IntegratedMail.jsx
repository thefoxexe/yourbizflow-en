import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Helmet } from 'react-helmet';
import { Inbox, Send, FileText, Archive, Trash2, AlertTriangle, Loader2, RefreshCw, Wrench } from 'lucide-react'; // Added Wrench icon
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MailViewer = ({ mail }) => {
  if (!mail) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Inbox className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold">Sélectionnez un e-mail</h2>
        <p className="text-muted-foreground mt-2">Choisissez un e-mail dans la liste pour le lire ici.</p>
      </div>
    );
  }

  const from = mail.payload.headers.find(h => h.name === 'From')?.value || 'N/A';
  const to = mail.payload.headers.find(h => h.name === 'To')?.value || 'N/A';
  const subject = mail.payload.headers.find(h => h.name === 'Subject')?.value || 'Sans objet';
  const date = new Date(mail.payload.headers.find(h => h.name === 'Date')?.value).toLocaleString();

  const getBody = (payload) => {
    if (payload.body.size > 0) {
      return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
    if (payload.parts) {
      const htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
      if (htmlPart) {
        return atob(htmlPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }
      const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
      if (textPart) {
        return atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }
    }
    return 'Contenu non disponible.';
  };

  const bodyContent = getBody(mail.payload);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold truncate">{subject}</h2>
        <p className="text-sm text-muted-foreground truncate">De: {from}</p>
        <p className="text-sm text-muted-foreground truncate">À: {to}</p>
        <p className="text-xs text-muted-foreground mt-1">{date}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
      </div>
    </div>
  );
};

const IntegratedMail = () => {
  const { toast } = useToast();
  const { session, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mails, setMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [isFetchingMails, setIsFetchingMails] = useState(false);

  // For now, we'll always show the "Coming Soon" message
  const isConnected = false; // !!session?.provider_token;

  const handleConnectGmail = async () => {
    toast({
      title: "🚧 Cette fonctionnalité n'est pas encore implémentée—mais ne vous inquiétez pas ! Vous pouvez la demander dans votre prochaine requête ! 🚀",
    });
    // const { error } = await supabase.auth.signInWithOAuth({
    //   provider: 'google',
    //   options: {
    //     scopes: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify',
    //     redirectTo: window.location.href,
    //   },
    // });
    // if (error) {
    //   toast({ variant: 'destructive', title: 'Erreur de connexion', description: error.message });
    // }
  };

  const handleDisconnectGmail = async () => {
    toast({
      title: "🚧 Cette fonctionnalité n'est pas encore implémentée—mais ne vous inquiétez pas ! Vous pouvez la demander dans votre prochaine requête ! 🚀",
    });
    // const { error } = await supabase.auth.signOut();
    // if (error) {
    //   toast({ variant: 'destructive', title: 'Erreur de déconnexion', description: error.message });
    // } else {
    //   setMails([]);
    //   setSelectedMail(null);
    //   toast({ title: 'Déconnecté de Gmail' });
    // }
  };

  const fetchMails = useCallback(async () => {
    toast({
      title: "🚧 Cette fonctionnalité n'est pas encore implémentée—mais ne vous inquiétez pas ! Vous pouvez la demander dans votre prochaine requête ! 🚀",
    });
    // if (!isConnected) return;
    // setIsFetchingMails(true);
    // try {
    //   const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25', {
    //     headers: { 'Authorization': `Bearer ${session.provider_token}` }
    //   });
    //   if (!response.ok) {
    //     if (response.status === 401) {
    //       toast({ variant: 'destructive', title: 'Session expirée', description: 'Veuillez vous reconnecter à Gmail.' });
    //       handleDisconnectGmail();
    //     } else {
    //       throw new Error(`Erreur API: ${response.statusText}`);
    //     }
    //     return;
    //   }
    //   const data = await response.json();
    //   const messagePromises = data.messages.map(async (message) => {
    //     const msgResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
    //       headers: { 'Authorization': `Bearer ${session.provider_token}` }
    //     });
    //     return msgResponse.json();
    //   });
    //   const fullMessages = await Promise.all(messagePromises);
    //   setMails(fullMessages);
    //   toast({ title: 'E-mails récupérés avec succès !' });
    // } catch (error) {
    //   toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de récupérer les e-mails.' });
    //   console.error(error);
    // } finally {
    //   setIsFetchingMails(false);
    // }
  }, [toast]); // Removed isConnected, session?.provider_token

  useEffect(() => {
    setLoading(false);
    // if (isConnected) {
    //   fetchMails();
    // }
  }, []); // Removed isConnected, fetchMails

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Helmet>
        <title>Mail Intégré - Bientôt Disponible</title>
        <meta name="description" content="Le module de mail intégré est en cours de développement et sera bientôt disponible." />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-8 rounded-xl border shadow-lg max-w-md">
        <Wrench className="w-20 h-20 mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Mail Intégré</h1>
        <p className="text-muted-foreground mb-6">
          Ce module est en cours de développement et sera bientôt disponible pour vous aider à gérer vos e-mails directement depuis YourBizFlow.
          Restez à l'écoute pour les mises à jour !
        </p>
        <Button onClick={() => toast({ title: "🚧 Cette fonctionnalité n'est pas encore implémentée—mais ne vous inquiétez pas ! Vous pouvez la demander dans votre prochaine requête ! 🚀" })} size="lg">
          En savoir plus
        </Button>
      </motion.div>
    </div>
  );
};

export default IntegratedMail;