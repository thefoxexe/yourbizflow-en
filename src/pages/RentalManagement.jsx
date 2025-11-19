import React, { useState, useEffect, useCallback, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/hooks/use-toast';
    import { format, parseISO } from 'date-fns';
    import { Button } from '@/components/ui/button';
    import { Plus, List, BookOpen, Calendar, Settings, Home, Car, Wrench, Edit, Trash2, MoreVertical, Upload, X, Loader2, UserPlus } from 'lucide-react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
    import { useTranslation } from 'react-i18next';
    
    const PropertyStatusBadge = ({ status, t }) => {
      const statusStyles = {
        available: 'bg-green-500/10 text-green-400 border-green-500/20',
        maintenance: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        rented: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        out_of_service: 'bg-red-500/10 text-red-400 border-red-500/20',
      };
      return (
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', statusStyles[status])}>
          {t(`rental.property_status_${status}`)}
        </span>
      );
    };
    
    const BookingStatusBadge = ({ status, t }) => {
      const statusStyles = {
        confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
        pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        canceled: 'bg-red-500/10 text-red-400 border-red-500/20',
      };
      return (
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', statusStyles[status])}>
          {t(`rental.booking_status_${status}`)}
        </span>
      );
    };
    
    const categoryIcons = {
      default: Home,
      Voiture: Car,
      Matériel: Wrench,
    };
    
    const PropertiesList = ({ properties, categories, onEdit, onDelete, currencySymbol, t }) => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map(prop => {
          const category = categories.find(c => c.id === prop.category_id);
          const Icon = categoryIcons[category?.name] || categoryIcons.default;
          return (
            <motion.div key={prop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border rounded-xl overflow-hidden flex flex-col">
              <div className="relative h-48 w-full bg-secondary flex items-center justify-center" style={{ borderTop: `4px solid ${prop.color || 'transparent'}` }}>
                {prop.photos && prop.photos.length > 0 ? (
                  <img src={prop.photos[0]} alt={prop.name} className="h-full w-full object-cover" />
                ) : (
                  <Icon className="w-12 h-12 text-muted-foreground" />
                )}
                <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button size="icon" variant="secondary" className="rounded-full h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(prop)}><Edit className="w-4 h-4 mr-2" />{t('rental.edit')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(prop.id)} className="text-red-500 focus:text-red-500"><Trash2 className="w-4 h-4 mr-2" />{t('rental.delete')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-foreground">{prop.name}</h3>
                    <PropertyStatusBadge status={prop.status} t={t} />
                </div>
                <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-2">{prop.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm border-t pt-3 mt-auto">
                    <div>
                        <p className="text-muted-foreground text-xs">{t('rental.rate_day')}</p>
                        <p className="font-semibold">{prop.daily_rate || 'N/A'}{currencySymbol}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs">{t('rental.rate_week')}</p>
                        <p className="font-semibold">{prop.weekly_rate || 'N/A'}{currencySymbol}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs">{t('rental.rate_month')}</p>
                        <p className="font-semibold">{prop.monthly_rate || 'N/A'}{currencySymbol}</p>
                    </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
    
    const BookingsList = ({ bookings, properties, clients, onEdit, onDelete, currencySymbol, t }) => (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-card/50 border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="p-4 text-left font-semibold text-muted-foreground">{t('rental.table_header_property')}</th>
                                <th className="p-4 text-left font-semibold text-muted-foreground">{t('rental.table_header_client')}</th>
                                <th className="p-4 text-left font-semibold text-muted-foreground">{t('rental.table_header_period')}</th>
                                <th className="p-4 text-left font-semibold text-muted-foreground">{t('rental.table_header_amount')}</th>
                                <th className="p-4 text-left font-semibold text-muted-foreground">{t('rental.table_header_status')}</th>
                                <th className="p-4 text-right font-semibold text-muted-foreground">{t('rental.table_header_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => {
                                const property = properties.find(p => p.id === booking.property_id);
                                const client = clients.find(c => c.id === booking.client_id);
                                return (
                                <tr key={booking.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5">
                                    <td className="p-4 font-medium">{property?.name || t('rental.deleted_property')}</td>
                                    <td className="p-4 text-muted-foreground">{client?.name || t('rental.deleted_client')}</td>
                                    <td className="p-4 text-muted-foreground">{format(parseISO(booking.start_date), 'dd/MM/yy')} - {format(parseISO(booking.end_date), 'dd/MM/yy')}</td>
                                    <td className="p-4 font-semibold">{booking.amount}{currencySymbol}</td>
                                    <td className="p-4"><BookingStatusBadge status={booking.status} t={t} /></td>
                                    <td className="p-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => onEdit(booking)}><Edit className="w-4 h-4 mr-2" />{t('rental.edit')}</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(booking.id)} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" />{t('rental.delete')}</DropdownMenuItem>
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
            
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {bookings.length > 0 ? bookings.map(booking => {
                    const property = properties.find(p => p.id === booking.property_id);
                    const client = clients.find(c => c.id === booking.client_id);
                    return (
                        <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/50 border rounded-xl p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{property?.name || t('rental.deleted_property')}</h3>
                                    <p className="text-sm text-muted-foreground">{client?.name || t('rental.deleted_client')}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="-mt-2 -mr-2"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => onEdit(booking)}><Edit className="w-4 h-4 mr-2" />{t('rental.edit')}</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onDelete(booking.id)} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" />{t('rental.delete')}</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t('rental.table_header_period')}</span>
                                    <span className="text-sm font-medium">{format(parseISO(booking.start_date), 'dd/MM/yy')} - {format(parseISO(booking.end_date), 'dd/MM/yy')}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t('rental.table_header_amount')}</span>
                                    <span className="text-lg font-bold text-primary">{booking.amount}{currencySymbol}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-sm text-muted-foreground">{t('rental.table_header_status')}</span>
                                    <BookingStatusBadge status={booking.status} t={t} />
                                </div>
                            </div>
                        </motion.div>
                    );
                }) : (
                    <div className="text-center py-10 text-muted-foreground">{t('rental.no_bookings')}</div>
                )}
            </div>
        </>
    );
    
    const RentalManagement = () => {
        const { user, profile } = useAuth();
        const { toast } = useToast();
        const { t, i18n } = useTranslation();
        const [activeTab, setActiveTab] = useState('properties');
        const [loading, setLoading] = useState(true);
        const [properties, setProperties] = useState([]);
        const [categories, setCategories] = useState([]);
        const [bookings, setBookings] = useState([]);
        const [clients, setClients] = useState([]);
        
        const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
        const [editingProperty, setEditingProperty] = useState(null);
        const [currentProperty, setCurrentProperty] = useState({ photos: [], color: '#6366f1' });
        const [photoFiles, setPhotoFiles] = useState([]);
        const [isUploading, setIsUploading] = useState(false);
    
        const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
        const [editingBooking, setEditingBooking] = useState(null);
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
                toast({ variant: 'destructive', title: t('toast_error_title'), description: t('rental.error_loading') });
            } else {
                setProperties(propertiesData);
                setCategories(categoriesData);
                setBookings(bookingsData);
                setClients(clientsData);
            }
            setLoading(false);
        }, [user, toast, t]);
    
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
                        toast({ variant: 'destructive', title: t('toast_error_title'), description: t('rental.error_upload', { name: file.name }) });
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
                toast({ variant: 'destructive', title: t('toast_error_title'), description: t('rental.error_save_property') });
            } else {
                toast({ title: t('toast_success_title'), description: editingProperty ? t('rental.success_save_property_updated') : t('rental.success_save_property_added') });
                setIsPropertyDialogOpen(false);
                fetchData();
            }
        };
    
        const handleDeleteProperty = async (id) => {
            const { error } = await supabase.from('rental_properties').delete().eq('id', id);
            if (error) {
                toast({ variant: 'destructive', title: t('toast_error_title'), description: t('rental.error_delete_property') });
            } else {
                toast({ title: t('toast_success_title'), description: t('rental.success_delete_property') });
                fetchData();
            }
        };
        
        const handleSaveBooking = async () => {
            const bookingPayload = { 
                ...currentBooking, 
                user_id: user.id,
                start_date: format(currentBooking.start_date, 'yyyy-MM-dd'),
                end_date: format(currentBooking.end_date, 'yyyy-MM-dd'),
            };
            delete bookingPayload.invoice_id; // Ensure we don't try to update this directly if it exists from an edit
    
            let bookingResult;
            if (editingBooking) {
                bookingResult = await supabase.from('rental_bookings').update(bookingPayload).eq('id', editingBooking.id).select().single();
            } else {
                bookingResult = await supabase.from('rental_bookings').insert(bookingPayload).select().single();
            }
    
            if (bookingResult.error) {
                toast({ variant: 'destructive', title: t('toast_error_title'), description: editingBooking ? t('rental.error_update_booking') : t('rental.error_create_booking') });
                return;
            }
    
            toast({ title: t('toast_success_title'), description: editingBooking ? t('rental.success_update_booking') : t('rental.success_create_booking') });
            
            // If it's a new booking, create an invoice
            if (!editingBooking) {
                const property = properties.find(p => p.id === bookingPayload.property_id);
                const startDate = typeof bookingPayload.start_date === 'string' ? parseISO(bookingPayload.start_date) : bookingPayload.start_date;
                const endDate = typeof bookingPayload.end_date === 'string' ? parseISO(bookingPayload.end_date) : bookingPayload.end_date;

                const invoiceItemDescription = t('rental.invoice_item_description', {
                  property_name: property?.name || t('rental.a_property'),
                  start_date: format(startDate, 'dd/MM/yyyy'),
                  end_date: format(endDate, 'dd/MM/yyyy')
                });

                const invoicePayload = {
                    user_id: user.id,
                    client_id: bookingPayload.client_id,
                    amount: bookingPayload.amount,
                    status: 'pending',
                    issue_date: format(new Date(), 'yyyy-MM-dd'),
                    due_date: format(startDate, 'yyyy-MM-dd'),
                    items: [{
                        description: invoiceItemDescription,
                        quantity: 1,
                        unit_price: parseFloat(bookingPayload.amount)
                    }],
                    tax_rate: 0
                };
    
                const { data: invoiceData, error: invoiceError } = await supabase.from('invoices').insert(invoicePayload).select().single();
    
                if (invoiceError) {
                    toast({ variant: 'destructive', title: t('toast_error_title'), description: t('rental.error_create_invoice') });
                } else {
                    toast({ title: t('toast_success_title'), description: t('rental.success_create_invoice') });
                    // Link invoice to booking
                    await supabase.from('rental_bookings').update({ invoice_id: invoiceData.id }).eq('id', bookingResult.data.id);
                }
            }
    
            setIsBookingDialogOpen(false);
            fetchData();
        };
    
        const handleDeleteBooking = async (id) => {
            const { error } = await supabase.from('rental_bookings').delete().eq('id', id);
            if (error) {
                toast({ variant: 'destructive', title: t('toast_error_title'), description: t('rental.error_delete_booking') });
            } else {
                toast({ title: t('toast_success_title'), description: t('rental.success_delete_booking') });
                fetchData();
            }
        };
    
        const handleClientAction = (newClient) => {
          fetchData();
          if(newClient) {
            setCurrentBooking(prev => ({ ...prev, client_id: newClient.id }));
          }
        };
    
        const openPropertyDialog = (property = null) => {
            setEditingProperty(property);
            setCurrentProperty(property || { photos: [], status: 'available', color: '#6366f1' });
            setPhotoFiles([]);
            setIsPropertyDialogOpen(true);
        };
        
        const openBookingDialog = (booking = null) => {
            setEditingBooking(booking);
            setCurrentBooking(booking ? { ...booking, start_date: parseISO(booking.start_date), end_date: parseISO(booking.end_date) } : { status: 'pending' });
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
                color: property?.color || (booking.status === 'confirmed' ? 'hsl(var(--primary))' : booking.status === 'pending' ? '#f59e0b' : 'hsl(var(--muted-foreground))'),
            };
        });
    
        return (
            <div className="space-y-6 sm:space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('rental.title')}</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">{t('rental.subtitle')}</p>
                </motion.div>
    
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex flex-col gap-4">
                        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto">
                            <TabsTrigger value="properties" className="text-xs sm:text-sm py-2"><List className="w-4 h-4 mr-1 sm:mr-2"/><span className="hidden xs:inline">{t('rental.tab_properties')}</span><span className="xs:hidden">Props</span></TabsTrigger>
                            <TabsTrigger value="bookings" className="text-xs sm:text-sm py-2"><BookOpen className="w-4 h-4 mr-1 sm:mr-2"/><span className="hidden xs:inline">{t('rental.tab_bookings')}</span><span className="xs:hidden">Book</span></TabsTrigger>
                            <TabsTrigger value="calendar" className="text-xs sm:text-sm py-2"><Calendar className="w-4 h-4 mr-1 sm:mr-2"/><span className="hidden xs:inline">{t('rental.tab_calendar')}</span><span className="xs:hidden">Cal</span></TabsTrigger>
                            <TabsTrigger value="settings" className="text-xs sm:text-sm py-2"><Settings className="w-4 h-4 mr-1 sm:mr-2"/><span className="hidden xs:inline">{t('rental.tab_settings')}</span><span className="xs:hidden">Set</span></TabsTrigger>
                        </TabsList>
                        <div className="w-full">
                            {activeTab === 'properties' && <Button onClick={() => openPropertyDialog()} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2"/>{t('rental.add_property')}</Button>}
                            {activeTab === 'bookings' && <Button onClick={() => openBookingDialog()} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2"/>{t('rental.add_booking')}</Button>}
                        </div>
                    </div>
    
                    <TabsContent value="properties" className="mt-6">
                        <PropertiesList properties={properties} categories={categories} onEdit={openPropertyDialog} onDelete={handleDeleteProperty} currencySymbol={currencySymbol} t={t} />
                    </TabsContent>
                    <TabsContent value="bookings" className="mt-6">
                        <BookingsList bookings={bookings} properties={properties} clients={clients} onEdit={openBookingDialog} onDelete={handleDeleteBooking} currencySymbol={currencySymbol} t={t} />
                    </TabsContent>
                    <TabsContent value="calendar" className="mt-6">
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card/50 backdrop-blur-sm border rounded-xl p-2 sm:p-4 overflow-hidden">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                headerToolbar={{ 
                                  left: 'prev,next', 
                                  center: 'title', 
                                  right: 'dayGridMonth' 
                                }}
                                initialView="dayGridMonth"
                                events={calendarEvents}
                                locale={i18n.language}
                                buttonText={{ today: t('rental.calendar_today'), month: t('rental.calendar_month'), week: t('rental.calendar_week') }}
                                height="auto"
                                contentHeight="auto"
                            />
                        </motion.div>
                    </TabsContent>
                    <TabsContent value="settings" className="mt-6">
                        <p className="text-muted-foreground">{t('rental.settings_soon')}</p>
                    </TabsContent>
                </Tabs>
                
                <Dialog open={isPropertyDialogOpen} onOpenChange={setIsPropertyDialogOpen}>
                    <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>{editingProperty ? t('rental.dialog_edit_property_title') : t('rental.dialog_add_property_title')}</DialogTitle>
                        </DialogHeader>
                        <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-4 py-4">
                            <div><Label>{t('rental.dialog_property_name')}</Label><Input value={currentProperty.name || ''} onChange={e => setCurrentProperty({...currentProperty, name: e.target.value})} /></div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1"><Label>{t('rental.dialog_property_category')}</Label><Input placeholder={t('rental.dialog_property_category_placeholder')} onChange={() => toast({title: t('rental.dialog_property_category_soon_toast')})} /></div>
                                <div className="flex-1">
                                    <Label>{t('rental.dialog_property_color')}</Label>
                                    <div className="flex items-center gap-2">
                                        <Input type="color" value={currentProperty.color || '#6366f1'} onChange={e => setCurrentProperty({...currentProperty, color: e.target.value})} className="p-1 h-10 w-14 flex-shrink-0" />
                                        <Input type="text" value={currentProperty.color || '#6366f1'} onChange={e => setCurrentProperty({...currentProperty, color: e.target.value})} placeholder="#6366f1" className="flex-1" />
                                    </div>
                                </div>
                            </div>
                            <div><Label>{t('rental.dialog_property_description')}</Label><Textarea value={currentProperty.description || ''} onChange={e => setCurrentProperty({...currentProperty, description: e.target.value})} /></div>
                            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                              <div><Label className="text-xs sm:text-sm">{t('rental.rate_day')} ({currencySymbol})</Label><Input type="number" value={currentProperty.daily_rate || ''} onChange={e => setCurrentProperty({...currentProperty, daily_rate: e.target.value})} /></div>
                              <div><Label className="text-xs sm:text-sm">{t('rental.rate_week')} ({currencySymbol})</Label><Input type="number" value={currentProperty.weekly_rate || ''} onChange={e => setCurrentProperty({...currentProperty, weekly_rate: e.target.value})} /></div>
                              <div><Label className="text-xs sm:text-sm">{t('rental.rate_month')} ({currencySymbol})</Label><Input type="number" value={currentProperty.monthly_rate || ''} onChange={e => setCurrentProperty({...currentProperty, monthly_rate: e.target.value})} /></div>
                            </div>
                            <div>
                                <Label>{t('rental.dialog_property_photos')}</Label>
                                <div className="mt-2 flex items-center justify-center w-full">
                                    <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground">{t('rental.dialog_property_upload_prompt')}</p>
                                        </div>
                                        <Input id="photo-upload" type="file" multiple className="hidden" onChange={(e) => setPhotoFiles(Array.from(e.target.files))} />
                                    </label>
                                </div>
                                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {currentProperty.photos?.map((photo, index) => (
                                        <div key={index} className="relative"><img src={photo} className="w-full h-24 object-cover rounded-md" alt="" /><Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => setCurrentProperty(p => ({...p, photos: p.photos.filter((_, i) => i !== index)}))}><X className="h-4 w-4"/></Button></div>
                                    ))}
                                    {photoFiles.map((file, index) => (
                                        <div key={index} className="relative"><img src={URL.createObjectURL(file)} className="w-full h-24 object-cover rounded-md" alt="" /><Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => setPhotoFiles(f => f.filter((_, i) => i !== index))}><X className="h-4 w-4"/></Button></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => setIsPropertyDialogOpen(false)} disabled={isUploading} className="w-full sm:w-auto">{t('dialog_cancel')}</Button>
                            <Button onClick={handleSaveProperty} disabled={isUploading} className="w-full sm:w-auto">
                                {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('billing.saving')}</> : t('dialog_save')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
    
                <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                    <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingBooking ? t('rental.dialog_edit_booking_title') : t('rental.dialog_new_booking_title')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>{t('rental.dialog_booking_property')}</Label>
                                <Select value={currentBooking.property_id} onValueChange={value => setCurrentBooking({...currentBooking, property_id: value})}>
                                    <SelectTrigger><SelectValue placeholder={t('rental.dialog_booking_select_property')} /></SelectTrigger>
                                    <SelectContent>
                                        {properties.filter(p => p.status === 'available' || p.id === currentBooking.property_id).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{t('rental.dialog_booking_client')}</Label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Select value={currentBooking.client_id} onValueChange={value => setCurrentBooking({...currentBooking, client_id: value})}>
                                        <SelectTrigger className="flex-1"><SelectValue placeholder={t('rental.dialog_booking_select_client')} /></SelectTrigger>
                                        <SelectContent>
                                            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="icon" onClick={() => setIsClientDialogOpen(true)} className="w-full sm:w-auto"><UserPlus className="h-4 w-4" /><span className="sm:hidden ml-2">{t('rental.add_client')}</span></Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div><Label>{t('rental.dialog_booking_start')}</Label><DatePicker date={currentBooking.start_date} setDate={date => setCurrentBooking({...currentBooking, start_date: date})} /></div>
                              <div><Label>{t('rental.dialog_booking_end')}</Label><DatePicker date={currentBooking.end_date} setDate={date => setCurrentBooking({...currentBooking, end_date: date})} /></div>
                            </div>
                            <div><Label>{t('rental.dialog_booking_amount')} ({currencySymbol})</Label><Input type="number" value={currentBooking.amount || ''} onChange={e => setCurrentBooking({...currentBooking, amount: e.target.value})} /></div>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)} className="w-full sm:w-auto">{t('dialog_cancel')}</Button>
                            <Button onClick={handleSaveBooking} className="w-full sm:w-auto">{editingBooking ? t('dialog_save') : t('rental.dialog_booking_confirm_and_invoice')}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                <CreateClientDialog isOpen={isClientDialogOpen} onOpenChange={setIsClientDialogOpen} onClientCreated={handleClientAction} />
            </div>
        );
    };
    
    export default RentalManagement;