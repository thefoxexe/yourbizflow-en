import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Download,
  Trash2,
  MoreVertical,
  Edit,
  X,
  Mic,
  FileText,
  RefreshCw,
  Square,
  Loader2,
  Sparkles,
  Eye,
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

const Quotes = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);

  const initialQuoteState = {
    client_id: "",
    expiry_date: null,
    items: [{ description: "", quantity: 1, unit_price: "" }],
    tax_rate: 0,
  };
  const [newQuote, setNewQuote] = useState(initialQuoteState);

  const fetchQuoteData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [
      { data: quotesData, error: quotesError },
      { data: clientsData, error: clientsError },
    ] = await Promise.all([
      supabase
        .from("quotes")
        .select("*, client:clients(*)")
        .eq("user_id", user.id)
        .order("issue_date", { ascending: false }),
      supabase.from("clients").select("*").eq("user_id", user.id),
    ]);

    if (quotesError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load quotes.",
      });
    } else {
      setQuotes(
        quotesData.map((q) => ({
          ...q,
          amount:
            (q.items || []).reduce(
              (acc, item) => acc + item.quantity * item.unit_price,
              0
            ) *
            (1 + (q.tax_rate || 0) / 100),
        }))
      );
    }
    if (!clientsError) setClients(clientsData);
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchQuoteData();
  }, [fetchQuoteData]);

  const handleClientCreated = (newClientData) => {
    setClients((prevClients) => [...prevClients, newClientData]);
    setNewQuote((prevQuote) => ({ ...prevQuote, client_id: newClientData.id }));
    setIsClientDialogOpen(false);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newQuote.items];
    updatedItems[index][field] = value;
    setNewQuote({ ...newQuote, items: updatedItems });
  };

  const addItem = () => {
    setNewQuote({
      ...newQuote,
      items: [
        ...newQuote.items,
        { description: "", quantity: 1, unit_price: "" },
      ],
    });
  };

  const removeItem = (index) => {
    const updatedItems = newQuote.items.filter((_, i) => i !== index);
    setNewQuote({ ...newQuote, items: updatedItems });
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

  const handleCreateQuote = async () => {
    const totalAmount = calculateTotal(newQuote.items, newQuote.tax_rate);
    if (!newQuote.client_id || totalAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Required fields",
        description: "Please select a customer and add at least one item.",
      });
      return;
    }

    const { error } = await supabase.from("quotes").insert({
      user_id: user.id,
      client_id: newQuote.client_id,
      expiry_date: newQuote.expiry_date
        ? format(newQuote.expiry_date, "yyyy-MM-dd")
        : null,
      issue_date: new Date().toISOString().split("T")[0],
      status: "pending",
      items: newQuote.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      })),
      tax_rate: Number(newQuote.tax_rate),
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The quote could not be created.",
      });
    } else {
      toast({ title: "Success", description: "Quote created successfully." });
      setIsQuoteDialogOpen(false);
      setNewQuote(initialQuoteState);
      fetchQuoteData();
    }
  };

  const handleDeleteQuote = async (quoteId) => {
    const { error } = await supabase.from("quotes").delete().eq("id", quoteId);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The quote could not be deleted.",
      });
    } else {
      toast({ title: "Success", description: "Quote deleted." });
      fetchQuoteData();
      setSelectedQuote(null);
    }
  };

  const handleUpdateStatus = async (quoteId, status) => {
    const { error } = await supabase
      .from("quotes")
      .update({ status })
      .eq("id", quoteId);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The status could not be updated.",
      });
    } else {
      toast({ title: "Success", description: "Quote status updated." });
      fetchQuoteData();
      if (selectedQuote?.id === quoteId) {
        setSelectedQuote((prev) => ({ ...prev, status }));
      }
    }
  };
  const handleConvertToInvoice = async (quote) => {
    const { error } = await supabase.from("invoices").insert({
      user_id: quote.user_id,
      client_id: quote.client_id,
      amount: quote.amount,
      issue_date: new Date().toISOString().split("T")[0],
      due_date: new Date(new Date().setDate(new Date().getDate() + 30))
        .toISOString()
        .split("T")[0],
      status: "pending",
      items: quote.items,
      tax_rate: quote.tax_rate,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Conversion to invoice failed.",
      });
    } else {
      await handleUpdateStatus(quote.id, "accepted");
      toast({ title: "Success", description: "Quote converted into invoice!" });
    }
  };

  const handleGenerateSuggestion = async (index) => {
    if (!profile?.business_description) {
      toast({
        variant: "destructive",
        title: "Action required",
        description:
          "Please first describe your activity in the company data (via the Billing module)",
      });
      return;
    }
    setIsGeneratingSuggestion(index);
    const userInput = newQuote.items[index].description;
    const { data, error } = await supabase.functions.invoke(
      "generate-text-suggestion",
      {
        body: {
          business_description: profile.business_description,
          context: "quote_item",
          userInput: userInput,
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

  const handleDownloadPDF = (quote) => {
    setIsGeneratingPdf(quote.id);
    const doc = new jsPDF();
    const currencySymbol =
      profile?.currency === "chf"
        ? "CHF"
        : profile?.currency === "usd"
        ? "$"
        : "€";

    const addContent = () => {
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("QUOTE", 14, 55);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(profile?.company_name || "Your Company", 120, 22);
      doc.text(profile?.email || user?.email || "", 120, 27);
      doc.text(profile?.company_address || "", 120, 32);
      doc.text(profile?.company_phone || "", 120, 37);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Addressed to:", 14, 70);
      doc.setFont("helvetica", "normal");
      doc.text(quote.client?.name || "N/A", 14, 76);
      doc.text(quote.client?.address || "", 14, 81);
      doc.text(quote.client?.email || "N/A", 14, 86);

      doc.setFontSize(10);
      doc.text(`Quotation number: ${quote.quote_number}`, 120, 70);
      doc.text(
        `Issue date: ${new Date(quote.issue_date).toLocaleDateString("fr-FR")}`,
        120,
        75
      );
      if (quote.expiry_date) {
        doc.text(
          `Valid until: ${new Date(quote.expiry_date).toLocaleDateString(
            "fr-FR"
          )}`,
          120,
          80
        );
      }

      const tableBody = (quote.items || []).map((item) => [
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
      const subtotal = (quote.items || []).reduce(
        (acc, item) => acc + item.quantity * item.unit_price,
        0
      );
      const tax = subtotal * ((quote.tax_rate || 0) / 100);
      const total = subtotal + tax;

      doc.setFontSize(10);
      doc.text("Subtotal excluding tax:", 140, finalY + 10);
      doc.text(`${subtotal.toFixed(2)} ${currencySymbol}`, 170, finalY + 10);
      doc.text(`VAT (${quote.tax_rate || 0}%):`, 140, finalY + 15);
      doc.text(`${tax.toFixed(2)} ${currencySymbol}`, 170, finalY + 15);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Total including tax:", 140, finalY + 22);
      doc.text(`${total.toFixed(2)} ${currencySymbol}`, 170, finalY + 22);

      doc.save(`quote-${quote.quote_number}.pdf`);
      setIsGeneratingPdf(null);
    };

    if (profile?.company_logo_url) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = profile.company_logo_url;
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
        addContent();
        setIsGeneratingPdf(null);
      };
    } else {
      addContent();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      default:
        return "Draft";
    }
  };

  const handleVoiceButtonClick = () => {
    toast({
      title: "🚧 In development",
      description:
        "This feature is under construction and will be available soon!",
    });
  };

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Quote - YourBizFlow</title>
        <meta
          name="description"
          content="Create and manage your quotes and commercial proposals. Easily convert your quotes into invoices and track their status."
        />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Quotation</h1>
          <p className="text-muted-foreground">
            Create and manage your commercial proposals
          </p>
        </div>
        <Button
          onClick={() => {
            setNewQuote(initialQuoteState);
            setIsQuoteDialogOpen(true);
          }}
          className="flex-shrink-0"
        >
          <More className="w-4 h-4 mr-2" />
          New quote
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card/50 backdrop-blur-sm border rounded-xl overflow-hidden"
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-foreground">Recent quotes</h2>
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
                : quotes.map((quote, index) => (
                    <motion.tr
                      key={quote.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-4 font-medium">{quote.quote_number}</td>
                      <td className="p-4 text-muted-foreground">
                        {quote.client?.name || "Customer deleted"}
                      </td>
                      <td className="p-4 font-semibold">
                        {profile?.currency === "chf"
                          ? "CHF"
                          : profile?.currency === "usd"
                          ? "$"
                          : "€"}
                        {quote.amount.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            quote.status
                          )}`}
                        >
                          {getStatusText(quote.status)}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {quote.expiry_date
                          ? new Date(quote.expiry_date).toLocaleDateString(
                              "fr-FR"
                            )
                          : "N/A"}
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
                              onClick={() => setSelectedQuote(quote)}
                            >
                              <Eye className="w-4 h-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadPDF(quote)}
                              disabled={isGeneratingPdf === quote.id}
                            >
                              {isGeneratingPdf === quote.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 mr-2" />
                              )}
                              {isGeneratingPdf === quote.id
                                ? "Generation..."
                                : "Download PDF"}
                            </DropdownMenuItem>
                            {quote.status === "pending" && (
                              <DropdownMenuItem
                                onClick={() => handleConvertToInvoice(quote)}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" /> Convert
                                to Invoice
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Edit className="w-4 h-4 mr-2" /> Change status
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(quote.id, "accepted")
                                    }
                                  >
                                    Accepted
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(quote.id, "pending")
                                    }
                                  >
                                    Pending
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(quote.id, "rejected")
                                    }
                                  >
                                    Rejected
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem
                              onClick={() => handleDeleteQuote(quote.id)}
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
            : quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="bg-card border rounded-lg p-4 flex justify-between items-center"
                >
                  <div
                    className="flex-1"
                    onClick={() => setSelectedQuote(quote)}
                  >
                    <p className="font-bold">{quote.quote_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {quote.client?.name || "Customer deleted"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="font-bold text-sm">
                        {profile?.currency === "chf"
                          ? "CHF"
                          : profile?.currency === "usd"
                          ? "$"
                          : "€"}
                        {quote.amount.toFixed(2)}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          quote.status
                        )}`}
                      >
                        {getStatusText(quote.status)}
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
                      <DropdownMenuItem onClick={() => setSelectedQuote(quote)}>
                        <Eye className="w-4 h-4 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDownloadPDF(quote)}
                        disabled={isGeneratingPdf === quote.id}
                      >
                        {isGeneratingPdf === quote.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        PDF
                      </DropdownMenuItem>
                      {quote.status === "pending" && (
                        <DropdownMenuItem
                          onClick={() => handleConvertToInvoice(quote)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" /> Convert
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Edit className="w-4 h-4 mr-2" /> Status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(quote.id, "accepted")
                              }
                            >
                              Accepted
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(quote.id, "pending")
                              }
                            >
                              Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(quote.id, "rejected")
                              }
                            >
                              Rejected
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuItem
                        onClick={() => handleDeleteQuote(quote.id)}
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
        open={!!selectedQuote}
        onOpenChange={() => setSelectedQuote(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Quote Details {selectedQuote?.quote_number}
            </DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="py-4 space-y-4">
              <p>
                <strong>Client:</strong> {selectedQuote.client?.name}
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                {profile?.currency === "chf"
                  ? "CHF"
                  : profile?.currency === "usd"
                  ? "$"
                  : "€"}
                {selectedQuote.amount.toFixed(2)}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    selectedQuote.status
                  )}`}
                >
                  {getStatusText(selectedQuote.status)}
                </span>
              </p>
              <p>
                <strong>Issue date:</strong>{" "}
                {new Date(selectedQuote.issue_date).toLocaleDateString("fr-FR")}
              </p>
              {selectedQuote.expiry_date && (
                <p>
                  <strong>Expiration date:</strong>{" "}
                  {new Date(selectedQuote.expiry_date).toLocaleDateString(
                    "fr-FR"
                  )}
                </p>
              )}
              <div className="flex gap-2 mt-4 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPDF(selectedQuote)}
                  disabled={isGeneratingPdf === selectedQuote.id}
                >
                  {isGeneratingPdf === selectedQuote.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  PDF
                </Button>
                {selectedQuote.status === "pending" && (
                  <Button onClick={() => handleConvertToInvoice(selectedQuote)}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Convert
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteQuote(selectedQuote.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create a new quote</DialogTitle>
            <DialogDescription>
              Fill in the information manually or use AI.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4 -mr-4 grid gap-4 py-4">
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Fill manually
              </Button>
              <Button className="w-full" onClick={handleVoiceButtonClick}>
                <Mic className="w-4 h-4 mr-2" />
                Create with voice AI
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Client</Label>
                <div className="flex gap-2 mt-1">
                  <select
                    id="client"
                    value={newQuote.client_id}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, client_id: e.target.value })
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
                <Label htmlFor="expiry_date">Expiry date</Label>
                <DatePicker
                  date={newQuote.expiry_date}
                  setDate={(date) =>
                    setNewQuote({ ...newQuote, expiry_date: date })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Items</Label>
              {newQuote.items.map((item, index) => (
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
                    disabled={newQuote.items.length <= 1}
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
                  value={newQuote.tax_rate}
                  onChange={(e) =>
                    setNewQuote({ ...newQuote, tax_rate: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div className="text-right self-end">
                <p className="text-muted-foreground">Total including tax</p>
                <p className="text-2xl font-bold">
                  {profile?.currency === "chf"
                    ? "CHF"
                    : profile?.currency === "usd"
                    ? "$"
                    : "€"}
                  {calculateTotal(newQuote.items, newQuote.tax_rate).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsQuoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateQuote}>Create Quote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateClientDialog
        isOpen={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
};

export default Quotes;
