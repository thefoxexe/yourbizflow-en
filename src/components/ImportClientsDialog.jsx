import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';

const ImportClientsDialog = ({ isOpen, onOpenChange, onImportComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const validateRow = (row) => {
    const errors = [];
    
    // Nettoyer et normaliser les données
    const name = (row.name || row.Name || row.nom || row.Nom || '').toString().trim();
    const firstName = (row.firstName || row.FirstName || row.prenom || row.Prenom || row['First Name'] || row.prénom || row.Prénom || '').toString().trim();
    const lastName = (row.lastName || row.LastName || row['Last Name'] || row.nomDeFamille || row['Nom de famille'] || '').toString().trim();
    const email = (row.email || row.Email || row.mail || row.Mail || row.courriel || row.Courriel || '').toString().trim();
    const phone = (row.phone || row.Phone || row.telephone || row.Telephone || row.tel || row.Tel || row.téléphone || row.Téléphone || '').toString().trim();
    const company = (row.company || row.Company || row.entreprise || row.Entreprise || row.société || row.Société || '').toString().trim();

    // Construire le nom complet - PRIORISER prénom + nom
    let fullName = '';
    if (firstName || lastName) {
      // Si on a prénom et/ou nom, on les utilise
      fullName = [firstName, lastName].filter(Boolean).join(' ');
    } else if (name) {
      // Sinon on utilise le champ "name" s'il existe
      fullName = name;
    }

    // Validation : au moins un nom
    if (!fullName) {
      errors.push(t('crm.import_validation_name_missing'));
    }

    // Validation : au moins email OU téléphone
    if (!email && !phone) {
      errors.push(t('crm.import_validation_contact_required'));
    }

    // Validation format email si présent (plus permissive)
    if (email && email.length > 0 && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push(t('crm.import_validation_email_invalid'));
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: {
        name: fullName,
        email: email || null,
        phone: phone || null,
        company: company || null,
        status: null
      }
    };
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier l'extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      toast({
        variant: 'destructive',
        title: t('crm.import_error_invalid_format'),
        description: t('crm.import_error_invalid_format_desc')
      });
      return;
    }

    setIsProcessing(true);
    setImportResults(null);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          let jsonData = [];

          if (fileName.endsWith('.csv')) {
            const text = e.target.result;
            const workbook = XLSX.read(text, { type: 'string' });
            const sheetName = workbook.SheetNames[0];
            jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          } else {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          }

          if (jsonData.length === 0) {
            toast({
              variant: 'destructive',
              title: t('crm.import_error_empty'),
              description: t('crm.import_error_empty_desc')
            });
            setIsProcessing(false);
            return;
          }

          // Valider et préparer les données
          const validClients = [];
          const invalidRows = [];

          jsonData.forEach((row, index) => {
            const validation = validateRow(row);
            if (validation.isValid) {
              validClients.push({
                ...validation.data,
                user_id: user.id
              });
            } else {
              invalidRows.push({
                row: index + 2, // +2 car index commence à 0 et ligne 1 est l'entête
                data: row,
                errors: validation.errors
              });
            }
          });

          // Insérer les clients valides
          let insertedCount = 0;
          if (validClients.length > 0) {
            const { data, error } = await supabase
              .from('clients')
              .insert(validClients)
              .select();

            if (error) {
              throw error;
            }
            insertedCount = data?.length || 0;
          }

          // Afficher les résultats
          setImportResults({
            total: jsonData.length,
            success: insertedCount,
            failed: invalidRows.length,
            invalidRows
          });

          if (insertedCount > 0) {
            toast({
              title: t('crm.import_success'),
              description: t('crm.import_success_desc', { count: insertedCount })
            });
            onImportComplete?.();
          }

          if (invalidRows.length > 0) {
            toast({
              variant: 'destructive',
              title: t('crm.import_failed_rows'),
              description: t('crm.import_failed_rows_desc', { count: invalidRows.length })
            });
          }

        } catch (error) {
          console.error('Import error:', error);
          toast({
            variant: 'destructive',
            title: t('crm.import_error_import'),
            description: error.message || t('crm.import_error_import')
          });
        } finally {
          setIsProcessing(false);
        }
      };

      if (fileName.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }

    } catch (error) {
      console.error('File read error:', error);
      toast({
        variant: 'destructive',
        title: t('crm.import_error_import'),
        description: t('crm.import_error_read')
      });
      setIsProcessing(false);
    }

    // Reset input
    event.target.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            {t('crm.import_title')}
          </DialogTitle>
          <DialogDescription>
            {t('crm.import_description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Zone d'upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button type="button" disabled={isProcessing} onClick={() => document.getElementById('file-upload').click()}>
                  {isProcessing ? t('crm.import_processing') : t('crm.import_select_file')}
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {t('crm.import_formats')}
              </p>
            </div>
          </div>

          {/* Format attendu */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">{t('crm.import_format_title')}</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>{t('crm.import_format_name')}</strong> : {t('crm.import_format_name_fields')}</li>
              <li><strong>{t('crm.import_format_contact')}</strong> : {t('crm.import_format_contact_fields')}</li>
              <li><strong>{t('crm.import_format_optional')}</strong> : {t('crm.import_format_optional_fields')}</li>
              <li>{t('crm.import_format_status')}</li>
            </ul>
          </div>

          {/* Résultats */}
          {importResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{t('crm.import_results_total')}</span>
                  </div>
                  <p className="text-2xl font-bold">{importResults.total}</p>
                </div>
                <div className="bg-card border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">{t('crm.import_results_imported')}</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
                </div>
                <div className="bg-card border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">{t('crm.import_results_failed')}</span>
                  </div>
                  <p className="text-2xl font-bold text-destructive">{importResults.failed}</p>
                </div>
              </div>

              {/* Détails des erreurs */}
              {importResults.invalidRows.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                  <p className="text-sm font-medium text-destructive">{t('crm.import_invalid_rows')}</p>
                  <div className="space-y-2">
                    {importResults.invalidRows.slice(0, 10).map((item, idx) => (
                      <div key={idx} className="text-xs bg-destructive/10 rounded p-2">
                        <p className="font-medium">{t('crm.import_invalid_row')} {item.row}</p>
                        <p className="text-muted-foreground">{t('crm.import_invalid_errors')} : {item.errors.join(', ')}</p>
                      </div>
                    ))}
                    {importResults.invalidRows.length > 10 && (
                      <p className="text-xs text-muted-foreground">
                        {t('crm.import_more_errors', { count: importResults.invalidRows.length - 10 })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            {t('crm.import_close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportClientsDialog;
