import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Eye,
  Download,
  Trash2,
  MoreVertical,
  Edit,
  Building,
  Upload,
  X,
  Sparkles,
  Loader2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/customSupabaseClient";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import "jspdf-autotable";
import CreateClientDialog from "@/components/CreateClientDialog";
import { DatePicker } from "@/components/DatePicker";
import { format } from "date-fns";
import { Helmet } from "react-helmet";

const Billing = () => {
  const { toast } = useToast();
  const { user, profile, refreshProfile, getPlan } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isImportHoursDialogOpen, setIsImportHoursDialogOpen] = useState(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const initialInvoiceState = {
    client_id: "",
    due_date: null,
    items: [{ description: "", quantity: 1, unit_price: "" }],
    tax_rate: 0,
  };
  const [newInvoice, setNewInvoice] = useState(initialInvoiceState);

  const [companyData, setCompanyData] = useState({
    company_name: "",
    email: "",
    company_address: "",
    company_phone: "",
    company_logo_url: "",
    business_description: "",
    invoice_prefix: "INV-",
    quote_prefix: "DEV-",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const plan = getPlan();

  const currencySymbol = useMemo(() => {
    const currency = profile?.currency || "eur";
    if (currency === "usd") return "$";
    if (currency === "chf") return "CHF";
    return "€";
  }, [profile]);

  useEffect(() => {
    if (profile) {
      setCompanyData({
        company_name: profile.company_name || "",
        email: profile.email || user.email || "",
        company_address: profile.company_address || "",
        company_phone: profile.company_phone || "",
        company_logo_url: profile.company_logo_url || "",
        business_description: profile.business_description || "",
        invoice_prefix: profile.invoice_prefix || "INV-",
        quote_prefix: profile.quote_prefix || "DEV-",
      });
    }
  }, [profile, user]);

  const fetchBillingData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [
      { data: invoicesData, error: invoicesError },
      { data: clientsData, error: clientsError },
      { data: projectsData, error: projectsError },
    ] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, client:clients(*)")
        .eq("user_id", user.id)
        .order("issue_date", { ascending: false }),
      supabase.from("clients").select("id, name").eq("user_id", user.id),
      supabase
        .from("projects")
        .select("id, name, client_id, hourly_rate")
        .eq("user_id", user.id)
        .not("hourly_rate", "is", null),
    ]);

    if (invoicesError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load invoices.",
      });
    } else {
      setInvoices(
        invoicesData.map((inv) => ({
          ...inv,
          amount:
            (inv.items || []).reduce(
              (acc, item) => acc + item.quantity * item.unit_price,
              0
            ) *
            (1 + (inv.tax_rate || 0) / 100),
        }))
      );
    }
    if (!clientsError) setClients(clientsData);
    if (!projectsError) setProjects(projectsData);
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handleClientCreated = (newClientData) => {
    setClients((prevClients) => [
      ...prevClients,
      { id: newClientData.id, name: newClientData.name },
    ]);
    setNewInvoice((prevInvoice) => ({
      ...prevInvoice,
      client_id: newClientData.id,
    }));
    setIsClientDialogOpen(false);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index][field] = value;
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const addItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [
        ...newInvoice.items,
        { description: "", quantity: 1, unit_price: "" },
      ],
    });
  };

  const removeItem = (index) => {
    const updatedItems = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const calculateTotal = (items, tax_rate) => {
    const subtotal = items.reduce(
      (acc, item) =>
        acc + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
      0
    );
    const tax = subtotal * (Number(tax_rate) / 100);
    return subtotal + tax;
  };

  const handleCreateInvoice = async () => {
    const totalAmount = calculateTotal(newInvoice.items, newInvoice.tax_rate);
    if (!newInvoice.client_id || !newInvoice.due_date || totalAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Required fields",
        description: "Please complete all fields and add at least one item.",
      });
      return;
    }

    const { data: invoiceData, error } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        client_id: newInvoice.client_id,
        amount: totalAmount,
        due_date: format(newInvoice.due_date, "yyyy-MM-dd"),
        issue_date: new Date().toISOString().split("T")[0],
        status: "pending",
        items: newInvoice.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),
        tax_rate: Number(newInvoice.tax_rate),
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The invoice could not be created.",
      });
    } else {
      if (newInvoice.time_entry_ids?.length > 0) {
        await supabase
          .from("time_entries")
          .update({ invoiced: true })
          .in("id", newInvoice.time_entry_ids);
      }
      toast({ title: "Success", description: "Invoice created successfully." });
      setIsInvoiceDialogOpen(false);
      setNewInvoice(initialInvoiceState);
      fetchBillingData();
    }
  };

  const handleSaveCompanyData = async () => {
    if (!companyData.company_name || !companyData.email) {
      toast({
        variant: "destructive",
        title: "Required fields",
        description: "Company name and email are required.",
      });
      return;
    }
    setIsUploading(true);

    let logoUrl = companyData.company_logo_url;

    if (logoFile) {
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("company_assets")
        .upload(filePath, logoFile);

      if (uploadError) {
        toast({
          variant: "destructive",
          title: "Upload error",
          description: "The logo could not be uploaded.",
        });
        setIsUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("company_assets")
        .getPublicUrl(filePath);

      logoUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        company_name: companyData.company_name,
        company_address: companyData.company_address,
        company_phone: companyData.company_phone,
        company_logo_url: logoUrl,
        business_description: companyData.business_description,
        email: companyData.email,
        invoice_prefix: companyData.invoice_prefix,
        quote_prefix: companyData.quote_prefix,
      })
      .eq("id", user.id);

    setIsUploading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Data could not be saved.",
      });
    } else {
      toast({ title: "Success", description: "Company data updated." });
      setIsCompanyDialogOpen(false);
      setLogoFile(null);
      refreshProfile();
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The invoice could not be deleted.",
      });
    } else {
      toast({ title: "Success", description: "Invoice deleted." });
      fetchBillingData();
      setSelectedInvoice(null);
    }
  };

  const handleUpdateStatus = async (invoiceId, status) => {
    const { error } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", invoiceId);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The status could not be updated.",
      });
    } else {
      toast({ title: "Success", description: "Invoice status updated." });
      fetchBillingData();
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice((prev) => ({ ...prev, status }));
      }
    }
  };

  const handleGenerateSuggestion = async (index) => {
    if (!profile?.business_description) {
      toast({
        variant: "destructive",
        title: "Action required",
        description:
          "Please first describe your activity in the business data.",
      });
      setIsCompanyDialogOpen(true);
      return;
    }
    setIsGeneratingSuggestion(index);
    const { data, error } = await supabase.functions.invoke(
      "generate-text-suggestion",
      {
        body: {
          business_description: profile.business_description,
          context: "invoice_item",
          userInput: newInvoice.items[index].description,
        },
      }
    );
    setIsGeneratingSuggestion(null);

    if (error || data.error) {
      toast({
        variant: "destructive",
        title: "AI error",
        description: "Suggestion could not be generated.",
      });
    } else {
      handleItemChange(index, "description", data.suggestion);
      toast({ title: "Suggestion generated!" });
    }
  };

  const handleImportProjectHours = async (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const { data: timeEntries, error } = await supabase
      .from("time_entries")
      .select("*")
      .eq("project_id", projectId)
      .eq("invoiced", false);

    if (error || timeEntries.length === 0) {
      toast({
        title: "Information",
        description: "No unbilled hours found for this project.",
      });
      setIsImportHoursDialogOpen(false);
      return;
    }

    const totalSeconds = timeEntries.reduce((acc, entry) => {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      return acc + (end - start) / 1000;
    }, 0);

    const totalHours = totalSeconds / 3600;

    setNewInvoice({
      client_id: project.client_id,
      due_date: new Date(new Date().setDate(new Date().getDate() + 30)),
      items: [
        {
          description: `Services for the project "${project.name}"`,
          quantity: totalHours.toFixed(2),
          unit_price: project.hourly_rate,
        },
      ],
      tax_rate: 20, // Default tax rate
      time_entry_ids: timeEntries.map((e) => e.id),
    });

    setIsImportHoursDialogOpen(false);
    setIsInvoiceDialogOpen(true);
    toast({
      title: "Imported Hours",
      description: `${totalHours.toFixed(
        2
      )} hours have been added to a new invoice.`,
    });
  };

  const handleDownloadPDF = (invoice) => {
    setIsGeneratingPdf(invoice.id);
    const doc = new jsPDF();
    const isFreePlan = plan === "Free";

    const addContent = () => {
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", 14, 55);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(profile?.company_name || "Your Company", 120, 22);
      doc.text(
        profile?.email || user?.email || "contact@your-company.com",
        120,
        27
      );
      doc.text(profile?.company_address || "Your Address", 120, 32);
      doc.text(profile?.company_phone || "Your Phone", 120, 37);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Billed to:", 14, 70);
      doc.setFont("helvetica", "normal");
      doc.text(invoice.client?.name || "N/A", 14, 76);
      doc.text(invoice.client?.address || "", 14, 81);
      doc.text(invoice.client?.email || "N/A", 14, 86);

      doc.setFontSize(10);
      doc.text(`Invoice number: ${invoice.invoice_number}`, 120, 70);
      doc.text(
        `Issue date: ${new Date(invoice.issue_date).toLocaleDateString(
          "fr-FR"
        )}`,
        120,
        75
      );
      doc.text(
        `Due date: ${new Date(invoice.due_date).toLocaleDateString("fr-FR")}`,
        120,
        80
      );

      const tableBody = (invoice.items || []).map((item) => [
        item.description,
        item.quantity,
        `${Number(item.unit_price).toFixed(2)} ${currencySymbol}`,
        `${(item.quantity * item.unit_price).toFixed(2)} ${currencySymbol}`,
      ]);

      doc.autoTable({
        startY: 95,
        head: [
          ["Description", "Quantity", "Unit Price", "Total excluding tax"],
        ],
        body: tableBody,
        theme: "striped",
        headStyles: { fillColor: [38, 38, 38] },
      });

      const finalY = doc.lastAutoTable.finalY;
      const subtotal = (invoice.items || []).reduce(
        (acc, item) => acc + item.quantity * item.unit_price,
        0
      );
      const tax = subtotal * ((invoice.tax_rate || 0) / 100);
      const total = subtotal + tax;

      doc.setFontSize(10);
      doc.text("Subtotal excluding tax:", 140, finalY + 10);
      doc.text(`${subtotal.toFixed(2)} ${currencySymbol}`, 170, finalY + 10);
      doc.text(`VAT (${invoice.tax_rate || 0}%):`, 140, finalY + 15);
      doc.text(`${tax.toFixed(2)} ${currencySymbol}`, 170, finalY + 15);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Total including tax:", 140, finalY + 22);
      doc.text(`${total.toFixed(2)} ${currencySymbol}`, 170, finalY + 22);

      if (invoice.status === "paid") {
        doc.setFontSize(16);
        doc.setTextColor(0, 128, 0);
        doc.text("PAID", 14, finalY + 30);
      }

      if (isFreePlan) {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          "Powered by yourbizflow.com",
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save(`Invoice-${invoice.invoice_number}.pdf`);
      setIsGeneratingPdf(null);
    };

    const userLogoUrl = profile?.company_logo_url;
    const defaultLogoUrl =
      "https://horizons-cdn.hostinger.com/58cbc4ed-cb6f-4ebd-abaf-62892e9ae2c6/0df0c9b0066dbdb2bc655da8f73f9fbc.png";
    const logoUrl = userLogoUrl || defaultLogoUrl;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = logoUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        doc.addImage(dataURL, "PNG", 14, 15, 30, 30);
      } catch (e) {
        console.error("Error adding image to PDF", e);
      }
      addContent();
    };
    img.onerror = () => {
      console.error("Could not load logo image for PDF.");
      addContent();
      setIsGeneratingPdf(null);
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "overdue":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "pending":
        return "Pending";
      case "overdue":
        return "Overdue";
      default:
        return "Draft";
    }
  };

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Invoicing - YourBizFlow</title>
        <meta
          name="description"
          content="Manage your invoices, track payments and create professional documents in just a few clicks with the YourBizFlow invoicing module."
        />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Billing</h1>
          <p className="text-muted-foreground">
            Manage your invoices and track your payments
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-start sm:justify-end w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setIsCompanyDialogOpen(true)}
            className="sm:w-auto"
          >
            <Building className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Business data</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsImportHoursDialogOpen(true)}
            className="sm:w-auto"
          >
            <Clock className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Import hours</span>
          </Button>
          <Button
            onClick={() => {
              setNewInvoice(initialInvoiceState);
              setIsInvoiceDialogOpen(true);
            }}
            className="sm:w-auto"
          >
            <More className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">New invoice</span>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card/50 backdrop-blur-sm border rounded-xl overflow-hidden"
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-foreground">Recent invoices</h2>
        </div>
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 font-semibold text-muted-foreground">
                  Number
                </th>
                <th className="text-left p-4 font-semibold text-muted-foreground">
                  Client
                </th>
                <th className="text-left p-4 font-semibold text-muted-foreground">
                  Amount
                </th>
                <th className="text-left p-4 font-semibold text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-muted-foreground">
                  Due date
                </th>
                <th className="text-right p-4 font-semibold text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td colSpan="6" className="p-4">
                        <div className="h-8 bg-muted/50 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                : invoices.map((invoice, index) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-4 font-medium">
                        {invoice.invoice_number}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {invoice.client?.name || "Customer deleted"}
                      </td>
                      <td className="p-4 font-semibold">
                        {currencySymbol}
                        {invoice.amount.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {getStatusText(invoice.status)}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(invoice.due_date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              <Eye className="w-4 h-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadPDF(invoice)}
                              disabled={isGeneratingPdf === invoice.id}
                            >
                              {isGeneratingPdf === invoice.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 mr-2" />
                              )}
                              {isGeneratingPdf === invoice.id
                                ? "Generation..."
                                : "Download PDF"}
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Edit className="w-4 h-4 mr-2" /> Change status
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(invoice.id, "paid")
                                    }
                                  >
                                    Paid
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(invoice.id, "pending")
                                    }
                                  >
                                    Pending
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(invoice.id, "overdue")
                                    }
                                  >
                                    Overdue
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="text-red-500 focus:text-red-500"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
        </div>
        <div className="sm:hidden p-4 space-y-4">
          {loading
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-muted/50 rounded-lg animate-pulse"
                ></div>
              ))
            : invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="bg-card border rounded-lg p-4 flex justify-between items-center"
                >
                  <div
                    className="flex-1"
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <p className="font-bold">{invoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.client?.name || "Customer deleted"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="font-bold text-sm">
                        {currencySymbol}
                        {invoice.amount.toFixed(2)}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {getStatusText(invoice.status)}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="w-4 h-4 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDownloadPDF(invoice)}
                        disabled={isGeneratingPdf === invoice.id}
                      >
                        {isGeneratingPdf === invoice.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        PDF
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Edit className="w-4 h-4 mr-2" /> Status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(invoice.id, "paid")
                              }
                            >
                              Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(invoice.id, "pending")
                              }
                            >
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(invoice.id, "overdue")
                              }
                            >
                              Overdue
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuItem
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
        </div>
      </motion.div>

      <Dialog
        open={!!selectedInvoice}
        onOpenChange={() => setSelectedInvoice(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Invoice details {selectedInvoice?.invoice_number}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="py-4 space-y-4">
              <p>
                <strong>Client:</strong> {selectedInvoice.client?.name}
              </p>
              <p>
                <strong>Amount:</strong> {currencySymbol}
                {selectedInvoice.amount.toFixed(2)}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    selectedInvoice.status
                  )}`}
                >
                  {getStatusText(selectedInvoice.status)}
                </span>
              </p>
              <p>
                <strong>Issue date:</strong>{" "}
                {new Date(selectedInvoice.issue_date).toLocaleDateString(
                  "fr-FR"
                )}
              </p>
              <p>
                <strong>Due date:</strong>{" "}
                {new Date(selectedInvoice.due_date).toLocaleDateString("fr-FR")}
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPDF(selectedInvoice)}
                  disabled={isGeneratingPdf === selectedInvoice.id}
                >
                  {isGeneratingPdf === selectedInvoice.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  PDF
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create a new invoice</DialogTitle>
            <DialogDescription>
              Fill in the information below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Client</Label>
                <div className="flex gap-2 mt-1">
                  <select
                    id="client"
                    value={newInvoice.client_id}
                    onChange={(e) =>
                      setNewInvoice({
                        ...newInvoice,
                        client_id: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2 bg-background text-foreground"
                  >
                    <option value="">Select a customer</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsClientDialogOpen(true)}
                  >
                    <More />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="due_date">Due date</Label>
                <DatePicker
                  date={newInvoice.due_date}
                  setDate={(date) =>
                    setNewInvoice({ ...newInvoice, due_date: date })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Items</Label>
              {newInvoice.items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
                >
                  <div className="relative flex-grow w-full">
                    <Input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      className="pr-10"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => handleGenerateSuggestion(index)}
                      disabled={isGeneratingSuggestion === index}
                    >
                      {isGeneratingSuggestion === index ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      className="w-1/2 sm:w-20"
                    />
                    <Input
                      type="number"
                      placeholder="Price U."
                      value={item.unit_price}
                      onChange={(e) =>
                        handleItemChange(index, "unit_price", e.target.value)
                      }
                      className="w-1/2 sm:w-24"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={newInvoice.items.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addItem}
                className="mt-2"
              >
                <More className="h-4 w-4 mr-2" /> Add an article
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="tax_rate">VAT rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  value={newInvoice.tax_rate}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, tax_rate: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div className="text-right self-end">
                <p className="text-muted-foreground">Total including tax</p>
                <p className="text-2xl font-bold">
                  {currencySymbol}
                  {calculateTotal(
                    newInvoice.items,
                    newInvoice.tax_rate
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsInvoiceDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateClientDialog
        isOpen={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        onClientCreated={handleClientCreated}
      />
      <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
        <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Company data</DialogTitle>
            <DialogDescription>
              This information will appear on your invoices and help the AI.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 -mr-6 grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company name (required)</Label>
              <Input
                id="company_name"
                value={companyData.company_name}
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    company_name: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Contact email (required)</Label>
              <Input
                id="email"
                type="email"
                value={companyData.email}
                onChange={(e) =>
                  setCompanyData({ ...companyData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_address">Address</Label>
              <Input
                id="company_address"
                value={companyData.company_address}
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    company_address: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_phone">Phone</Label>
              <Input
                id="company_phone"
                value={companyData.company_phone}
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    company_phone: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_description">Business description</Label>
              <Textarea
                id="business_description"
                placeholder="Ex: Sale of second-hand clothing, digital marketing consulting services, website creation..."
                value={companyData.business_description}
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    business_description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
                <Input
                  id="invoice_prefix"
                  value={companyData.invoice_prefix}
                  onChange={(e) =>
                    setCompanyData({
                      ...companyData,
                      invoice_prefix: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quote_prefix">Quote Prefix</Label>
                <Input
                  id="quote_prefix"
                  value={companyData.quote_prefix}
                  onChange={(e) =>
                    setCompanyData({
                      ...companyData,
                      quote_prefix: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo-upload">Logo</Label>
              <div className="flex items-center gap-4">
                {companyData.company_logo_url && !logoFile && (
                  <img
                    src={companyData.company_logo_url}
                    alt="Current logo"
                    className="h-16 w-16 rounded-md object-cover"
                  />
                )}
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer flex-grow flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-md hover:border-primary"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  <span>{logoFile ? logoFile.name : "Choose a file"}</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsCompanyDialogOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCompanyData} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isImportHoursDialogOpen}
        onOpenChange={setIsImportHoursDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import project hours</DialogTitle>
            <DialogDescription>
              Select a project to create an invoice from unbilled hours.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-64 overflow-y-auto">
            {projects.length > 0 ? (
              <ul className="space-y-2">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleImportProjectHours(p.id)}
                    >
                      {p.name}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center">
                No projects with an hourly rate were found.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Billing;
