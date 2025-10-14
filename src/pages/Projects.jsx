import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { FolderKanban, PlusCircle, MoreVertical, Edit, Trash2, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const ProjectCard = ({ project, onDragStart, onUpdate, onDelete, t }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, project.id)}
      className="bg-card p-4 rounded-md shadow-sm cursor-grab active:cursor-grabbing border"
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-foreground">{project.name}</h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onUpdate(project)}><Edit className="mr-2 h-4 w-4" />{t('projects.edit_project')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(project.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" />{t('page_billing_action_delete')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{project.description}</p>
      {project.client && <p className="text-xs text-muted-foreground mt-2">{t('page_billing_dialog_client')}: {project.client.name}</p>}
    </div>
  );
};


const ProjectForm = ({ project, clients, onSave, onCancel, t }) => {
  const [currentProject, setCurrentProject] = useState(project || { name: '', description: '', client_id: null, hourly_rate: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(currentProject);
    setIsSaving(false);
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{project?.id ? t('projects.edit_project') : t('projects.new_project')}</DialogTitle></DialogHeader>
      <div className="py-4 space-y-4">
        <div><Label htmlFor="name">{t('budget.budget_name_label')}</Label><Input id="name" value={currentProject.name} onChange={e => setCurrentProject({ ...currentProject, name: e.target.value })} /></div>
        <div><Label htmlFor="description">{t('page_billing_dialog_item_desc')}</Label><Textarea id="description" value={currentProject.description || ''} onChange={e => setCurrentProject({ ...currentProject, description: e.target.value })} /></div>
        <div><Label htmlFor="client">{t('page_billing_dialog_client')}</Label>
          <Select value={currentProject.client_id || ''} onValueChange={client_id => setCurrentProject({ ...currentProject, client_id })}>
            <SelectTrigger><SelectValue placeholder={t('page_billing_dialog_select_client')} /></SelectTrigger>
            <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label htmlFor="hourly_rate">{t('projects.hourly_rate')}</Label><Input id="hourly_rate" type="number" value={currentProject.hourly_rate || ''} onChange={e => setCurrentProject({ ...currentProject, hourly_rate: e.target.value })} /></div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button variant="outline" onClick={onCancel} disabled={isSaving}>{t('page_billing_dialog_cancel')}</Button></DialogClose>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {t('dialog_save')}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const Projects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [statuses, setStatuses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [statusesRes, projectsRes, clientsRes] = await Promise.all([
      supabase.from('project_statuses').select('*').eq('user_id', user.id).order('position'),
      supabase.from('projects').select('*, client:clients(name)').eq('user_id', user.id),
      supabase.from('clients').select('id, name').eq('user_id', user.id)
    ]);

    if (statusesRes.error || projectsRes.error || clientsRes.error) {
      toast({ variant: "destructive", title: t('toast_error_title'), description: t('projects.load_error') });
    } else {
      setStatuses(statusesRes.data);
      setProjects(projectsRes.data);
      setClients(clientsRes.data);
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

  const handleProjectMove = async (projectId, newStatusId) => {
    setProjects(prev => prev.map(p => p.id === projectId ? {...p, status_id: newStatusId} : p));
    const { error } = await supabase.from('projects').update({ status_id: newStatusId }).eq('id', projectId);
    if (error) {
      toast({ variant: "destructive", title: t('toast_error_title'), description: t('projects.move_error') });
      fetchData(); // revert optimistic update
    }
  };

  const handleSaveProject = async (projectData) => {
    const payload = { ...projectData, user_id: user.id };
    if (!payload.status_id && statuses.length > 0) {
      payload.status_id = statuses[0].id;
    }
    let error;
    if (projectData.id) {
      ({ error } = await supabase.from('projects').update(payload).eq('id', projectData.id));
    } else {
      const { id, ...insertData } = payload;
      ({ error } = await supabase.from('projects').insert(insertData));
    }
    if (error) {
      toast({ variant: "destructive", title: t('toast_error_title'), description: t('projects.save_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('projects.save_success') });
      setIsFormOpen(false);
      setEditingProject(null);
      fetchData();
    }
  };

  const handleDeleteProject = async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      toast({ variant: "destructive", title: t('toast_error_title'), description: t('projects.delete_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('projects.delete_success') });
      fetchData();
    }
  };

  const handleOpenForm = (project = null) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };
  
  const handleDragStart = (e, projectId) => {
    e.dataTransfer.setData('projectId', projectId);
    setIsDragging(true);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, statusId) => {
    const projectId = e.dataTransfer.getData('projectId');
    handleProjectMove(projectId, statusId);
    setIsDragging(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('sidebar_module_projects')}</h1>
          <p className="text-muted-foreground">{t('projects.subtitle')}</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild><Button onClick={() => handleOpenForm()} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> {t('projects.new_project')}</Button></DialogTrigger>
          {isFormOpen && <ProjectForm project={editingProject} clients={clients} onSave={handleSaveProject} onCancel={() => setIsFormOpen(false)} t={t} />}
        </Dialog>
      </motion.div>

      <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="flex gap-6 min-w-max">
        {statuses.map(status => (
          <div
            key={status.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status.id)}
            className={`w-full sm:w-80 flex-shrink-0 bg-card/50 rounded-lg p-4 transition-colors border ${isDragging ? 'border-dashed border-primary' : 'border-transparent'}`}
          >
            <h3 className="font-bold mb-4 text-foreground">{status.name}</h3>
            <div className="space-y-4">
              {projects.filter(p => p.status_id === status.id).map(project => (
                <ProjectCard key={project.id} project={project} onDragStart={handleDragStart} onUpdate={handleOpenForm} onDelete={handleDeleteProject} t={t} />
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;