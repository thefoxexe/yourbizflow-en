
    import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus, List, BookOpen, Calendar, Settings, Home, Car, Wrench, Edit, Trash2, MoreVertical, Upload, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { cn } from '@/lib/utils';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import CreateClientDialog from '@/components/CreateClientDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const PropertyStatusBadge = ({ status }) => {
  const statusStyles = {
    available: 'bg-green-500/10 text-green-400 border-green-500/20',
    maintenance: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    rented: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    out_of_service: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const statusLabels = {
    available: 'Disponible',
    maintenance: 'Maintenance',
    rented: 'Loué',
    out_of_service: 'Hors service',
  };
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', statusStyles[status])}>
      {statusLabels[status] || status}
    </span>
  );
};

const BookingStatusBadge = ({ status }) => {
  const statusStyles = {
    confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    canceled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const statusLabels = {
    confirmed: 'Confirmée',
    pending: 'En attente',
    completed: 'Terminée',
    canceled: 'Annulée',
  };
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', statusStyles[status])}>
      {statusLabels[status] || status}
    </span>
  );
};

const categoryIcons = {
  default: Home,
  Voiture: Car,
  Matériel: Wrench,
};

const PropertiesList = ({ properties, categories, onEdit, onDelete, currencySymbol }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {properties.map(prop => {
      const category = categories.find(c => c.id === prop.category_id);
      const Icon = categoryIcons[category?.name] || categoryIcons.default;
      return (
        <motion.div key={prop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border rounded-xl overflow-hidden flex flex-col">
          <div className="relative h-48 w-full bg-secondary flex items-center justify-center">
            {prop.photos && prop.photos.length > 0 ? (
              <img src={prop.photos[0]} alt={prop.name} className="h-full w-full object-cover" />
            ) : (
              <Icon className="w-12 h-12 text-muted-foreground" />
            )}
            <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button size="icon" variant="secondary" className="rounded-full h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(prop)}><Edit className="w-4 h-4 mr-2" /> Modifier</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(prop.id)} className="text-red-500 focus:text-red-500"><Trash2 className="w-4 h-4 mr-2" /> Supprimer</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
          <div className="p-4 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-foreground">{prop.name}</h3>
                <PropertyStatusBadge status={prop.status} />
            </div>
            <p className="text-sm text-muted-foreground mb-4 flex-grow">{prop.description}</p>
            <div className="flex justify-around text-center text-sm border-t pt-2 mt-auto">
                <div>
                    <p className="text-muted-foreground">/jour</p>
                    <p className="font-semibold">{prop.daily_rate || 'N/A'}{currencySymbol}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">/semaine</p>
                    <p className="font-semibold">{prop.weekly_rate || 'N/A'}{currencySymbol}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">/mois</p>
                    <p className="font-semibold">{prop.monthly_rate || 'N/A'}{currencySymbol}</p>
                </div>
            </div>
          </div>
        </motion.div>
      );
    })}
  </div>
);

const BookingsList = ({ bookings, properties, clients, onDelete, currencySymbol }) => (
    <div className="bg-card/50 border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/10">
                        <th className="p-4 text-left font-semibold text-muted-foreground">Bien</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">Client</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">Période</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">Montant</th>
                        <th className="p-4 text-left font-semibold text-muted-foreground">Statut</th>
                        <th className="p-4 text-right font-semibold text-muted-foreground">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(booking => {
                        const property = properties.find(p => p.id === booking.property_id);
                        const client = clients.find(c => c.id === booking.client_id);
                        return (
                        <tr key={booking.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5">
                            <td className="p-4 font-medium">{property?.name || 'Bien supprimé'}</td>
                            <td className="p-4 text-muted-foreground">{client?.name || 'Client supprimé'}</td>
                            <td className="p-4 text-muted-foreground">{format(parseISO(booking.start_date), 'dd/MM/yy')} - {format(parseISO(booking.end_date), 'dd/MM/yy')}</td>
                            <td className="p-4 font-semibold">{booking.amount}{currencySymbol}</td>
                            <td className="p-4"><BookingStatusBadge status={booking.status} /></td>
                            <td className="p-4 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => onDelete(booking.id)} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
);

const RentalManagement = () => {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('properties');
    const [loading, setLoading] = useState(true);
    const [properties, setProperties] = useState([]);
    const [categories, setCategories] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [clients, setClients] = useState([]);
    
    const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [currentProperty, setCurrentProperty] = useState({ photos: [] });
    const [photoFiles, setPhotoFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState({});
    
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);

    const currencySymbol = useMemo(() => {
        const currency = profile?.currency || 'eur';
        if (currency === 'usd') return '$';
        if (currency === 'chf') return 'CHF';
        return '€';
    }, [profile]);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const [
            { data: propertiesData, error: propertiesError },
            { data: categoriesData, error: categoriesError },
            { data: bookingsData, error: bookingsError },
            { data: clientsData, error: clientsError },
        ] = await Promise.all([
            supabase.from('rental_properties').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('rental_categories').select('*').eq('user_id', user.id),
            supabase.from('rental_bookings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('clients').select('id, name').eq('user_id', user.id),
        ]);

        if (propertiesError || categoriesError || bookingsError || clientsError) {
            toast({ variant: 'destructive', title: 'Erreur de chargement', description: 'Impossible de charger toutes les données.' });
        } else {
            setProperties(propertiesData);
            setCategories(categoriesData);
            setBookings(bookingsData);
            setClients(clientsData);
        }
        setLoading(false);
    }, [user, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveProperty = async () => {
        setIsUploading(true);
        let photoUrls = currentProperty.photos || [];

        if (photoFiles.length > 0) {
            for (const file of photoFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('inventory_photos')
                    .upload(filePath, file);

                if (uploadError) {
                    toast({ variant: 'destructive', title: 'Erreur d\'upload', description: `L'image ${file.name} n'a pas pu être téléversée.` });
                    setIsUploading(false);
                    return;
                }
                
                const { data: urlData } = supabase.storage.from('inventory_photos').getPublicUrl(filePath);
                photoUrls.push(urlData.publicUrl);
            }
        }

        const payload = { ...currentProperty, user_id: user.id, photos: photoUrls };
        delete payload.photoFiles;

        const { error } = editingProperty
            ? await supabase.from('rental_properties').update(payload).eq('id', editingProperty.id)
            : await supabase.from('rental_properties').insert(payload);
        
        setIsUploading(false);
        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder le bien.' });
        } else {
            toast({ title: 'Succès', description: `Bien ${editingProperty ? 'mis à jour' : 'ajouté'}.` });
            setIsPropertyDialogOpen(false);
            fetchData();
        }
    };

    const handleDeleteProperty = async (id) => {
        const { error } = await supabase.from('rental_properties').delete().eq('id', id);
        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le bien. Il est peut-être lié à des réservations.' });
        } else {
            toast({ title: 'Succès', description: 'Bien supprimé.' });
            fetchData();
        }
    };
    
    const handleSaveBooking = async () => {
        const payload = { 
            ...currentBooking, 
            user_id: user.id,
            start_date: format(currentBooking.start_date, 'yyyy-MM-dd'),
            end_date: format(currentBooking.end_date, 'yyyy-MM-dd'),
        };
        const { error } = await supabase.from('rental_bookings').insert(payload);

        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de créer la réservation.' });
        } else {
            toast({ title: 'Succès', description: 'Réservation créée.' });
            
            const { error: invoiceError } = await supabase.from('invoices').insert({
                user_id: user.id,
                client_id: payload.client_id,
                amount: payload.amount,
                status: 'pending',
                issue_date: format(new Date(), 'yyyy-MM-dd'),
                due_date: payload.start_date,
                items: [{
                    description: `Location de ${properties.find(p => p.id === payload.property_id)?.name}`,
                    quantity: 1,
                    unit_price: payload.amount
                }],
                tax_rate: 0
            });

            if (invoiceError) {
                toast({ variant: 'destructive', title: 'Erreur Facture', description: 'La facture automatique n\'a pas pu être créée.' });
            } else {
                toast({ title: 'Facture créée', description: 'Une facture a été générée automatiquement.' });
            }

            setIsBookingDialogOpen(false);
            fetchData();
        }
    };

    const handleDeleteBooking = async (id) => {
        const { error } = await supabase.from('rental_bookings').delete().eq('id', id);
        if (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la réservation.' });
        } else {
            toast({ title: 'Succès', description: 'Réservation supprimée.' });
            fetchData();
        }
    };

    const handleClientCreated = (newClient) => {
        setClients(prev => [...prev, { id: newClient.id, name: newClient.name }]);
        setCurrentBooking(prev => ({ ...prev, client_id: newClient.id }));
        setIsClientDialogOpen(false);
    };

    const openPropertyDialog = (property = null) => {
        setEditingProperty(property);
        setCurrentProperty(property || { photos: [] });
        setPhotoFiles([]);
        setIsPropertyDialogOpen(true);
    };
    
    const openBookingDialog = (booking = null) => {
        setCurrentBooking(booking ? { ...booking, start_date: parseISO(booking.start_date), end_date: parseISO(booking.end_date) } : {});
        setIsBookingDialogOpen(true);
    };
    
    const calendarEvents = bookings.map(booking => {
        const property = properties.find(p => p.id === booking.property_id);
        const client = clients.find(c => c.id === booking.client_id);
        return {
            title: `${property?.name} - ${client?.name}`,
            start: booking.start_date,
            end: format(new Date(booking.end_date).setDate(new Date(booking.end_date).getDate() + 1), 'yyyy-MM-dd'),
            allDay: true,
            color: booking.status === 'confirmed' ? 'hsl(var(--primary))' : booking.status === 'pending' ? 'hsl(var(--yellow-500))' : 'hsl(var(--muted-foreground))',
        };
    });

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-foreground">Gestion de Location</h1>
                <p className="text-muted-foreground">Gérez vos biens, réservations et disponibilités.</p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <TabsList className="w-full sm:w-auto">
                        <TabsTrigger value="properties" className="flex-1 sm:flex-initial"><List className="w-4 h-4 mr-2"/>Biens</TabsTrigger>
                        <TabsTrigger value="bookings" className="flex-1 sm:flex-initial"><BookOpen className="w-4 h-4 mr-2"/>Réservations</TabsTrigger>
                        <TabsTrigger value="calendar" className="flex-1 sm:flex-initial"><Calendar className="w-4 h-4 mr-2"/>Calendrier</TabsTrigger>
                        <TabsTrigger value="settings" className="flex-1 sm:flex-initial"><Settings className="w-4 h-4 mr-2"/>Paramètres</TabsTrigger>
                    </TabsList>
                    <div className="w-full sm:w-auto">
                        {activeTab === 'properties' && <Button onClick={() => openPropertyDialog()} className="w-full"><Plus className="w-4 h-4 mr-2"/>Ajouter un bien</Button>}
                        {activeTab === 'bookings' && <Button onClick={() => openBookingDialog()} className="w-full"><Plus className="w-4 h-4 mr-2"/>Ajouter une réservation</Button>}
                    </div>
                </div>

                <TabsContent value="properties" className="mt-6">
                    <PropertiesList properties={properties} categories={categories} onEdit={openPropertyDialog} onDelete={handleDeleteProperty} currencySymbol={currencySymbol} />
                </TabsContent>
                <TabsContent value="bookings" className="mt-6">
                    <BookingsList bookings={bookings} properties={properties} clients={clients} onDelete={handleDeleteBooking} currencySymbol={currencySymbol} />
                </TabsContent>
                <TabsContent value="calendar" className="mt-6">
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card/50 backdrop-blur-sm border rounded-xl p-4">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
                            initialView="dayGridMonth"
                            events={calendarEvents}
                            locale="fr"
                            buttonText={{ today: "Aujourd'hui", month: 'Mois', week: 'Semaine' }}
                            height="auto"
                        />
                    </motion.div>
                </TabsContent>
                <TabsContent value="settings" className="mt-6">
                    <p className="text-muted-foreground">Paramètres du module de location à venir...</p>
                </TabsContent>
            </Tabs>
            
            <Dialog open={isPropertyDialogOpen} onOpenChange={setIsPropertyDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{editingProperty ? 'Modifier le bien' : 'Ajouter un bien'}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-4 py-4">
                        <div><Label>Nom</Label><Input value={currentProperty.name || ''} onChange={e => setCurrentProperty({...currentProperty, name: e.target.value})} /></div>
                        <div><Label>Catégorie</Label><Input placeholder="Voiture, Matériel..." onChange={e => toast({title: "Bientôt disponible"})} /></div>
                        <div><Label>Description</Label><Textarea value={currentProperty.description || ''} onChange={e => setCurrentProperty({...currentProperty, description: e.target.value})} /></div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div><Label>Tarif/jour ({currencySymbol})</Label><Input type="number" value={currentProperty.daily_rate || ''} onChange={e => setCurrentProperty({...currentProperty, daily_rate: e.target.value})} /></div>
                          <div><Label>Tarif/semaine ({currencySymbol})</Label><Input type="number" value={currentProperty.weekly_rate || ''} onChange={e => setCurrentProperty({...currentProperty, weekly_rate: e.target.value})} /></div>
                          <div><Label>Tarif/mois ({currencySymbol})</Label><Input type="number" value={currentProperty.monthly_rate || ''} onChange={e => setCurrentProperty({...currentProperty, monthly_rate: e.target.value})} /></div>
                        </div>
                        <div>
                            <Label>Photos</Label>
                            <div className="mt-2 flex items-center justify-center w-full">
                                <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">Cliquez pour téléverser</p>
                                    </div>
                                    <Input id="photo-upload" type="file" multiple className="hidden" onChange={(e) => setPhotoFiles(Array.from(e.target.files))} />
                                </label>
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                                {currentProperty.photos?.map((photo, index) => (
                                    <div key={index} className="relative"><img src={photo} className="w-full h-24 object-cover rounded-md" /><Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => setCurrentProperty(p => ({...p, photos: p.photos.filter((_, i) => i !== index)}))}><X className="h-4 w-4"/></Button></div>
                                ))}
                                {photoFiles.map((file, index) => (
                                    <div key={index} className="relative"><img src={URL.createObjectURL(file)} className="w-full h-24 object-cover rounded-md" /><Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => setPhotoFiles(f => f.filter((_, i) => i !== index))}><X className="h-4 w-4"/></Button></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPropertyDialogOpen(false)} disabled={isUploading}>Annuler</Button>
                        <Button onClick={handleSaveProperty} disabled={isUploading}>
                            {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde...</> : 'Sauvegarder'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouvelle réservation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Bien</Label>
                            <Select onValueChange={value => setCurrentBooking({...currentBooking, property_id: value})}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner un bien..." /></SelectTrigger>
                                <SelectContent>
                                    {properties.filter(p => p.status === 'available').map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Client</Label>
                            <div className="flex gap-2">
                                <Select onValueChange={value => setCurrentBooking({...currentBooking, client_id: value})}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner un client..." /></SelectTrigger>
                                    <SelectContent>
                                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="icon" onClick={() => setIsClientDialogOpen(true)}><Plus/></Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div><Label>Début</Label><DatePicker date={currentBooking.start_date} setDate={date => setCurrentBooking({...currentBooking, start_date: date})} /></div>
                          <div><Label>Fin</Label><DatePicker date={currentBooking.end_date} setDate={date => setCurrentBooking({...currentBooking, end_date: date})} /></div>
                        </div>
                        <div><Label>Montant Total ({currencySymbol})</Label><Input type="number" value={currentBooking.amount || ''} onChange={e => setCurrentBooking({...currentBooking, amount: e.target.value})} /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleSaveBooking}>Confirmer et Facturer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <CreateClientDialog isOpen={isClientDialogOpen} onOpenChange={setIsClientDialogOpen} onClientCreated={handleClientCreated} />
        </div>
    );
};

export default RentalManagement;
  