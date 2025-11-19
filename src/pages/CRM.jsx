import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Users, PlusCircle, Search, MoreVertical, Edit, Trash2, Mail, Phone, Loader2, Upload, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CreateClientDialog from '@/components/CreateClientDialog';
import ImportClientsDialog from '@/components/ImportClientsDialog';
import UpgradePlanDialog from '@/components/UpgradePlanDialog';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import * as XLSX from 'xlsx';

const CRM = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
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
    (client.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const isPremiumPlan = () => {
    const planName = profile?.subscription_plan?.name?.toLowerCase();
    return planName === 'pro' || planName === 'business';
  };

  const handleImportClick = () => {
    if (!isPremiumPlan()) {
      setUpgradeFeature("l'importation de clients");
      setIsUpgradeDialogOpen(true);
      return;
    }
    setIsImportDialogOpen(true);
  };

  const handleExportClick = () => {
    if (!isPremiumPlan()) {
      setUpgradeFeature("l'exportation de clients");
      setIsUpgradeDialogOpen(true);
      return;
    }
    exportToExcel();
  };

  const exportToExcel = () => {
    if (clients.length === 0) {
      toast({ 
        variant: 'destructive',
        title: t('toast_error_title'), 
        description: 'Aucun client à exporter' 
      });
      return;
    }

    const exportData = clients.map(client => ({
      'Prénom': client.first_name || '',
      'Nom': client.name || '',
      'Entreprise': client.company || '',
      'Email': client.email || '',
      'Téléphone': client.phone || '',
      'Statut': getTranslatedStatus(client.status),
      'Adresse': client.address || '',
      'Notes': client.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `clients_${date}.xlsx`);

    toast({ 
      title: t('toast_success_title'), 
      description: `${clients.length} clients exportés avec succès` 
    });
  };


  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('crm.title')}</h1>
          <p className="text-muted-foreground">{t('crm.subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <motion.div
            whileHover={!isPremiumPlan() ? { scale: 1.05 } : {}}
            whileTap={!isPremiumPlan() ? { scale: 0.95 } : {}}
          >
            <Button 
              variant="outline" 
              onClick={handleImportClick}
              className={cn(
                "relative",
                !isPremiumPlan() && "cursor-not-allowed"
              )}
            >
              <Upload className="mr-2 h-4 w-4" /> {t('crm.import_button')}
              {!isPremiumPlan() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-1 -right-1 bg-primary rounded-full p-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </motion.div>
              )}
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={!isPremiumPlan() ? { scale: 1.05 } : {}}
            whileTap={!isPremiumPlan() ? { scale: 0.95 } : {}}
          >
            <Button 
              variant="outline"
              onClick={handleExportClick}
              className={cn(
                "relative",
                !isPremiumPlan() && "cursor-not-allowed"
              )}
            >
              <Download className="mr-2 h-4 w-4" /> {t('crm.export_button')}
              {!isPremiumPlan() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-1 -right-1 bg-primary rounded-full p-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </motion.div>
              )}
            </Button>
          </motion.div>
          
          <Button onClick={() => { setEditingClient(null); setIsDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> {t('crm.new_client')}
          </Button>
        </div>
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
            <TableHead>Prénom</TableHead>
            <TableHead>Nom</TableHead>
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
                    <TableCell className="font-medium">{client.first_name}</TableCell>
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
                      <CardTitle className="text-lg">{client.first_name} {client.name}</CardTitle>
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
      <ImportClientsDialog
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={handleClientAction}
      />
      <UpgradePlanDialog
        open={isUpgradeDialogOpen}
        onOpenChange={setIsUpgradeDialogOpen}
        feature={upgradeFeature}
        requiredPlan="Pro"
      />
    </div>
  );
};

export default CRM;