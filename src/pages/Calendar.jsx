import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { format } from 'date-fns-tz';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const eventCategories = {
  business: { label: 'Business', color: 'hsl(var(--primary))' },
  personal: { label: 'Personnel', color: 'hsl(var(--green-500, 142 76% 36%))' },
  important: { label: 'Important', color: 'hsl(var(--destructive))' },
  other: { label: 'Autre', color: 'hsl(var(--muted-foreground))' },
};

const CalendarPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', category: 'business', allDay: true });

  const fetchEvents = useCallback(async () => {
    if (!user) return;

    const { data: calendarEvents, error: calendarError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id);

    if (calendarError) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les événements.' });
      return;
    }

    const { data: invoices, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, invoice_number, due_date, amount, clients(name)')
      .eq('user_id', user.id)
      .in('status', ['pending', 'overdue']);

    if (invoiceError) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les factures.' });
    }

    const invoiceEvents = invoices?.map(inv => {
      const isOverdue = new Date(inv.due_date) < new Date();
      return {
        title: `Facture #${inv.invoice_number}`,
        start: inv.due_date,
        allDay: true,
        color: isOverdue ? 'hsl(var(--destructive))' : 'hsl(var(--orange-500, 35 92% 53%))',
        borderColor: isOverdue ? 'hsl(var(--destructive))' : 'hsl(var(--orange-500, 35 92% 53%))',
        extendedProps: { type: 'invoice', amount: inv.amount, client: inv.clients?.name }
      };
    }) || [];

    const formattedCalendarEvents = calendarEvents.map(e => ({
      id: e.id,
      title: e.title,
      start: e.start_time,
      end: e.end_time,
      allDay: !e.start_time?.includes('T'),
      color: eventCategories[e.category]?.color || eventCategories.other.color,
      borderColor: eventCategories[e.category]?.color || eventCategories.other.color,
      extendedProps: { type: 'event', description: e.description, category: e.category }
    }));

    setEvents([...formattedCalendarEvents, ...invoiceEvents]);
  }, [user, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDateSelect = (selectInfo) => {
    setIsModalOpen(true);

    const isAllDay = selectInfo.allDay || (!selectInfo.startStr.includes('T') && !selectInfo.endStr.includes('T'));
    
    let localStart, localEnd;

    if (isAllDay) {
        localStart = format(selectInfo.start, "yyyy-MM-dd");
        localEnd = selectInfo.end ? format(new Date(selectInfo.end.getTime() - 1), "yyyy-MM-dd") : localStart;
    } else {
        localStart = format(selectInfo.start, "yyyy-MM-dd'T'HH:mm");
        localEnd = format(selectInfo.end, "yyyy-MM-dd'T'HH:mm");
    }

    setNewEvent({
      title: '',
      start: localStart,
      end: localEnd,
      category: 'business',
      allDay: isAllDay
    });
  };

  const handleEventClick = (clickInfo) => {
    const { extendedProps, title, start, allDay } = clickInfo.event;
    let description = '';
    if (extendedProps.type === 'invoice') {
      description = `Facture pour ${extendedProps.client || 'N/A'} d'un montant de ${extendedProps.amount}€.`;
    } else {
      description = extendedProps.description || 'Aucune description.';
    }
    
    const displayDate = allDay 
      ? new Date(start).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) 
      : new Date(start).toLocaleString();

    toast({
      title: title,
      description: `Date: ${displayDate}. ${description}`,
    });
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.start) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Le titre et la date de début sont obligatoires.' });
      return;
    }
    
    const startValue = newEvent.allDay ? newEvent.start : new Date(newEvent.start).toISOString();
    const endValue = (newEvent.end && newEvent.end !== newEvent.start) 
      ? (newEvent.allDay ? newEvent.end : new Date(newEvent.end).toISOString()) 
      : (newEvent.allDay ? startValue : null);

    const { error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        title: newEvent.title,
        start_time: startValue,
        end_time: endValue,
        category: newEvent.category,
        type: 'event'
      });

    if (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'ajouter l'événement." });
    } else {
      toast({ title: 'Succès', description: 'Événement ajouté.' });
      setIsModalOpen(false);
      fetchEvents();
    }
  };

  const handleAllDayChange = (checked) => {
    if (checked) {
      setNewEvent({ 
        ...newEvent, 
        allDay: true,
        start: newEvent.start ? format(new Date(newEvent.start), 'yyyy-MM-dd') : '',
        end: newEvent.end ? format(new Date(newEvent.end), 'yyyy-MM-dd') : '',
      });
    } else {
      setNewEvent({ 
        ...newEvent, 
        allDay: false,
        start: newEvent.start ? format(new Date(newEvent.start), "yyyy-MM-dd'T'09:00") : '',
        end: newEvent.end ? format(new Date(newEvent.end), "yyyy-MM-dd'T'10:00") : '',
      });
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Calendrier</h1>
          <p className="text-muted-foreground">Organisez votre temps, ne manquez aucune échéance.</p>
        </div>
        <Button onClick={() => handleDateSelect({ start: new Date(), end: new Date(), allDay: true, startStr: new Date().toISOString().split('T')[0], endStr: new Date().toISOString().split('T')[0] })}><Plus className="w-4 h-4 mr-2" />Ajouter un événement</Button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }} 
        className="bg-card/50 backdrop-blur-sm border rounded-xl p-2 sm:p-4 shadow-sm calendar-container"
      >
        <FullCalendar
          key={theme}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="dayGridMonth"
          weekends={true}
          events={events}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          locale="fr"
          buttonText={{
            today: "Aujourd'hui",
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
          }}
          height="auto"
          contentHeight="auto"
          aspectRatio={1.75}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
          }}
          displayEventTime={true}
          displayEventEnd={true}
        />
      </motion.div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Ajouter un nouvel événement</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="event-title">Titre</Label>
              <Input id="event-title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="event-category">Catégorie</Label>
              <Select value={newEvent.category} onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(eventCategories).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="all-day" checked={newEvent.allDay} onCheckedChange={handleAllDayChange} />
              <Label htmlFor="all-day">Journée entière</Label>
            </div>
            <div>
              <Label htmlFor="event-start">Date de début</Label>
              <Input id="event-start" type={newEvent.allDay ? 'date' : 'datetime-local'} value={newEvent.start} onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="event-end">Date de fin (optionnel)</Label>
              <Input id="event-end" type={newEvent.allDay ? 'date' : 'datetime-local'} value={newEvent.end} onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button onClick={handleAddEvent}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;