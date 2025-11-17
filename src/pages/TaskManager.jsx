import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { PlusCircle, MoreVertical, Edit, Trash2, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Helmet } from 'react-helmet';

const TaskCard = ({ task, onDragStart, onUpdate, onDelete }) => {
  const { t } = useTranslation();

  const priorityClasses = {
    'Basse': 'bg-blue-500/20',
    'Moyenne': 'bg-yellow-500/20',
    'Haute': 'bg-red-500/20',
    'Low': 'bg-blue-500/20',
    'Medium': 'bg-yellow-500/20',
    'High': 'bg-red-500/20',
  };

  const translatedPriority = t(`task_manager.priority_${task.priority?.toLowerCase()}`, task.priority);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="bg-card p-4 rounded-md shadow-sm cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold">{task.title}</h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onUpdate(task)}><Edit className="mr-2 h-4 w-4" /> {t('task_manager.edit_task')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> {t('task_manager.delete_task')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
      <div className="flex justify-between items-center mt-4 text-xs">
        <span className={`px-2 py-1 rounded-full ${priorityClasses[translatedPriority] || priorityClasses[task.priority]}`}>{translatedPriority}</span>
        {task.due_date && <span>{new Date(task.due_date).toLocaleDateString()}</span>}
      </div>
    </motion.div>
  );
};

