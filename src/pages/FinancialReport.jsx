import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { TrendingUp, TrendingDown, DollarSign, FileWarning, Users, Download, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format, isSameMonth, startOfToday } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/StatsCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    const doc = new jsPDF();
    const monthDate = new Date(reportData.month + '-02');
    const monthName = format(monthDate, 'MMMM yyyy', { locale: currentLocale });

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t('financial_report.pdf_title')} - ${monthName}`, 14, 22);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(profile?.company_name || t('financial_report.your_company'), 14, 30);
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);

    let yPos = 45;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t('financial_report.pdf_summary_title'), 14, yPos);
    yPos += 8;
    
    const summaryData = [
      [t('financial_report.pdf_revenue'), `${reportData.total_revenue.toFixed(2)} ${currencySymbol}`],
      [t('financial_report.pdf_expenses'), `${reportData.total_expenses.toFixed(2)} ${currencySymbol}`],
      [t('financial_report.pdf_net_profit'), `${reportData.net_profit.toFixed(2)} ${currencySymbol}`],
      [t('financial_report.pdf_unpaid_invoices'), `${reportData.unpaid_invoices_amount.toFixed(2)} ${currencySymbol}`],
      [t('financial_report.pdf_new_clients'), `${reportData.new_clients_count}`],
    ];
    doc.autoTable({ startY: yPos, head: [[t('financial_report.pdf_indicator'), t('financial_report.pdf_value')]], body: summaryData, theme: 'grid', headStyles: { fillColor: [50, 50, 50] } });
    yPos = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t('financial_report.pdf_revenue_details_title'), 14, yPos);
    yPos += 8;
    const revenueDetailsData = [
      [t('financial_report.pdf_paid_invoices'), `${reportData.revenue_details.paid_invoices.toFixed(2)} ${currencySymbol}`],
      [t('financial_report.pdf_subscriptions'), `${reportData.revenue_details.subscriptions.toFixed(2)} ${currencySymbol}`],
      [t('financial_report.pdf_product_sales'), `${reportData.revenue_details.product_sales.toFixed(2)} ${currencySymbol}`],
      [t('financial_report.pdf_other_revenues'), `${reportData.revenue_details.other_revenues.toFixed(2)} ${currencySymbol}`],
    ];
    doc.autoTable({ startY: yPos, head: [[t('financial_report.pdf_source'), t('financial_report.pdf_amount')]], body: revenueDetailsData, theme: 'grid', headStyles: { fillColor: [50, 50, 50] } });
    yPos = doc.lastAutoTable.finalY + 15;

    if (reportData.expense_details.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(t('financial_report.pdf_expense_details_title'), 14, yPos);
        yPos += 8;
        const expenseDetailsData = reportData.expense_details.map(e => [
            format(new Date(e.date), 'dd/MM/yyyy'),
            e.description,
            t(`expenses.category_${e.category}`, e.category),
            `${e.amount.toFixed(2)} ${currencySymbol}`
        ]);
        doc.autoTable({ startY: yPos, head: [[t('financial_report.pdf_date'), t('financial_report.pdf_description'), t('financial_report.pdf_category'), t('financial_report.pdf_amount')]], body: expenseDetailsData, theme: 'grid', headStyles: { fillColor: [50, 50, 50] } });
    }

    doc.output('dataurlnewwindow');
    setIsGeneratingPdf(null);
  }, [profile, currencySymbol, t, currentLocale]);

  const renderStatCards = (data) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard title={t('financial_report.card_revenue')} value={`${data.total_revenue.toFixed(2)}${currencySymbol}`} icon={TrendingUp} loading={loading} />
      <StatsCard title={t('financial_report.card_expenses')} value={`${data.total_expenses.toFixed(2)}${currencySymbol}`} icon={TrendingDown} loading={loading} />
      <StatsCard title={t('financial_report.card_net_profit')} value={`${data.net_profit.toFixed(2)}${currencySymbol}`} icon={DollarSign} loading={loading} changeColor={data.net_profit >= 0 ? 'text-green-500' : 'text-red-500'} />
      <StatsCard title={t('financial_report.card_unpaid_invoices')} value={`${data.unpaid_invoices_amount.toFixed(2)}${currencySymbol}`} icon={FileWarning} loading={loading} />
      <StatsCard title={t('financial_report.card_new_clients')} value={data.new_clients_count.toString()} icon={Users} loading={loading} />
    </div>
  );

  const renderDetails = (data) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
      <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4">{t('financial_report.revenue_details_title')}</h3>
        <ul className="space-y-3">
          <li className="flex justify-between items-center"><span className="text-muted-foreground">{t('financial_report.revenue_paid_invoices')}</span><span>{data.revenue_details.paid_invoices.toFixed(2)}{currencySymbol}</span></li>
          <li className="flex justify-between items-center"><span className="text-muted-foreground">{t('financial_report.revenue_subscriptions')}</span><span>{data.revenue_details.subscriptions.toFixed(2)}{currencySymbol}</span></li>
          <li className="flex justify-between items-center"><span className="text-muted-foreground">{t('financial_report.revenue_product_sales')}</span><span>{data.revenue_details.product_sales.toFixed(2)}{currencySymbol}</span></li>
          <li className="flex justify-between items-center"><span className="text-muted-foreground">{t('financial_report.revenue_other')}</span><span>{data.revenue_details.other_revenues.toFixed(2)}{currencySymbol}</span></li>
          <li className="flex justify-between items-center border-t pt-3 mt-3"><span className="font-bold">{t('financial_report.revenue_total')}</span><span className="font-bold">{data.total_revenue.toFixed(2)}{currencySymbol}</span></li>
        </ul>
      </div>
      <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4">{t('financial_report.expense_details_title')}</h3>
        {data.expense_details?.length > 0 ? (
          <ul className="space-y-3 max-h-60 overflow-y-auto">
            {data.expense_details.map((exp, i) => (
              <li key={i} className="flex justify-between items-center">
                <div>
                  <p>{exp.description}</p>
                  <p className="text-sm text-muted-foreground">{t(`expenses.category_${exp.category}`, exp.category)} - {format(new Date(exp.date), 'dd/MM/yyyy')}</p>
                </div>
                <span className="text-red-400">-{exp.amount.toFixed(2)}{currencySymbol}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-8">{t('financial_report.no_expenses')}</p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('financial_report.title')}</h1>
        <p className="text-muted-foreground">{t('financial_report.subtitle')}</p>
      </motion.div>
      
      {currentMonthData ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('financial_report.current_month_report')}</h2>
           <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-xl font-semibold text-foreground mb-4 hover:no-underline">
                   {format(new Date(currentMonthData.month + '-02'), 'MMMM yyyy', { locale: currentLocale })}
                </AccordionTrigger>
                <AccordionContent>
                  {renderStatCards(currentMonthData)}
                  {renderDetails(currentMonthData)}
                </AccordionContent>
              </AccordionItem>
          </Accordion>
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
          <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-4 space-y-3">
            {archivedReports.map(report => (
              <div key={report.month} className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg">
                <div>
                  <p className="font-semibold">{format(new Date(report.month + '-02'), 'MMMM yyyy', { locale: currentLocale })}</p>
                  <p className="text-sm text-muted-foreground">{t('financial_report.card_net_profit')}: <span className={report.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}>{report.net_profit.toFixed(2)}{currencySymbol}</span></p>
                </div>
                <Button variant="outline" size="sm" onClick={() => generatePDF(report)} disabled={isGeneratingPdf === report.month}>
                  {isGeneratingPdf === report.month ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  {t('financial_report.download_button')}
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FinancialReport;