import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Folder, FileText, Plus, MoreVertical, Trash2, Edit, Search, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

const CloudStorage = () => {
  const { toast } = useToast();
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFiles = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('storage_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('notes.load_error') });
    } else {
      setFiles(data);
    }
    setLoading(false);
  }, [user, toast, t]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleCreateNote = async () => {
    if (!hasPermission('drive_write')) {
      toast({ variant: 'destructive', title: t('notes.permission_denied_title'), description: t('notes.permission_denied_desc') });
      return;
    }
    const { data, error } = await supabase
      .from('storage_items')
      .insert({ user_id: user.id, name: t('notes.new_note'), type: 'note', content: '' })
      .select()
      .single();

    if (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('notes.create_error') });
    } else {
      navigate(`/drive/note/${data.id}`);
    }
  };
  
  const handleDelete = async (id) => {
    const { error } = await supabase.from('storage_items').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('notes.delete_error') });
    } else {
      toast({ title: t('password_reset_success_title'), description: t('notes.delete_success') });
      fetchFiles();
    }
  };

  const handleAiAnalysis = () => {
    toast({
      title: t('notes.coming_soon_title'),
      description: t('notes.coming_soon_desc'),
    });
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('notes.title')}</h1>
          <p className="text-muted-foreground">{t('notes.subtitle')}</p>
        </div>
        <Button onClick={handleCreateNote}>
          <Plus className="w-4 h-4 mr-2" />
          {t('notes.new_note_button')}
        </Button>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder={t('notes.search_placeholder')}
          className="pl-10 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-card/50 rounded-lg h-32 animate-pulse"></div>
            ))
          ) : filteredFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-card/50 hover:bg-card/70 transition-colors duration-200 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer aspect-square"
              onClick={() => file.type === 'note' && navigate(`/drive/note/${file.id}`)}
            >
              {file.type === 'folder' ? (
                <Folder className="w-12 h-12 text-primary mb-2" />
              ) : (
                <FileText className="w-12 h-12 text-accent-foreground mb-2" />
              )}
              <p className="text-sm font-medium text-foreground truncate w-full">{file.name}</p>
              <p className="text-xs text-muted-foreground">{new Date(file.created_at).toLocaleDateString()}</p>
              
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => navigate(`/drive/note/${file.id}`)}>
                      <Edit className="w-4 h-4 mr-2" /> {t('notes.open')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAiAnalysis}>
                      <BrainCircuit className="w-4 h-4 mr-2" /> {t('notes.analyze_ai')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(file.id)} className="text-red-500 focus:text-red-500">
                      <Trash2 className="w-4 h-4 mr-2" /> {t('page_billing_action_delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
        {!loading && filteredFiles.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>{searchTerm ? t('notes.no_search_results') : t('notes.empty_drive')}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CloudStorage;