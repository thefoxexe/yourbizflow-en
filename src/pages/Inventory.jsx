import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PlusCircle,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  PackageOpen,
  Search,
  PackageCheck,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Inventory = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("available");

  const currencySymbol = useMemo(
    () =>
      profile?.currency === "usd"
        ? "$"
        : profile?.currency === "chf"
        ? "CHF"
        : "€",
    [profile]
  );

  const fetchItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load inventory.",
      });
    } else {
      setItems(data.filter((item) => item.status === "available"));
      setSoldItems(data.filter((item) => item.status === "sold"));
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenDialog = (item = null) => {
    setCurrentItem(
      item || {
        name: "",
        sku: "",
        quantity: 1,
        purchase_price: "",
        sale_price: "",
      }
    );
    setIsDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!currentItem.name) {
      toast({
        variant: "destructive",
        title: "Required Field",
        description: "The name is required.",
      });
      return;
    }

    const itemToSave = {
      ...currentItem,
      user_id: user.id,
      purchase_price: parseFloat(currentItem.purchase_price) || 0,
      sale_price: parseFloat(currentItem.sale_price) || 0,
      quantity: parseInt(currentItem.quantity) || 1,
      status: "available",
    };

    let error;
    if (currentItem.id) {
      ({ error } = await supabase
        .from("inventory_items")
        .update(itemToSave)
        .eq("id", currentItem.id));
    } else {
      const { id, ...insertData } = itemToSave;
      ({ error } = await supabase.from("inventory_items").insert(insertData));
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The article could not be saved.",
      });
    } else {
      toast({
        title: "Success!",
        description: `Item ${currentItem.id ? "updated" : "added"}.`,
      });
      setIsDialogOpen(false);
      fetchItems();
    }
  };

  const handleDeleteItem = async (itemId) => {
    setIsDeleting(true);
    const { error } = await supabase
      .from("inventory_items")
      .delete()
      .eq("id", itemId);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The article could not be deleted.",
      });
    } else {
      toast({ title: "Article deleted." });
      fetchItems();
    }
    setIsDeleting(false);
  };

  const handleMarkAsSold = async (item) => {
    const soldItem = {
      ...item,
      status: "sold",
      sold_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("inventory_items")
      .update(soldItem)
      .eq("id", item.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to mark item as sold.",
      });
    } else {
      // Record revenue and expense
      const income = {
        user_id: user.id,
        amount: item.sale_price,
        description: `Sale of ${item.name}`,
        revenue_date: soldItem.sold_at,
        source_type: "inventory_item",
        source_id: item.id,
      };
      const expense = {
        user_id: user.id,
        amount: item.purchase_price,
        category: "Cost of goods sold",
        description: `Cost for ${item.name}`,
        expense_date: soldItem.sold_at,
        source_type: "inventory_item",
        source_id: item.id,
      };

      await supabase.from("revenue").insert(revenue);
      await supabase.from("expenses").insert(expenses);

      toast({
        title: "Item sold!",
        description: "Income and expense have been recorded.",
      });
      fetchItems();
    }
  };

  const filteredAvailableItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredSoldItems = soldItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderList = (data, isSoldList) => (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>
                {isSoldList ? "Selling Price" : "Purchase Price"}
              </TableHead>
              <TableHead>{isSoldList ? "Sale Date" : "Added Date"}</TableHead>
              <TableHead className="text-right">Potential Profit</TableHead>
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
            ) : data.length > 0 ? (
              data.map((item) => {
                const profit =
                  (item.sale_price || 0) - (item.purchase_price || 0);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku || "N/A"}</TableCell>
                    <TableCell>
                      {isSoldList
                        ? item.sale_price?.toFixed(2)
                        : item.purchase_price?.toFixed(2)}{" "}
                      {currencySymbol}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(isSoldList ? item.sold_at : item.created_at),
                        "dd MMM yyyy",
                        { locale: fr }
                      )}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        profit > 0
                          ? "text-green-500"
                          : profit < 0
                          ? "text-red-500"
                          : ""
                      }`}
                    >
                      {profit.toFixed(2)} {currencySymbol}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {!isSoldList && (
                            <DropdownMenuItem
                              onClick={() => handleMarkAsSold(item)}
                            >
                              <PackageCheck className="mr-2 h-4 w-4" /> Mark as
                              sold
                            </DropdownMenuItem>
                          )}
                          {!isSoldList && (
                            <DropdownMenuItem
                              onClick={() => handleOpenDialog(item)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-500 focus:text-red-500"
                            disabled={isDeleting}
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
                  No articles found.
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
        ) : data.length > 0 ? (
          data.map((item) => {
            const profit = (item.sale_price || 0) - (item.purchase_price || 0);
            return (
              <Card key={item.id} className="bg-card/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription>
                        SKU: {item.sku || "N/A"}
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
                        {!isSoldList && (
                          <DropdownMenuItem
                            onClick={() => handleMarkAsSold(item)}
                          >
                            <PackageCheck className="mr-2 h-4 w-4" /> Mark as
                            sold
                          </DropdownMenuItem>
                        )}
                        {!isSoldList && (
                          <DropdownMenuItem
                            onClick={() => handleOpenDialog(item)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-500 focus:text-red-500"
                          disabled={isDeleting}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isSoldList ? "Sale Price" : "Purchase Price"}
                    </span>
                    <span>
                      {isSoldList
                        ? item.sale_price?.toFixed(2)
                        : item.purchase_price?.toFixed(2)}{" "}
                      {currencySymbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Potential Profit
                    </span>
                    <span
                      className={`font-semibold ${
                        profit > 0
                          ? "text-green-500"
                          : profit < 0
                          ? "text-red-500"
                          : ""
                      }`}
                    >
                      {profit.toFixed(2)} {currencySymbol}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t mt-2">
                    <span className="text-muted-foreground">
                      {isSoldList ? "Sale Date" : "Added Date"}
                    </span>
                    <span>
                      {format(
                        new Date(isSoldList ? item.sold_at : item.created_at),
                        "dd MMM yyyy",
                        { locale: fr }
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No articles in this category.
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Track your items from purchase to sale.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add item
        </Button>
      </motion.div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("available")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "available"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            Available ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("sold")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "sold"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            Sold ({soldItems.length})
          </button>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search for item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {activeTab === "available" ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageOpen className="w-5 h-5 text-primary" /> Available Items
              </CardTitle>
              <CardDescription>
                Items currently in stock, ready to sell.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderList(filteredAvailableItems, false)}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-green-500" />
                Sold Items
              </CardTitle>
              <CardDescription>History of items you have sold.</CardDescription>
            </CardHeader>
            <CardContent>{renderList(filteredSoldItems, true)}</CardContent>
          </Card>
        )}
      </motion.div>

      {isDialogOpen && currentItem && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentItem.id ? "Edit" : "Add"} an article
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={currentItem.name}
                  onChange={(e) =>
                    setCurrentItem((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU (Optional)</Label>
                <Input
                  id="sku"
                  value={currentItem.sku}
                  onChange={(e) =>
                    setCurrentItem((p) => ({ ...p, sku: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="purchase_price">
                  Purchase price ({currencySymbol})
                </Label>
                <Input
                  id="purchase_price"
                  type="number"
                  value={currentItem.purchase_price}
                  onChange={(e) =>
                    setCurrentItem((p) => ({
                      ...p,
                      purchase_price: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="sale_price">
                  Sale price ({currencySymbol})
                </Label>
                <Input
                  id="sale_price"
                  type="number"
                  value={currentItem.sale_price}
                  onChange={(e) =>
                    setCurrentItem((p) => ({
                      ...p,
                      sale_price: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveItem}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Inventory;
