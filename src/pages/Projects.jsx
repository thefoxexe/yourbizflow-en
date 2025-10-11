
    import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, MoreVertical, Edit, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  currencySymbol,
  isMobile = false
}) => <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 mb-4 cursor-grab active:cursor-grabbing" draggable onDragStart={e => e.dataTransfer.setData('projectId', project.id)}>
    <div className="flex justify-between items-start">
      <h4 className="font-bold text-foreground">{project.name}</h4>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-6 w-6"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(project)}><Edit className="w-4 h-4 mr-2" /> Modifier</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(project.id)} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" /> Supprimer</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
    {project.client && <p className="text-xs text-muted-foreground mt-2">Client: {project.client.name}</p>}
    {project.hourly_rate && <p className="text-xs text-primary font-semibold mt-2">Tarif: {project.hourly_rate} {currencySymbol}/h</p>}
  </div>;

const Projects = () => {
  const {
    toast
  } = useToast();
  const {
    user, profile
  } = useAuth();
  const [statuses, setStatuses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    client_id: '',
    status_id: '',
    hourly_rate: ''
  });
  const [newStatusName, setNewStatusName] = useState('');

  const currencySymbol = useMemo(() => {
    const currency = profile?.currency || 'eur';
    if (currency === 'usd') return '$';
    if (currency === 'chf') return 'CHF';
    return '€';
  }, [profile]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [statusesRes, projectsRes, clientsRes] = await Promise.all([supabase.from('project_statuses').select('*').eq('user_id', user.id).order('position'), supabase.from('projects').select('*, client:clients(name)').eq('user_id', user.id), supabase.from('clients').select('id, name').eq('user_id', user.id)]);
    if (statusesRes.error || projectsRes.error || clientsRes.error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les données.'
      });
    } else {
      if (statusesRes.data.length === 0) {
        const defaultStatuses = [{
          user_id: user.id,
          name: 'À faire',
          position: 0
        }, {
          user_id: user.id,
          name: 'En cours',
          position: 1
        }, {
          user_id: user.id,
          name: 'Terminé',
          position: 2
        }];
        const {
          data: newStatuses,
          error: insertError
        } = await supabase.from('project_statuses').insert(defaultStatuses).select();
        if (insertError) toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de créer les statuts par défaut.'
        });else setStatuses(newStatuses);
      } else {
        setStatuses(statusesRes.data);
      }
      setProjects(projectsRes.data);
      setClients(clientsRes.data);
    }
    setLoading(false);
  }, [user, toast]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleProjectDrop = async (e, statusId) => {
    const projectId = e.dataTransfer.getData('projectId');
    const {
      error
    } = await supabase.from('projects').update({
      status_id: statusId
    }).eq('id', projectId);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de déplacer le projet.'
      });
    } else {
      fetchData();
    }
  };
  const handleCreateOrUpdateProject = async () => {
    if (!newProject.name || !newProject.status_id) {
      toast({
        variant: 'destructive',
        title: 'Champs requis',
        description: 'Le nom et le statut sont obligatoires.'
      });
      return;
    }
    const projectData = {
      ...newProject,
      user_id: user.id,
      client_id: newProject.client_id || null,
      hourly_rate: newProject.hourly_rate ? Number(newProject.hourly_rate) : null
    };
    const {
      error
    } = currentProject ? await supabase.from('projects').update(projectData).eq('id', currentProject.id) : await supabase.from('projects').insert(projectData);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Le projet n'a pas pu être sauvegardé."
      });
    } else {
      toast({
        title: 'Succès',
        description: `Projet ${currentProject ? 'mis à jour' : 'créé'}.`
      });
      setIsProjectDialogOpen(false);
      fetchData();
    }
  };
  const handleDeleteProject = async projectId => {
    const {
      error
    } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) toast({
      variant: 'destructive',
      title: 'Erreur',
      description: "Le projet n'a pas pu être supprimé."
    });else {
      toast({
        title: 'Succès',
        description: 'Projet supprimé.'
      });
      fetchData();
    }
  };
  const handleCreateOrUpdateStatus = async () => {
    if (!newStatusName) return;
    const statusData = {
      user_id: user.id,
      name: newStatusName,
      position: currentStatus ? currentStatus.position : statuses.length
    };
    const {
      error
    } = currentStatus ? await supabase.from('project_statuses').update({
      name: newStatusName
    }).eq('id', currentStatus.id) : await supabase.from('project_statuses').insert(statusData);
    if (error) toast({
      variant: 'destructive',
      title: 'Erreur',
      description: "Le statut n'a pas pu être sauvegardé."
    });else {
      toast({
        title: 'Succès',
        description: `Statut ${currentStatus ? 'mis à jour' : 'créé'}.`
      });
      setIsStatusDialogOpen(false);
      fetchData();
    }
  };
  const handleDeleteStatus = async statusId => {
    const {
      error
    } = await supabase.from('project_statuses').delete().eq('id', statusId);
    if (error) toast({
      variant: 'destructive',
      title: 'Erreur',
      description: "Le statut n'a pas pu être supprimé."
    });else {
      toast({
        title: 'Succès',
        description: 'Statut supprimé.'
      });
      fetchData();
    }
  };
  return <div className="h-full flex flex-col">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Suivi de Projets</h1>
          <p className="text-muted-foreground">Organisez vos projets avec un tableau.</p>
        </div>
        <Button onClick={() => {
        setCurrentProject(null);
        setNewProject({
          name: '',
          description: '',
          client_id: '',
          status_id: statuses[0]?.id || '',
          hourly_rate: ''
        });
        setIsProjectDialogOpen(true);
      }}>
          <Plus className="w-4 h-4 mr-2" /> Nouveau Projet
        </Button>
      </motion.div>

      <div className="hidden md:flex flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {loading ? [...Array(3)].map((_, i) => <div key={i} className="w-full sm:w-80 bg-card/50 rounded-xl animate-pulse"></div>) : statuses.map(status => <div key={status.id} className="w-full sm:w-80 h-full flex flex-col" onDragOver={e => e.preventDefault()} onDrop={e => handleProjectDrop(e, status.id)}>
                <div className="flex items-center justify-between p-2 mb-4">
                  <h3 className="font-semibold text-foreground">{status.name}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-6 w-6"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                  setCurrentStatus(status);
                  setNewStatusName(status.name);
                  setIsStatusDialogOpen(true);
                }}><Edit className="w-4 h-4 mr-2" /> Renommer</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteStatus(status.id)} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" /> Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2 flex-1 overflow-y-auto">
                  {projects.filter(p => p.status_id === status.id).map(p => <ProjectCard key={p.id} project={p} currencySymbol={currencySymbol} onEdit={proj => {
              setCurrentProject(proj);
              setNewProject(proj);
              setIsProjectDialogOpen(true);
            }} onDelete={handleDeleteProject} />)}
                </div>
              </div>)}
          <div className="w-full sm:w-80 flex-shrink-0">
            <Button variant="outline" className="w-full" onClick={() => {
            setCurrentStatus(null);
            setNewStatusName('');
            setIsStatusDialogOpen(true);
          }}>
              <Plus className="w-4 h-4 mr-2" /> Ajouter une colonne
            </Button>
          </div>
        </div>
      </div>

      <div className="md:hidden flex-1">
        <Tabs defaultValue={statuses[0]?.id || '0'} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {statuses.map(status => (
              <TabsTrigger key={status.id} value={status.id}>{status.name}</TabsTrigger>
            ))}
          </TabsList>
          {statuses.map(status => (
            <TabsContent key={status.id} value={status.id} className="mt-4">
              {projects.filter(p => p.status_id === status.id).map(p => (
                <ProjectCard key={p.id} project={p} currencySymbol={currencySymbol} onEdit={proj => {
                  setCurrentProject(proj);
                  setNewProject(proj);
                  setIsProjectDialogOpen(true);
                }} onDelete={handleDeleteProject} isMobile />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{currentProject ? 'Modifier le projet' : 'Nouveau projet'}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-4 py-4">
            <div className="space-y-2"><Label htmlFor="name">Nom</Label><Input id="name" value={newProject.name} onChange={e => setNewProject({
              ...newProject,
              name: e.target.value
            })} /></div>
            <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={newProject.description} onChange={e => setNewProject({
              ...newProject,
              description: e.target.value
            })} /></div>
            <div className="space-y-2"><Label htmlFor="hourly_rate">Tarif horaire ({currencySymbol})</Label><Input id="hourly_rate" type="number" placeholder="Ex: 50" value={newProject.hourly_rate} onChange={e => setNewProject({
              ...newProject,
              hourly_rate: e.target.value
            })} /></div>
            <div className="space-y-2"><Label htmlFor="status">Statut</Label><select id="status" value={newProject.status_id} onChange={e => setNewProject({
              ...newProject,
              status_id: e.target.value
            })} className="w-full mt-1 border rounded-md p-2 bg-background text-foreground"><option value="">Choisir...</option>{statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="client">Client</Label><select id="client" value={newProject.client_id || ''} onChange={e => setNewProject({
              ...newProject,
              client_id: e.target.value
            })} className="w-full mt-1 border rounded-md p-2 bg-background text-foreground"><option value="">Aucun</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          </div>
          <DialogFooter className="flex-shrink-0"><Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>Annuler</Button><Button onClick={handleCreateOrUpdateProject}>Sauvegarder</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{currentStatus ? 'Renommer la colonne' : 'Nouvelle colonne'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4"><div className="space-y-2"><Label htmlFor="status-name">Nom</Label><Input id="status-name" value={newStatusName} onChange={e => setNewStatusName(e.target.value)} /></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Annuler</Button><Button onClick={handleCreateOrUpdateStatus}>Sauvegarder</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Projects;
  