import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Plus, Eye, Download, Trash2, MoreVertical, Edit, Building, Upload, X, Sparkles, Loader2, Clock } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/hooks/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
    import jsPDF from 'jspdf';
    import 'jspdf-autotable';
    import CreateClientDialog from '@/components/CreateClientDialog';
    import { DatePicker } from '@/components/DatePicker';
    import { format } from 'date-fns';
    import { Helmet } from 'react-helmet';
    import { useTranslation } from 'react-i18next';
    import { cn } from '@/lib/utils';
    import CompanyDataDialog from '@/components/CompanyDataDialog';

    const Billing = () => {
      const { toast } = useToast();
      const { user, profile, refreshProfile, getPlan } = useAuth();
      const { t } = useTranslation();
      const [invoices, setInvoices] = useState([]);
      const [clients, setClients] = useState([]);
      const [projects, setProjects] = useState([]);
      const [loading, setLoading] = useState(true);
      const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
      const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
      const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
      const [isImportHoursDialogOpen, setIsImportHoursDialogOpen] = useState(false);
      const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(null);
      const [isGeneratingPdf, setIsGeneratingPdf] = useState(null);
      const [selectedInvoice, setSelectedInvoice] = useState(null);
      
      const initialInvoiceState = {
        client_id: '',
        due_date: null,
        items: [{ description: '', quantity: 1, unit_price: '' }],
        tax_rate: 0,
      };
      const [newInvoice, setNewInvoice] = useState(initialInvoiceState);

      const plan = getPlan();

      const currencySymbol = useMemo(() => {
        const currency = profile?.currency || 'eur';
        if (currency === 'usd') return '$';
        if (currency === 'chf') return 'CHF';
        return '€';
      }, [profile]);

      const fetchBillingData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const [
          { data: invoicesData, error: invoicesError },
          { data: clientsData, error: clientsError },
          { data: projectsData, error: projectsError }
        ] = await Promise.all([
          supabase.from('invoices').select('*, client:clients(*)').eq('user_id', user.id).order('issue_date', { ascending: false }),
          supabase.from('clients').select('id, name, address, email').eq('user_id', user.id),
          supabase.from('projects').select('id, name, client_id, hourly_rate').eq('user_id', user.id).not('hourly_rate', 'is', null)
        ]);

        if (invoicesError) {
          toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les factures.' });
        } else {
          setInvoices(invoicesData.map(inv => ({
            ...inv,
            amount: (inv.items || []).reduce((acc, item) => acc + (item.quantity * item.unit_price), 0) * (1 + (inv.tax_rate || 0) / 100)
          })));
        }
        if (!clientsError) setClients(clientsData);
        if (!projectsError) setProjects(projectsData);
        setLoading(false);
      }, [user, toast]);

      useEffect(() => {
        fetchBillingData();
      }, [fetchBillingData]);

      const handleClientCreated = (newClientData) => {
        setClients(prevClients => [...prevClients, { id: newClientData.id, name: newClientData.name }]);
        setNewInvoice(prevInvoice => ({ ...prevInvoice, client_id: newClientData.id }));
        setIsClientDialogOpen(false);
      };

      const handleItemChange = (index, field, value) => {
        const updatedItems = [...newInvoice.items];
        updatedItems[index][field] = value;
        setNewInvoice({ ...newInvoice, items: updatedItems });
      };

      const addItem = () => {
        setNewInvoice({
          ...newInvoice,
          items: [...newInvoice.items, { description: '', quantity: 1, unit_price: '' }],
        });
      };

      const removeItem = (index) => {
        const updatedItems = newInvoice.items.filter((_, i) => i !== index);
        setNewInvoice({ ...newInvoice, items: updatedItems });
      };

      const calculateTotal = (items, tax_rate) => {
        const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);
        const tax = subtotal * (Number(tax_rate) / 100);
        return subtotal + tax;
      };

      const handleCreateInvoice = async () => {
        const totalAmount = calculateTotal(newInvoice.items, newInvoice.tax_rate);
        if (!newInvoice.client_id || !newInvoice.due_date || totalAmount <= 0) {
          toast({ variant: 'destructive', title: 'Champs requis', description: 'Veuillez remplir tous les champs et ajouter au moins un article.' });
          return;
        }

        const { data: invoiceData, error } = await supabase
          .from('invoices')
          .insert({
            user_id: user.id,
            client_id: newInvoice.client_id,
            amount: totalAmount,
            due_date: format(newInvoice.due_date, 'yyyy-MM-dd'),
            issue_date: new Date().toISOString().split('T')[0],
            status: 'pending',
            items: newInvoice.items.map(item => ({ ...item, quantity: Number(item.quantity), unit_price: Number(item.unit_price) })),
            tax_rate: Number(newInvoice.tax_rate),
          }).select().single();

        if (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: "La facture n'a pas pu être créée." });
        } else {
          if (newInvoice.time_entry_ids?.length > 0) {
            await supabase.from('time_entries').update({ invoiced: true }).in('id', newInvoice.time_entry_ids);
          }
          toast({ title: 'Succès', description: 'Facture créée avec succès.' });
          setIsInvoiceDialogOpen(false);
          setNewInvoice(initialInvoiceState);
          fetchBillingData();
        }
      };

      const handleDeleteInvoice = async (invoiceId) => {
        const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);
        if (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: "La facture n'a pas pu être supprimée." });
        } else {
          toast({ title: 'Succès', description: 'Facture supprimée.' });
          fetchBillingData();
          setSelectedInvoice(null);
        }
      };

      const handleUpdateStatus = async (invoiceId, status) => {
        const { error } = await supabase.from('invoices').update({ status }).eq('id', invoiceId);
        if (error) {
          toast({ variant: 'destructive', title: 'Erreur', description: "Le statut n'a pas pu être mis à jour." });
        } else {
          toast({ title: 'Succès', description: 'Statut de la facture mis à jour.' });
          fetchBillingData();
          if (selectedInvoice?.id === invoiceId) {
            setSelectedInvoice(prev => ({...prev, status}));
          }
        }
      };

      const handleGenerateSuggestion = async (index) => {
        if (!profile?.business_description) {
          toast({
            variant: 'destructive',
            title: 'Action requise',
            description: "Veuillez d'abord décrire votre activité dans les données d'entreprise.",
          });
          setIsCompanyDialogOpen(true);
          return;
        }
        setIsGeneratingSuggestion(index);
        const { data, error } = await supabase.functions.invoke('generate-text-suggestion', {
          body: { 
            business_description: profile.business_description, 
            context: 'invoice_item',
            userInput: newInvoice.items[index].description
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

      const handleImportProjectHours = async (projectId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const { data: timeEntries, error } = await supabase
          .from('time_entries')
          .select('*')
          .eq('project_id', projectId)
          .eq('invoiced', false);

        if (error) {
          toast({ variant: 'destructive', title: t('toast_error_title'), description: t('billing.load_hours_error') });
          return;
        }

        if (timeEntries.length === 0) {
          toast({ title: t('billing.no_unbilled_hours_title'), description: t('billing.no_unbilled_hours_desc') });
          return;
        }

        const projectClient = clients.find(c => c.id === project.client_id);

        const newItems = timeEntries.map(entry => {
          const durationHours = (new Date(entry.end_time) - new Date(entry.start_time)) / (1000 * 60 * 60);
          return {
            description: `${t('billing.service_for')} ${project.name} - ${format(new Date(entry.start_time), 'dd/MM/yyyy')}`,
            quantity: durationHours.toFixed(2),
            unit_price: project.hourly_rate,
          };
        });

        setNewInvoice({
          client_id: project.client_id,
          due_date: new Date(),
          items: newItems,
          tax_rate: 0,
          time_entry_ids: timeEntries.map(e => e.id),
        });
        setIsImportHoursDialogOpen(false);
        setIsInvoiceDialogOpen(true);
      };

      const generatePDF = async (invoice) => {
        setIsGeneratingPdf(invoice.id);
        const doc = new jsPDF();
        const client = clients.find(c => c.id === invoice.client_id) || invoice.client;

        const addWatermark = () => {
          if (plan.name === 'Free') {
            const pageCount = doc.internal.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
              doc.setPage(i);
              doc.setFontSize(50);
              doc.setTextColor(220, 220, 220);
              doc.text('Made with YourBizFlow.com', doc.internal.pageSize.width / 2, doc.internal.pageSize.height / 2, {
                angle: 45,
                align: 'center'
              });
              doc.setTextColor(0, 0, 0);
            }
          }
        };

        const addContent = () => {
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(t('billing.invoice_title').toUpperCase(), 14, 40);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`${t('billing.invoice_number')}: ${invoice.invoice_number}`, 14, 48);
            doc.text(`${t('billing.issue_date')}: ${format(new Date(invoice.issue_date), 'dd/MM/yyyy')}`, 14, 54);
            doc.text(`${t('billing.due_date')}: ${format(new Date(invoice.due_date), 'dd/MM/yyyy')}`, 14, 60);

            doc.setFontSize(10);
            doc.text(profile.company_name || '', 140, 20);
            doc.text(profile.company_address || '', 140, 25);
            doc.text(profile.company_phone || '', 140, 30);
            doc.text(profile.email || '', 140, 35);

            doc.text(t('billing.bill_to'), 14, 80);
            doc.text(client?.name || '', 14, 85);
            doc.text(client?.address || '', 14, 90);
            doc.text(client?.email || '', 14, 95);

            const tableColumn = [t('billing.table_item'), t('billing.table_quantity'), t('billing.table_unit_price'), t('billing.table_total')];
            const tableRows = [];
            let subtotal = 0;

            invoice.items.forEach(item => {
                const itemTotal = item.quantity * item.unit_price;
                subtotal += itemTotal;
                const itemData = [
                    item.description,
                    item.quantity,
                    `${item.unit_price.toFixed(2)} ${currencySymbol}`,
                    `${itemTotal.toFixed(2)} ${currencySymbol}`,
                ];
                tableRows.push(itemData);
            });

            doc.autoTable({
                startY: 105,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [50, 50, 50] },
                didDrawPage: () => addWatermark()
            });

            let finalY = doc.lastAutoTable.finalY || 150;
            const tax = subtotal * (invoice.tax_rate / 100);
            const total = subtotal + tax;
            doc.setFontSize(10);
            
            const rightAlignX = doc.internal.pageSize.width - 20;

            doc.text(`${t('billing.subtotal')}:`, 140, finalY + 10, { align: 'left' });
            doc.text(`${subtotal.toFixed(2)} ${currencySymbol}`, rightAlignX, finalY + 10, { align: 'right' });
            doc.text(`${t('billing.tax')} (${invoice.tax_rate}%):`, 140, finalY + 17, { align: 'left' });
            doc.text(`${tax.toFixed(2)} ${currencySymbol}`, rightAlignX, finalY + 17, { align: 'right' });
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${t('billing.total')}:`, 140, finalY + 25, { align: 'left' });
            doc.text(`${total.toFixed(2)} ${currencySymbol}`, rightAlignX, finalY + 25, { align: 'right' });
            
            finalY += 35; 

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Informations de paiement', 14, finalY);
            doc.setFont('helvetica', 'normal');
            doc.text(`${profile.company_name || ''}`, 14, finalY + 5);
            doc.text(`${profile.company_address || ''}`, 14, finalY + 10);
            doc.text(`IBAN: ${profile.iban || ''}`, 14, finalY + 15);
            doc.text(`BIC: ${profile.bic || ''}`, 14, finalY + 20);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`À payer au plus tard le ${format(new Date(invoice.due_date), 'dd/MM/yyyy')}`, 14, finalY + 30);


            doc.setFontSize(8);
            doc.text(t('billing.payment_terms'), 14, doc.internal.pageSize.height - 10);

            doc.save(`facture-${invoice.invoice_number}.pdf`);
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

      const statusVariant = {
        paid: 'bg-green-500/10 text-green-400 border-green-500/20',
        pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
      };

      return (
        <div className="space-y-8">
          <Helmet>
            <title>{t('billing.helmet_title')}</title>
            <meta name="description" content={t('billing.helmet_desc')} />
          </Helmet>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{t('billing.title')}</h1>
              <p className="text-muted-foreground">{t('billing.subtitle')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setIsCompanyDialogOpen(true)} className="w-full sm:w-auto"><Building className="w-4 h-4 mr-2" />{t('billing.company_data_button')}</Button>
              <Button onClick={() => { setSelectedInvoice(null); setNewInvoice(initialInvoiceState); setIsInvoiceDialogOpen(true); }} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" />{t('billing.new_invoice_button')}</Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="bg-card/50 backdrop-blur-sm border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <div className="hidden sm:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="p-4 text-left font-semibold text-muted-foreground">{t('billing.table_invoice_number')}</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">{t('billing.table_client')}</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">{t('billing.table_issue_date')}</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">{t('billing.table_due_date')}</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">{t('billing.table_amount')}</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">{t('billing.table_status')}</th>
                        <th className="p-4 text-right font-semibold text-muted-foreground">{t('billing.table_actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="7" className="text-center p-8 text-muted-foreground">Chargement...</td></tr>
                      ) : invoices.length > 0 ? invoices.map(invoice => (
                        <tr key={invoice.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5 cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                          <td className="p-4 font-medium">{invoice.invoice_number}</td>
                          <td className="p-4 text-muted-foreground">{invoice.client?.name || 'Client supprimé'}</td>
                          <td className="p-4 text-muted-foreground">{format(new Date(invoice.issue_date), 'dd/MM/yyyy')}</td>
                          <td className="p-4 text-muted-foreground">{format(new Date(invoice.due_date), 'dd/MM/yyyy')}</td>
                          <td className="p-4 font-semibold">{invoice.amount.toFixed(2)}{currencySymbol}</td>
                          <td className="p-4">
                            <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', statusVariant[invoice.status])}>
                              {t(`billing.status_${invoice.status}`)}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedInvoice(invoice); }}><Eye className="w-4 h-4 mr-2" />{t('billing.action_view')}</DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); generatePDF(invoice); }} disabled={isGeneratingPdf === invoice.id}>
                                  {isGeneratingPdf === invoice.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                  {t('billing.action_download')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(invoice.id, 'paid'); }} className="pl-8">
                                  <span className="text-xs text-muted-foreground mr-2">Statut:</span> {t('billing.status_paid')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(invoice.id, 'pending'); }} className="pl-8">
                                  <span className="text-xs text-muted-foreground mr-2">Statut:</span> {t('billing.status_pending')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(invoice.id, 'overdue'); }} className="pl-8">
                                  <span className="text-xs text-muted-foreground mr-2">Statut:</span> {t('billing.status_overdue')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteInvoice(invoice.id); }} className="text-red-500 focus:text-red-500"><Trash2 className="w-4 h-4 mr-2" />{t('billing.action_delete')}</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="7" className="text-center p-8 text-muted-foreground">{t('billing.no_invoices')}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="sm:hidden p-4 space-y-4">
                  {loading ? (
                     <div className="text-center p-8 text-muted-foreground">Chargement...</div>
                  ) : invoices.length > 0 ? invoices.map(invoice => (
                    <div key={invoice.id} className="bg-card border rounded-lg p-4 flex flex-col gap-2" onClick={() => setSelectedInvoice(invoice)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{invoice.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">{invoice.client?.name || 'Client supprimé'}</p>
                        </div>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" onClick={e => e.stopPropagation()}><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedInvoice(invoice); }}><Eye className="w-4 h-4 mr-2" />{t('billing.action_view')}</DropdownMenuItem>
                               <DropdownMenuItem onClick={(e) => { e.stopPropagation(); generatePDF(invoice); }} disabled={isGeneratingPdf === invoice.id}>
                                {isGeneratingPdf === invoice.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                {t('billing.action_download')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(invoice.id, 'paid'); }} className="pl-8">
                                <span className="text-xs text-muted-foreground mr-2">Statut:</span> {t('billing.status_paid')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(invoice.id, 'pending'); }} className="pl-8">
                                <span className="text-xs text-muted-foreground mr-2">Statut:</span> {t('billing.status_pending')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(invoice.id, 'overdue'); }} className="pl-8">
                                <span className="text-xs text-muted-foreground mr-2">Statut:</span> {t('billing.status_overdue')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteInvoice(invoice.id); }} className="text-red-500 focus:text-red-500"><Trash2 className="w-4 h-4 mr-2" />{t('billing.action_delete')}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                       <div className="flex justify-between items-center text-sm">
                          <p className="font-semibold">{invoice.amount.toFixed(2)}{currencySymbol}</p>
                           <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', statusVariant[invoice.status])}>
                            {t(`billing.status_${invoice.status}`)}
                          </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{t('billing.table_issue_date')}: {format(new Date(invoice.issue_date), 'dd/MM/yy')}</span>
                        <span>{t('billing.table_due_date')}: {format(new Date(invoice.due_date), 'dd/MM/yy')}</span>
                      </div>
                    </div>
                  )) : (
                     <div className="text-center p-8 text-muted-foreground">{t('billing.no_invoices')}</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>{t('billing.new_invoice_title')}</DialogTitle>
                <DialogDescription>{t('billing.new_invoice_desc')}</DialogDescription>
              </DialogHeader>
              <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('billing.dialog_client')}</Label>
                    <div className="flex gap-2">
                      <select value={newInvoice.client_id} onChange={(e) => setNewInvoice({ ...newInvoice, client_id: e.target.value })} className="w-full mt-1 border rounded-md p-2 bg-background text-foreground">
                        <option value="">{t('billing.dialog_select_client')}</option>
                        {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                      </select>
                      <Button variant="outline" size="icon" onClick={() => setIsClientDialogOpen(true)}><Plus /></Button>
                    </div>
                  </div>
                  <div>
                    <Label>{t('billing.dialog_due_date')}</Label>
                    <DatePicker date={newInvoice.due_date} setDate={(date) => setNewInvoice({ ...newInvoice, due_date: date })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('billing.dialog_items')}</Label>
                  {newInvoice.items.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 items-start">
                      <div className="relative flex-grow w-full">
                        <Textarea
                          placeholder={t('billing.dialog_item_desc')}
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="pr-10"
                        />
                        {plan !== 'Free' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-1 right-1 h-7 w-7"
                            onClick={() => handleGenerateSuggestion(index)}
                            disabled={isGeneratingSuggestion === index}
                          >
                            {isGeneratingSuggestion === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-primary" />}
                          </Button>
                        )}
                      </div>
                      <Input
                        type="number"
                        placeholder={t('billing.dialog_item_qty')}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full sm:w-24"
                      />
                      <Input
                        type="number"
                        placeholder={t('billing.dialog_item_price')}
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="w-full sm:w-28"
                      />
                      <Button variant="destructive" size="icon" onClick={() => removeItem(index)} className="flex-shrink-0"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addItem}>{t('billing.dialog_add_item')}</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('billing.dialog_tax_rate')}</Label>
                    <Input type="number" placeholder="%" value={newInvoice.tax_rate} onChange={(e) => setNewInvoice({ ...newInvoice, tax_rate: e.target.value })} />
                  </div>
                  <div className="text-right self-end">
                    <p className="text-muted-foreground">{t('billing.total')}</p>
                    <p className="text-2xl font-bold">{calculateTotal(newInvoice.items, newInvoice.tax_rate).toFixed(2)}{currencySymbol}</p>
                  </div>
                </div>
                {plan !== 'Free' && (
                  <div>
                    <Button variant="outline" onClick={() => setIsImportHoursDialogOpen(true)}><Clock className="w-4 h-4 mr-2" />{t('billing.import_hours_button')}</Button>
                  </div>
                )}
              </div>
              <DialogFooter className="flex-shrink-0">
                <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>{t('billing.dialog_cancel')}</Button>
                <Button onClick={handleCreateInvoice}>{t('billing.dialog_create')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <CompanyDataDialog isOpen={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen} />
          
          <CreateClientDialog isOpen={isClientDialogOpen} onOpenChange={setIsClientDialogOpen} onClientCreated={handleClientCreated} />

          <Dialog open={isImportHoursDialogOpen} onOpenChange={setIsImportHoursDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>{t('billing.import_hours_title')}</DialogTitle></DialogHeader>
              <div className="py-4 space-y-2">
                <p>{t('billing.import_hours_desc')}</p>
                {projects.map(project => (
                  <Button key={project.id} variant="secondary" className="w-full justify-start" onClick={() => handleImportProjectHours(project.id)}>
                    {project.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {selectedInvoice && (
            <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('billing.invoice_details_title')} {selectedInvoice.invoice_number}</DialogTitle>
                  <DialogDescription>
                    {t('billing.client')}: {selectedInvoice.client?.name} | {t('billing.due_date')}: {format(new Date(selectedInvoice.due_date), 'dd/MM/yyyy')}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b"><th className="p-2 text-left">{t('billing.table_item')}</th><th className="p-2 text-right">{t('billing.table_quantity')}</th><th className="p-2 text-right">{t('billing.table_unit_price')}</th><th className="p-2 text-right">{t('billing.table_total')}</th></tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, index) => {
                        const itemTotal = item.quantity * item.unit_price;
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-2">{item.description}</td>
                            <td className="p-2 text-right">{item.quantity}</td>
                            <td className="p-2 text-right">{item.unit_price.toFixed(2)}{currencySymbol}</td>
                            <td className="p-2 text-right">{itemTotal.toFixed(2)}{currencySymbol}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="mt-4 text-right">
                    <p>{t('billing.subtotal')}: {((selectedInvoice.amount) / (1 + selectedInvoice.tax_rate / 100)).toFixed(2)}{currencySymbol}</p>
                    <p>{t('billing.tax')} ({selectedInvoice.tax_rate}%): {(selectedInvoice.amount - (selectedInvoice.amount) / (1 + selectedInvoice.tax_rate / 100)).toFixed(2)}{currencySymbol}</p>
                    <p className="font-bold text-lg">{t('billing.total')}: {selectedInvoice.amount.toFixed(2)}{currencySymbol}</p>
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setSelectedInvoice(null)}>{t('billing.close')}</Button>
                  <Button onClick={() => generatePDF(selectedInvoice)} disabled={isGeneratingPdf === selectedInvoice.id}>
                    {isGeneratingPdf === selectedInvoice.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    {t('billing.action_download')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      );
    };

    export default Billing;