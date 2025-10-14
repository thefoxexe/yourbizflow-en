import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import frLocale from '@fullcalendar/core/locales/fr';
import enLocale from '@fullcalendar/core/locales/en-gb';

const CalendarPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', start: null, end: null, description: '', category: 'appointment' });

  const calendarLocale = useMemo(() => {
    return i18n.language === 'fr' ? frLocale : enLocale;
  }, [i18n.language]);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('calendar_events').select('*').eq('user_id', user.id);
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('calendar.load_error') });
    } else {
      setEvents(data.map(e => ({
        id: e.id,
        title: e.title,
        start: e.start_time,
        end: e.end_time,
        extendedProps: { description: e.description, category: e.category }
      })));
    }
  }, [user, toast, t]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDateClick = (arg) => {
    setNewEvent({ title: '', start: arg.date, end: null, description: '', category: 'appointment' });
    setSelectedEvent(null);
    setIsDialogOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    const { id, title, start, end, extendedProps } = clickInfo.event;
    setSelectedEvent({ id, title, start, end, description: extendedProps.description, category: extendedProps.category });
    setNewEvent({ title, start, end, description: extendedProps.description, category: extendedProps.category });
    setIsDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!newEvent.title) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('calendar.title_required') });
      return;
    }

    const eventData = {
      user_id: user.id,
      title: newEvent.title,
      start_time: newEvent.start,
      end_time: newEvent.end,
      description: newEvent.description,
      category: newEvent.category,
    };

    let error;
    if (selectedEvent) {
      ({ error } = await supabase.from('calendar_events').update(eventData).eq('id', selectedEvent.id));
      toast({ title: t('toast_success_title'), description: t('calendar.update_success') });
    } else {
      ({ error } = await supabase.from('calendar_events').insert(eventData));
      toast({ title: t('toast_success_title'), description: t('calendar.create_success') });
    }

    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: selectedEvent ? t('calendar.update_error') : t('calendar.create_error') });
    } else {
      setIsDialogOpen(false);
      fetchEvents();
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    const { error } = await supabase.from('calendar_events').delete().eq('id', selectedEvent.id);
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('calendar.delete_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('calendar.delete_success') });
      setIsDialogOpen(false);
      fetchEvents();
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('calendar.title')}</h1>
          <p className="text-muted-foreground">{t('calendar.subtitle')}</p>
        </div>
        <Button onClick={() => { setSelectedEvent(null); setNewEvent({ title: '', start: new Date(), end: null, description: '', category: 'appointment' }); setIsDialogOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> {t('calendar.new_event')}
        </Button>
      </motion.div>
      <Card>
        <CardContent className="p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
            initialView="dayGridMonth"
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            locale={calendarLocale}
            buttonText={{
              today: t('calendar.today_button'),
              month: t('calendar.month_button'),
              week: t('calendar.week_button'),
              day: t('calendar.day_button'),
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent ? t('calendar.edit_event') : t('calendar.new_event')}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div><Label htmlFor="title">{t('calendar.event_title_label')}</Label><Input id="title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('calendar.start_date_label')}</Label><DatePicker date={newEvent.start} setDate={date => setNewEvent({ ...newEvent, start: date })} /></div>
              <div><Label>{t('calendar.end_date_label')}</Label><DatePicker date={newEvent.end} setDate={date => setNewEvent({ ...newEvent, end: date })} /></div>
            </div>
            <div><Label htmlFor="description">{t('calendar.description_label')}</Label><Textarea id="description" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} /></div>
            <div>
              <Label>{t('calendar.category_label')}</Label>
              <Select value={newEvent.category} onValueChange={category => setNewEvent({ ...newEvent, category })}>
                <SelectTrigger><SelectValue placeholder={t('calendar.select_category')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment">{t('calendar.category_appointment')}</SelectItem>
                  <SelectItem value="deadline">{t('calendar.category_deadline')}</SelectItem>
                  <SelectItem value="meeting">{t('calendar.category_meeting')}</SelectItem>
                  <SelectItem value="personal">{t('calendar.category_personal')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex justify-between w-full">
            {selectedEvent ? <Button variant="destructive" onClick={handleDeleteEvent}>{t('calendar.delete_event')}</Button> : <div></div>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('dialog_cancel')}</Button>
              <Button onClick={handleSaveEvent}>{t('dialog_save')}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;