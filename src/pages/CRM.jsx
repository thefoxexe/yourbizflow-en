import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Users, PlusCircle, Search, MoreVertical, Edit, Trash2, Mail, Phone, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CreateClientDialog from '@/components/CreateClientDialog';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const CRM = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const fetchClients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('crm.load_error') });
    } else {
      setClients(data);
    }
    setLoading(false);
  }, [user, toast, t]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleClientAction = () => {
    fetchClients();
  };
  
  const handleDeleteClient = async (clientId) => {
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('crm.delete_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('crm.delete_success') });
      fetchClients();
    }
  };

  const filteredClients = clients.filter(client =>
    (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusVariant = (status) => {
    if (!status) return 'default';
    const statusLower = status.toLowerCase();
    const statusMap = {
      'prospect': 'secondary',
      'actif': 'default',
      'active': 'default',
      'inactif': 'outline',
      'inactive': 'outline',
      'piste': 'warning',
      'lead': 'warning'
    };
    return statusMap[statusLower] || 'default';
  }

  const getTranslatedStatus = (status) => {
    if (!status) return t('crm.status_prospect');
    return t(`crm.status_${status.toLowerCase()}`, status);
  }


  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('crm.title')}</h1>
          <p className="text-muted-foreground">{t('crm.subtitle')}</p>
        </div>
        <Button onClick={() => { setEditingClient(null); setIsDialogOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> {t('crm.new_client')}
        </Button>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder={t('crm.search_placeholder')} className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="hidden md:block border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('crm.table_name')}</TableHead>
                <TableHead>{t('crm.table_company')}</TableHead>
                <TableHead>{t('crm.table_email')}</TableHead>
                <TableHead>{t('crm.table_phone')}</TableHead>
                <TableHead>{t('crm.table_status')}</TableHead>
                <TableHead className="text-right">{t('crm.table_actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan="6" className="text-center h-24"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
              ) : filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.company}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell><Badge variant={statusVariant(client.status)}>{getTranslatedStatus(client.status)}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => { setEditingClient(client); setIsDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" /> {t('crm.edit_client')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClient(client.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> {t('billing.action_delete')}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan="6" className="text-center h-24">{t('crm.no_clients')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="text-center p-8 text-muted-foreground"><Loader2 className="animate-spin mx-auto" /></div>
          ) : filteredClients.length > 0 ? (
            filteredClients.map(client => (
              <Card key={client.id} className="bg-card/80">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      {client.company && <CardDescription>{client.company}</CardDescription>}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="-mt-2 -mr-2"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => { setEditingClient(client); setIsDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" /> {t('crm.edit_client')}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClient(client.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> {t('billing.action_delete')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant={statusVariant(client.status)}>{getTranslatedStatus(client.status)}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center p-8 text-muted-foreground">{t('crm.no_clients')}</div>
          )}
        </div>
      </motion.div>

      <CreateClientDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClientCreated={handleClientAction}
        client={editingClient}
      />
    </div>
  );
};

export default CRM;