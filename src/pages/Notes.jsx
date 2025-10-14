import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Folder, FileText, Plus, MoreVertical, Trash2, Edit, Search, FolderPlus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

const Notes = () => {
  const { toast } = useToast();
  const { user, getPlan } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [noteCount, setNoteCount] = useState(0);

  const plan = getPlan();
  const MAX_NOTES = {
    'Free': 2,
    'Pro': 20,
    'Business': Infinity,
  };
  const maxNotesForPlan = MAX_NOTES[plan] || 2;

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: allItems, error: allItemsError } = await supabase
      .from('storage_items')
      .select('id, name, is_folder, parent_id, created_at')
      .eq('user_id', user.id);

    if (allItemsError) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('notes.load_error') });
      setLoading(false);
      return;
    }

    setNoteCount(allItems.filter(item => !item.is_folder).length);
    setItems(allItems);

    if (currentFolderId) {
      const path = [];
      let folderId = currentFolderId;
      while (folderId) {
        const folder = allItems.find(item => item.id === folderId);
        if (folder) {
          path.unshift(folder);
          folderId = folder.parent_id;
        } else {
          folderId = null;
        }
      }
      setFolderPath(path);
    } else {
      setFolderPath([]);
    }

    setLoading(false);
  }, [user, toast, currentFolderId, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const canCreateNote = noteCount < maxNotesForPlan;

  const handleCreateNote = async () => {
    if (!canCreateNote) {
      toast({ variant: 'destructive', title: t('notes.limit_reached_title'), description: t('notes.limit_reached_desc', { max: maxNotesForPlan }) });
      navigate('/subscription');
      return;
    }
    const { data, error } = await supabase
      .from('storage_items')
      .insert({ user_id: user.id, name: t('notes.new_note'), is_folder: false, parent_id: currentFolderId })
      .select()
      .single();

    if (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('notes.create_error') });
    } else {
      navigate(`/notes/${data.id}`);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    const { error } = await supabase
      .from('storage_items')
      .insert({ user_id: user.id, name: newFolderName, is_folder: true, parent_id: currentFolderId });

    if (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('notes.folder_create_error') });
    } else {
      toast({ title: t('password_reset_success_title'), description: t('notes.folder_create_success') });
      setIsFolderDialogOpen(false);
      setNewFolderName('');
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('storage_items').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('notes.delete_error') });
    } else {
      toast({ title: t('password_reset_success_title'), description: t('notes.delete_success') });
      fetchData();
    }
  };

  const handleItemClick = (item) => {
    if (item.is_folder) {
      setCurrentFolderId(item.id);
    } else {
      navigate(`/notes/${item.id}`);
    }
  };

  const filteredItems = items
    .filter(item => item.parent_id === currentFolderId && item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (a.is_folder === b.is_folder) ? a.name.localeCompare(b.name) : (a.is_folder ? -1 : 1));

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('notes.title')}</h1>
          <p className="text-muted-foreground">{t('notes.subtitle')}</p>
          {plan !== 'Business' && (
            <p className="text-sm text-muted-foreground mt-1">
              {t('notes.usage_info', { count: noteCount, max: maxNotesForPlan })}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsFolderDialogOpen(true)}><FolderPlus className="w-4 h-4 mr-2" /> {t('notes.new_folder_button')}</Button>
          <Button onClick={handleCreateNote}><Plus className="w-4 h-4 mr-2" /> {t('notes.new_note_button')}</Button>
        </div>
      </motion.div>

      <div className="flex items-center gap-4">
        {currentFolderId && (
          <Button variant="ghost" size="icon" onClick={() => setCurrentFolderId(folderPath[folderPath.length - 2]?.id || null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder={t('notes.search_placeholder')} className="pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <span className="cursor-pointer hover:underline" onClick={() => setCurrentFolderId(null)}>{t('notes.breadcrumb_root')}</span>
        {folderPath.map(folder => (
          <span key={folder.id}> / <span className="cursor-pointer hover:underline" onClick={() => setCurrentFolderId(folder.id)}>{folder.name}</span></span>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="bg-card/50 rounded-lg h-32 animate-pulse"></div>)
          ) : filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-card/50 hover:bg-card/70 transition-colors duration-200 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer aspect-square"
              onClick={() => handleItemClick(item)}
            >
              {item.is_folder ? <Folder className="w-12 h-12 text-primary mb-2" /> : <FileText className="w-12 h-12 text-accent-foreground mb-2" />}
              <p className="text-sm font-medium text-foreground truncate w-full">{item.name}</p>
              <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
              
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => handleItemClick(item)}><Edit className="w-4 h-4 mr-2" /> {t('notes.open')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-500 focus:text-red-500"><Trash2 className="w-4 h-4 mr-2" /> {t('page_billing_action_delete')}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </div>
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>{searchTerm ? t('notes.no_search_results') : t('notes.empty_folder')}</p>
          </div>
        )}
      </motion.div>

      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{t('notes.new_folder_title')}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label htmlFor="folder-name">{t('notes.folder_name_label')}</Label><Input id="folder-name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>{t('page_billing_dialog_cancel')}</Button><Button onClick={handleCreateFolder}>{t('page_billing_dialog_create')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notes;