import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, MoreVertical, Edit, Trash2, Users, TrendingUp, FileText, Banknote, Clock, MinusCircle, PlusCircle, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Tooltip as ShadTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const calculateNetSalary = (gross, payrollConfig) => {
  const annualGross = gross * 12;
  let totalDeductions = 0;

  (payrollConfig || []).forEach(item => {
    totalDeductions += annualGross * (item.rate / 100);
  });

  const annualNet = annualGross - totalDeductions;
  
  return {
    monthlyNet: annualNet / 12,
    deductions: (payrollConfig || []).map(item => ({
      name: item.name,
      amount: (annualGross * (item.rate / 100)) / 12
    }))
  };
};

const StatsCard = ({ title, value, icon, color }) => (
  <motion.div 
    className="bg-card border rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-lg transition-shadow duration-300"
    whileHover={{ y: -5 }}
  >
    <div className={`p-3 rounded-lg ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </motion.div>
);

const PayslipDialog = ({ employee, companyProfile, onGenerationStateChange }) => {
  const [bonus, setBonus] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [overtimeRate, setOvertimeRate] = useState(25);
  const { toast } = useToast();
  const currencySymbol = companyProfile?.currency?.toUpperCase() === 'USD' ? '$' : companyProfile?.currency?.toUpperCase() === 'CHF' ? 'CHF' : '€';

  const generatePayslip = () => {
    onGenerationStateChange(true);
    const doc = new jsPDF();
    const issueDate = new Date();
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const period = `${monthNames[issueDate.getMonth()]} ${issueDate.getFullYear()}`;

    const addContent = () => {
      doc.setFontSize(22);
      doc.setFont(undefined, 'bold');
      doc.text('Fiche de Paie', doc.internal.pageSize.getWidth() - 15, 30, { align: 'right' });
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(period, doc.internal.pageSize.getWidth() - 15, 37, { align: 'right' });

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(companyProfile?.company_name || 'Votre Entreprise', 15, 50);
      doc.setFont(undefined, 'normal');
      doc.text(companyProfile?.company_address || 'Adresse de votre entreprise', 15, 55);
      doc.text(companyProfile?.company_phone || 'Téléphone', 15, 60);

      doc.setFont(undefined, 'bold');
      doc.text(employee.name, doc.internal.pageSize.getWidth() - 15, 50, { align: 'right' });
      doc.setFont(undefined, 'normal');
      doc.text(employee.position, doc.internal.pageSize.getWidth() - 15, 55, { align: 'right' });
      doc.text(`Date d'embauche: ${new Date(employee.hire_date).toLocaleDateString('fr-FR')}`, doc.internal.pageSize.getWidth() - 15, 60, { align: 'right' });

      const grossSalary = employee.gross_salary || 0;
      const hourlyRate = grossSalary / (35 * 4.33);
      const overtimePay = overtimeHours * hourlyRate * (1 + overtimeRate / 100);
      const totalGross = grossSalary + parseFloat(bonus) + overtimePay;
      
      const { monthlyNet, deductions: taxDeductions } = calculateNetSalary(totalGross, employee.payroll_config);
      const finalNet = monthlyNet - parseFloat(deductions);

      const formatCurrency = (val) => `${val.toFixed(2)} ${currencySymbol}`;

      const body = [
        [{content: 'Rémunération', colSpan: 2, styles: { fontStyle: 'bold', fillColor: '#f3f4f6', textColor: '#111827' }}],
        ['Salaire de base brut', formatCurrency(grossSalary)],
        ['Heures supplémentaires', `${formatCurrency(overtimePay)} (${overtimeHours}h à ${overtimeRate}%)`],
        ['Prime exceptionnelle', formatCurrency(parseFloat(bonus))],
        [{ content: `Total Brut`, styles: { fontStyle: 'bold' } }, { content: formatCurrency(totalGross), styles: { fontStyle: 'bold' } }],
        [{content: 'Déductions', colSpan: 2, styles: { fontStyle: 'bold', fillColor: '#f3f4f6', textColor: '#111827' }}],
        ...taxDeductions.map(d => ([d.name, `-${formatCurrency(d.amount)}`])),
        ['Autres déductions (manuelles)', `-${formatCurrency(parseFloat(deductions))}`],
        [{ content: 'Net à payer', styles: { fontStyle: 'bold', fontSize: 12, fillColor: '#F9FAFB', textColor: '#111827' } }, { content: formatCurrency(finalNet), styles: { fontStyle: 'bold', fontSize: 12, fillColor: '#F9FAFB', textColor: '#111827' } }],
      ];

      doc.autoTable({
        startY: 80,
        head: [['Description', 'Montant']],
        body: body,
        theme: 'grid',
        headStyles: { fillColor: '#374151' },
        columnStyles: { 1: { halign: 'right' } },
      });

      doc.setFontSize(10);
      doc.text(`Fiche de paie générée le ${issueDate.toLocaleDateString('fr-FR')}.`, 15, doc.internal.pageSize.height - 10);
      doc.text(`Paiement à effectuer sur l'IBAN : ${employee.iban || 'Non renseigné'}`, doc.internal.pageSize.getWidth() - 15, doc.internal.pageSize.height - 10, { align: 'right' });

      doc.save(`Fiche_de_Paie_${employee.name.replace(' ', '_')}_${period}.pdf`);
      toast({ title: 'Succès', description: 'Fiche de paie générée.' });
      onGenerationStateChange(false);
    };

    if (companyProfile?.company_logo_url) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = companyProfile.company_logo_url;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          doc.addImage(dataURL, 'PNG', 15, 15, 30, 30);
        } catch (e) {
          console.error("Error adding image to PDF", e);
        }
        addContent();
      };
      img.onerror = () => {
        console.error("Could not load logo image for PDF.");
        addContent();
        onGenerationStateChange(false);
      };
    } else {
      addContent();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <FileText className="w-4 h-4 mr-2" /> Générer fiche de paie
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ajustements pour {employee.name}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6 py-4">
          <div className="p-4 border rounded-lg space-y-4">
            <Label className="font-semibold">Heures supplémentaires</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="overtime" className="text-xs text-muted-foreground">Heures</Label>
                <Input id="overtime" type="number" value={overtimeHours} onChange={e => setOvertimeHours(e.target.value)} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1">
                  <Label htmlFor="overtimeRate" className="text-xs text-muted-foreground">Taux (%)</Label>
                  <TooltipProvider>
                    <ShadTooltip>
                      <TooltipTrigger><HelpCircle className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>
                        <p>Taux de majoration des heures supplémentaires. <br/> 25% est le taux légal pour les 8 premières heures en France.</p>
                      </TooltipContent>
                    </ShadTooltip>
                  </TooltipProvider>
                </div>
                <Input id="overtimeRate" type="number" value={overtimeRate} onChange={e => setOvertimeRate(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-lg space-y-4">
            <Label className="font-semibold">Variables de paie</Label>
            <div className="space-y-1">
              <Label htmlFor="bonus" className="text-xs text-muted-foreground">Primes</Label>
              <div className="relative">
                <Input id="bonus" type="number" value={bonus} onChange={e => setBonus(e.target.value)} className="pl-8" />
                <PlusCircle className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="deductions" className="text-xs text-muted-foreground">Autres déductions (manuelles)</Label>
              <div className="relative">
                <Input id="deductions" type="number" value={deductions} onChange={e => setDeductions(e.target.value)} className="pl-8" />
                <MinusCircle className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-shrink-0">
          <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
          <Button onClick={generatePayslip}>Générer PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EmployeeListItem = ({ employee, onEdit, onDelete, companyProfile }) => {
  const [isGeneratingPayslip, setIsGeneratingPayslip] = useState(false);

  return (
    <motion.div 
      className="bg-card border rounded-xl p-4 flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      <div className="flex justify-between items-start w-full">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold">
            {employee.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{employee.name}</h3>
            <p className="text-sm text-muted-foreground">{employee.position}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(employee)}><Edit className="w-4 h-4 mr-2" /> Modifier</DropdownMenuItem>
            {isGeneratingPayslip ? (
              <DropdownMenuItem disabled>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération...
              </DropdownMenuItem>
            ) : (
              <PayslipDialog employee={employee} companyProfile={companyProfile} onGenerationStateChange={setIsGeneratingPayslip} />
            )}
            <DropdownMenuItem onClick={() => onDelete(employee.id)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm w-full mt-4">
        <div>
          <p className="text-muted-foreground">Salaire Brut</p>
          <p className="font-semibold">{(companyProfile?.currency?.toUpperCase() === 'USD' ? '$' : companyProfile?.currency?.toUpperCase() === 'CHF' ? 'CHF' : '€')}{employee.gross_salary?.toLocaleString('fr-FR') || 'N/A'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Statut</p>
          <p className="font-semibold">{employee.status}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Département</p>
          <p className="font-semibold">{employee.department || 'N/A'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Embauche</p>
          <p className="font-semibold">{new Date(employee.hire_date).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </motion.div>
  );
};

const HR = () => {
  const { toast } = useToast();
  const { user, profile: companyProfile } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '', position: '', gross_salary: '', hire_date: '', status: 'CDI', department: '', team: '', iban: '', payroll_config: [{ name: 'Charges sociales', rate: 22 }, { name: 'Impôt sur le revenu', rate: 10 }]
  });

  const fetchEmployees = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('employees').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les employés.' });
    } else {
      setEmployees(data);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleSaveEmployee = async () => {
    if (!newEmployee.name || !newEmployee.gross_salary) {
      toast({ variant: 'destructive', title: 'Champs requis', description: 'Le nom et le salaire brut sont obligatoires.' });
      return;
    }
    const payroll_config = newEmployee.payroll_config.filter(item => item.name && item.rate).map(item => ({...item, rate: parseFloat(item.rate)}));
    const employeeData = { ...newEmployee, user_id: user.id, gross_salary: Number(newEmployee.gross_salary), payroll_config };
    const { error } = currentEmployee ? await supabase.from('employees').update(employeeData).eq('id', currentEmployee.id) : await supabase.from('employees').insert(employeeData);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "L'employé n'a pas pu être enregistré." });
    } else {
      toast({ title: 'Succès', description: `Employé ${currentEmployee ? 'mis à jour' : 'ajouté'}.` });
      setIsDialogOpen(false);
      fetchEmployees();
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    const { error } = await supabase.from('employees').delete().eq('id', employeeId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "L'employé n'a pas pu être supprimé." });
    } else {
      toast({ title: 'Succès', description: 'Employé supprimé.' });
      fetchEmployees();
    }
  };

  const openDialog = (employee = null) => {
    setCurrentEmployee(employee);
    const defaultConfig = [{ name: 'Charges sociales', rate: 22 }, { name: 'Impôt sur le revenu', rate: 10 }];
    const payrollConfig = (employee?.payroll_config && employee.payroll_config.length > 0) ? employee.payroll_config : defaultConfig;
    setNewEmployee(employee ? { ...employee, hire_date: employee.hire_date?.split('T')[0], payroll_config: payrollConfig } : {
      name: '', position: '', gross_salary: '', hire_date: new Date().toISOString().split('T')[0], status: 'CDI', department: '', team: '', iban: '', payroll_config: payrollConfig
    });
    setIsDialogOpen(true);
  };
  
  const handlePayrollConfigChange = (index, field, value) => {
    const updatedConfig = [...newEmployee.payroll_config];
    updatedConfig[index][field] = value;
    setNewEmployee({...newEmployee, payroll_config: updatedConfig});
  };

  const addPayrollConfigLine = () => {
    setNewEmployee({...newEmployee, payroll_config: [...newEmployee.payroll_config, {name: '', rate: ''}]});
  };

  const removePayrollConfigLine = (index) => {
    const updatedConfig = newEmployee.payroll_config.filter((_, i) => i !== index);
    setNewEmployee({...newEmployee, payroll_config: updatedConfig});
  };

  const currencySymbol = useMemo(() => (companyProfile?.currency?.toUpperCase() === 'USD' ? '$' : companyProfile?.currency?.toUpperCase() === 'CHF' ? 'CHF' : '€'), [companyProfile]);

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const totalPayroll = employees.reduce((sum, emp) => sum + (emp.gross_salary || 0), 0);
    const averageSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;
    return { totalEmployees, totalPayroll, averageSalary };
  }, [employees]);

  const payrollByDepartment = useMemo(() => {
    const data = employees.reduce((acc, emp) => {
      const dept = emp.department || 'Non défini';
      if (!acc[dept]) acc[dept] = { name: dept, "Masse Salariale": 0 };
      acc[dept]["Masse Salariale"] += emp.gross_salary || 0;
      return acc;
    }, {});
    return Object.values(data);
  }, [employees]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ressources Humaines & Paie</h1>
          <p className="text-muted-foreground">Gérez vos équipes, salaires et fiches de paie avec efficacité.</p>
        </div>
        <Button onClick={() => openDialog()} className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Nouvel employé
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Employés" value={stats.totalEmployees} icon={<Users className="w-6 h-6 text-blue-500" />} color="bg-blue-500/10" />
        <StatsCard title="Masse Salariale Mensuelle" value={`${currencySymbol}${stats.totalPayroll.toLocaleString('fr-FR')}`} icon={<Banknote className="w-6 h-6 text-green-500" />} color="bg-green-500/10" />
        <StatsCard title="Salaire Moyen Brut" value={`${currencySymbol}${stats.averageSalary.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}`} icon={<TrendingUp className="w-6 h-6 text-yellow-500" />} color="bg-yellow-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Vos Employés</h2>
          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => <div key={i} className="h-36 bg-card rounded-xl animate-pulse"></div>)}
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => (
                <EmployeeListItem key={employee.id} employee={employee} onEdit={openDialog} onDelete={handleDeleteEmployee} companyProfile={companyProfile} />
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-4">Masse Salariale par Département</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={payrollByDepartment} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${currencySymbol}${value / 1000}k`} />
                <Tooltip cursor={{ fill: 'hsl(var(--accent))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value) => `${currencySymbol}${value.toLocaleString('fr-FR')}`} />
                <Bar dataKey="Masse Salariale" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle>{currentEmployee ? 'Modifier un employé' : 'Ajouter un employé'}</DialogTitle></DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="name">Nom complet</Label><Input id="name" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="position">Poste</Label><Input id="position" value={newEmployee.position} onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="iban">IBAN</Label><Input id="iban" value={newEmployee.iban} onChange={(e) => setNewEmployee({ ...newEmployee, iban: e.target.value })} placeholder="FR76..." /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="gross_salary">Salaire Brut Mensuel ({currencySymbol})</Label><Input id="gross_salary" type="number" value={newEmployee.gross_salary} onChange={(e) => setNewEmployee({ ...newEmployee, gross_salary: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="hire_date">Date d'embauche</Label><Input id="hire_date" type="date" value={newEmployee.hire_date} onChange={(e) => setNewEmployee({ ...newEmployee, hire_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="status">Type de contrat</Label>
                <select id="status" value={newEmployee.status} onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })} className="w-full h-10 border rounded-md px-3 bg-transparent">
                  <option>CDI</option><option>CDD</option><option>Freelance</option><option>Alternant</option><option>Stagiaire</option>
                </select>
              </div>
              <div className="space-y-2"><Label htmlFor="department">Département</Label><Input id="department" value={newEmployee.department} onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })} /></div>
            </div>
            <div className="space-y-4 p-4 border rounded-lg">
                <Label className="font-semibold">Configuration de la paie (taxes, cotisations...)</Label>
                {newEmployee.payroll_config.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input placeholder="Nom de la déduction" value={item.name} onChange={(e) => handlePayrollConfigChange(index, 'name', e.target.value)} />
                        <Input type="number" placeholder="Taux %" value={item.rate} onChange={(e) => handlePayrollConfigChange(index, 'rate', e.target.value)} className="w-28" />
                        <Button variant="ghost" size="icon" onClick={() => removePayrollConfigLine(index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={addPayrollConfigLine}><Plus className="w-4 h-4 mr-2" /> Ajouter une ligne</Button>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0"><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button><Button onClick={handleSaveEmployee}>Sauvegarder</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HR;