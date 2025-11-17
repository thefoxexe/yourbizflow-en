import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/customSupabaseClient';
    import { TrendingUp, TrendingDown, DollarSign, FileWarning, Users, Download, Calendar, Loader2, BarChart2 } from 'lucide-react';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/hooks/use-toast';
    import { format, isSameMonth, startOfToday } from 'date-fns';
    import { fr, enUS } from 'date-fns/locale';
    import { useTranslation } from 'react-i18next';
    import jsPDF from 'jspdf';
    import 'jspdf-autotable';
    import { Button } from '@/components/ui/button';
    import StatsCard from '@/components/StatsCard';
    import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
    import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
    
    const FinancialReport = () => {
      const { user, profile } = useAuth();
      const { toast } = useToast();
      const { t, i18n } = useTranslation();
      const [currentMonthData, setCurrentMonthData] = useState(null);
      const [archivedReports, setArchivedReports] = useState([]);
      const [loading, setLoading] = useState(true);
      const [isGeneratingPdf, setIsGeneratingPdf] = useState(null);
    
      const currentLocale = i18n.language === 'fr' ? fr : enUS;
      const currencySymbol = useMemo(() => (profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'), [profile]);
    
      const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase.rpc('get_monthly_financial_reports');
    
        if (error) {
          console.error("Error fetching financial reports:", error);
          toast({ variant: 'destructive', title: t('toast_error_title'), description: t('financial_report.data_load_error') });
          setLoading(false);
          return;
        }
        
        const today = startOfToday();
        const currentData = data.find(report => isSameMonth(new Date(report.month + '-02'), today));
        const archivedData = data.filter(report => !isSameMonth(new Date(report.month + '-02'), today));
    
        setCurrentMonthData(currentData);
        setArchivedReports(archivedData);
        setLoading(false);
      }, [user, toast, t]);
    
      useEffect(() => {
        fetchData();
      }, [fetchData]);
    
      const generatePDF = useCallback(async (reportData) => {
        setIsGeneratingPdf(reportData.month);
    
        const { data: detailedData, error: detailedError } = await supabase.rpc('get_detailed_monthly_report_data', {
            report_month: reportData.month,
        });
    
        if (detailedError) {
            toast({ variant: 'destructive', title: t('toast_error_title'), description: "Impossible de charger les détails pour le PDF." });
            setIsGeneratingPdf(null);
            return;
        }
    
        const doc = new jsPDF();
        const monthDate = new Date(reportData.month + '-02');
        const monthName = format(monthDate, 'MMMM yyyy', { locale: currentLocale });
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        let yPos = 0;
        let pageNumber = 1;
    
        const addHeader = () => {
            if (profile?.company_logo_url) {
                try {
                    doc.addImage(profile.company_logo_url, 'PNG', 14, 15, 20, 20);
                } catch (e) { console.error("Error adding logo to PDF:", e); }
            }
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text(t('financial_report.pdf_title'), pageWidth / 2, 22, { align: 'center' });
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(monthName, pageWidth / 2, 29, { align: 'center' });
            yPos = 45;
        };
    
        const addFooter = () => {
            doc.setFontSize(8);
            doc.setTextColor(150);
            const footerText = `${profile?.company_name || 'YourBizFlow'} | ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;
            doc.text(footerText, 14, pageHeight - 10);
            doc.text(`${t('financial_report.pdf_page')} ${pageNumber}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
        };
        
        const addPage = () => {
            addFooter();
            doc.addPage();
            pageNumber++;
            addHeader();
        };
    
        const checkPageBreak = (neededHeight) => {
            if (yPos + neededHeight > pageHeight - 20) {
                addPage();
            }
        };
    
        const addSectionTitle = (title) => {
            checkPageBreak(20);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 14, yPos);
            yPos += 8;
        };
    
        addHeader();
    
        // --- Summary ---
        addSectionTitle('Résumé du mois');
        doc.autoTable({
            startY: yPos,
            body: [
                ['Revenus totaux', `${reportData.total_revenue.toFixed(2)} ${currencySymbol}`],
                ['Dépenses totales', `${reportData.total_expenses.toFixed(2)} ${currencySymbol}`],
                ['Résultat net', `${reportData.net_profit.toFixed(2)} ${currencySymbol}`],
            ],
            theme: 'plain',
            styles: { fontSize: 12, cellPadding: 3 },
            columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right', fontStyle: 'bold' } },
        });
        yPos = doc.lastAutoTable.finalY + 15;
    
        // --- Revenues ---
        checkPageBreak(20);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Détail des Revenus', 14, yPos);
        yPos += 10;
    
        if (detailedData.paid_invoices?.length > 0) {
            addSectionTitle('Factures Encaissées');
            doc.autoTable({ startY: yPos, head: [['Numéro', 'Client', 'Date', 'Montant']], body: detailedData.paid_invoices.map(i => [i.invoice_number, i.client_name, format(new Date(i.issue_date), 'dd/MM/yyyy'), `${i.amount.toFixed(2)} ${currencySymbol}`]), theme: 'striped', headStyles: { fillColor: [44, 62, 80] } });
            yPos = doc.lastAutoTable.finalY + 10;
        }
    
        if (detailedData.unpaid_invoices?.length > 0) {
            addSectionTitle('Factures en Attente');
            doc.autoTable({ startY: yPos, head: [['Numéro', 'Client', 'Émission', 'Échéance', 'Montant']], body: detailedData.unpaid_invoices.map(i => [i.invoice_number, i.client_name, format(new Date(i.issue_date), 'dd/MM/yyyy'), format(new Date(i.due_date), 'dd/MM/yyyy'), `${i.amount.toFixed(2)} ${currencySymbol}`]), theme: 'striped', headStyles: { fillColor: [44, 62, 80] } });
            yPos = doc.lastAutoTable.finalY + 10;
        }
    
        if (detailedData.active_subscriptions?.length > 0) {
            addSectionTitle('Abonnements Actifs');
            doc.autoTable({ startY: yPos, head: [['Client', 'Abonnement', 'Montant']], body: detailedData.active_subscriptions.map(s => [s.client_name, s.subscription_name, `${s.amount.toFixed(2)} ${currencySymbol}`]), theme: 'striped', headStyles: { fillColor: [44, 62, 80] } });
            yPos = doc.lastAutoTable.finalY + 10;
        }
    
        if (detailedData.product_sales?.length > 0) {
            addSectionTitle('Ventes de Produits');
            doc.autoTable({ startY: yPos, head: [['Produit', 'Qté', 'P.U.', 'Total']], body: detailedData.product_sales.map(p => [p.name, p.quantity, `${p.sale_price.toFixed(2)} ${currencySymbol}`, `${p.total.toFixed(2)} ${currencySymbol}`]), theme: 'striped', headStyles: { fillColor: [44, 62, 80] } });
            yPos = doc.lastAutoTable.finalY + 10;
        }
    
        if (detailedData.other_revenues?.length > 0) {
            addSectionTitle('Autres Entrées');
            doc.autoTable({ startY: yPos, head: [['Date', 'Description', 'Montant']], body: detailedData.other_revenues.map(r => [format(new Date(r.revenue_date), 'dd/MM/yyyy'), r.description, `${r.amount.toFixed(2)} ${currencySymbol}`]), theme: 'striped', headStyles: { fillColor: [44, 62, 80] } });
            yPos = doc.lastAutoTable.finalY + 10;
        }
    
        // --- Expenses ---
        checkPageBreak(30);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Détail des Dépenses', 14, yPos);
        yPos += 10;
    
        if (detailedData.payroll_expenses?.length > 0) {
            addSectionTitle('Masse Salariale');
            doc.autoTable({ startY: yPos, head: [['Employé', 'Salaire Brut']], body: detailedData.payroll_expenses.map(e => [e.name, `${e.gross_salary.toFixed(2)} ${currencySymbol}`]), theme: 'striped', headStyles: { fillColor: [44, 62, 80] } });
            yPos = doc.lastAutoTable.finalY + 10;
        }
    
        if (reportData.expense_details?.length > 0) {
            addSectionTitle('Autres Dépenses');
            doc.autoTable({ startY: yPos, head: [['Date', 'Description', 'Catégorie', 'Montant']], body: reportData.expense_details.map(e => [format(new Date(e.date), 'dd/MM/yyyy'), e.description, t(`expenses.category_${e.category}`, e.category), `${e.amount.toFixed(2)} ${currencySymbol}`]), theme: 'striped', headStyles: { fillColor: [44, 62, 80] } });
            yPos = doc.lastAutoTable.finalY + 10;
        }
    
        // --- Final Result ---
        checkPageBreak(30);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Résultat du Mois', 14, yPos);
        yPos += 10;
        doc.autoTable({
            startY: yPos,
            body: [
                ['Revenus Totaux', `${reportData.total_revenue.toFixed(2)} ${currencySymbol}`],
                ['Dépenses Totales', `${reportData.total_expenses.toFixed(2)} ${currencySymbol}`],
                ['Résultat Net', `${reportData.net_profit.toFixed(2)} ${currencySymbol}`],
            ],
            theme: 'grid',
            styles: { fontSize: 12, cellPadding: 4 },
            bodyStyles: { fontStyle: 'bold' },
            columnStyles: { 1: { halign: 'right' } },
            didParseCell: function (data) {
                if (data.row.index === 2) {
                    data.cell.styles.textColor = reportData.net_profit >= 0 ? [0, 128, 0] : [255, 0, 0];
                }
            }
        });
        yPos = doc.lastAutoTable.finalY + 15;
    
        // Add footer to all pages
        for (let i = 1; i <= pageNumber; i++) {
            doc.setPage(i);
            addFooter();
        }
    
        doc.save(`Rapport_Financier_${reportData.month}.pdf`);
        setIsGeneratingPdf(null);
    }, [profile, currencySymbol, t, currentLocale, toast]);
    
      const renderStatCards = (data) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatsCard title={t('financial_report.card_revenue')} value={`${currencySymbol}${data.total_revenue.toFixed(2)}`} icon={TrendingUp} loading={loading} changeColor="text-green-400" />
          <StatsCard title={t('financial_report.card_expenses')} value={`${currencySymbol}${data.total_expenses.toFixed(2)}`} icon={TrendingDown} loading={loading} changeColor="text-red-400" />
          <StatsCard title={t('financial_report.card_net_profit')} value={`${currencySymbol}${data.net_profit.toFixed(2)}`} icon={DollarSign} loading={loading} changeColor={data.net_profit >= 0 ? 'text-blue-400' : 'text-red-400'} />
          <StatsCard title={t('financial_report.card_unpaid_invoices')} value={`${currencySymbol}${data.unpaid_invoices_amount.toFixed(2)}`} icon={FileWarning} loading={loading} changeColor="text-yellow-400" />
          <StatsCard title={t('financial_report.card_new_clients')} value={data.new_clients_count.toString()} icon={Users} loading={loading} changeColor="text-indigo-400" />
        </div>
      );
    
      const renderDetails = (data) => {
        const chartData = [
          { name: t('financial_report.card_revenue'), value: data.total_revenue, fill: 'url(#colorRevenue)' },
          { name: t('financial_report.card_expenses'), value: data.total_expenses, fill: 'url(#colorExpenses)' },
        ];
    
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2 bg-card/50 backdrop-blur-sm border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center"><BarChart2 className="w-5 h-5 mr-2 text-primary" />{t('financial_report.revenue_vs_expenses')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={(value) => `${currencySymbol}${value}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30,30,30,0.8)',
                      borderColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '0.5rem',
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                    formatter={(value) => `${value.toFixed(2)} ${currencySymbol}`}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">{t('financial_report.revenue_details_title')}</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center"><span className="text-muted-foreground">{t('financial_report.revenue_paid_invoices')}</span><span className="font-medium">{data.revenue_details.paid_invoices.toFixed(2)}{currencySymbol}</span></li>
                <li className="flex justify-between items-center"><span className="text-muted-foreground">{t('financial_report.revenue_subscriptions')}</span><span className="font-medium">{data.revenue_details.subscriptions.toFixed(2)}{currencySymbol}</span></li>
                <li className="flex justify-between items-center"><span className="text-muted-foreground">{t('financial_report.revenue_product_sales')}</span><span className="font-medium">{data.revenue_details.product_sales.toFixed(2)}{currencySymbol}</span></li>
                <li className="flex justify-between items-center"><span className="text-muted-foreground">{t('financial_report.revenue_other')}</span><span className="font-medium">{data.revenue_details.other_revenues.toFixed(2)}{currencySymbol}</span></li>
                <li className="flex justify-between items-center border-t border-white/10 pt-3 mt-3"><span className="font-bold text-lg">{t('financial_report.revenue_total')}</span><span className="font-bold text-lg text-green-400">{data.total_revenue.toFixed(2)}{currencySymbol}</span></li>
              </ul>
            </div>
          </div>
        );
      };
    
      if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
      }
    
      return (
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('financial_report.title')}</h1>
            <p className="text-muted-foreground">{t('financial_report.subtitle')}</p>
          </motion.div>
          
          {currentMonthData ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="bg-gradient-to-br from-primary/10 to-background border border-primary/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">{t('financial_report.current_month_report')} - {format(new Date(currentMonthData.month + '-02'), 'MMMM yyyy', { locale: currentLocale })}</h2>
                {renderStatCards(currentMonthData)}
                {renderDetails(currentMonthData)}
              </div>
            </motion.div>
          ) : (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="text-center py-12 bg-card/50 backdrop-blur-sm border rounded-xl">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">{t('financial_report.no_current_month_data_title')}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t('financial_report.no_current_month_data_subtitle')}</p>
                </div>
            </motion.div>
          )}
    
          {archivedReports.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('financial_report.monthly_archives')}</h2>
              <Accordion type="single" collapsible className="w-full bg-card/50 backdrop-blur-sm border rounded-xl p-4">
                {archivedReports.map(report => (
                  <AccordionItem value={report.month} key={report.month} className="border-b-white/10">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex justify-between items-center w-full">
                        <p className="font-semibold text-lg">{format(new Date(report.month + '-02'), 'MMMM yyyy', { locale: currentLocale })}</p>
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-muted-foreground hidden sm:block">{t('financial_report.card_net_profit')}: <span className={report.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}>{report.net_profit.toFixed(2)}{currencySymbol}</span></p>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); generatePDF(report); }} disabled={isGeneratingPdf === report.month}>
                            {isGeneratingPdf === report.month ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      {renderStatCards(report)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          )}
        </div>
      );
    };
    
    export default FinancialReport;