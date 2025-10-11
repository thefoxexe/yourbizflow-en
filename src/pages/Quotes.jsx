import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, Trash2, MoreVertical, Edit, X, Mic, FileText, RefreshCw, Square, Loader2, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateClientDialog from '@/components/CreateClientDialog';
import { DatePicker } from '@/components/DatePicker';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet';

const Quotes = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  
  const initialQuoteState = {
    client_id: '',
    expiry_date: null,
    items: [{ description: '', quantity: 1, unit_price: '' }],
    tax_rate: 0,
  };
  const [newQuote, setNewQuote] = useState(initialQuoteState);

  const fetchQuoteData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [
      { data: quotesData, error: quotesError },
      { data: clientsData, error: clientsError }
    ] = await Promise.all([
      supabase.from('quotes').select('*, client:clients(*)').eq('user_id', user.id).order('issue_date', { ascending: false }),
      supabase.from('clients').select('*').eq('user_id', user.id)
    ]);

    if (quotesError) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les devis.' });
    } else {
      setQuotes(quotesData.map(q => ({
        ...q,
        amount: (q.items || []).reduce((acc, item) => acc + (item.quantity * item.unit_price), 0) * (1 + (q.tax_rate || 0) / 100)
      })));
    }
    if (!clientsError) setClients(clientsData);
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchQuoteData();
  }, [fetchQuoteData]);

  const handleClientCreated = (newClientData) => {
    setClients(prevClients => [...prevClients, newClientData]);
    setNewQuote(prevQuote => ({ ...prevQuote, client_id: newClientData.id }));
    setIsClientDialogOpen(false);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newQuote.items];
    updatedItems[index][field] = value;
    setNewQuote({ ...newQuote, items: updatedItems });
  };

  const addItem = () => {
    setNewQuote({
      ...newQuote,
      items: [...newQuote.items, { description: '', quantity: 1, unit_price: '' }],
    });
  };

  const removeItem = (index) => {
    const updatedItems = newQuote.items.filter((_, i) => i !== index);
    setNewQuote({ ...newQuote, items: updatedItems });
  };

  const calculateTotal = (items, tax_rate) => {
    const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);
    const tax = subtotal * (Number(tax_rate) / 100);
    return subtotal + tax;
  };

  const handleCreateQuote = async () => {
    const totalAmount = calculateTotal(newQuote.items, newQuote.tax_rate);
    if (!newQuote.client_id || totalAmount <= 0) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Veuillez sélectionner un client et ajouter au moins un article.' });
      return;
    }

    const { error } = await supabase
      .from('quotes')
      .insert({
        user_id: user.id,
        client_id: newQuote.client_id,
        expiry_date: newQuote.expiry_date ? format(newQuote.expiry_date, 'yyyy-MM-dd') : null,
        issue_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        items: newQuote.items.map(item => ({ ...item, quantity: Number(item.quantity), unit_price: Number(item.unit_price) })),
        tax_rate: Number(newQuote.tax_rate),
      });

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Le devis n'a pas pu être créé." });
    } else {
      toast({ title: 'Succès', description: 'Devis créé avec succès.' });
      setIsQuoteDialogOpen(false);
      setNewQuote(initialQuoteState);
      fetchQuoteData();
    }
  };

  const handleDeleteQuote = async (quoteId) => {
    const { error } = await supabase.from('quotes').delete().eq('id', quoteId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Le devis n'a pas pu être supprimé." });
    } else {
      toast({ title: 'Succès', description: 'Devis supprimé.' });
      fetchQuoteData();
      setSelectedQuote(null);
    }
  };

  const handleUpdateStatus = async (quoteId, status) => {
    const { error } = await supabase.from('quotes').update({ status }).eq('id', quoteId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Le statut n'a pas pu être mis à jour." });
    } else {
      toast({ title: 'Succès', description: 'Statut du devis mis à jour.' });
      fetchQuoteData();
      if (selectedQuote?.id === quoteId) {
        setSelectedQuote(prev => ({...prev, status}));
      }
    }
  };

  const handleConvertToInvoice = async (quote) => {
    const { error } = await supabase.from('invoices').insert({
      user_id: quote.user_id,
      client_id: quote.client_id,
      amount: quote.amount,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      status: 'pending',
      items: quote.items,
      tax_rate: quote.tax_rate,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "La conversion en facture a échoué." });
    } else {
      await handleUpdateStatus(quote.id, 'accepted');
      toast({ title: 'Succès', description: 'Devis converti en facture !' });
    }
  };

  const handleGenerateSuggestion = async (index) => {
    if (!profile?.business_description) {
      toast({
        variant: 'destructive',
        title: 'Action requise',
        description: "Veuillez d'abord décrire votre activité dans les données d'entreprise (via le module Facturation).",
      });
      return;
    }
    setIsGeneratingSuggestion(index);
    const userInput = newQuote.items[index].description;
    const { data, error } = await supabase.functions.invoke('generate-text-suggestion', {
      body: { 
        business_description: profile.business_description, 
        context: 'quote_item',
        userInput: userInput
      },
    });
    setIsGeneratingSuggestion(null);

    if (error || data.error) {
      toast({ variant: 'destructive', title: "Erreur de l'IA", description: "La suggestion n'a pas pu être générée." });
    } else {
      handleItemChange(index, 'description', data.suggestion);
      toast({ title: 'Suggestion générée !' });
    }
  };

  const handleDownloadPDF = (quote) => {
    setIsGeneratingPdf(quote.id);
    const doc = new jsPDF();
    const currencySymbol = profile?.currency === 'chf' ? 'CHF' : (profile?.currency === 'usd' ? '$' : '€');
    
    const addContent = () => {
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('DEVIS', 14, 55);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(profile?.company_name || 'Votre Entreprise', 120, 22);
      doc.text(profile?.email || user?.email || '', 120, 27);
      doc.text(profile?.company_address || '', 120, 32);
      doc.text(profile?.company_phone || '', 120, 37);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Adressé à :', 14, 70);
      doc.setFont('helvetica', 'normal');
      doc.text(quote.client?.name || 'N/A', 14, 76);
      doc.text(quote.client?.address || '', 14, 81);
      doc.text(quote.client?.email || 'N/A', 14, 86);

      doc.setFontSize(10);
      doc.text(`Numéro de devis : ${quote.quote_number}`, 120, 70);
      doc.text(`Date d'émission : ${new Date(quote.issue_date).toLocaleDateString('fr-FR')}`, 120, 75);
      if (quote.expiry_date) {
        doc.text(`Valide jusqu'au : ${new Date(quote.expiry_date).toLocaleDateString('fr-FR')}`, 120, 80);
      }

      const tableBody = (quote.items || []).map(item => [
        item.description,
        item.quantity,
        `${Number(item.unit_price).toFixed(2)} ${currencySymbol}`,
        `${(item.quantity * item.unit_price).toFixed(2)} ${currencySymbol}`
      ]);

      doc.autoTable({
        startY: 95,
        head: [['Description', 'Quantité', 'Prix Unitaire', 'Total HT']],
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: [38, 38, 38] },
      });

      const finalY = doc.lastAutoTable.finalY;
      const subtotal = (quote.items || []).reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
      const tax = subtotal * ((quote.tax_rate || 0) / 100);
      const total = subtotal + tax;

      doc.setFontSize(10);
      doc.text('Sous-total HT :', 140, finalY + 10);
      doc.text(`${subtotal.toFixed(2)} ${currencySymbol}`, 170, finalY + 10);
      doc.text(`TVA (${quote.tax_rate || 0}%) :`, 140, finalY + 15);
      doc.text(`${tax.toFixed(2)} ${currencySymbol}`, 170, finalY + 15);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Total TTC :', 140, finalY + 22);
      doc.text(`${total.toFixed(2)} ${currencySymbol}`, 170, finalY + 22);

      doc.save(`devis-${quote.quote_number}.pdf`);
      setIsGeneratingPdf(null);
    };

    if (profile?.company_logo_url) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = profile.company_logo_url;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          doc.addImage(dataURL, 'PNG', 14, 15, 30, 30);
        } catch (e) { console.error("Error adding image to PDF", e); }
        addContent();
      };
      img.onerror = () => { 
        addContent();
        setIsGeneratingPdf(null);
      };
    } else {
      addContent();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted': return 'Accepté';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      default: return 'Brouillon';
    }
  };

  const handleVoiceButtonClick = () => {
    toast({
      title: "🚧 En développement",
      description: "Cette fonctionnalité est en cours de construction et sera bientôt disponible !",
    });
  };

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Devis - YourBizFlow</title>
        <meta name="description" content="Créez et gérez vos devis et propositions commerciales. Convertissez facilement vos devis en factures et suivez leur statut." />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Devis</h1>
          <p className="text-muted-foreground">Créez et gérez vos propositions commerciales</p>
        </div>
        <Button onClick={() => { setNewQuote(initialQuoteState); setIsQuoteDialogOpen(true); }} className="flex-shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau devis
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-sm border rounded-xl overflow-hidden">
        <div className="p-6 border-b"><h2 className="text-xl font-bold text-foreground">Devis récents</h2></div>
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 font-semibold text-muted-foreground">Numéro</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Client</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Montant</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Statut</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Échéance</th>
                <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan="6" className="p-4"><div className="h-8 bg-muted/50 rounded animate-pulse"></div></td></tr>
                ))
              ) : quotes.map((quote, index) => (
                <motion.tr key={quote.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 font-medium">{quote.quote_number}</td>
                  <td className="p-4 text-muted-foreground">{quote.client?.name || 'Client supprimé'}</td>
                  <td className="p-4 font-semibold">{profile?.currency === 'chf' ? 'CHF' : (profile?.currency === 'usd' ? '$' : '€')}{quote.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(quote.status)}`}>
                      {getStatusText(quote.status)}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{quote.expiry_date ? new Date(quote.expiry_date).toLocaleDateString('fr-FR') : 'N/A'}</td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedQuote(quote)}><Eye className="w-4 h-4 mr-2" /> Voir</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPDF(quote)} disabled={isGeneratingPdf === quote.id}>
                          {isGeneratingPdf === quote.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                          {isGeneratingPdf === quote.id ? 'Génération...' : 'Télécharger PDF'}
                        </DropdownMenuItem>
                        {quote.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)}><RefreshCw className="w-4 h-4 mr-2" /> Convertir en facture</DropdownMenuItem>
                        )}
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger><Edit className="w-4 h-4 mr-2" /> Changer statut</DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'accepted')}>Accepté</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'pending')}>En attente</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'rejected')}>Rejeté</DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuItem onClick={() => handleDeleteQuote(quote.id)} className="text-red-500 focus:text-red-500">
                          <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sm:hidden p-4 space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse"></div>)
          ) : quotes.map(quote => (
            <div key={quote.id} className="bg-card border rounded-lg p-4 flex justify-between items-center">
              <div className="flex-1" onClick={() => setSelectedQuote(quote)}>
                <p className="font-bold">{quote.quote_number}</p>
                <p className="text-sm text-muted-foreground">{quote.client?.name || 'Client supprimé'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="font-bold text-sm">{profile?.currency === 'chf' ? 'CHF' : (profile?.currency === 'usd' ? '$' : '€')}{quote.amount.toFixed(2)}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(quote.status)}`}>
                    {getStatusText(quote.status)}
                  </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}><MoreVertical className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedQuote(quote)}><Eye className="w-4 h-4 mr-2" /> Voir</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadPDF(quote)} disabled={isGeneratingPdf === quote.id}>
                    {isGeneratingPdf === quote.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    PDF
                  </DropdownMenuItem>
                  {quote.status === 'pending' && (
                    <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)}><RefreshCw className="w-4 h-4 mr-2" /> Convertir</DropdownMenuItem>
                  )}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger><Edit className="w-4 h-4 mr-2" /> Statut</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'accepted')}>Accepté</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'pending')}>En attente</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'rejected')}>Rejeté</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem onClick={() => handleDeleteQuote(quote.id)} className="text-red-500 focus:text-red-500">
                    <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </motion.div>

      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails du devis {selectedQuote?.quote_number}</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="py-4 space-y-4">
              <p><strong>Client:</strong> {selectedQuote.client?.name}</p>
              <p><strong>Montant:</strong> {profile?.currency === 'chf' ? 'CHF' : (profile?.currency === 'usd' ? '$' : '€')}{selectedQuote.amount.toFixed(2)}</p>
              <p><strong>Statut:</strong> <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedQuote.status)}`}>{getStatusText(selectedQuote.status)}</span></p>
              <p><strong>Date d'émission:</strong> {new Date(selectedQuote.issue_date).toLocaleDateString('fr-FR')}</p>
              {selectedQuote.expiry_date && <p><strong>Date d'expiration:</strong> {new Date(selectedQuote.expiry_date).toLocaleDateString('fr-FR')}</p>}
              <div className="flex gap-2 mt-4 flex-wrap">
                <Button variant="outline" onClick={() => handleDownloadPDF(selectedQuote)} disabled={isGeneratingPdf === selectedQuote.id}>
                  {isGeneratingPdf === selectedQuote.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  PDF
                </Button>
                {selectedQuote.status === 'pending' && (
                  <Button onClick={() => handleConvertToInvoice(selectedQuote)}><RefreshCw className="w-4 h-4 mr-2" /> Convertir</Button>
                )}
                <Button variant="destructive" onClick={() => handleDeleteQuote(selectedQuote.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Créer un nouveau devis</DialogTitle>
            <DialogDescription>Remplissez les informations manuellement ou utilisez l'IA.</DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-4 py-4">
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
                <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Remplir manuellement
                </Button>
                <Button className="w-full" onClick={handleVoiceButtonClick}>
                    <Mic className="w-4 h-4 mr-2" />
                    Créer avec l'IA vocale
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Client</Label>
                <div className="flex gap-2 mt-1">
                  <select id="client" value={newQuote.client_id} onChange={(e) => setNewQuote({...newQuote, client_id: e.target.value})} className="w-full border rounded-md p-2 bg-background text-foreground">
                    <option value="">Sélectionner un client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Button variant="outline" size="icon" onClick={() => setIsClientDialogOpen(true)}><Plus /></Button>
                </div>
              </div>
              <div>
                <Label htmlFor="expiry_date">Date d'expiration</Label>
                <DatePicker date={newQuote.expiry_date} setDate={(date) => setNewQuote({ ...newQuote, expiry_date: date })} className="mt-1" />
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label>Articles</Label>
              {newQuote.items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="relative flex-grow w-full">
                    <Input type="text" placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="pr-10" />
                    <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => handleGenerateSuggestion(index)} disabled={isGeneratingSuggestion === index}>
                      {isGeneratingSuggestion === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-yellow-400" />}
                    </Button>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Input type="number" placeholder="Qté" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-1/2 sm:w-20" />
                    <Input type="number" placeholder="Prix U." value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} className="w-1/2 sm:w-24" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={newQuote.items.length <= 1}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem} className="mt-2">
                <Plus className="h-4 w-4 mr-2" /> Ajouter un article
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="tax_rate">Taux de TVA (%)</Label>
                <Input id="tax_rate" type="number" value={newQuote.tax_rate} onChange={(e) => setNewQuote({...newQuote, tax_rate: e.target.value})} className="mt-1" />
              </div>
              <div className="text-right self-end">
                <p className="text-muted-foreground">Total TTC</p>
                <p className="text-2xl font-bold">{profile?.currency === 'chf' ? 'CHF' : (profile?.currency === 'usd' ? '$' : '€')}{calculateTotal(newQuote.items, newQuote.tax_rate).toFixed(2)}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateQuote}>Créer le devis</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateClientDialog 
        isOpen={isClientDialogOpen} 
        onOpenChange={setIsClientDialogOpen}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
};

export default Quotes;