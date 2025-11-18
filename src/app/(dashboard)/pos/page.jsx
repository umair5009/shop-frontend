"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { productAPI, customerAPI, saleAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Minus, Trash2, ShoppingCart, Printer } from "lucide-react";

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("percentage");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, customersRes] = await Promise.all([
        productAPI.getAll({ page: 1, limit: 1000 }),
        customerAPI.getAll({ page: 1, limit: 1000 }),
      ]);
      setProducts(productsRes.data.data.products || []);
      setCustomers(customersRes.data.data.customers || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.product._id === product._id);
    if (existingItem) {
      updateQuantity(product._id, existingItem.quantity + 1);
    } else {
      setCart([...cart, { product, quantity: 1, price: product.sellingPrice }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map((item) =>
      item.product._id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product._id !== productId));
  };

  const calculateTotals = () => {
    const grossTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discountAmount = 0;
    
    if (discountType === "percentage") {
      discountAmount = (grossTotal * discount) / 100;
    } else {
      discountAmount = discount;
    }

    const netTotal = grossTotal - discountAmount;
    const paid = parseFloat(amountPaid) || 0;
    const balance = netTotal - paid;

    return { grossTotal, discountAmount, netTotal, balance };
  };

  const handleSubmitSale = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const totals = calculateTotals();
    
    try {
      setSubmitting(true);

      const saleData = {
        customerId: selectedCustomer || null,
        items: cart.map((item) => ({
          productId: item.product._id,
          qty: item.quantity,
          unitPrice: item.price,
        })),
        discountAmount: totals.discountAmount,
        paymentMethod,
        amountPaid: parseFloat(amountPaid) || 0,
        isCredit: paymentMethod === 'credit'
      };

      const response = await saleAPI.create(saleData);
      
      // Print the bill
      if (response.data.printData) {
        printBill(response.data.printData);
      }

      // Reset form
      setCart([]);
      setSelectedCustomer("");
      setDiscount(0);
      setAmountPaid("");
      
      alert("Sale completed successfully!");
    } catch (error) {
      console.error("Error creating sale:", error);
      alert(error.response?.data?.message || "Failed to create sale");
    } finally {
      setSubmitting(false);
    }
  };

  const printBill = (printData) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${printData.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>INVOICE</h1>
          <p><strong>Invoice #:</strong> ${printData.invoiceNumber}</p>
          <p><strong>Date:</strong> ${new Date(printData.date).toLocaleString()}</p>
          <p><strong>Customer:</strong> ${printData.customer?.name || "Walk-in Customer"}</p>
          <hr/>
          ${Object.entries(printData.categorizedItems || {}).map(([category, items]) => `
            <h3>${category}</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="text-right">1*${item.qty}</td>
                    <td class="text-right">Rs ${item.unitPrice.toFixed(2)}</td>
                    <td class="text-right">Rs ${item.lineTotal.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `).join('')}
          <table>
            <tr class="total-row">
              <td colspan="3" class="text-right">Gross Total:</td>
              <td class="text-right">Rs ${printData.grossTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-right">Discount:</td>
              <td class="text-right">Rs ${printData.discountAmount.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" class="text-right">Net Total:</td>
              <td class="text-right">Rs ${printData.netTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-right">Amount Paid:</td>
              <td class="text-right">Rs ${printData.amountPaid.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" class="text-right">Current Bill Balance:</td>
              <td class="text-right">Rs ${printData.balance.toFixed(2)}</td>
            </tr>
            ${printData.customer ? `
              <tr style="border-top: 2px solid #000;">
                <td colspan="3" class="text-right"><strong>Previous Balance:</strong></td>
                <td class="text-right"><strong>Rs ${(printData.previousBalance || 0).toFixed(2)}</strong></td>
              </tr>
              <tr class="total-row" style="background-color: #f9f9f9;">
                <td colspan="3" class="text-right"><strong>Total Outstanding Balance:</strong></td>
                <td class="text-right"><strong>Rs ${(printData.newBalance || 0).toFixed(2)}</strong></td>
              </tr>
            ` : ''}
          </table>
          <p style="text-align: center; margin-top: 30px;">Thank you for your business!</p>
          <script>window.print(); window.onafterprint = () => window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent dark:border-zinc-50"></div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Point of Sale</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Create new sales and print invoices</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-zinc-500">
                        {formatCurrency(product.sellingPrice)} • Stock: {product.stock}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-sm text-zinc-500 py-8">Cart is empty</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product._id} className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-zinc-500">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.product._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <div className="flex justify-between text-sm">
                  <span>Gross Total:</span>
                  <span className="font-medium">{formatCurrency(totals.grossTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(totals.discountAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Total:</span>
                  <span>{formatCurrency(totals.netTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Balance:</span>
                  <Badge variant={totals.balance > 0 ? "destructive" : "success"}>
                    {formatCurrency(totals.balance)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select
                  id="customer"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountType">Type</Label>
                  <Select
                    id="discountType"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">Fixed</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
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
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSubmitSale}
                disabled={submitting || cart.length === 0}
              >
                <Printer className="mr-2 h-4 w-4" />
                {submitting ? "Processing..." : "Complete Sale & Print"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

