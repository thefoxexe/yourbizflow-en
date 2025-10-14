import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Clock, PlusCircle, Edit, Trash2, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/DatePicker';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const TimeEntryDialog = ({ entry, onSave, onCancel, projects, t }) => {
  const [currentEntry, setCurrentEntry] = useState(entry || { project_id: '', hours: 0, minutes: 0, date: new Date(), description: '' });

  useEffect(() => {
    if (entry) {
      const durationHours = Math.floor(entry.duration / 60);
      const durationMinutes = entry.duration % 60;
      setCurrentEntry({ ...entry, hours: durationHours, minutes: durationMinutes, date: new Date(entry.date) });
    } else {
      setCurrentEntry({ project_id: '', hours: 0, minutes: 0, date: new Date(), description: '' });
    }
  }, [entry]);

  const handleSave = () => {
    if (!currentEntry.project_id || (currentEntry.hours === 0 && currentEntry.minutes === 0)) {
      alert(t('time_tracking.all_fields_required'));
      return;
    }
    const durationInMinutes = parseInt(currentEntry.hours, 10) * 60 + parseInt(currentEntry.minutes, 10);
    onSave({ ...currentEntry, duration: durationInMinutes, start_time: currentEntry.date, end_time: currentEntry.date });
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{entry?.id ? t('time_tracking.edit_entry') : t('time_tracking.add_entry')}</DialogTitle></DialogHeader>
      <div className="py-4 space-y-4">
        <div>
          <Label>{t('sidebar_module_projects')}</Label>
          <Select value={currentEntry.project_id} onValueChange={project_id => setCurrentEntry({ ...currentEntry, project_id })}>
            <SelectTrigger><SelectValue placeholder={t('time_tracking.select_project')} /></SelectTrigger>
            <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t('task_manager.task_desc')}</Label>
          <Input value={currentEntry.description || ''} onChange={e => setCurrentEntry({ ...currentEntry, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t('time_tracking.hours')}</Label>
            <Input type="number" value={currentEntry.hours} onChange={e => setCurrentEntry({ ...currentEntry, hours: e.target.value })} min="0" />
          </div>
          <div>
            <Label>{t('time_tracking.minutes')}</Label>
            <Input type="number" value={currentEntry.minutes} onChange={e => setCurrentEntry({ ...currentEntry, minutes: e.target.value })} min="0" max="59" />
          </div>
        </div>
        <div>
          <Label>{t('time_tracking.date')}</Label>
          <DatePicker date={currentEntry.date} setDate={date => setCurrentEntry({ ...currentEntry, date })} />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline" onClick={onCancel}>{t('dialog_cancel')}</Button></DialogClose>
        <Button onClick={handleSave}>{t('dialog_save')}</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const TimeTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [entriesRes, projectsRes] = await Promise.all([
      supabase.from('time_entries').select('*, projects(name)').eq('user_id', user.id).order('start_time', { ascending: false }),
      supabase.from('projects').select('id, name').eq('user_id', user.id)
    ]);

    if (entriesRes.error || projectsRes.error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('time_tracking.load_error') });
    } else {
      setEntries(entriesRes.data.map(e => ({
        ...e,
        date: e.start_time,
        duration: e.end_time ? (new Date(e.end_time) - new Date(e.start_time)) / 60000 : 0
      })));
      setProjects(projectsRes.data);
    }
    setLoading(false);
  }, [user, toast, t]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSaveEntry = async (entryData) => {
    const payload = {
      user_id: user.id,
      project_id: entryData.project_id,
      description: entryData.description,
      start_time: entryData.date,
      end_time: new Date(new Date(entryData.date).getTime() + entryData.duration * 60000),
      invoiced: entryData.invoiced || false
    };

    let error;
    if (entryData.id) {
      ({ error } = await supabase.from('time_entries').update(payload).eq('id', entryData.id));
    } else {
      ({ error } = await supabase.from('time_entries').insert(payload));
    }
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('time_tracking.save_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('time_tracking.save_success') });
      setIsDialogOpen(false);
      setEditingEntry(null);
      fetchEntries();
    }
  };

  const handleDeleteEntry = async (id) => {
    const { error } = await supabase.from('time_entries').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('time_tracking.delete_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('time_tracking.delete_success') });
      fetchEntries();
    }
  };

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h}h ${m}m`;
  };
  
  const openDialog = (entry = null) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };
  
  const totalHours = useMemo(() => entries.reduce((sum, e) => sum + e.duration, 0) / 60, [entries]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('sidebar_module_time_tracking')}</h1>
          <p className="text-muted-foreground">{t('module_time_tracking_desc')}</p>
        </div>
        <Button onClick={() => openDialog()} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" />{t('time_tracking.add_manual_entry')}</Button>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>{t('time_tracking.duration')} ({t('analytics.last_30_days')})</CardTitle>
          <CardDescription className="text-4xl font-bold text-primary">{totalHours.toFixed(2)}h</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sidebar_module_projects')}</TableHead>
                  <TableHead>{t('task_manager.task_desc')}</TableHead>
                  <TableHead className="text-center">{t('time_tracking.duration')}</TableHead>
                  <TableHead className="text-center">{t('time_tracking.date')}</TableHead>
                  <TableHead className="text-right">{t('crm.table_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></TableCell></TableRow>
                ) : entries.length > 0 ? entries.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.projects?.name || t('time_tracking.unnamed_entry')}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-center">{formatDuration(entry.duration)}</TableCell>
                    <TableCell className="text-center">{format(new Date(entry.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(entry)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                )) : <TableRow><TableCell colSpan={5} className="text-center h-24">{t('time_tracking.no_entries')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <TimeEntryDialog entry={editingEntry} onSave={handleSaveEntry} onCancel={() => setIsDialogOpen(false)} projects={projects} t={t} />
      </Dialog>
    </div>
  );
};

export default TimeTracking;