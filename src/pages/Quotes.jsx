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
import { useTranslation } from 'react-i18next';

const Quotes = () => {
  const { t } = useTranslation();
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
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('quotes.load_error') });
    } else {
      setQuotes(quotesData.map(q => ({
        ...q,
        amount: (q.items || []).reduce((acc, item) => acc + (item.quantity * item.unit_price), 0) * (1 + (q.tax_rate || 0) / 100)
      })));
    }
    if (!clientsError) setClients(clientsData);
    setLoading(false);
  }, [user, toast, t]);

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
      toast({ variant: 'destructive', title: t('toast_required_fields_title'), description: t('quotes.required_fields_error') });
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
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('quotes.create_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('quotes.create_success') });
      setIsQuoteDialogOpen(false);
      setNewQuote(initialQuoteState);
      fetchQuoteData();
    }
  };

  const handleDeleteQuote = async (quoteId) => {
    const { error } = await supabase.from('quotes').delete().eq('id', quoteId);
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('quotes.delete_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('quotes.delete_success') });
      fetchQuoteData();
      setSelectedQuote(null);
    }
  };

  const handleUpdateStatus = async (quoteId, status) => {
    const { error } = await supabase.from('quotes').update({ status }).eq('id', quoteId);
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('quotes.status_update_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('quotes.status_update_success') });
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
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('quotes.convert_error') });
    } else {
      await handleUpdateStatus(quote.id, 'accepted');
      toast({ title: t('toast_success_title'), description: t('quotes.convert_success') });
    }
  };

  const handleGenerateSuggestion = async (index) => {
    if (!profile?.business_description) {
      toast({
        variant: 'destructive',
        title: 'Action requise',
        description: t('quotes.ai_business_desc_missing'),
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
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('quotes.ai_error') });
    } else {
      handleItemChange(index, 'description', data.suggestion);
      toast({ title: t('quotes.ai_success') });
    }
  };

  const handleDownloadPDF = async (quote) => {
    setIsGeneratingPdf(quote.id);
    const doc = new jsPDF();
    const currencySymbol = profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€';
    const client = clients.find(c => c.id === quote.client_id) || quote.client;

    const addContent = () => {
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('DEVIS', 14, 40);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(profile?.company_name || 'Votre Entreprise', 140, 20);
      doc.text(profile?.email || user?.email || '', 140, 25);
      doc.text(profile?.company_address || '', 140, 30);
      doc.text(profile?.company_phone || '', 140, 35);

      doc.text('Adressé à :', 14, 70);
      doc.text(client?.name || 'N/A', 14, 76);
      doc.text(client?.address || '', 14, 81);
      doc.text(client?.email || 'N/A', 14, 86);

      doc.text(`Numéro de devis : ${quote.quote_number}`, 140, 70);
      doc.text(`Date d'émission : ${new Date(quote.issue_date).toLocaleDateString('fr-FR')}`, 140, 75);
      if (quote.expiry_date) {
        doc.text(`Valide jusqu'au : ${new Date(quote.expiry_date).toLocaleDateString('fr-FR')}`, 140, 80);
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
        theme: 'grid',
        headStyles: { fillColor: [50, 50, 50] },
      });

      const finalY = doc.lastAutoTable.finalY;
      const subtotal = (quote.items || []).reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
      const tax = subtotal * ((quote.tax_rate || 0) / 100);
      const total = subtotal + tax;
      const rightAlignX = doc.internal.pageSize.width - 20;

      doc.setFontSize(10);
      doc.text('Sous-total HT :', 140, finalY + 10, { align: 'left' });
      doc.text(`${subtotal.toFixed(2)} ${currencySymbol}`, rightAlignX, finalY + 10, { align: 'right' });
      doc.text(`TVA (${quote.tax_rate || 0}%) :`, 140, finalY + 17, { align: 'left' });
      doc.text(`${tax.toFixed(2)} ${currencySymbol}`, rightAlignX, finalY + 17, { align: 'right' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Total TTC :', 140, finalY + 24, { align: 'left' });
      doc.text(`${total.toFixed(2)} ${currencySymbol}`, rightAlignX, finalY + 24, { align: 'right' });

      doc.save(`devis-${quote.quote_number}.pdf`);
      setIsGeneratingPdf(null);
    };

    if (profile?.company_logo_url) {
      try {
        const response = await fetch(profile.company_logo_url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = function(event) {
          const img = new Image();
          img.src = event.target.result;
          img.onload = function() {
            try {
              const maxWidth = 40;
              const maxHeight = 20;
              let imgWidth = this.width;
              let imgHeight = this.height;

              if (imgWidth > maxWidth) {
                  const ratio = maxWidth / imgWidth;
                  imgWidth = maxWidth;
                  imgHeight *= ratio;
              }
              if (imgHeight > maxHeight) {
                  const ratio = maxHeight / imgHeight;
                  imgHeight = maxHeight;
                  imgWidth *= ratio;
              }
              doc.addImage(this.src, 'PNG', 14, 10, imgWidth, imgHeight);
            } catch (e) {
              console.error("Error adding image to PDF", e);
            } finally {
              addContent();
            }
          };
          img.onerror = function(e) {
            console.error("Image loading error in onload", e);
            addContent();
          };
        };
        reader.onerror = function(e) {
          console.error("FileReader error:", e);
          addContent();
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        console.error("Error fetching company logo:", e);
        addContent();
      }
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
    return t(`quotes.status_${status}`);
  };

  const handleVoiceButtonClick = () => {
    toast({
      title: t('quotes.dev_in_progress_title'),
      description: t('quotes.dev_in_progress'),
    });
  };

  return (
    <div className="space-y-8">
      <Helmet>
        <title>{t('quotes.title')} - YourBizFlow</title>
        <meta name="description" content={t('quotes.subtitle')} />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('quotes.title')}</h1>
          <p className="text-muted-foreground">{t('quotes.subtitle')}</p>
        </div>
        <Button onClick={() => { setNewQuote(initialQuoteState); setIsQuoteDialogOpen(true); }} className="flex-shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          {t('quotes.new_quote')}
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-sm border rounded-xl overflow-hidden">
        <div className="p-6 border-b"><h2 className="text-xl font-bold text-foreground">{t('quotes.recent_quotes')}</h2></div>
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 font-semibold text-muted-foreground">{t('quotes.table_number')}</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">{t('quotes.table_client')}</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">{t('quotes.table_amount')}</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">{t('quotes.table_status')}</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">{t('quotes.table_due_date')}</th>
                <th className="text-right p-4 font-semibold text-muted-foreground">{t('quotes.table_actions')}</th>
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
                  <td className="p-4 text-muted-foreground">{quote.client?.name || t('client_deleted')}</td>
                  <td className="p-4 font-semibold">{profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'}{quote.amount.toFixed(2)}</td>
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
                        <DropdownMenuItem onClick={() => setSelectedQuote(quote)}><Eye className="w-4 h-4 mr-2" /> {t('quotes.action_view')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPDF(quote)} disabled={isGeneratingPdf === quote.id}>
                          {isGeneratingPdf === quote.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                          {isGeneratingPdf === quote.id ? t('quotes.action_generating_pdf') : t('quotes.action_download_pdf')}
                        </DropdownMenuItem>
                        {quote.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)}><RefreshCw className="w-4 h-4 mr-2" /> {t('quotes.action_convert')}</DropdownMenuItem>
                        )}
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger><Edit className="w-4 h-4 mr-2" /> {t('quotes.action_change_status')}</DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'accepted')}>{t('quotes.status_accepted')}</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'pending')}>{t('quotes.status_pending')}</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'rejected')}>{t('quotes.status_rejected')}</DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuItem onClick={() => handleDeleteQuote(quote.id)} className="text-red-500 focus:text-red-500">
                          <Trash2 className="w-4 h-4 mr-2" /> {t('quotes.action_delete')}
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
                <p className="text-sm text-muted-foreground">{quote.client?.name || t('client_deleted')}</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="font-bold text-sm">{profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'}{quote.amount.toFixed(2)}</p>
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
                  <DropdownMenuItem onClick={() => setSelectedQuote(quote)}><Eye className="w-4 h-4 mr-2" /> {t('quotes.action_view')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadPDF(quote)} disabled={isGeneratingPdf === quote.id}>
                    {isGeneratingPdf === quote.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    PDF
                  </DropdownMenuItem>
                  {quote.status === 'pending' && (
                    <DropdownMenuItem onClick={() => handleConvertToInvoice(quote)}><RefreshCw className="w-4 h-4 mr-2" /> {t('quotes.action_convert')}</DropdownMenuItem>
                  )}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger><Edit className="w-4 h-4 mr-2" /> {t('quotes.action_change_status')}</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'accepted')}>{t('quotes.status_accepted')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'pending')}>{t('quotes.status_pending')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus(quote.id, 'rejected')}>{t('quotes.status_rejected')}</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem onClick={() => handleDeleteQuote(quote.id)} className="text-red-500 focus:text-red-500">
                    <Trash2 className="w-4 h-4 mr-2" /> {t('quotes.action_delete')}
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
            <DialogTitle>{t('quotes.details_title')} {selectedQuote?.quote_number}</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="py-4 space-y-4">
              <p><strong>{t('quotes.table_client')}:</strong> {selectedQuote.client?.name}</p>
              <p><strong>{t('quotes.table_amount')}:</strong> {profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'}{selectedQuote.amount.toFixed(2)}</p>
              <p><strong>{t('quotes.table_status')}:</strong> <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedQuote.status)}`}>{getStatusText(selectedQuote.status)}</span></p>
              <p><strong>{t('billing.table_issue_date')}:</strong> {new Date(selectedQuote.issue_date).toLocaleDateString('fr-FR')}</p>
              {selectedQuote.expiry_date && <p><strong>{t('quotes.table_due_date')}:</strong> {new Date(selectedQuote.expiry_date).toLocaleDateString('fr-FR')}</p>}
              <div className="flex gap-2 mt-4 flex-wrap">
                <Button variant="outline" onClick={() => handleDownloadPDF(selectedQuote)} disabled={isGeneratingPdf === selectedQuote.id}>
                  {isGeneratingPdf === selectedQuote.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  PDF
                </Button>
                {selectedQuote.status === 'pending' && (
                  <Button onClick={() => handleConvertToInvoice(selectedQuote)}><RefreshCw className="w-4 h-4 mr-2" /> {t('quotes.action_convert')}</Button>
                )}
                <Button variant="destructive" onClick={() => handleDeleteQuote(selectedQuote.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> {t('quotes.action_delete')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('quotes.dialog_new_title')}</DialogTitle>
            <DialogDescription>{t('quotes.dialog_desc')}</DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-4 py-4">
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
                <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    {t('quotes.dialog_fill_manual')}
                </Button>
                <Button className="w-full" onClick={handleVoiceButtonClick}>
                    <Mic className="w-4 h-4 mr-2" />
                    {t('quotes.dialog_use_ai')}
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">{t('quotes.dialog_client')}</Label>
                <div className="flex gap-2 mt-1">
                  <select id="client" value={newQuote.client_id} onChange={(e) => setNewQuote({...newQuote, client_id: e.target.value})} className="w-full border rounded-md p-2 bg-background text-foreground">
                    <option value="">{t('quotes.dialog_select_client')}</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Button variant="outline" size="icon" onClick={() => setIsClientDialogOpen(true)}><Plus /></Button>
                </div>
              </div>
              <div>
                <Label htmlFor="expiry_date">{t('quotes.dialog_expiry_date')}</Label>
                <DatePicker date={newQuote.expiry_date} setDate={(date) => setNewQuote({ ...newQuote, expiry_date: date })} className="mt-1" />
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label>{t('quotes.dialog_items')}</Label>
              {newQuote.items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="relative flex-grow w-full">
                    <Input type="text" placeholder={t('quotes.dialog_item_desc')} value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="pr-10" />
                    <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => handleGenerateSuggestion(index)} disabled={isGeneratingSuggestion === index}>
                      {isGeneratingSuggestion === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-yellow-400" />}
                    </Button>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Input type="number" placeholder={t('quotes.dialog_item_qty')} value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-1/2 sm:w-20" />
                    <Input type="number" placeholder={t('quotes.dialog_item_price')} value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} className="w-1/2 sm:w-24" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={newQuote.items.length <= 1}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem} className="mt-2">
                <Plus className="h-4 w-4 mr-2" /> {t('quotes.dialog_add_item')}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="tax_rate">{t('quotes.dialog_tax_rate')}</Label>
                <Input id="tax_rate" type="number" value={newQuote.tax_rate} onChange={(e) => setNewQuote({...newQuote, tax_rate: e.target.value})} className="mt-1" />
              </div>
              <div className="text-right self-end">
                <p className="text-muted-foreground">{t('quotes.dialog_total')}</p>
                <p className="text-2xl font-bold">{profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'}{calculateTotal(newQuote.items, newQuote.tax_rate).toFixed(2)}</p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>{t('quotes.dialog_cancel')}</Button>
            <Button onClick={handleCreateQuote}>{t('quotes.dialog_create')}</Button>
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