"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { purchaseAPI, supplierAPI, productAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Eye, Search } from "lucide-react";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    supplier: "",
    product: "",
    quantity: "",
    costPrice: "",
    totalAmount: "",
    paymentMethod: "cash",
    amountPaid: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [purchasesRes, suppliersRes, productsRes] = await Promise.all([
        purchaseAPI.getAll({ page: 1, limit: 1000 }),
        supplierAPI.getAll({ page: 1, limit: 1000 }),
        productAPI.getAll({ page: 1, limit: 1000 }),
      ]);
      setPurchases(purchasesRes.data.data.purchases || []);
      setSuppliers(suppliersRes.data.data.suppliers || []);
      setProducts(productsRes.data.data.products || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      supplier: "",
      product: "",
      quantity: "",
      costPrice: "",
      totalAmount: "",
      paymentMethod: "cash",
      amountPaid: "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleProductChange = (productId) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      setFormData({
        ...formData,
        product: productId,
        costPrice: product.costPrice,
      });
    }
  };

  const handleQuantityChange = (quantity) => {
    const qty = parseInt(quantity) || 0;
    const cost = parseFloat(formData.costPrice) || 0;
    setFormData({
      ...formData,
      quantity,
      totalAmount: (qty * cost).toFixed(2),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Find the selected product to get its name
      const selectedProduct = products.find(p => p._id === formData.product);
      const productName = selectedProduct?.name || "Unknown Product";

      const payload = {
        supplier: formData.supplier,
        // Backend expects items array with specific structure
        items: [
          {
            product: formData.product,
            productName: productName,
            tradePrice: parseFloat(formData.costPrice) || 0,
            qty: parseInt(formData.quantity) || 0,
            netAmount: parseFloat(formData.totalAmount) || 0,
          }
        ],
        cashReceived: parseFloat(formData.amountPaid) || 0,
      };

      await purchaseAPI.create(payload);
      fetchData();
      handleCloseDialog();
      alert("Purchase created successfully!");
    } catch (error) {
      console.error("Error creating purchase:", error);
      alert(error.response?.data?.message || "Failed to create purchase");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = async (purchase) => {
    setSelectedPurchase(purchase);
    setDetailsDialogOpen(true);
  };

  const filteredPurchases = purchases.filter((purchase) =>
    purchase.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.items?.some(item => item.productName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent dark:border-zinc-50"></div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchases</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage purchase orders and inventory</p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Purchase
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search by supplier or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Purchases ({filteredPurchases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPurchases.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 py-8">
              {searchTerm ? "No purchases found matching your search." : "No purchases found."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                  <TableHead className="text-right">Cash Received</TableHead>
                  <TableHead className="text-right">Net Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase._id}>
                    <TableCell className="font-mono font-medium">{purchase.invoiceNo}</TableCell>
                    <TableCell>{formatDate(purchase.invoiceDate || purchase.createdAt)}</TableCell>
                    <TableCell>{purchase.supplier?.name || "N/A"}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        {purchase.items?.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            {item.productName} <span className="text-zinc-500">x{item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{purchase.noOfItems || purchase.items?.length}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(purchase.grandTotal)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(purchase.cashReceived)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={purchase.netBalance > 0 ? "destructive" : "success"}>
                        {formatCurrency(purchase.netBalance)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(purchase)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Purchase Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogClose onClick={handleCloseDialog} />
          <DialogHeader>
            <DialogTitle>Add New Purchase</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Select
                id="product"
                value={formData.product}
                onChange={(e) => handleProductChange(e.target.value)}
                required
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price *</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => {
                    setFormData({ ...formData, costPrice: e.target.value });
                    handleQuantityChange(formData.quantity);
                  }}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={formData.totalAmount}
                readOnly
                className="bg-zinc-100 dark:bg-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                required
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="credit">Credit</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountPaid">Amount Paid</Label>
              <Input
                id="amountPaid"
                type="number"
                step="0.01"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remainingBalance">Remaining Balance</Label>
              <Input
                id="remainingBalance"
                type="number"
                step="0.01"
                value={(parseFloat(formData.totalAmount || 0) - parseFloat(formData.amountPaid || 0)).toFixed(2)}
                readOnly
                className="bg-zinc-100 dark:bg-zinc-800 font-semibold"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Purchase"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setDetailsDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                <div>
                  <p className="text-sm text-zinc-500">Invoice No</p>
                  <p className="font-mono font-medium">{selectedPurchase.invoiceNo}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Invoice Date</p>
                  <p className="font-medium">{formatDate(selectedPurchase.invoiceDate || selectedPurchase.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Supplier</p>
                  <p className="font-medium">{selectedPurchase.supplier?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Supplier Phone</p>
                  <p className="font-medium">{selectedPurchase.supplier?.phone || "N/A"}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-semibold mb-2">Items ({selectedPurchase.noOfItems || selectedPurchase.items?.length})</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Trade Price</TableHead>
                      <TableHead className="text-right">Net Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPurchase.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right">{item.qty}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.tradePrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.netAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <div className="flex justify-between">
                  <span>Gross Total:</span>
                  <span className="font-medium">{formatCurrency(selectedPurchase.gross)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(selectedPurchase.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Amount in Words:</span>
                  <span className="italic">{selectedPurchase.amountInWords}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Received:</span>
                  <span className="font-medium text-green-600">{formatCurrency(selectedPurchase.cashReceived)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Previous Balance:</span>
                  <span className="font-medium">{formatCurrency(selectedPurchase.previousBalance)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Balance:</span>
                  <Badge variant={selectedPurchase.netBalance > 0 ? "destructive" : "success"} className="text-base px-3 py-1">
                    {formatCurrency(selectedPurchase.netBalance)}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

