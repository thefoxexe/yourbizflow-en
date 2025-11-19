import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const NotificationDetailDialog = ({ notification, isOpen, onClose }) => {
  if (!notification) return null;

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'warning';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeBadgeLabel = (type) => {
    switch (type) {
      case 'success':
        return 'Succès';
      case 'warning':
        return 'Attention';
      case 'error':
        return 'Erreur';
      default:
        return 'Info';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto sm:max-w-[90vw] md:max-w-2xl">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <DialogTitle className="flex-1 text-base sm:text-lg">{notification.title}</DialogTitle>
            <Badge variant={getTypeBadgeVariant(notification.type)}>
              {getTypeBadgeLabel(notification.type)}
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-muted-foreground">
            <span>De: YourBizFlow Team</span>
            <span className="text-xs">{format(new Date(notification.created_at), 'PPpp')}</span>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert text-foreground"
            dangerouslySetInnerHTML={{ __html: notification.message }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDetailDialog;
