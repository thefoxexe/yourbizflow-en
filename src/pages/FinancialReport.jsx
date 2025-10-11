import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Loader2,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Users,
  FileWarning,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/customSupabaseClient";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  format,
  parse,
  startOfMonth,
  endOfMonth,
  startOfToday,
  getMonth,
  getYear,
  isBefore,
  differenceInCalendarMonths,
  addMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FinancialReport = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [availableMonths, setAvailableMonths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingPdfFor, setGeneratingPdfFor] = useState(null);
  const [reportData, setReportData] = useState(null);

  const currencySymbol = useMemo(() => {
    const currency = profile?.currency || "eur";
    if (currency === "usd") return "$";
    if (currency === "chf") return "CHF";
    return "€";
  }, [profile]);

  const formatCurrency = (value) =>
    `${value != null ? currencySymbol : ""}${
      value != null ? value.toFixed(2) : "N/A"
    }`;

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user) return;
      setIsLoading(true);

      const today = startOfToday();
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);

      const [
        { data: allInvoices, error: allInvoicesError },
        { data: allExpenses, error: allExpensesError },
        { data: allRevenues, error: allRevenuesError },
        { data: allSoldItems, error: allSoldItemsError },
        { data: allEmployees, error: allEmployeesError },
        { data: allSubscriptions, error: allSubscriptionsError },
        { data: monthInvoices, error: monthInvoicesError },
        { data: monthExpenses, error: monthExpensesError },
        { data: monthRevenues, error: monthRevenuesError },
        { data: monthNewClients, error: monthNewClientsError },
        { data: monthSoldItems, error: monthSoldItemsError },
      ] = await Promise.all([
        supabase
          .from("invoices")
          .select("issue_date, status")
          .eq("user_id", user.id),
        supabase.from("expenses").select("expense_date").eq("user_id", user.id),
        supabase.from("revenues").select("revenue_date").eq("user_id", user.id),
        supabase
          .from("inventory_items")
          .select("sold_at")
          .eq("user_id", user.id)
          .eq("status", "sold"),
        supabase.from("employees").select("created_at").eq("user_id", user.id),
        supabase
          .from("customer_subscriptions")
          .select("start_date, canceled_at")
          .eq("user_id", user.id),
        supabase
          .from("invoices")
          .select("*, client:clients(name)")
          .eq("user_id", user.id)
          .gte("issue_date", format(monthStart, "yyyy-MM-dd"))
          .lte("issue_date", format(monthEnd, "yyyy-MM-dd")),
        supabase
          .from("expenses")
          .select("*")
          .eq("user_id", user.id)
          .gte("expense_date", format(monthStart, "yyyy-MM-dd"))
          .lte("expense_date", format(monthEnd, "yyyy-MM-dd")),
        supabase
          .from("revenues")
          .select("*")
          .eq("user_id", user.id)
          .gte("revenue_date", format(monthStart, "yyyy-MM-dd"))
          .lte("revenue_date", format(monthEnd, "yyyy-MM-dd")),
        supabase
          .from("clients")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", format(monthStart, "yyyy-MM-dd"))
          .lte("created_at", format(monthEnd, "yyyy-MM-dd")),
        supabase
          .from("inventory_items")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "sold")
          .gte("sold_at", format(monthStart, "yyyy-MM-dd"))
          .lte("sold_at", format(monthEnd, "yyyy-MM-dd")),
      ]);

      const { data: monthEmployees } = await supabase
        .from("employees")
        .select("gross_salary")
        .eq("user_id", user.id);
      const { data: monthSubscriptions } = await supabase
        .from("customer_subscriptions")
        .select("*, subscription_product_id(price, interval)")
        .eq("user_id", user.id);

      if (
        allInvoicesError ||
        allExpensesError ||
        monthInvoicesError ||
        monthExpensesError ||
        monthNewClientsError ||
        allRevenuesError ||
        monthRevenuesError ||
        allSoldItemsError ||
        monthSoldItemsError ||
        allEmployeesError ||
        allSubscriptionsError
      ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Unable to load report data.",
        });
        setIsLoading(false);
        return;
      }

      const dates = [
        ...allInvoices.map((d) => d.issue_date),
        ...allExpenses.map((d) => d.expense_date),
        ...allRevenues.map((d) => d.revenue_date),
        ...allSoldItems.map((d) => d.sold_at),
        ...allEmployees.map((d) => d.created_at),
        ...allSubscriptions.map((d) => d.start_date),
      ]
        .filter(Boolean)
        .map((d) => new Date(d));

      if (dates.length > 0) {
        const earliestDate = new Date(Math.min.apply(null, dates));
        const monthCount = differenceInCalendarMonths(today, earliestDate) + 1;
        const allMonths = Array.from({ length: monthCount }, (_, i) =>
          format(addMonths(earliestDate, i), "yyyy-MM")
        );
        setAvailableMonths(allMonths.reverse());
      }

      const processData = (
        invoices,
        expenses,
        revenues,
        clients,
        soldItems,
        employees,
        subscriptions,
        currentMonth
      ) => {
        const paidInvoiceRevenue = invoices
          .filter((inv) => inv.status === "paid")
          .reduce((sum, inv) => sum + inv.amount, 0);
        const productSaleRevenue = soldItems.reduce(
          (sum, item) => sum + (item.sale_price || 0),
          0
        );
        const miscRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);

        let subscriptionRevenue = 0;
        subscriptions.forEach((sub) => {
          const subStartDate = new Date(sub.start_date);
          if (isBefore(subStartDate, endOfMonth(currentMonth))) {
            if (
              sub.status === "active" ||
              (sub.status === "canceled" &&
                sub.canceled_at &&
                isBefore(currentMonth, startOfMonth(new Date(sub.canceled_at))))
            ) {
              const pricePerMonth =
                sub.subscription_product_id.interval === "year"
                  ? sub.subscription_product_id.price / 12
                  : sub.subscription_product_id.price;
              subscriptionRevenue += pricePerMonth;
            }
          }
        });

        const totalRevenue =
          paidInvoiceRevenue +
          productSaleRevenue +
          miscRevenue +
          subscriptionRevenue;

        const unpaidAmount = invoices
          .filter((inv) => ["pending", "overdue"].includes(inv.status))
          .reduce((sum, inv) => sum + inv.amount, 0);

        const cogs = soldItems.reduce(
          (sum, item) => sum + (item.purchase_price || 0),
          0
        );
        const otherExpenses = expenses.reduce(
          (sum, exp) => sum + exp.amount,
          0
        );
        const payroll = employees.reduce(
          (sum, emp) => sum + (emp.gross_salary || 0),
          0
        );
        const totalExpenses = cogs + otherExpenses + payroll;

        const netResult = totalRevenue - totalExpenses;

        return {
          totalRevenue,
          paidInvoiceRevenue,
          productSaleRevenue,
          miscRevenue,
          subscriptionRevenue,
          unpaidAmount,
          newClientsCount: clients.length,
          totalExpenses,
          cogs,
          payroll,
          otherExpenses,
          netResult,
        };
      };

      setReportData(
        processData(
          monthInvoices,
          monthExpenses,
          monthRevenues,
          monthNewClients,
          monthSoldItems,
          monthEmployees,
          monthSubscriptions,
          today
        )
      );
      setIsLoading(false);
    };

    fetchReportData();
  }, [user, toast]);

  const handleGenerateReport = async (monthYear) => {
    setGeneratingPdfFor(monthYear);

    const targetDate = parse(monthYear, "yyyy-MM", new Date());
    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);

    const formattedStartDate = format(
      startDate,
      "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
    );
    const formattedEndDate = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    const [
      { data: invoicesData, error: invoicesError },
      { data: expensesData, error: expensesError },
      { data: revenuesData, error: revenuesError },
      { data: newClientsData, error: newClientsError },
      { data: soldItemsData, error: soldItemsError },
      { data: employeesData, error: employeesError },
      { data: subscriptionsData, error: subscriptionsError },
    ] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, client:clients(name)")
        .eq("user_id", user.id)
        .gte("issue_date", format(startDate, "yyyy-MM-dd"))
        .lte("issue_date", format(endDate, "yyyy-MM-dd")),
      supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .gte("expense_date", format(startDate, "yyyy-MM-dd"))
        .lte("expense_date", format(endDate, "yyyy-MM-dd")),
      supabase
        .from("revenues")
        .select("*")
        .eq("user_id", user.id)
        .gte("revenue_date", format(startDate, "yyyy-MM-dd"))
        .lte("revenue_date", format(endDate, "yyyy-MM-dd")),
      supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", formattedStartDate)
        .lte("created_at", formattedEndDate),
      supabase
        .from("inventory_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "sold")
        .gte("sold_at", format(startDate, "yyyy-MM-dd"))
        .lte("sold_at", format(endDate, "yyyy-MM-dd")),
      supabase
        .from("employees")
        .select("*")
        .eq("user_id", user.id)
        .lte("hire_date", format(endDate, "yyyy-MM-dd")),
      supabase
        .from("customer_subscriptions")
        .select(
          "*, client:clients(name), subscription_product_id(name, price, interval)"
        )
        .eq("user_id", user.id),
    ]);

    if (
      invoicesError ||
      expensesError ||
      newClientsError ||
      revenuesError ||
      soldItemsError ||
      employeesError ||
      subscriptionsError
    ) {
      setGeneratingPdfFor(null);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to retrieve financial data.",
      });
      return;
    }

    await generatePDF(
      {
        invoices: invoicesData,
        expenses: expensesData,
        revenues: revenuesData,
        newClients: newClientsData,
        soldItems: soldItemsData,
        employees: employeesData,
        subscriptions: subscriptionsData,
      },
      startDate,
      endDate
    );
    setGeneratingPdfFor(null);
  };

  const generatePDF = async (data, reportStartDate, reportEndDate) => {
    const {
      invoices,
      expenses,
      revenues,
      newClients,
      soldItems,
      employees,
      subscriptions,
    } = data;
    const doc = new jsPDF();

    const addContent = async () => {
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("Financial Report", doc.internal.pageSize.getWidth() / 2, 100, {
        align: "center",
      });

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(
        profile?.company_name || "Your Company",
        doc.internal.pageSize.getWidth() / 2,
        120,
        { align: "center" }
      );

      doc.setFontSize(12);
      doc.text(
        `Period from ${format(reportStartDate, "dd/MM/yyyy", {
          locale: fr,
        })} to ${format(reportEndDate, "dd/MM/yyyy", { locale: fr })}`,
        doc.internal.pageSize.getWidth() / 2,
        130,
        { align: "center" }
      );

      doc.setFontSize(10);
      doc.text(
        `Generated on ${format(new Date(), "dd/MM/yyyy", { locale: fr })}`,
        doc.internal.pageSize.getWidth() / 2,
        140,
        { align: "center" }
      );

      const paidInvoices = invoices.filter((inv) => inv.status === "paid");
      const unpaidInvoices = invoices.filter((inv) =>
        ["pending", "overdue"].includes(inv.status)
      );

      const totalInvoiceRevenue = paidInvoices.reduce(
        (sum, inv) => sum + inv.amount,
        0
      );
      const totalProductSaleRevenue = soldItems.reduce(
        (sum, item) => sum + (item.sale_price || 0),
        0
      );
      const totalMiscRevenue = revenues.reduce(
        (sum, rev) => sum + rev.amount,
        0
      );

      let totalSubscriptionRevenue = 0;
      const monthSubscriptions = [];
      subscriptions.forEach((sub) => {
        const subStartDate = new Date(sub.start_date);
        if (isBefore(subStartDate, reportEndDate)) {
          if (
            sub.status === "active" ||
            (sub.status === "canceled" &&
              sub.canceled_at &&
              isBefore(reportStartDate, new Date(sub.canceled_at)))
          ) {
            const pricePerMonth =
              sub.subscription_product_id.interval === "year"
                ? sub.subscription_product_id.price / 12
                : sub.subscription_product_id.price;
            totalSubscriptionRevenue += pricePerMonth;
            monthSubscriptions.push({ ...sub, pricePerMonth });
          }
        }
      });

      const totalRevenue =
        totalInvoiceRevenue +
        totalProductSaleRevenue +
        totalMiscRevenue +
        totalSubscriptionRevenue;

      const totalUnpaidAmount = unpaidInvoices.reduce(
        (sum, inv) => sum + inv.amount,
        0
      );

      const cogs = soldItems.reduce(
        (sum, item) => sum + (item.purchase_price || 0),
        0
      );
      const otherExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const payroll = employees.reduce((sum, emp) => sum + emp.gross_salary, 0);
      const totalExpenses = cogs + otherExpenses + payroll;
      const netResult = totalRevenue - totalExpenses;

      doc.addPage();
      doc.setFontSize(18);
      doc.text("Financial Summary", 14, 20);

      const summaryData = [
        ["Revenue (received)", `${currencySymbol}${totalRevenue.toFixed(2)}`],
        ["Unpaid invoices", `${currencySymbol}${totalUnpaidAmount.toFixed(2)}`],
        ["New Clients", `${newClients.length}`],
        ["Total Expenses", `${currencySymbol}${totalExpenses.toFixed(2)}`],
        ["Net Result", `${currencySymbol}${netResult.toFixed(2)}`],
      ];
      doc.autoTable({
        startY: 30,
        head: [["Indicator", "Value"]],
        body: summaryData,
        theme: "striped",
        headStyles: { fillColor: [38, 38, 38] },
        styles: { fontSize: 12 },
        bodyStyles: {
          didParseCell: function (data) {
            if (data.row.index === 4) {
              // Net Result
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.textColor =
                netResult >= 0 ? [0, 128, 0] : [255, 0, 0];
            }
          },
        },
      });

      let finalY = doc.lastAutoTable.finalY || 30;

      const addSection = (title, data, columns, startY) => {
        if (data.length > 0) {
          doc.setFontSize(14);
          doc.text(title, 14, startY + 15);
          doc.autoTable({
            startY: startY + 20,
            head: [columns],
            body: data,
            theme: "striped",
            headStyles: { fillColor: [38, 38, 38] },
          });
          return doc.lastAutoTable.finalY;
        }
        return startY;
      };

      finalY = addSection(
        "Invoices Cashed",
        paidInvoices.map((inv) => [
          inv.invoice_number,
          inv.client?.name || "N/A",
          format(new Date(inv.issue_date), "dd/MM/yyyy"),
          `${currencySymbol}${inv.amount.toFixed(2)}`,
        ]),
        ["Number", "Customer", "Date", "Amount"],
        finalY
      );
      finalY = addSection(
        "Subscription Revenue",
        monthSubscriptions.map((sub) => [
          sub.client?.name || "Anonymous Subscriber",
          sub.subscription_product_id.name,
          `${currencySymbol}${sub.pricePerMonth.toFixed(2)}`,
        ]),
        ["Client / Subscriber", "Plan", "Monthly Amount"],
        finalY
      );
      finalY = addSection(
        "Product Sales",
        soldItems.map((item) => [
          item.name,
          format(new Date(item.sold_at), "dd/MM/yyyy"),
          `${currencySymbol}${(item.sale_price || 0).toFixed(2)}`,
        ]),
        ["Product", "Sale Date", "Amount"],
        finalY
      );
      finalY = addSection(
        "Money receipts (Miscellaneous)",
        revenues.map((rev) => [
          rev.description,
          format(new Date(rev.revenue_date), "dd/MM/yyyy"),
          `${currencySymbol}${rev.amount.toFixed(2)}`,
        ]),
        ["Description", "Date", "Amount"],
        finalY
      );
      finalY = addSection(
        "Salaries",
        employees.map((emp) => [
          emp.name,
          emp.position,
          `${currencySymbol}${emp.gross_salary.toFixed(2)}`,
        ]),
        ["Employee", "Position", "Gross Salary"],
        finalY
      );
      finalY = addSection(
        "Cost of Goods Sold",
        soldItems.map((item) => [
          item.name,
          format(new Date(item.sold_at), "dd/MM/yyyy"),
          `${currencySymbol}${(item.purchase_price || 0).toFixed(2)}`,
        ]),
        ["Product", "Sale Date", "Cost"],
        finalY
      );
      finalY = addSection(
        "General Expenses",
        expenses.map((exp) => [
          format(new Date(exp.expense_date), "dd/MM/yyyy"),
          exp.category || "N/A",
          exp.description || "N/A",
          exp.spent_by || "",
          `${currencySymbol}${exp.amount.toFixed(2)}`,
        ]),
        ["Date", "Category", "Description", "Spent by", "Amount"],
        finalY
      );
      finalY = addSection(
        "Unpaid Invoices",
        unpaidInvoices.map((inv) => [
          inv.invoice_number,
          inv.client?.name || "N/A",
          format(new Date(inv.due_date), "dd/MM/yyyy"),
          `${currencySymbol}${inv.amount.toFixed(2)}`,
        ]),
        ["Number", "Customer", "Due", "Amount"],
        finalY
      );

      doc.save(`financial-report-${format(reportStartDate, "yyyy-MM")}.pdf`);
    };

    if (profile?.company_logo_url) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = profile.company_logo_url;
      img.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL("image/png");
          doc.addImage(
            dataURL,
            "PNG",
            doc.internal.pageSize.getWidth() / 2 - 15,
            20,
            30,
            30
          );
        } catch (e) {
          console.error("Error adding image to PDF", e);
        }
        await addContent();
      };
      img.onerror = async () => {
        console.error("Could not load logo image for PDF.");
        await addContent();
      };
    } else {
      await addContent();
    }
  };

  const formatMonth = (monthYear) => {
    const date = parse(monthYear, "yyyy-MM", new Date());
    return format(date, "MMMM yyyy", { locale: fr });
  };

  const renderSummaryCard = (
    title,
    value,
    icon,
    colorClass = "text-foreground"
  ) => (
    <Card className="bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      </CardContent>
    </Card>
  );

  const renderDetailRow = (label, value) => (
    <div className="flex justify-between items-center py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{formatCurrency(value)}</span>
    </div>
  );

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Financial Reports - YourBizFlow</title>
        <meta
          name="description"
          content="View your detailed financial reports and download them as PDF."
        />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Financial Reports
        </h1>
        <p className="text-muted-foreground">
          Your financial statement, in real time and in archives.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-4 capitalize">
          Review of {format(new Date(), "MMMM yyyy", { locale: fr })}
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-muted/50 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderSummaryCard(
              "Revenue",
              formatCurrency(reportData?.totalRevenue),
              <TrendingUp className="h-4 w-4 text-muted-foreground" />,
              "text-green-500"
            )}
            {renderSummaryCard(
              "Total Expenses",
              formatCurrency(reportData?.totalExpenses),
              <TrendingDown className="h-4 w-4 text-muted-foreground" />,
              "text-red-500"
            )}
            {renderSummaryCard(
              "Net result",
              formatCurrency(reportData?.netResult),
              <FileCheck2 className="h-4 w-4 text-muted-foreground" />,
              reportData?.netResult >= 0 ? "text-green-500" : "text-red-500"
            )}
            {renderSummaryCard(
              "Unpaid Invoices",
              formatCurrency(reportData?.unpaidAmount),
              <FileWarning className="h-4 w-4 text-muted-foreground" />,
              "text-yellow-500"
            )}
            {renderSummaryCard(
              "New Clients",
              reportData?.newClientsCount || 0,
              <Users className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger className="text-xl font-bold">
              See month details
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Revenue details
                  </h3>
                  {isLoading ? (
                    <div className="h-40 bg-muted/50 rounded-md animate-pulse"></div>
                  ) : (
                    <div className="space-y-2 divide-y divide-border/50">
                      {renderDetailRow(
                        "Paid Invoices",
                        reportData?.paidInvoiceRevenue
                      )}
                      {renderDetailRow(
                        "Subscriptions",
                        reportData?.subscriptionRevenue
                      )}
                      {renderDetailRow(
                        "Product Sales",
                        reportData?.productSaleRevenue
                      )}
                      {renderDetailRow(
                        "Money Inflows (Miscellaneous)",
                        reportData?.miscRevenue
                      )}
                      <div className="flex justify-between items-center font-bold pt-3">
                        <span>Total revenue</span>
                        <span>{formatCurrency(reportData?.totalRevenue)}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Expense details
                  </h3>
                  {isLoading ? (
                    <div className="h-40 bg-muted/50 rounded-md animate-pulse"></div>
                  ) : reportData?.totalExpenses > 0 ? (
                    <div className="space-y-2 divide-y divide-border/50">
                      {renderDetailRow(
                        "Salaries (gross payroll)",
                        reportData?.payroll
                      )}
                      {renderDetailRow("Cost of goods", reportData?.cogs)}
                      {renderDetailRow(
                        "General Expenses",
                        reportData?.otherExpenses
                      )}
                      <div className="flex justify-between items-center font-bold pt-3">
                        <span>Total expenses</span>
                        <span>{formatCurrency(reportData?.totalExpenses)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-10">
                      No spending this month.
                    </p>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 max-w-2xl mx-auto"
      >
        <h3 className="text-xl font-bold text-foreground mb-4">
          Monthly Archives
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span className="text-muted-foreground">Loading periods...</span>
          </div>
        ) : availableMonths.length > 0 ? (
          <div className="space-y-3">
            {availableMonths.map((month) => (
              <div
                key={month}
                className="flex items-center justify-between p-4 bg-secondary rounded-lg"
              >
                <span className="font-medium capitalize">
                  {formatMonth(month)}
                </span>
                <Button
                  onClick={() => handleGenerateReport(month)}
                  disabled={generatingPdfFor === month}
                  size="sm"
                >
                  {generatingPdfFor === month ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Generation...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" /> Generate PDF
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No financial data</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start by creating invoices or recording expenses to see your
              monthly reports here.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FinancialReport;
