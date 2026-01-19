"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { productAPI, customerAPI, saleAPI, areaAPI, staffAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Minus, Trash2, ShoppingCart, Printer } from "lucide-react";

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [staff, setStaff] = useState([]);
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
  const [deliveredByNo, setDeliveredByNo] = useState("");
  const [bookedBy, setBookedBy] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [cnic, setCnic] = useState("");
  const [area, setArea] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [orderByNo, setOrderByNo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, customersRes, areasRes, staffRes] = await Promise.all([
        productAPI.getAll({ page: 1, limit: 1000 }),
        customerAPI.getAll({ page: 1, limit: 1000 }),
        areaAPI.getAll(),
        staffAPI.getAll(),
      ]);
      setProducts(productsRes.data.data.products || []);
      setCustomers(customersRes.data.data.customers || []);
      setAreas(areasRes.data || []);
      setStaff(staffRes.data || []);
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
        price: product.sellingPrice,
        paidQty: pcsPerUnit,  // Default: all pieces are paid
        freeQty: 0            // Default: no free items
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
        const newTotalPcs = newQtyInUnits * pcsPerUnit;
        return {
          ...item,
          qtyInUnits: newQtyInUnits,
          totalPcs: newTotalPcs,
          paidQty: newTotalPcs,  // Reset to all paid when quantity changes
          freeQty: 0
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product._id !== productId));
  };

  // Update price for a cart item (flexible pricing)
  const updatePrice = (productId, newPrice) => {
    const price = parseFloat(newPrice) || 0;
    setCart(cart.map((item) => {
      if (item.product._id === productId) {
        return { ...item, price };
      }
      return item;
    }));
  };

  // Update scheme (paid/free quantities) for a cart item
  const updateScheme = (productId, paidQty, freeQty) => {
    setCart(cart.map((item) => {
      if (item.product._id === productId) {
        const paid = parseInt(paidQty) || 0;
        const free = parseInt(freeQty) || 0;
        const totalPcs = paid + free;
        const pcsPerUnit = item.product.pcsPerUnit || 1;
        return {
          ...item,
          paidQty: paid,
          freeQty: free,
          totalPcs: totalPcs,
          qtyInUnits: Math.ceil(totalPcs / pcsPerUnit)
        };
      }
      return item;
    }));
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
    // Calculate gross using paidQty only (for free product scheme)
    const grossTotal = cart.reduce((sum, item) => sum + item.price * (item.paidQty || item.totalPcs), 0);
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
          paidQty: item.paidQty || item.totalPcs,  // Paid quantity for billing
          freeQty: item.freeQty || 0               // Free quantity (scheme)
        })),
        discountAmount: totals.discountAmount,
        paymentMethod,
        amountPaid: parseFloat(amountPaid) || 0,
        isCredit: paymentMethod === 'credit',

        // Invoice metadata fields
        customerNo,
        area,
        deliveredBy,
        deliveredByNo: deliveredByNo || null,
        bookedBy,
        orderByNo: orderByNo || null,
        licenseNo,
        cnic,
        orderNo,
        dueDate: dueDate || null,
        invoiceDate: invoiceDate || new Date().toISOString().split('T')[0], // Custom invoice date
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
      setDeliveredByNo("");
      setBookedBy("");
      setLicenseNo("");
      setCnic("");
      setArea("");
      setOrderNo("");
      setOrderByNo("");
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
<!DOCTYPE html>
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

    .header {
      text-align: center;
      margin-bottom: 10px;
    }

    .header h1 {
      font-size: 18px;
      margin: 0;
    }

    .header p {
      font-size: 10px;
      margin: 2px 0;
    }

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

    .meta-left, .meta-right {
      width: 48%;
    }

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
      margin-top: 10px;
    }

    .summary-left, .summary-right {
      width: 48%;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 11px;
    }

     .terms {
      border: 1px solid #000;
      padding: 8px;
      font-size: 10px;
      line-height: 1.7;
      margin-top: 10px;
    }

    .terms h4 {
      margin: 0 0 6px 0;
      font-size: 11px;
      text-align: center;
      border-bottom: 1px solid #000;
      padding-bottom: 4px;
    }

    .terms p {
      margin: 4px 0;
      text-align: right;
    }
    .grand-total {
      font-size: 16px;
      font-weight: bold;
      border: 2px solid #000;
      padding: 8px;
      margin: 10px 0;
    }

    .terms {
      padding: 8px;
      font-size: 10px;
      line-height: 1.7;
      margin-top: 10px;
    }

    .terms h4 {
      margin: 0 0 6px 0;
      font-size: 11px;
      text-align: center;
      border-bottom: 1px solid #000;
      padding-bottom: 4px;
    }

    .terms p {
      margin: 4px 0;
      text-align: right;
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
    <h1>Khalil Traders Nowshera</h1>
    <p>Near Ordinance Depot Mohallah Eisakhail Badrashi Nowshera</p>
    <p>Phone: 0335-5314415</p>
  </div>

  <div class="invoice-title">SALES INVOICE</div>

  <div class="meta-section">
    <div class="meta-left">
      <div class="meta-row"><span class="meta-label">Customer #:</span><span class="meta-value">${customerNo || ''}</span></div>
      <div class="meta-row"><span class="meta-label">Customer Name:</span><span class="meta-value">${printData.customer?.name || 'Walk-in Customer'}</span></div>
      <div class="meta-row"><span class="meta-label">Address:</span><span class="meta-value">${printData.customer?.address || ''}</span></div>
      <div class="meta-row"><span class="meta-label">Phone:</span><span class="meta-value">${printData.customer?.phone || ''}</span></div>
      <div class="meta-row"><span class="meta-label">Area:</span><span class="meta-value">${area || ''}</span></div>
      <div class="meta-row"><span class="meta-label">Salesman:</span><span class="meta-value">${deliveredBy || ''}</span></div>
      <div class="meta-row"><span class="meta-label">Salesman No:</span><span class="meta-value">${deliveredByNo || '0312-0914180'}</span></div>
      <div class="meta-row"><span class="meta-label">Order Booker:</span><span class="meta-value">${bookedBy || ''}</span></div>
      <div class="meta-row"><span class="meta-label">Order Booker Number #</span><span class="meta-value">${orderByNo || ''}</span></div>
    </div>

    <div class="meta-right">
      <div class="meta-row"><span class="meta-label">Invoice No:</span><span class="meta-value">${printData.invoiceNumber}</span></div>
      <div class="meta-row"><span class="meta-label">Invoice Date:</span><span class="meta-value">${new Date(printData.date).toLocaleDateString()}</span></div>
      <div class="meta-row"><span class="meta-label">Due Date:</span><span class="meta-value">${dueDate ? new Date(dueDate).toLocaleDateString() : ''}</span></div>
      <div class="meta-row"><span class="meta-label">Order No:</span><span class="meta-value">${orderNo || ''}</span></div>
    </div>
  </div>

${Object.entries(printData.categorizedItems || {}).map(([category, items]) => `
            <div style="margin: 15px 0;">
              <h3 style="font-size: 12px; margin: 5px 0; padding: 3px; background-color: #f0f0f0; border-left: 3px solid #000;">${category}</h3>
              <table>
                <thead>
                  <tr>
                    <th style="width: 28%;">Item</th>
                    <th style="width: 12%;">Trade Price</th>
                    <th style="width: 12%;">Price</th>
                    <th style="width: 10%;">QTY</th>
                    <th style="width: 10%;">CTN</th>
                    <th style="width: 10%;">PCS</th>
                    <th style="width: 18%;">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(item => `
                    <tr>
                      <td>${item.name}${item.scheme ? ` <strong style="color: green;">(${item.scheme})</strong>` : ''}</td>
                      <td class="text-right">Rs ${(item.costPrice || 0).toFixed(2)}</td>
                      <td class="text-right">Rs ${item.unitPrice.toFixed(2)}</td>
                      <td class="text-center">${item.scheme ? `${item.paidQty}+${item.freeQty}` : item.qty}</td>
                      <td class="text-center">${item.unit === 'CTN' || item.unit === 'BOX' ? item.qtyInUnits || 0 : 0}</td>
                      <td class="text-center">${item.scheme ? `${item.paidQty}+${item.freeQty}` : item.qty}</td>
                      <td class="text-right"><strong>Rs ${item.lineTotal.toFixed(2)}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}

  <div class="summary">
    <div class="summary-left">
      <div><strong>No. of Items:</strong> ${printData.items?.length || 0}</div>
      <div style="font-size: 10px; margin-bottom: 5px;">
        <strong>Gross:</strong> Rs ${printData.grossTotal.toFixed(2)}
      </div>

      <div class="terms">
        <h4>Terms & Conditions</h4>
        <p>براۓ مہربانی! بغیر بل کے ادائیگی ہرگز نہ کریں۔ سیلز مین سے کسی بھی قسم کی ذاتی لین دین کی صورت میں ڈسٹری بیوٹر ذمہ دار نہیں ہوگا۔</p>
        <p>کسی بھی قسم کی شکایت کی صورت میں درج ذیل نمبر پر رابطہ کریں:</p>
        <p style="text-align:center;font-weight:bold;">0335-5314415</p>
        <p style="text-align:center;font-weight:bold;">منجانب: خلیل ٹریڈرز</p>
      </div>
    </div>

    <div class="summary-right">
      <div class="total-row"><span>Gross Total:</span><span>Rs ${printData.grossTotal.toFixed(2)}</span></div>
      <div class="total-row"><span>Discount:</span><span>Rs ${printData.discountAmount.toFixed(2)}</span></div>

      <div class="grand-total">
        <div class="total-row"><span>Grand Total:</span><span>Rs ${printData.netTotal.toFixed(2)}</span></div>
      </div>

      <div style="text-align:center;font-style:italic;font-size:10px;">
        ${numberToWords(printData.netTotal)}
      </div>

      <div class="total-row"><span>Cash Received:</span><span>Rs ${printData.amountPaid.toFixed(2)}</span></div>
      <div class="total-row"><span>Previous Balance:</span><span>Rs ${(printData.previousBalance || 0).toFixed(2)}</span></div>
      <div class="total-row" style="font-weight:bold;border-top:2px solid #000;">
        <span>Net Balance:</span><span>Rs ${(printData.newBalance || 0).toFixed(2)}</span>
      </div>
    </div>
  </div>

  <div class="footer">
            <p style="margin-top: 20px; border-top: 1px solid #000; padding-top: 10px;">
              Thank you for your business!
            </p>
          </div>

  `);

    printWindow.document.close();

    // Wait for content to render before printing
    setTimeout(() => {
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
        // create a listener or just let user close? 
        // Better to not auto-close immediately after print call as it might close before dialog
        // often print() blocks in browsers, but in Electron it might not.
        // Let's rely on user closing or set a long timeout, or better, just leave it open for user to close?
        // Actually, typical flow is print -> close.
        // But auto-closing can result in "preview failed".
        // Let's try JUST printing and allow user to close, OR auto-close after a delay if safe.
        // For now, removing auto-close to ensure printing works.
      }
    }, 500);
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
                    <div key={item.product._id} className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.product.name}</p>
                          <p className="text-xs text-zinc-500">
                            {formatCurrency(item.price)} × {item.qtyInUnits} {item.product.unit}
                            {item.product.pcsPerUnit > 1 && ` (${item.totalPcs} pcs)`}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.product._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product._id, item.qtyInUnits - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.qtyInUnits}
                            onChange={(e) => updateQuantity(item.product._id, parseInt(e.target.value) || 1)}
                            className="w-14 text-center text-sm h-8 px-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product._id, item.qtyInUnits + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        {/* Price Override */}
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-zinc-500">Rs</span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => updatePrice(item.product._id, e.target.value)}
                            className="w-20 text-center text-sm h-8 px-1"
                            title="Override price per unit"
                          />
                        </div>
                      </div>
                      {/* Scheme row (Paid + Free) */}
                      <div className="flex items-center gap-2 mt-1 border-t border-zinc-100 pt-2 dark:border-zinc-700">
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Scheme:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-zinc-500">Paid:</span>
                          <Input
                            type="number"
                            min="0"
                            value={item.paidQty || item.totalPcs}
                            onChange={(e) => updateScheme(item.product._id, e.target.value, item.freeQty || 0)}
                            className="w-14 text-center text-sm h-7 px-1"
                            title="Paid quantity"
                          />
                        </div>
                        <span className="text-xs font-bold">+</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-zinc-500">Free:</span>
                          <Input
                            type="number"
                            min="0"
                            value={item.freeQty || 0}
                            onChange={(e) => updateScheme(item.product._id, item.paidQty || item.totalPcs, e.target.value)}
                            className="w-14 text-center text-sm h-7 px-1 border-green-300 dark:border-green-700"
                            title="Free quantity"
                          />
                        </div>
                        {item.freeQty > 0 && (
                          <Badge variant="success" className="text-xs">
                            {item.paidQty}+{item.freeQty}
                          </Badge>
                        )}
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
                      // Set the area field to the selected area (for the sale)
                      setArea(e.target.value);
                      setCustomerNo("");
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
                          {customer.name} {customer.runningBalance > 0 ? `(Bal: Rs ${customer.runningBalance})` : ''}
                        </option>
                      ))}
                  </Select>
                </div>

                {/* Show Previous Balance for selected customer */}
                {selectedCustomer && (() => {
                  const customer = customers.find(c => c._id === selectedCustomer);
                  const balance = customer?.runningBalance || 0;
                  if (balance > 0) {
                    return (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 dark:bg-amber-900/20 dark:border-amber-800">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Previous Balance:</span>
                          <span className="text-lg font-bold text-amber-800 dark:text-amber-200">{formatCurrency(balance)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
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
                  <Label htmlFor="deliveredBy">Delivered By (Salesman)</Label>
                  <Select
                    id="deliveredBy"
                    value={deliveredBy}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      setDeliveredBy(selectedName);
                      const s = staff.find(st => st.name === selectedName);
                      if (s) setDeliveredByNo(s.phone || "");
                    }}
                  >
                    <option value="">Select Salesman</option>
                    {staff.filter(s => s.role === 'salesman').map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookedBy">Booked By (Order Booker)</Label>
                  <Select
                    id="bookedBy"
                    value={bookedBy}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      setBookedBy(selectedName);
                      const s = staff.find(st => st.name === selectedName);
                      if (s) setOrderByNo(s.phone || "");
                    }}
                  >
                    <option value="">Select Order Booker</option>
                    {staff.filter(s => s.role === 'order_booker').map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="deliveredByNo">Delivered By #</Label>
                  <Input
                    id="deliveredByNo"
                    type="number"
                    value={deliveredByNo}
                    onChange={(e) => setDeliveredByNo(e.target.value)}
                    placeholder="Salesman number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderByNo">Order By #</Label>
                  <Input
                    id="orderByNo"
                    type="number"
                    value={orderByNo}
                    onChange={(e) => setOrderByNo(e.target.value)}
                    placeholder="Order by number"
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

              {/* Invoice Date Control */}
              <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <Label htmlFor="invoiceDate" className="text-blue-800 dark:text-blue-200">
                  Invoice Date
                </Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="border-blue-300 dark:border-blue-700"
                />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Defaults to today. Select a different date if creating a bill for another day.
                </p>
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

