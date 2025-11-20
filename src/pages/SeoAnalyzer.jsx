import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Search, Loader2, Globe, History, Trash2, ExternalLink, TrendingUp, Smartphone, Monitor, Download, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

const SeoAnalyzer = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('en');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentReport, setCurrentReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('analyze');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('seo_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('analyzed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const analyzeUrl = async () => {
    if (!url) {
      toast({
        title: t('seo.error_title'),
        description: t('seo.error_url_required'),
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: t('seo.error_title'),
        description: t('seo.error_login_required'),
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setCurrentReport(null);

    const progressInterval = setInterval(() => {
      setProgress(prev => prev >= 90 ? 90 : prev + 10);
    }, 300);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-seo', {
        body: { url, lang: language }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw new Error(error.message || t('seo.error_edge_function'));
      if (!data || data.error) throw new Error(data?.error || t('seo.error_edge_function'));

      const reportToSave = {
        user_id: user.id,
        url,
        scores: data.scores,
        results: {
          analysis: data.analysis,
          aiAnalysis: data.aiAnalysis,
        },
        report_lang: language,
        analyzed_at: new Date().toISOString(),
      };

      const { data: savedReport, error: saveError } = await supabase
        .from('seo_reports')
        .insert([reportToSave])
        .select()
        .single();

      if (!saveError) loadHistory();

      setCurrentReport({
        ...data,
        id: savedReport?.id,
        reportLang: language,
      });

      toast({
        title: t('seo.report_success', { score: data.scores.global }),
      });

    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error:', error);
      let errorMessage = t('seo.error_edge_function');
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMessage = t('seo.error_network');
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: t('seo.error_title'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const loadReport = (report) => {
    const scores = typeof report.scores?.global === 'number' 
      ? report.scores 
      : {
          global: report.scores?.overall || 0,
          mobile: report.scores?.mobile?.seo || 0,
          desktop: report.scores?.desktop?.seo || 0,
        };

    const aiAnalysis = report.results?.aiAnalysis || report.results?.ai_analysis || report.results?.aiReport || 
      t('seo.history_empty_subtitle');

    setCurrentReport({
      url: report.url,
      scores,
      analysis: report.results?.analysis,
      aiAnalysis,
      analyzedAt: report.analyzed_at,
      id: report.id,
      reportLang: report.report_lang,
    });
    
    setActiveTab('analyze');
    
    toast({
      title: t('seo.report_loaded'),
      description: t('seo.report_loaded_desc', { date: format(new Date(report.analyzed_at), 'dd/MM/yyyy HH:mm') }),
    });
  };

  const deleteReport = async (reportId) => {
    try {
      const { error } = await supabase
        .from('seo_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: t('seo.report_deleted'),
        description: t('seo.report_deleted_desc'),
      });

      loadHistory();
      if (currentReport?.id === reportId) setCurrentReport(null);
    } catch (error) {
      toast({
        title: t('seo.delete_error'),
        description: t('seo.delete_error_desc'),
        variant: "destructive",
      });
    }
  };

  const generatePDF = () => {
    if (!currentReport) return;
    
    setIsGeneratingPdf(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      doc.setFontSize(22);
      doc.setTextColor(139, 92, 246);
      doc.text(currentReport.reportLang === 'fr' ? 'Rapport SEO' : 'SEO Report', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(currentReport.url, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 5;
      doc.setFontSize(10);
      doc.text(format(new Date(currentReport.analyzedAt || new Date()), 'dd/MM/yyyy HH:mm'), pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 15;

      // Scores
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(currentReport.reportLang === 'fr' ? 'Scores' : 'Scores', 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.text(`${currentReport.reportLang === 'fr' ? 'Global' : 'Global'}: ${currentReport.scores.global}/100`, 20, yPos);
      yPos += 7;
      doc.text(`Mobile: ${currentReport.scores.mobile}/100`, 20, yPos);
      yPos += 7;
      doc.text(`Desktop: ${currentReport.scores.desktop}/100`, 20, yPos);
      yPos += 15;

      // AI Analysis
      doc.setFontSize(16);
      doc.text(currentReport.reportLang === 'fr' ? 'Analyse Détaillée' : 'Detailed Analysis', 20, yPos);
      yPos += 10;

      // Parse markdown content
      const lines = currentReport.aiAnalysis.split('\n');
      doc.setFontSize(10);
      
      lines.forEach(line => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        const trimmed = line.trim();
        if (!trimmed) {
          yPos += 3;
          return;
        }

        // Headers
        if (trimmed.startsWith('# ')) {
          doc.setFontSize(14);
          doc.setTextColor(139, 92, 246);
          doc.text(trimmed.substring(2), 20, yPos);
          doc.setFontSize(10);
          doc.setTextColor(0);
          yPos += 8;
        } else if (trimmed.startsWith('## ')) {
          doc.setFontSize(12);
          doc.setTextColor(100);
          doc.text(trimmed.substring(3), 20, yPos);
          doc.setFontSize(10);
          doc.setTextColor(0);
          yPos += 7;
        } else {
          // Regular text with word wrap
          const textLines = doc.splitTextToSize(trimmed, pageWidth - 40);
          textLines.forEach(textLine => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(textLine, 20, yPos);
            yPos += 5;
          });
        }
      });

      // Save PDF
      const fileName = `seo-report-${currentReport.url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: t('seo.pdf_generated'),
        description: t('seo.pdf_generated_desc'),
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: t('seo.delete_error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Helmet>
        <title>{t('seo.title')} - YourBizFlow</title>
        <meta name="description" content={t('seo.subtitle')} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">{t('seo.title')}</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('seo.subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto mb-8"
        >
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                    {language === 'fr' ? 'Module en cours de mise à jour' : 'Module Under Maintenance'}
                  </h3>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500">
                    {language === 'fr' 
                      ? 'Ce module est actuellement en cours de maintenance et pourrait rencontrer des problèmes temporaires. Nous travaillons à sa stabilisation. Merci de votre patience.' 
                      : 'This module is currently under maintenance and may experience temporary issues. We are working on stabilizing it. Thank you for your patience.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="analyze" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              {t('seo.tab_analyze')}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              {t('seo.tab_history')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-8">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {t('seo.new_analysis')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('seo.url_label')}</label>
                  <Input
                    type="url"
                    placeholder={t('seo.url_placeholder')}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isAnalyzing}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('seo.language_label')}</label>
                  <Select value={language} onValueChange={setLanguage} disabled={isAnalyzing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t('seo.language_english')}</SelectItem>
                      <SelectItem value="fr">{t('seo.language_french')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isAnalyzing && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      {t('seo.analyzing_progress', { progress })}
                    </p>
                  </div>
                )}

                <Button
                  onClick={analyzeUrl}
                  disabled={isAnalyzing || !url}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('seo.analyzing')}
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      {t('seo.analyze_button')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {currentReport && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="bg-green-500/10 border-green-500/20">
                  <CardContent className="py-4 flex items-center justify-between">
                    <p className="text-green-600 dark:text-green-400 font-semibold">
                      {t('seo.report_success', { score: currentReport.scores.global })}
                    </p>
                    <Button onClick={generatePDF} disabled={isGeneratingPdf} variant="outline" size="sm">
                      {isGeneratingPdf ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('seo.generating_pdf')}
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          {t('seo.download_pdf')}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                      <TrendingUp className="w-8 h-8 text-primary mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('seo.score_global')}</h3>
                      <ScoreCircle score={currentReport.scores?.global || 0} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                      <Smartphone className="w-8 h-8 text-primary mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('seo.score_mobile')}</h3>
                      <ScoreCircle score={currentReport.scores?.mobile || 0} size="medium" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                      <Monitor className="w-8 h-8 text-primary mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('seo.score_desktop')}</h3>
                      <ScoreCircle score={currentReport.scores?.desktop || 0} size="medium" />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      {t('seo.detailed_analysis')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MarkdownContent content={currentReport.aiAnalysis} />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  {t('seo.history_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">{t('seo.history_loading')}</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">{t('seo.history_empty')}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t('seo.history_empty_subtitle')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((report) => {
                      const globalScore = typeof report.scores?.global === 'number' 
                        ? report.scores.global 
                        : report.scores?.overall || 0;
                      const mobileScore = typeof report.scores?.mobile === 'number' 
                        ? report.scores.mobile 
                        : report.scores?.mobile?.seo || 0;
                      const desktopScore = typeof report.scores?.desktop === 'number' 
                        ? report.scores.desktop 
                        : report.scores?.desktop?.seo || 0;

                      return (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <a
                                  href={report.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium hover:text-primary truncate flex items-center gap-1"
                                >
                                  {report.url}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {t('seo.history_analyzed_on')} {format(new Date(report.analyzed_at), 'dd/MM/yyyy HH:mm')}
                              </p>
                              <div className="flex items-center gap-4 text-sm flex-wrap">
                                <span className="font-semibold">
                                  {t('seo.history_score')}: {globalScore}/100
                                </span>
                                <span className="text-muted-foreground">
                                  {t('seo.history_mobile')}: {mobileScore}/100
                                </span>
                                <span className="text-muted-foreground">
                                  {t('seo.history_desktop')}: {desktopScore}/100
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadReport(report)}
                              >
                                {t('seo.history_view')}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteReport(report.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const ScoreCircle = ({ score, size = 'large' }) => {
  const radius = size === 'large' ? 70 : 50;
  const strokeWidth = size === 'large' ? 12 : 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getColor = (score) => {
    if (score >= 90) return '#22c55e';
    if (score >= 50) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={getColor(score)}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </svg>
      <div className="absolute text-center">
        <div className={`font-bold ${size === 'large' ? 'text-3xl' : 'text-xl'}`}>
          {score}
        </div>
        <div className={`text-muted-foreground ${size === 'large' ? 'text-sm' : 'text-xs'}`}>
          /100
        </div>
      </div>
    </div>
  );
};

const MarkdownContent = ({ content }) => {
  if (!content) return <p className="text-muted-foreground">No content</p>;
  if (typeof content === 'object') return <p className="text-muted-foreground">Invalid format</p>;

  const lines = String(content).split('\n');
  
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold mt-6 mb-3">{trimmed.substring(2)}</h1>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold mt-5 mb-2">{trimmed.substring(3)}</h2>;
        }
        if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{trimmed.substring(4)}</h3>;
        }

        const formatBold = (text) => {
          const parts = text.split(/(\*\*.*?\*\*)/g);
          return parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={idx}>{part.slice(2, -2)}</strong>;
            }
            return part;
          });
        };

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return <li key={i} className="ml-4">{formatBold(trimmed.substring(2))}</li>;
        }

        return <p key={i} className="leading-relaxed">{formatBold(trimmed)}</p>;
      })}
    </div>
  );
};

export default SeoAnalyzer;
