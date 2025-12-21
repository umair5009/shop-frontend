"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { productAPI, customerAPI, saleAPI, areaAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Minus, Trash2, ShoppingCart, Printer } from "lucide-react";

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("percentage");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Additional invoice fields
  const [customerNo, setCustomerNo] = useState("");
  const [deliveredBy, setDeliveredBy] = useState("");
  const [bookedBy, setBookedBy] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [cnic, setCnic] = useState("");
  const [area, setArea] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, customersRes, areasRes] = await Promise.all([
        productAPI.getAll({ page: 1, limit: 1000 }),
        customerAPI.getAll({ page: 1, limit: 1000 }),
        areaAPI.getAll(),
      ]);
      setProducts(productsRes.data.data.products || []);
      setCustomers(customersRes.data.data.customers || []);
      setAreas(areasRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.product._id === product._id);
    if (existingItem) {
      updateQuantity(product._id, existingItem.qtyInUnits + 1);
    } else {
      const pcsPerUnit = product.pcsPerUnit || 1;
      setCart([...cart, {
        product,
        qtyInUnits: 1, // Quantity in product's unit (e.g., 1 box)
        totalPcs: pcsPerUnit, // Total pieces (e.g., 20 pieces if 1 box = 20 pcs)
        price: product.sellingPrice
      }]);
    }
  };

  const updateQuantity = (productId, newQtyInUnits) => {
    if (newQtyInUnits <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map((item) => {
      if (item.product._id === productId) {
        const pcsPerUnit = item.product.pcsPerUnit || 1;
        return {
          ...item,
          qtyInUnits: newQtyInUnits,
          totalPcs: newQtyInUnits * pcsPerUnit
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product._id !== productId));
  };

  const handleCustomerChange = (customerId) => {
    setSelectedCustomer(customerId);
    if (customerId) {
      const customer = customers.find(c => c._id === customerId);
      if (customer) {
        // Auto-fill customer details
        setArea(customer.area || "");
        setCnic(customer.cnic || "");
        setLicenseNo(customer.licenseNo || "");
      }
    } else {
      // Clear fields for walk-in customer
      setCustomerNo("");
      setArea("");
      setCnic("");
      setLicenseNo("");
    }
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    const convertHundreds = (n) => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertHundreds(n % 100) : '');
    };

    const convertThousands = (n) => {
      if (n < 1000) return convertHundreds(n);
      return convertHundreds(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convertHundreds(n % 1000) : '');
    };

    const convertLakhs = (n) => {
      if (n < 100000) return convertThousands(n);
      return convertHundreds(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convertThousands(n % 100000) : '');
    };

    return convertLakhs(Math.floor(num)) + ' Only';
  };

  const calculateTotals = () => {
    const grossTotal = cart.reduce((sum, item) => sum + item.price * item.totalPcs, 0);
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
          qty: item.totalPcs, // Total pieces
          qtyInUnits: item.qtyInUnits, // Quantity in product's unit
          unit: item.product.unit,
          pcsPerUnit: item.product.pcsPerUnit || 1,
          unitPrice: item.price,
        })),
        discountAmount: totals.discountAmount,
        paymentMethod,
        amountPaid: parseFloat(amountPaid) || 0,
        isCredit: paymentMethod === 'credit',

        // Invoice metadata fields
        customerNo,
        area,
        deliveredBy,
        bookedBy,
        licenseNo,
        cnic,
        orderNo,
        dueDate: dueDate || null
      };

      const response = await saleAPI.create(saleData);

      // Print the bill
      if (response.data.printData) {
        console.log("Printing bill", response.data.printData, "length", response.data.printData.items.length);
        printBill(response.data.printData);
      }

      // Reset form
      setCart([]);
      setSelectedCustomer("");
      setDiscount(0);
      setAmountPaid("");
      setCustomerNo("");
      setDeliveredBy("");
      setBookedBy("");
      setLicenseNo("");
      setCnic("");
      setArea("");
      setOrderNo("");
      setDueDate("");

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
            @page { size: A4; margin: 10mm; }
            body {
              font-family: Arial, sans-serif;
              font-size: 11px;
              margin: 0;
              padding: 15px;
            }
            .header { text-align: center; margin-bottom: 10px; }
            .header h1 { font-size: 18px; margin: 0; }
            .header p { font-size: 10px; margin: 2px 0; }
            .invoice-title {
              text-align: center;
              border: 2px solid #000;
              padding: 5px;
              margin: 10px 0;
              font-size: 14px;
              font-weight: bold;
            }
            .meta-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .meta-left, .meta-right { width: 48%; }
            .meta-row {
              display: flex;
              margin-bottom: 3px;
              font-size: 10px;
            }
            .meta-label {
              width: 120px;
              font-weight: bold;
            }
            .meta-value {
              flex: 1;
              border-bottom: 1px solid #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
              font-size: 10px;
            }
            th, td {
              border: 1px solid #000;
              padding: 5px 4px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
              text-align: center;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .summary {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
            }
            .summary-left { width: 48%; }
            .summary-right { width: 48%; }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 5px;
              font-size: 11px;
            }
            .grand-total {
              font-size: 16px;
              font-weight: bold;
              border: 2px solid #000;
              padding: 8px;
              margin: 10px 0;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>G.L TRADERS</h1>
            <p>4 Haji Saeed Market Near 13M Office G.T Road Jehangira</p>
            <p>Saiful Gul: 0322-9171401</p>
          </div>

          <div class="invoice-title">SALES INVOICE</div>

          <div class="meta-section">
            <div class="meta-left">
              <div class="meta-row">
                <span class="meta-label">Customer #:</span>
                <span class="meta-value">${customerNo || ''}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Customer/Shop Name:</span>
                <span class="meta-value">${printData.customer?.name || "Walk-in Customer"}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Address:</span>
                <span class="meta-value">${printData.customer?.address || ''}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Phone:</span>
                <span class="meta-value">${printData.customer?.phone || ''}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Area:</span>
                <span class="meta-value">${area || ''}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Delivered By:</span>
                <span class="meta-value">${deliveredBy || ''}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Booked By:</span>
                <span class="meta-value">${bookedBy || ''}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">License #:</span>
                <span class="meta-value">${licenseNo || ''}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">CNIC:</span>
                <span class="meta-value">${cnic || ''}</span>
              </div>
            </div>

            <div class="meta-right">
              <div class="meta-row">
                <span class="meta-label">Invoice No:</span>
                <span class="meta-value">${printData.invoiceNumber}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Invoice Date:</span>
                <span class="meta-value">${new Date(printData.date).toLocaleDateString()}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Due Date:</span>
                <span class="meta-value">${dueDate ? new Date(dueDate).toLocaleDateString() : ''}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Order No:</span>
                <span class="meta-value">${orderNo || ''}</span>
              </div>
              
            </div>
          </div>

          ${Object.entries(printData.categorizedItems || {}).map(([category, items]) => `
            <div style="margin: 15px 0;">
              <h3 style="font-size: 12px; margin: 5px 0; padding: 3px; background-color: #f0f0f0; border-left: 3px solid #000;">${category}</h3>
              <table>
                <thead>
                  <tr>
                    <th style="width: 30%;">Item</th>
                    <th style="width: 12%;">Price</th>
                    <th style="width: 10%;">QTY</th>
                    <th style="width: 10%;">CTN</th>
                    <th style="width: 10%;">PCS</th>
                    <th style="width: 10%;">KG</th>
                    <th style="width: 18%;">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(item => `
                    <tr>
                      <td>${item.name}</td>
                      <td class="text-right">Rs ${item.unitPrice.toFixed(2)}</td>
                      <td class="text-center">${item.qty}</td>
                      <td class="text-center">${item.unit === 'CTN' || item.unit === 'BOX' ? item.qtyInUnits || 0 : 0}</td>
                      <td class="text-center">${item.unit === 'PCS' ? item.qty : 0}</td>
                      <td class="text-center">${item.unit === 'KG' ? item.qtyInUnits || 0 : 0}</td>
                      <td class="text-right"><strong>Rs ${item.lineTotal.toFixed(2)}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}

          <div class="summary">
            <div class="summary-left">
              <div style="font-size: 10px; margin-bottom: 5px;">
                <strong>No. of items:</strong> ${printData.items?.length || 0}
              </div>
              <div style="font-size: 10px; margin-bottom: 5px;">
                <strong>Gross:</strong> Rs ${printData.grossTotal.toFixed(2)}
              </div>
            </div>

            <div class="summary-right">
              <div class="total-row" style="border-bottom: 1px solid #000;">
                <span>Gross Total:</span>
                <span>Rs ${printData.grossTotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Discount:</span>
                <span>Rs ${printData.discountAmount.toFixed(2)}</span>
              </div>
              <div class="grand-total">
                <div class="total-row">
                  <span>Grand Total:</span>
                  <span>Rs ${printData.netTotal.toFixed(2)}</span>
                </div>
              </div>
              <div style="font-size: 10px; font-style: italic; margin-bottom: 10px; text-align: center;">
                ${numberToWords(printData.netTotal)}
              </div>
              <div class="total-row" style="border-top: 1px solid #000; border-bottom: 1px solid #000;">
                <span>Cash Received:</span>
                <span>Rs ${printData.amountPaid.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Previous Balance:</span>
                <span>Rs ${(printData.previousBalance || 0).toFixed(2)}</span>
              </div>
              <div class="total-row" style="border-top: 2px solid #000; font-weight: bold; font-size: 12px; background-color: #f9f9f9; padding: 8px;">
                <span>Net Balance:</span>
                <span>Rs ${(printData.newBalance || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p style="margin-top: 20px; border-top: 1px solid #000; padding-top: 10px;">
              Thank you for your business!
            </p>
          </div>

          <script>
            window.print();
            window.onafterprint = () => window.close();
          </script>
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
                        <p className="text-xs text-zinc-500">
                          {formatCurrency(item.price)} × {item.qtyInUnits} {item.product.unit}
                          {item.product.pcsPerUnit > 1 && ` (${item.totalPcs} pcs)`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product._id, item.qtyInUnits - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.qtyInUnits}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.product._id, item.qtyInUnits + 1)}
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="areaFilter">Filter by Area</Label>
                  <Select
                    id="areaFilter"
                    value={selectedArea}
                    onChange={(e) => {
                      setSelectedArea(e.target.value);
                      setSelectedCustomer(""); // Reset customer when area changes
                      // Clear fields
                      setCustomerNo("");
                      setArea("");
                      setCnic("");
                      setLicenseNo("");
                    }}
                  >
                    <option value="">All Areas</option>
                    {areas.map((a) => (
                      <option key={a._id} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select
                    id="customer"
                    value={selectedCustomer}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                  >
                    <option value="">Walk-in Customer</option>
                    {customers
                      .filter((c) => !selectedArea || c.area === selectedArea)
                      .map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name}
                        </option>
                      ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="customerNo">Customer #</Label>
                  <Input
                    id="customerNo"
                    value={customerNo}
                    onChange={(e) => setCustomerNo(e.target.value)}
                    placeholder="Customer number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Area"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="deliveredBy">Delivered By</Label>
                  <Input
                    id="deliveredBy"
                    value={deliveredBy}
                    onChange={(e) => setDeliveredBy(e.target.value)}
                    placeholder="Delivery person name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookedBy">Booked By</Label>
                  <Input
                    id="bookedBy"
                    value={bookedBy}
                    onChange={(e) => setBookedBy(e.target.value)}
                    placeholder="Booked by"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="licenseNo">License #</Label>
                  <Input
                    id="licenseNo"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    placeholder="License number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnic">CNIC</Label>
                  <Input
                    id="cnic"
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                    placeholder="CNIC number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="orderNo">Order No</Label>
                  <Input
                    id="orderNo"
                    value={orderNo}
                    onChange={(e) => setOrderNo(e.target.value)}
                    placeholder="Order number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
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

