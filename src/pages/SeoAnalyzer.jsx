import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Search, Loader2, CheckCircle, XCircle, Wrench, BrainCircuit, Smartphone, Monitor, TrendingUp, ShieldCheck, Zap, Star, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from 'react-i18next';

const ResultCard = ({ icon: Icon, title, children, delay }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <Icon className="w-6 h-6 text-primary" />
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    </motion.div>
);

const MarkdownRenderer = ({ content }) => {
    if (!content) return null;

    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```markdown')) {
        cleanedContent = cleanedContent.substring(11);
    } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.substring(3);
    }
    if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
    }

    const parseLine = (line, key) => {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(line)) !== null) {
            if (match.index > lastIndex) {
                parts.push(line.substring(lastIndex, match.index));
            }
            parts.push(<strong key={`${key}-${lastIndex}`}>{match[1]}</strong>);
            lastIndex = boldRegex.lastIndex;
        }

        if (lastIndex < line.length) {
            parts.push(line.substring(lastIndex));
        }
        
        return parts;
    };

    const parseMarkdown = (text) => {
        const lines = text.split('\n');
        const elements = [];
        let listItems = [];

        const flushList = () => {
            if (listItems.length > 0) {
                elements.push(<ul key={`ul-${elements.length}`} className="list-disc space-y-2 pl-5">{listItems}</ul>);
                listItems = [];
            }
        };

        lines.forEach((line, index) => {
            if (line.trim() === '') return;
            if (line.startsWith('### ')) {
                flushList();
                elements.push(<h3 key={index} className="text-lg font-semibold mt-4 mb-2">{parseLine(line.substring(4), index)}</h3>);
            } else if (line.startsWith('## ')) {
                flushList();
                elements.push(<h2 key={index} className="text-xl font-bold mt-6 mb-3">{parseLine(line.substring(3), index)}</h2>);
            } else if (line.startsWith('* ') || line.startsWith('- ')) {
                listItems.push(
                    <li key={`${index}-${listItems.length}`}>{parseLine(line.substring(2), index)}</li>
                );
            } else {
                flushList();
                elements.push(<p key={index} className="mb-2">{parseLine(line, index)}</p>);
            }
        });

        flushList();
        return elements;
    };

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            {parseMarkdown(cleanedContent)}
        </div>
    );
};

const ScoreComparisonCard = ({ mobile, desktop, t }) => {
    const scores = [
        { label: t('seo.result_score_performance'), key: 'performance', icon: Zap },
        { label: t('seo.result_score_accessibility'), key: 'accessibility', icon: ShieldCheck },
        { label: t('seo.result_score_seo'), key: 'seo', icon: TrendingUp },
        { label: t('seo.result_score_best_practices'), key: 'bestPractices', icon: Star },
    ];

    const getScoreColor = (s) => {
        if (s >= 90) return 'bg-green-500';
        if (s >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{t('seo.result_detailed_scores')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {scores.map(({ label, key, icon: Icon }) => (
                    <div key={key}>
                        <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                            <h4 className="font-semibold">{label}</h4>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-primary" />
                                <div className="w-full bg-secondary rounded-full h-2.5">
                                    <motion.div
                                        className={`h-2.5 rounded-full ${getScoreColor(mobile[key])}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${mobile[key]}%` }}
                                        transition={{ duration: 0.5, delay: 0.5 }}
                                    />
                                </div>
                                <span className="font-bold w-10 text-right">{mobile[key]}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Monitor className="w-5 h-5 text-primary" />
                                <div className="w-full bg-secondary rounded-full h-2.5">
                                    <motion.div
                                        className={`h-2.5 rounded-full ${getScoreColor(desktop[key])}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${desktop[key]}%` }}
                                        transition={{ duration: 0.5, delay: 0.6 }}
                                    />
                                </div>
                                <span className="font-bold w-10 text-right">{desktop[key]}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

const ScoreCircle = ({ score }) => {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100 * circumference);

    const getScoreColor = (s) => {
        if (s >= 90) return 'text-green-500';
        if (s >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-secondary"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <motion.circle
                    className={getScoreColor(score)}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, delay: 0.3, ease: "circOut" }}
                />
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text-4xl font-bold fill-current text-foreground">
                    {score}
                </text>
            </svg>
        </div>
    );
};

const SeoAnalyzer = () => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [progress, setProgress] = useState(0);
    const { toast } = useToast();
    const { t, i18n } = useTranslation();
    const [reportLang, setReportLang] = useState(i18n.language.split('-')[0] || 'fr');

    const handleAnalyze = async () => {
        if (!url) {
            toast({
                variant: 'destructive',
                title: t('seo.error_missing_url_title'),
                description: t('seo.error_missing_url_desc'),
            });
            return;
        }
        try {
            new URL(url);
        } catch (_) {
            toast({
                variant: 'destructive',
                title: t('seo.error_invalid_url_title'),
                description: t('seo.error_invalid_url_desc'),
            });
            return;
        }

        setIsLoading(true);
        setAnalysisResult(null);
        setProgress(0);

        const progressInterval = setInterval(() => {
            setProgress(prev => (prev < 90 ? prev + 10 : 90));
        }, 800);

        try {
            const { data, error } = await supabase.functions.invoke('seo-analyzer', {
                body: JSON.stringify({ url, lang: reportLang }),
            });
            clearInterval(progressInterval);
            setProgress(100);

            if (error) throw new Error(error.message || t('seo.toast_error'));
            if (data.error) throw new Error(data.error);

            setAnalysisResult(data);
            toast({
                title: t('seo.toast_success'),
                description: t('seo.toast_success_desc'),
            });
        } catch (error) {
            clearInterval(progressInterval);
            toast({
                variant: 'destructive',
                title: t('seo.toast_error'),
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderAnalysisResult = () => {
        if (!analysisResult) return null;
        const { scores, results } = analysisResult;
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 mt-8"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                        <Card className="flex flex-col items-center justify-center text-center p-6 h-full">
                            <CardHeader className="pb-4">
                                <CardTitle>{t('seo.result_global_score')}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center">
                                <ScoreCircle score={scores.overall} />
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
                        <ScoreComparisonCard mobile={scores.mobile} desktop={scores.desktop} t={t} />
                    </motion.div>
                </div>
                <ResultCard icon={BrainCircuit} title={t('seo.result_ai_analysis')} delay={0.3}>
                    <MarkdownRenderer content={results.aiReport} />
                </ResultCard>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResultCard icon={Wrench} title={t('seo.result_structure_content')} delay={0.4}>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2">
                                {results.h1.count === 1 ? <CheckCircle className="text-green-500 flex-shrink-0" /> : <XCircle className="text-red-500 flex-shrink-0" />}
                                <span>{t('seo.result_h1_found', { count: results.h1.count })}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                {results.h2.count > 0 ? <CheckCircle className="text-green-500 flex-shrink-0" /> : <XCircle className="text-yellow-500 flex-shrink-0" />}
                                <span>{t('seo.result_h2_found', { count: results.h2.count })}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                {results.images.withoutAlt === 0 ? <CheckCircle className="text-green-500 flex-shrink-0" /> : <XCircle className="text-red-500 flex-shrink-0" />}
                                <span>{t('seo.result_images_alt', { count: results.images.withoutAlt, total: results.images.total })}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                {results.wordCount.value > 300 ? <CheckCircle className="text-green-500 flex-shrink-0" /> : <XCircle className="text-yellow-500 flex-shrink-0" />}
                                <span>{t('seo.result_word_count', { count: results.wordCount.value })}</span>
                            </li>
                        </ul>
                    </ResultCard>
                    <ResultCard icon={Wrench} title={t('seo.result_technical')} delay={0.5}>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2">
                                {results.robotsTxt.found ? <CheckCircle className="text-green-500 flex-shrink-0" /> : <XCircle className="text-red-500 flex-shrink-0" />}
                                <span>{results.robotsTxt.found ? t('seo.result_robots_found') : t('seo.result_robots_missing')}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                {results.sitemapXml.found ? <CheckCircle className="text-green-500 flex-shrink-0" /> : <XCircle className="text-red-500 flex-shrink-0" />}
                                <span>{results.sitemapXml.found ? t('seo.result_sitemap_found') : t('seo.result_sitemap_missing')}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="text-green-500 flex-shrink-0" />
                                <span>{t('seo.result_content_score')}: {scores.content}/100</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="text-green-500 flex-shrink-0" />
                                <span>{t('seo.result_technical_score')}: {scores.technical}/100</span>
                            </li>
                        </ul>
                    </ResultCard>
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('seo.methodology_title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>{t('seo.methodology_desc')}</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>{t('seo.methodology_item1')}</li>
                                <li>{t('seo.methodology_item2')}</li>
                                <li>{t('seo.methodology_item3')}</li>
                                <li>{t('seo.methodology_item4')}</li>
                                <li>{t('seo.methodology_item5')}</li>
                                <li>{t('seo.methodology_item6')}</li>
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-8">
            <Helmet>
                <title>{t('seo.title')} - {t('app_name')}</title>
                <meta name="description" content={t('seo.subtitle')} />
            </Helmet>

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center gap-4 mb-2">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg"><Sparkles className="w-6 h-6" /></div>
                    <h1 className="text-3xl font-bold text-foreground">{t('seo.title')}</h1>
                </div>
                <p className="text-muted-foreground">{t('seo.subtitle')}</p>
            </motion.div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('seo.new_analysis')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="relative flex-grow">
                            <label htmlFor="url-input" className="text-sm font-medium mb-2 block">{t('seo.url_placeholder')}</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="url-input"
                                    type="url"
                                    placeholder="https://example.com"
                                    className="pl-10 pr-4 py-3 text-base"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className="w-full sm:w-auto">
                            <label htmlFor="lang-select" className="text-sm font-medium mb-2 block">{t('seo.report_language')}</label>
                            <Select value={reportLang} onValueChange={setReportLang}>
                                <SelectTrigger className="w-full sm:w-[180px] py-3 text-base" id="lang-select">
                                    <Globe className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder={t('seo.report_language')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fr">Français</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button size="lg" onClick={handleAnalyze} disabled={isLoading} className="flex-shrink-0 w-full sm:w-auto py-3 text-base">
                            {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('seo.analyzing_button')}</> : t('seo.analyze_button')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4 text-center"
                    >
                        <Progress value={progress} className="w-full" />
                        <p className="text-muted-foreground animate-pulse">{t('seo.loading_text')}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {analysisResult ? (
                renderAnalysisResult()
            ) : !isLoading && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 border-2 border-dashed rounded-lg"
                >
                    <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">{t('seo.empty_state_title')}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t('seo.empty_state_desc')}</p>
                </motion.div>
            )}
        </div>
    );
};

export default SeoAnalyzer;