const TaskForm = ({ task, onSave, onCancel, statuses }) => {
  const { t } = useTranslation();
  const [currentTask, setCurrentTask] = useState(task || { title: '', description: '', due_date: null, priority: 'Moyenne', status: statuses[0]?.id });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(currentTask);
    setIsSaving(false);
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{task?.id ? t('task_manager.edit_task') : t('task_manager.new_task')}</DialogTitle></DialogHeader>
      <div className="py-4 space-y-4">
        <div><Label htmlFor="title">{t('task_manager.task_title')}</Label><Input id="title" value={currentTask.title} onChange={e => setCurrentTask({ ...currentTask, title: e.target.value })} placeholder={t('task_manager.task_title_placeholder')} /></div>
        <div><Label htmlFor="description">{t('task_manager.task_desc')}</Label><Textarea id="description" value={currentTask.description} onChange={e => setCurrentTask({ ...currentTask, description: e.target.value })} placeholder={t('task_manager.task_desc_placeholder')} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>{t('task_manager.task_due_date')}</Label><DatePicker date={currentTask.due_date ? new Date(currentTask.due_date) : null} setDate={(date) => setCurrentTask({ ...currentTask, due_date: date })} /></div>
          <div><Label>{t('task_manager.task_priority')}</Label>
            <Select value={currentTask.priority} onValueChange={priority => setCurrentTask({ ...currentTask, priority })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Haute">{t('task_manager.priority_high')}</SelectItem>
                <SelectItem value="Moyenne">{t('task_manager.priority_medium')}</SelectItem>
                <SelectItem value="Basse">{t('task_manager.priority_low')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline" onClick={onCancel} disabled={isSaving}>{t('dialog_cancel')}</Button></DialogClose>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {t('dialog_save')}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const TaskManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [statuses, setStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [statusesRes, tasksRes] = await Promise.all([
      supabase.from('project_statuses').select('*').eq('user_id', user.id).order('position'),
      supabase.from('tasks').select('*').eq('user_id', user.id),
    ]);

    if (statusesRes.error || tasksRes.error) {
      toast({ variant: "destructive", title: t('toast_error_title'), description: t('task_manager.error_load_data') });
    } else {
      setStatuses(statusesRes.data);
      setTasks(tasksRes.data);
      if (statusesRes.data.length === 0) {
        const defaultStatuses = [
          { name: t('projects.status_todo'), position: 1, user_id: user.id },
          { name: t('projects.status_in_progress'), position: 2, user_id: user.id },
          { name: t('projects.status_done'), position: 3, user_id: user.id },
        ];
        const { data: newStatuses, error: createError } = await supabase.from('project_statuses').insert(defaultStatuses).select();
        if (!createError) setStatuses(newStatuses);
      }
    }
    setLoading(false);
  }, [user, toast, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTaskMove = async (taskId, newStatusId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task.status === newStatusId) return;

    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: newStatusId } : t));

    const { error } = await supabase.from('tasks').update({ status: newStatusId }).eq('id', taskId);
    if (error) {
      toast({ variant: "destructive", title: t('toast_error_title'), description: t('task_manager.error_move_task') });
      fetchData();
    }
  };

  const handleSaveTask = async (taskData) => {
    if (!taskData.title || taskData.title.trim() === '') {
      toast({
        variant: "destructive",
        title: t('toast_required_fields_title'),
        description: t('task_manager.error_title_required'),
      });
      return;
    }

    const payload = { ...taskData, user_id: user.id };
    let error;
    if (taskData.id) {
      ({ error } = await supabase.from('tasks').update(payload).eq('id', taskData.id));
    } else {
      const { id, ...insertData } = payload;
      ({ error } = await supabase.from('tasks').insert(insertData).select());
    }
    if (error) {
      console.error("Supabase error:", error);
      toast({ variant: "destructive", title: t('toast_error_title'), description: `${t('task_manager.error_save_task')}: ${error.message}` });
    } else {
      toast({ title: t('toast_success_title'), description: t('task_manager.success_save_task') });
      setIsTaskFormOpen(false);
      setEditingTask(null);
      fetchData();
    }
  };

  const handleDeleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      toast({ variant: "destructive", title: t('toast_error_title'), description: t('task_manager.error_delete_task') });
    } else {
      toast({ title: t('toast_success_title'), description: t('task_manager.success_delete_task') });
      fetchData();
    }
  };

  const handleOpenTaskForm = (task = null, statusId = null) => {
    const defaultStatusId = statusId || statuses[0]?.id;
    setEditingTask(task ? { ...task, status: task.status || defaultStatusId } : { title: '', description: '', due_date: null, status: defaultStatusId, priority: 'Moyenne' });
    setIsTaskFormOpen(true);
  };
  
  const handleAddStatus = async () => {
    if (!newStatusName.trim()) return;
    const newPosition = (statuses[statuses.length - 1]?.position || 0) + 1;
    const { data, error } = await supabase.from('project_statuses').insert({ name: newStatusName, position: newPosition, user_id: user.id }).select().single();
    if (error) {
      toast({ variant: "destructive", title: t('toast_error_title'), description: t('task_manager.error_save_status') });
    } else {
      setStatuses([...statuses, data]);
      setNewStatusName('');
      toast({ title: t('toast_success_title'), description: t('task_manager.success_save_status') });
    }
  };
  
  const handleDeleteStatus = async (statusId) => {
    await supabase.from('tasks').delete().eq('status', statusId);
    const { error } = await supabase.from('project_statuses').delete().eq('id', statusId);
    if (error) {
      toast({ variant: "destructive", title: t('toast_error_title'), description: t('task_manager.error_delete_status') });
    } else {
      toast({ title: t('toast_success_title'), description: t('task_manager.success_delete_status') });
      fetchData();
    }
  };

  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
    setIsDragging(true);
  };
  const onDragEnd = () => setIsDragging(false);
  const onDragOver = (e) => e.preventDefault();

  const onDrop = (e, statusId) => {
    const taskId = e.dataTransfer.getData("taskId");
    handleTaskMove(taskId, statusId);
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col h-full space-y-8">
       <Helmet>
        <title>{t('sidebar_module_task_manager')} - {t('app_name')}</title>
        <meta name="description" content={t('task_manager.subtitle')} />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('sidebar_module_task_manager')}</h1>
            <p className="text-muted-foreground">{t('task_manager.subtitle')}</p>
          </div>
          <Button onClick={() => handleOpenTaskForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />{t('task_manager.new_task')}
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center flex-grow"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
      ) : (
        <div className="flex-grow overflow-x-auto overflow-y-hidden pb-4">
            <div className="flex gap-6 h-full min-w-max">
            {statuses.length > 0 ? statuses.map(status => (
              <div key={status.id} onDrop={(e) => onDrop(e, status.id)} onDragOver={onDragOver} className="w-80 flex-shrink-0 h-full">
                <div className="flex flex-col max-h-full bg-card/50 backdrop-blur-sm rounded-xl">
                  <div className="p-4 flex justify-between items-center border-b">
                    <h3 className="font-semibold text-foreground">{status.name}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" />{t('task_manager.delete_status')}</DropdownMenuItem></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>{t('task_manager.delete_status_confirm_title')}</AlertDialogTitle><AlertDialogDescription>{t('task_manager.delete_status_confirm_desc')}</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('dialog_cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteStatus(status.id)}>{t('billing.action_delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="p-4 space-y-4 overflow-y-auto flex-grow">
                    {tasks.filter(t => t.status === status.id).map(task => (
                      <TaskCard key={task.id} task={task} onDragStart={onDragStart} onUpdate={() => handleOpenTaskForm(task)} onDelete={() => handleDeleteTask(task.id)} />
                    ))}
                    <Button variant="outline" className="w-full" onClick={() => handleOpenTaskForm(null, status.id)}><PlusCircle className="mr-2 h-4 w-4" />{t('task_manager.new_task')}</Button>
                  </div>
                </div>
              </div>
            )) : <p className="text-muted-foreground w-full text-center mt-10">{t('task_manager.empty_board')}</p>}
            <div className="w-80 flex-shrink-0">
                <div className="p-4 bg-card/30 rounded-xl space-y-2">
                    <Input placeholder={t('task_manager.new_status')} value={newStatusName} onChange={(e) => setNewStatusName(e.target.value)} />
                    <Button className="w-full" onClick={handleAddStatus}>{t('task_manager.new_status')}</Button>
                </div>
            </div>
            </div>
        </div>
      )}

      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        {isTaskFormOpen && <TaskForm task={editingTask} onSave={handleSaveTask} onCancel={() => setIsTaskFormOpen(false)} statuses={statuses} />}
      </Dialog>
    </div>
  );
};

export default TaskManager;