import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/customSupabaseClient";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  ShoppingCart,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  Search,
  Filter,
  UserPlus,
  PackagePlus,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet";
import CreateClientDialog from "@/components/CreateClientDialog";
import ProductForm, { initialProductState } from "@/components/ProductForm";

const OrderManagement = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const currencySymbol = useMemo(
    () =>
      profile?.currency === "usd"
        ? "$"
        : profile?.currency === "chf"
        ? "CHF"
        : "€",
    [profile]
  );
  const orderStatuses = useMemo(() => profile?.order_statuses || [], [profile]);

  const fetchInitialData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [ordersRes, clientsRes, productsRes] = await Promise.all([
      supabase
        .from("orders")
        .select("*, clients (name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name").eq("user_id", user.id),
      supabase
        .from("cost_calculator_products")
        .select(
          "id, name, sale_price, cost_of_goods, shipping_cost, marketing_cost, platform_fee_percent, other_fees, stock"
        )
        .eq("user_id", user.id),
    ]);

    if (ordersRes.error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load orders.",
      });
    else setOrders(ordersRes.data);

    if (clientsRes.error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load clients.",
      });
    else setClients(clientsRes.data);

    if (productsRes.error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load products.",
      });
    else setProducts(productsRes.data);

    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleOpenOrderDialog = (order = null) => {
    if (order) {
      setEditingOrder(order);
      setCurrentOrder({ ...order });
    } else {
      setEditingOrder(null);
      setCurrentOrder({
        client_id: "",
        products: [{ product_id: "", quantity: 1, price: 0 }],
        status: orderStatuses[0]?.id || "in_preparation",
        notes: "",
      });
    }
    setIsOrderDialogOpen(true);
  };

  const handleSaveOrder = async () => {
    if (
      !currentOrder.client_id ||
      currentOrder.products.some((p) => !p.product_id)
    ) {
      toast({
        variant: "destructive",
        title: "Required fields",
        description: "Please select a customer and products.",
      });
      return;
    }

    const total_amount = currentOrder.products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
    const order_reference = `CMD-${Date.now().toString().slice(-6)}`;

    const payload = {
      ...currentOrder,
      user_id: user.id,
      total_amount,
      order_reference: editingOrder
        ? currentOrder.order_reference
        : order_reference,
      products: currentOrder.products.map(
        ({ product_id, quantity, price, name }) => ({
          product_id,
          quantity,
          price,
          name,
        })
      ),
    };

    let error;
    if (editingOrder) {
      ({ error } = await supabase
        .from("orders")
        .update(payload)
        .eq("id", editingOrder.id));
    } else {
      ({ error } = await supabase.from("orders").insert(payload));
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The command could not be saved.",
      });
    } else {
      toast({
        title: "Success!",
        description: `Order ${editingOrder ? "updated" : "created"}.`,
      });
      setIsOrderDialogOpen(false);
      fetchInitialData();
    }
  };

  const restoreStock = async (order) => {
    for (const item of order.products) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product || product.stock === null) continue;

      const { data: currentProduct, error } = await supabase
        .from("cost_calculator_products")
        .select("stock")
        .eq("id", product.id)
        .single();

      if (error) continue;

      const newStock = (currentProduct.stock || 0) + item.quantity;
      await supabase
        .from("cost_calculator_products")
        .update({ stock: newStock })
        .eq("id", product.id);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    // DB trigger 'handle_order_delete' will handle restoring stock and deleting financials.
    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to delete command.",
      });
    } else {
      toast({
        title: "Order deleted",
        description: "Inventory and financials have been updated.",
      });
      fetchInitialData();
    }
  };

  const processStockAndFinance = async (order) => {
    const transactionDate = new Date().toISOString();
    for (const item of order.products) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) continue;

      const quantity = item.quantity;

      if (product.stock !== null) {
        const { data: currentProduct, error } = await supabase
          .from("cost_calculator_products")
          .select("stock")
          .eq("id", product.id)
          .single();

        if (error) continue;

        const newStock = (currentProduct.stock || 0) - quantity;
        await supabase
          .from("cost_calculator_products")
          .update({ stock: newStock })
          .eq("id", product.id);
      }

      const parse = (v) => parseFloat(String(v || "0").replace(",", ".")) || 0;
      const salePrice = parse(item.price);
      const platformFee =
        salePrice * (parse(product.platform_fee_percent) / 100);
      const totalCost =
        parse(product.cost_of_goods) +
        parse(product.shipping_cost) +
        parse(product.marketing_cost) +
        platformFee +
        parse(product.other_fees);

      await supabase.from("revenues").insert({
        user_id: user.id,
        amount: salePrice * quantity,
        description: `Sale of ${quantity} x ${product.name} (Order ${order.order_reference})`,
        revenue_date: transactionDate,
        source_type: "order",
        source_id: order.id,
      });
      await supabase.from("expenses").insert({
        user_id: user.id,
        amount: totalCost * quantity,
        category: "Cost of goods sold",
        description: `Cost for sale of ${quantity} x ${product.name} (Order ${order.order_reference})`,
        expense_date: transactionDate,
        source_type: "order_cost",
        source_id: order.id,
      });
    }
    await supabase
      .from("orders")
      .update({ stock_processed: true })
      .eq("id", order.id);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to update status.",
      });
      return;
    }

    toast({ title: "Status updated" });

    const shouldProcessStock =
      (newStatus === "shipped" || newStatus === "delivered") &&
      !order.stock_processed;
    const shouldRestoreStock =
      newStatus === "cancelled" && order.stock_processed;

    if (shouldProcessStock) {
      await processStockAndFinance({ ...order, status: newStatus });
      toast({ title: "Accounting & Stock updated!" });
    } else if (shouldRestoreStock) {
      // The handle_order_delete trigger only fires ON DELETE, so we do it manually here for 'cancelled' status.
      await restoreStock(order);
      await supabase
        .from("revenues")
        .delete()
        .match({ source_type: "order", source_id: order.id });
      await supabase
        .from("expenses")
        .delete()
        .match({ source_type: "order_cost", source_id: order.id });
      await supabase
        .from("orders")
        .update({ stock_processed: false })
        .eq("id", order.id);
      toast({ title: "Stock and finances restored!" });
    }

    fetchInitialData();
  };

  const handleProductChange = (index, productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const updatedProducts = [...currentOrder.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      product_id: productId,
      price: parseFloat(String(product.sale_price).replace(",", ".")) || 0,
      name: product.name,
    };
    setCurrentOrder((prev) => ({ ...prev, products: updatedProducts }));
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedProducts = [...currentOrder.products];
    updatedProducts[index].quantity = parseInt(quantity, 10) || 1;
    setCurrentOrder((prev) => ({ ...prev, products: updatedProducts }));
  };

  const addProductLine = () => {
    setCurrentOrder((prev) => ({
      ...prev,
      products: [...prev.products, { product_id: "", quantity: 1, price: 0 }],
    }));
  };

  const removeProductLine = (index) => {
    const updatedProducts = currentOrder.products.filter((_, i) => i !== index);
    setCurrentOrder((prev) => ({ ...prev, products: updatedProducts }));
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const clientName = order.clients?.name || "";
      const searchMatch =
        order.order_reference
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch =
        statusFilter === "all" || order.status === statusFilter;
      return searchMatch && statusMatch;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleClientCreated = (newClient) => {
    setClients((prev) => [newClient, ...prev]);
    setCurrentOrder((prev) => ({ ...prev, client_id: newClient.id }));
    setIsClientDialogOpen(false);
  };

  const handleProductCreated = async (newProductData) => {
    const { data, error } = await supabase
      .from("cost_calculator_products")
      .insert({ ...newProductData, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The product could not be created.",
      });
    } else {
      toast({ title: "Success", description: `Product created.` });
      setProducts((prev) => [data, ...prev]);
      setIsProductDialogOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Order Management - YourBizFlow</title>
        <meta
          name="description"
          content="Manage your customer order processing cycle, from preparation to delivery."
        />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Order Management
          </h1>
          <p className="text-muted-foreground">
            Track your orders from preparation to delivery.
          </p>
        </div>
        <Button onClick={() => handleOpenOrderDialog()}>
          <PlusCircle className="w-4 h-4 mr-2" /> New Order
        </Button>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>List of orders</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by ref. or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {orderStatuses.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const statusInfo = orderStatuses.find(
                      (s) => s.id === order.status
                    );
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.order_reference}
                        </TableCell>
                        <TableCell>
                          {order.clients?.name || "Customer deleted"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.created_at), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium border",
                              statusInfo?.color
                            )}
                          >
                            {statusInfo?.label || order.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {order.total_amount.toFixed(2)} {currencySymbol}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => handleOpenOrderDialog(order)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  Change status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {orderStatuses.map((s) => (
                                    <DropdownMenuItem
                                      key={s.id}
                                      onClick={() =>
                                        handleUpdateStatus(order.id, s.id)
                                      }
                                    >
                                      {s.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuItem
                                onClick={() => handleDeleteOrder(order.id)}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-24 text-muted-foreground"
                    >
                      No commands found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="sm:hidden space-y-4">
            {loading ? (
              <div className="text-center p-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const statusInfo = orderStatuses.find(
                  (s) => s.id === order.status
                );
                return (
                  <Card key={order.id} className="bg-card/50">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {order.order_reference}
                          </CardTitle>
                          <CardDescription>
                            {order.clients?.name || "Customer deleted"}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="-mt-2 -mr-2"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleOpenOrderDialog(order)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                Change status
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {orderStatuses.map((s) => (
                                  <DropdownMenuItem
                                    key={s.id}
                                    onClick={() =>
                                      handleUpdateStatus(order.id, s.id)
                                    }
                                  >
                                    {s.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-red-500 focus:text-red-500"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {format(new Date(order.created_at), "dd MMM yyyy")}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border",
                            statusInfo?.color
                          )}
                        >
                          {statusInfo?.label || order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold text-lg">
                          {order.total_amount.toFixed(2)} {currencySymbol}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No orders.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isOrderDialogOpen && currentOrder && (
        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
          <DialogContent className="w-full max-w-md sm:max-w-xl md:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? "Edit order" : "New order"}
              </DialogTitle>
              <DialogDescription>
                {editingOrder
                  ? `Ref: ${editingOrder.order_reference}`
                  : "Enter the order details."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-3 -mr-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <div className="flex gap-2">
                    <Select
                      value={currentOrder.client_id}
                      onValueChange={(value) =>
                        setCurrentOrder((prev) => ({
                          ...prev,
                          client_id: value,
                        }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsClientDialogOpen(true)}
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={currentOrder.status}
                    onValueChange={(value) =>
                      setCurrentOrder((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Products</Label>
                <div className="space-y-3 mt-2">
                  {currentOrder.products.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_80px_100px_auto] items-center gap-2"
                    >
                      <Select
                        value={item.product_id}
                        onValueChange={(value) =>
                          handleProductChange(index, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                        placeholder="Qty"
                        className="w-20"
                      />
                      <Input
                        value={`${item.price.toFixed(2)}`}
                        readOnly
                        className="bg-secondary text-center w-24"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProductLine(index)}
                        className="hidden sm:inline-flex"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={addProductLine}>
                    Add product
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsProductDialogOpen(true)}
                  >
                    <PackagePlus className="w-4 h-4 mr-2" />
                    Create product
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Internal notes</Label>
                <Textarea
                  id="notes"
                  value={currentOrder.notes || ""}
                  onChange={(e) =>
                    setCurrentOrder((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="mt-4 text-right">
                <p className="text-lg font-bold">
                  Total:{" "}
                  {currentOrder.products
                    .reduce((sum, p) => sum + p.price * p.quantity, 0)
                    .toFixed(2)}{" "}
                  {currencySymbol}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOrderDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveOrder}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <CreateClientDialog
        isOpen={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        onClientCreated={handleClientCreated}
      />
      <ProductForm
        product={initialProductState}
        onSave={handleProductCreated}
        onCancel={() => setIsProductDialogOpen(false)}
        currencySymbol={currencySymbol}
        isOpen={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
      />
    </div>
  );
};

export default OrderManagement;
