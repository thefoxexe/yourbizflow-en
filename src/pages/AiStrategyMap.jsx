import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Map, Zap, Loader2, Maximize, Save, BrainCircuit, History, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { hierarchy, tree } from 'd3-hierarchy';
import { zoom, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Node = ({ node }) => {
  const isRoot = node.depth === 0;
  const isPillar = node.depth === 1;
  const colors = {
    bg: isRoot ? 'bg-indigo-500' : isPillar ? 'bg-sky-500' : 'bg-slate-700',
    border: isRoot ? 'border-indigo-400' : isPillar ? 'border-sky-400' : 'border-slate-600',
    text: 'text-white'
  };
  return (
    <g transform={`translate(${node.y},${node.x})`}>
      <foreignObject x={-75} y={-35} width={150} height={70} className="cursor-pointer">
        <div className={cn("w-full h-full p-2 rounded-lg border-2 flex items-center justify-center text-center shadow-lg", colors.bg, colors.border, colors.text)}>
          <p className="text-xs font-semibold" style={{ whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
            {node.data.name}
          </p>
        </div>
      </foreignObject>
    </g>
  );
};

const LinkPath = ({ link }) => (
  <path d={`M${link.source.y + 75},${link.source.x}C${(link.source.y + link.target.y) / 2},${link.source.x} ${(link.source.y + link.target.y) / 2},${link.target.x} ${link.target.y - 75},${link.target.x}`} fill="none" stroke="#4b5563" strokeWidth={2} />
);

const MindMapVisualization = ({ data }) => {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  const root = useMemo(() => {
    if (!data) return null;
    const treeLayout = tree().nodeSize([140, 250]);
    return treeLayout(data);
  }, [data]);
  
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);
  
  useEffect(() => {
    if (!root || !svgRef.current || !gRef.current) return;
    const svg = select(svgRef.current);
    const g = select(gRef.current);
    const zoomBehavior = zoom().scaleExtent([0.2, 3]).on('zoom', event => {
      g.attr('transform', event.transform);
    });
    svg.call(zoomBehavior);

    setTimeout(() => {
      if (!gRef.current) return;
      const bounds = gRef.current.getBBox();
      const parent = svg.node().parentElement;
      const fullWidth = parent.clientWidth;
      const fullHeight = parent.clientHeight;
      const width = bounds.width;
      const height = bounds.height;
      const midX = bounds.x + width / 2;
      const midY = bounds.y + height / 2;
      if (width === 0 || height === 0) return;
      const scale = Math.min(1, fullWidth / width, fullHeight / height) * 0.9;
      const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];
      const initialTransform = zoomIdentity.translate(translate[0], translate[1]).scale(scale);
      svg.transition().duration(750).call(zoomBehavior.transform, initialTransform);
    }, 100);
  }, [root, dimensions.width, dimensions.height]);
  
  if (!root) return null;
  return (
    <div ref={containerRef} className="w-full h-[600px] rounded-lg border bg-grid-slate-900/[0.2] overflow-hidden cursor-grab">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
        <g ref={gRef}>
          {root.links().map(l => <LinkPath key={`${l.source.data.name}-${l.target.data.name}`} link={l} />)}
          {root.descendants().map(n => <Node key={n.data.name} node={n} />)}
        </g>
      </svg>
    </div>
  );
};

const AiStrategyMap = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [objective, setObjective] = useState('');
  const [currentMap, setCurrentMap] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMaps, setSavedMaps] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const fullscreenRef = useRef(null);
  
  const fetchSavedMaps = useCallback(async () => {
    setIsHistoryLoading(true);
    const { data, error } = await supabase.from('strategy_maps').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('ai_strategy_map.history_load_error') });
      console.error("Fetch error:", error);
    } else {
      setSavedMaps(data);
    }
    setIsHistoryLoading(false);
  }, [user.id, toast, t]);

  useEffect(() => {
    fetchSavedMaps();
  }, [fetchSavedMaps]);

  const handleGenerateMap = async () => {
    if (!objective.trim()) {
      toast({ variant: 'destructive', title: t('ai_strategy_map.objective_missing_title'), description: t('ai_strategy_map.objective_missing_desc') });
      return;
    }
    setIsLoading(true);
    setCurrentMap(null);
    const companyContext = `
      Nom de l'entreprise: ${profile.company_name || 'Non défini'}
      Description de l'activité: ${profile.business_description || 'Non définie'}
      Pays: ${profile.country || 'Non défini'}
    `;
    try {
      const { data, error } = await supabase.functions.invoke('ai-strategy-map', {
        body: JSON.stringify({ objective, companyContext })
      });
      if (error) throw error;
      setCurrentMap({
        id: null,
        name: data.mapName || `${t('ai_strategy_map.strategy_for')} "${objective.substring(0, 30)}..."`,
        objective: objective,
        map_data: data.mapData,
        explanation: data.explanation,
        created_at: new Date().toISOString()
      });
      toast({ title: t('ai_strategy_map.map_generated_title'), description: t('ai_strategy_map.map_generated_desc') });
    } catch (error) {
      console.error('Error generating strategy map:', error);
      toast({ variant: 'destructive', title: t('ai_strategy_map.generation_error_title'), description: t('ai_strategy_map.generation_error_desc') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMap = async () => {
    if (!currentMap) return;
    setIsSaving(true);
    const { data, error } = await supabase.from('strategy_maps').insert({
      user_id: user.id,
      name: currentMap.name,
      objective: currentMap.objective,
      map_data: currentMap.map_data,
      explanation: currentMap.explanation
    }).select().single();
    if (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('ai_strategy_map.save_error') });
    } else {
      toast({ title: t('password_reset_success_title'), description: t('ai_strategy_map.save_success') });
      setCurrentMap(prev => ({ ...prev, id: data.id }));
      await fetchSavedMaps();
    }
    setIsSaving(false);
  };

  const handleDeleteMap = async (mapId) => {
    const { error } = await supabase.from('strategy_maps').delete().eq('id', mapId);
    if (error) {
        toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('ai_strategy_map.delete_error') });
    } else {
        toast({ title: t('password_reset_success_title'), description: t('ai_strategy_map.delete_success') });
        setSavedMaps(prevMaps => prevMaps.filter(map => map.id !== mapId));
        if (currentMap && currentMap.id === mapId) {
            setCurrentMap(null);
            setObjective('');
        }
    }
  };

  const handleFullscreen = () => {
    if (fullscreenRef.current) {
      fullscreenRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
  };

  const handleLoadMap = map => {
    setCurrentMap(map);
    setObjective(map.objective);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hierarchicalMapData = useMemo(() => {
    return currentMap ? hierarchy(currentMap.map_data) : null;
  }, [currentMap]);
  
  return (
    <div className="space-y-8">
      <Helmet>
        <title>{t('sidebar_module_ai_strategy_map')} - {t('app_name')}</title>
        <meta name="description" content={t('ai_strategy_map.meta_description')} />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Map className="w-8 h-8" />
              {t('sidebar_module_ai_strategy_map')}
            </h1>
            <p className="text-muted-foreground">{t('ai_strategy_map.subtitle')}</p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
            <BrainCircuit className="w-4 h-4" />
            <span>{t('ai_strategy_map.ai_badge')}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                {t('ai_strategy_map.create_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea placeholder={t('ai_strategy_map.placeholder')} value={objective} onChange={e => setObjective(e.target.value)} className="min-h-[100px]" disabled={isLoading} />
              <Button onClick={handleGenerateMap} disabled={isLoading || !objective.trim()}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('ai_strategy_map.generating_button')}</> : t('ai_strategy_map.generate_button')}
              </Button>
            </CardContent>
          </Card>

          {currentMap && hierarchicalMapData && (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <CardTitle className="flex-1">{currentMap.name}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="icon" onClick={handleFullscreen} title={t('ai_strategy_map.fullscreen_button')}><Maximize className="w-4 h-4" /></Button>
                        <Button onClick={handleSaveMap} disabled={isSaving || !!currentMap.id}>
                          {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('ai_strategy_map.saving_button')}</> : <><Save className="w-4 h-4 mr-2" />{t('ai_strategy_map.save_button')}</>}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div ref={fullscreenRef} className="bg-background p-4 rounded-lg">
                      <MindMapVisualization data={hierarchicalMapData} />
                      {currentMap.explanation && (
                        <div className="mt-8">
                          <h3 className="text-xl font-bold flex items-center gap-2 mb-4"><BrainCircuit className="w-5 h-5 text-primary" /> {t('ai_strategy_map.explanation_title')}</h3>
                          <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-primary">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentMap.explanation}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}

          {!currentMap && !isLoading && (
            <div className="text-center p-12 border-2 border-dashed rounded-lg">
              <Map className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t('ai_strategy_map.empty_title')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t('ai_strategy_map.empty_subtitle')}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="w-5 h-5" /> {t('ai_strategy_map.history_title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isHistoryLoading ? (
                <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : savedMaps.length > 0 ? (
                <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {savedMaps.map(map => (
                    <li key={map.id} className="p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{map.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(map.created_at), "d MMMM yyyy 'à' HH:mm", { locale: i18n.language === 'fr' ? fr : enUS })}
                              </p>
                          </div>
                          <div className="flex items-center flex-shrink-0">
                            <Button size="sm" variant="ghost" onClick={() => handleLoadMap(map)}><Eye className="w-4 h-4"/></Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4"/></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('ai_strategy_map.delete_confirm_title')}</AlertDialogTitle>
                                  <AlertDialogDescription>{t('ai_strategy_map.delete_confirm_desc')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('page_billing_dialog_cancel')}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteMap(map.id)} className="bg-destructive hover:bg-destructive/90">{t('page_billing_action_delete')}</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">{t('ai_strategy_map.no_history')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AiStrategyMap;