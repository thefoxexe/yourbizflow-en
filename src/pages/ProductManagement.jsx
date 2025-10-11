import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/customSupabaseClient";
import {
  PlusCircle,
  Edit,
  MoreVertical,
  Trash2,
  Loader2,
  Wrench,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProductForm, { initialProductState } from "@/components/ProductForm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

const ProductManagement = () => {
  const { user, profile, getPlan } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const plan = getPlan();
  const isFreePlan = plan === "Free";
  const productLimit = 2;
  const canAddProduct = !isFreePlan || products.length < productLimit;

  const currencySymbol = useMemo(
    () =>
      profile?.currency === "usd"
        ? "$"
        : profile?.currency === "chf"
        ? "CHF"
        : "€",
    [profile]
  );

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("cost_calculator_products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load products.",
      });
    } else {
      setProducts(
        data.map((p) => {
          const newP = { ...p };
          for (const key in newP) {
            if (
              typeof newP[key] === "number" &&
              key !== "id" &&
              key !== "user_id" &&
              key !== "stock"
            ) {
              newP[key] = String(newP[key]).replace(".", ",");
            }
          }
          return newP;
        })
      );
    }
    setIsLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSaveProduct = async (productToSave) => {
    if (!productToSave.name.trim()) {
      toast({ variant: "destructive", title: "Required product name" });
      return;
    }
    const productData = {
      ...productToSave,
      user_id: user.id,
    };

    let error;
    if (productToSave.id) {
      ({ error } = await supabase
        .from("cost_calculator_products")
        .update(productData)
        .eq("id", productToSave.id));
    } else {
      if (!canAddProduct) {
        toast({
          variant: "destructive",
          title: "Limit reached",
          description: "Upgrade to add more products.",
        });
        return;
      }
      const { id, ...insertData } = productData;
      ({ error } = await supabase
        .from("cost_calculator_products")
        .insert(insertData));
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The product could not be saved.",
      });
    } else {
      toast({
        title: "Success",
        description: `Product ${productToSave.id ? "updated" : "created"}.`,
      });
      setIsFormOpen(false);
      setEditingProduct(null);
      fetchProducts();
    }
  };

  const handleOpenForm = (product = null) => {
    if (!product && !canAddProduct) {
      toast({
        variant: "destructive",
        title: "Product limit reached",
        description: "Upgrade to add more products.",
        action: (
          <Button onClick={() => navigate("/subscription")}>Upgrade</Button>
        ),
      });
      return;
    }
    setEditingProduct(product ? { ...product } : initialProductState);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    const { error } = await supabase
      .from("cost_calculator_products")
      .delete()
      .eq("id", id);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The product could not be deleted.",
      });
    } else {
      toast({ title: "Product removed" });
      fetchProducts();
    }
  };

  const calculateResults = useCallback((product) => {
    const parse = (v) => parseFloat(String(v || "0").replace(",", ".")) || 0;
    const salePrice = parse(product.sale_price);
    const platformFee = salePrice * (parse(product.platform_fee_percent) / 100);
    const totalCost =
      parse(product.cost_of_goods) +
      parse(product.shipping_cost) +
      parse(product.marketing_cost) +
      platformFee +
      parse(product.other_fees);
    const profit = salePrice - totalCost;
    const profitMargin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
    return { totalCost, profit, profitMargin };
  }, []);

  const formatCurrency = (value) =>
    `${value.toFixed(2).replace(".", ",")} ${currencySymbol}`;
  const getProfitColor = (margin) =>
    margin < 0
      ? "text-red-500"
      : margin < 15
      ? "text-yellow-500"
      : "text-green-500";

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-2">
          <Wrench className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Product Management
          </h1>
        </div>
        <p className="text-muted-foreground">
          Create your products and define their costs to analyze their
          profitability.
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>
                {isFreePlan
                  ? `You have ${products.length}/${productLimit} products. Upgrade to add more.`
                  : "Add and compare the profitability of your products."}
              </CardDescription>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full sm:w-auto">
                      <Button
                        onClick={() => handleOpenForm()}
                        className="w-full sm:w-auto"
                        disabled={!canAddProduct}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> New Product
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!canAddProduct && (
                    <TooltipContent>
                      <p>Product limit reached for the Free plan.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <ProductForm
                product={editingProduct}
                onSave={handleSaveProduct}
                onCancel={() => setIsFormOpen(false)}
                currencySymbol={currencySymbol}
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Sale Price</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : products.length > 0 ? (
                  products.map((product) => {
                    const { totalCost, profit, profitMargin } =
                      calculateResults(product);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            parseFloat(
                              String(product.sale_price || "0").replace(
                                ",",
                                "."
                              )
                            )
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(totalCost)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-bold ${getProfitColor(
                            profitMargin
                          )}`}
                        >
                          {formatCurrency(profit)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-bold ${getProfitColor(
                            profitMargin
                          )}`}
                        >
                          {profitMargin.toFixed(1).replace(".", ",")}%
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
                                onClick={() => handleOpenForm(product)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteProduct(product.id)}
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
                      No products. Click “New Product” to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="sm:hidden space-y-4">
            {isLoading ? (
              <div className="text-center p-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length > 0 ? (
              products.map((product) => {
                const { totalCost, profit, profitMargin } =
                  calculateResults(product);
                return (
                  <Card key={product.id} className="bg-card/50">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {product.name}
                        </CardTitle>
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
                              onClick={() => handleOpenForm(product)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-500 focus:text-red-500"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Sale Price:</span>{" "}
                        <span>
                          {formatCurrency(
                            parseFloat(
                              String(product.sale_price || "0").replace(
                                ",",
                                "."
                              )
                            )
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Cost:</span>{" "}
                        <span>{formatCurrency(totalCost)}</span>
                      </div>
                      <div
                        className={`flex justify-between font-bold ${getProfitColor(
                          profitMargin
                        )}`}
                      >
                        <span>Profit:</span>{" "}
                        <span>{formatCurrency(profit)}</span>
                      </div>
                      <div
                        className={`flex justify-between font-bold ${getProfitColor(
                          profitMargin
                        )}`}
                      >
                        <span>Margin:</span>{" "}
                        <span>
                          {profitMargin.toFixed(1).replace(".", ",")}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No products.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagement;
