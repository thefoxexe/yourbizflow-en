import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Users, PlusCircle, MoreVertical, Edit, Trash2, PlayCircle, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, getMonth, getYear } from 'date-fns';
import { useTranslation } from 'react-i18next';

const EmployeeDialog = ({ isOpen, onOpenChange, onSave, employee, t }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [hireDate, setHireDate] = useState(new Date());
  const [status, setStatus] = useState('active');
  const [iban, setIban] = useState('');

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setPosition(employee.position || '');
      setSalary(employee.gross_salary || '');
      setHireDate(employee.hire_date ? new Date(employee.hire_date) : new Date());
      setStatus(employee.status || 'active');
      setIban(employee.iban || '');
    } else {
      setName(''); setPosition(''); setSalary(''); setHireDate(new Date()); setStatus('active'); setIban('');
    }
  }, [employee, isOpen]);

  const handleSave = () => {
    onSave({ name, position, gross_salary: parseFloat(salary), hire_date: hireDate, status, iban });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{employee ? t('hr.edit_employee_title') : t('hr.add_employee_title')}</DialogTitle></DialogHeader>
        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Label htmlFor="name">{t('crm.full_name_label')}</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label htmlFor="position">{t('hr.table_position')}</Label><Input id="position" value={position} onChange={e => setPosition(e.target.value)} placeholder={t('hr.position_placeholder')} /></div>
          <div><Label htmlFor="salary">{t('hr.table_salary')}</Label><Input id="salary" type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder={t('hr.salary_placeholder')} /></div>
          <div><Label>{t('hr.table_hire_date')}</Label><DatePicker date={hireDate} setDate={setHireDate} /></div>
          <div>
            <Label>{t('hr.table_status')}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('hr.status_active')}</SelectItem>
                <SelectItem value="on_leave">{t('hr.status_on_leave')}</SelectItem>
                <SelectItem value="terminated">{t('hr.status_terminated')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2"><Label htmlFor="iban">{t('hr.iban_label')}</Label><Input id="iban" value={iban} onChange={e => setIban(e.target.value)} /></div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <DialogClose asChild><Button variant="outline" className="w-full sm:w-auto">{t('page_billing_dialog_cancel')}</Button></DialogClose>
          <Button onClick={handleSave} className="w-full sm:w-auto">{t('ai_strategy_map.save_button')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const HR = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isPayrollConfirmOpen, setIsPayrollConfirmOpen] = useState(false);

  const currency = useMemo(() => (profile?.currency === 'usd' ? '$' : profile?.currency === 'chf' ? 'CHF' : '€'), [profile]);

  const fetchEmployees = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('employees').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('hr.load_error') });
    } else {
      setEmployees(data);
    }
    setLoading(false);
  }, [user, toast, t]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSaveEmployee = async (employeeData) => {
    let error;
    if (editingEmployee) {
      ({ error } = await supabase.from('employees').update(employeeData).eq('id', editingEmployee.id));
    } else {
      ({ error } = await supabase.from('employees').insert({ ...employeeData, user_id: user.id }));
    }

    if (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('hr.save_error') });
    } else {
      toast({ title: t('password_reset_success_title'), description: t('hr.save_success') });
      setIsDialogOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    const { error } = await supabase.from('employees').delete().eq('id', employeeId);
    if (error) {
      toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('hr.delete_error') });
    } else {
      toast({ title: t('password_reset_success_title'), description: t('hr.delete_success') });
      fetchEmployees();
    }
  };

  const handleRunPayroll = async () => {
    const month = format(new Date(), 'MMMM yyyy');
    const activeEmployees = employees.filter(e => e.status === 'active');
    const expensesToInsert = activeEmployees.map(e => ({
        user_id: user.id,
        amount: e.gross_salary,
        category: 'payroll',
        description: `Salary for ${e.name} - ${month}`,
        expense_date: new Date().toISOString(),
        spent_by: e.name,
    }));

    const { error } = await supabase.from('expenses').insert(expensesToInsert);
    if (error) {
        toast({ variant: 'destructive', title: t('password_reset_error_title'), description: t('hr.payroll_error') });
    } else {
        toast({ title: t('password_reset_success_title'), description: t('hr.payroll_success', { month }) });
    }
    setIsPayrollConfirmOpen(false);
  };

  const statusVariant = {
    [t('hr.status_active')]: 'default',
    [t('hr.status_on_leave')]: 'secondary',
    [t('hr.status_terminated')]: 'outline',
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('hr.title')}</h1>
          <p className="text-muted-foreground">{t('hr.subtitle')}</p>
        </div>
        <div className="flex gap-2">
            <Dialog open={isPayrollConfirmOpen} onOpenChange={setIsPayrollConfirmOpen}>
                <DialogTrigger asChild><Button variant="outline"><PlayCircle className="mr-2 h-4 w-4" /> {t('hr.run_payroll')}</Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>{t('hr.payroll_confirm_title', { month: format(new Date(), 'MMMM yyyy') })}</DialogTitle></DialogHeader>
                    <p>{t('hr.payroll_confirm_desc')}</p>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">{t('page_billing_dialog_cancel')}</Button></DialogClose>
                        <Button onClick={handleRunPayroll}>{t('hr.run_payroll')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Button onClick={() => { setEditingEmployee(null); setIsDialogOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> {t('hr.new_employee')}</Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {/* Desktop Table View */}
        <div className="hidden md:block border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('hr.table_name')}</TableHead>
                <TableHead>{t('hr.table_position')}</TableHead>
                <TableHead>{t('hr.table_salary')}</TableHead>
                <TableHead>{t('hr.table_status')}</TableHead>
                <TableHead>{t('hr.table_hire_date')}</TableHead>
                <TableHead className="text-right">{t('crm.table_actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan="6" className="text-center h-24">Loading...</TableCell></TableRow>
              ) : employees.length > 0 ? (
                employees.map(employee => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.gross_salary}{currency}</TableCell>
                    <TableCell><Badge variant={statusVariant[employee.status] || 'default'}>{t(`hr.status_${employee.status}`)}</Badge></TableCell>
                    <TableCell>{format(new Date(employee.hire_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => { setEditingEmployee(employee); setIsDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" /> {t('crm.edit_client')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteEmployee(employee.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> {t('page_billing_action_delete')}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan="6" className="text-center h-24">{t('hr.no_employees')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="text-center p-8"><Loader2 className="mx-auto animate-spin" /></div>
          ) : employees.length > 0 ? employees.map(employee => (
            <div key={employee.id} className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{employee.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{employee.position}</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm"><span className="text-muted-foreground">{t('hr.table_salary')}:</span> <span className="font-semibold">{employee.gross_salary}{currency}</span></p>
                    <p className="text-sm"><span className="text-muted-foreground">{t('hr.table_hire_date')}:</span> <span className="font-semibold">{format(new Date(employee.hire_date), 'dd/MM/yyyy')}</span></p>
                    <div className="pt-1">
                      <Badge variant={statusVariant[employee.status] || 'default'}>{t(`hr.status_${employee.status}`)}</Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditingEmployee(employee); setIsDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" /> {t('crm.edit_client')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteEmployee(employee.id)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> {t('page_billing_action_delete')}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )) : (
            <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">{t('hr.no_employees')}</div>
          )}
        </div>
      </motion.div>

      <EmployeeDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleSaveEmployee} employee={editingEmployee} t={t} />
    </div>
  );
};

export default HR;