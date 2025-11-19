import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Bell, Archive, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import NotificationDetailDialog from './NotificationDetailDialog';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import defaultLogo from '@/assets/logo-default-notification.jpg';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Subscribe to real-time notifications
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new, ...prev]);
            setUnreadCount((prev) => prev + 1);
            toast({
              title: payload.new.title,
              description: payload.new.message,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    }
  };

  const markAsRead = async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast({
        title: 'All notifications marked as read',
      });
    }
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setIsDetailOpen(true);
    
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  // Helper function to extract plain text from HTML
  const getPlainTextPreview = (htmlString) => {
    if (!htmlString) return '';
    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = htmlString;
    // Get text content and limit to ~100 characters
    const text = temp.textContent || temp.innerText || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <Tabs defaultValue="unread" className="w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
            </div>
            
            <TabsList className="grid w-full grid-cols-2 px-4 pb-2">
              <TabsTrigger value="unread" className="text-sm">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="archive" className="text-sm">
                <Archive className="h-3 w-3 mr-1" />
                Archive
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unread" className="m-0">
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.filter((n) => !n.read).length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No unread notifications</p>
                  </div>
                ) : (
                  notifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 border-b hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                            <img 
                              src={notification.image_url || defaultLogo} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {getPlainTextPreview(notification.message)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="archive" className="m-0">
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.filter((n) => n.read).length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Archive className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No archived notifications</p>
                  </div>
                ) : (
                  notifications
                    .filter((n) => n.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 border-b hover:bg-accent/50 transition-colors cursor-pointer opacity-70"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                            <img 
                              src={notification.image_url || defaultLogo} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {getPlainTextPreview(notification.message)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>

      <NotificationDetailDialog
        notification={selectedNotification}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
};

export default NotificationBell;
