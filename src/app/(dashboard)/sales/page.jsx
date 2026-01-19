"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { saleAPI, returnAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye, Printer, Search, Undo2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSales, setSelectedSales] = useState(new Set());
  const [isBulkPrinting, setIsBulkPrinting] = useState(false);

  // Return dialog state
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returningSale, setReturningSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [addToStock, setAddToStock] = useState(true);
  const [returnReason, setReturnReason] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const [saleReturns, setSaleReturns] = useState([]); // Returns history for selected sale

  // Dialog States
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await saleAPI.getAll({ page: 1, limit: 1000 });
      setSales(response.data.data.sales || []);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (sale) => {
    try {
      const response = await saleAPI.getById(sale._id);
      setSelectedSale(response.data.sale || response.data);

      // Also fetch returns for this sale
      try {
        const returnsResponse = await returnAPI.getBySale(sale._id);
        setSaleReturns(returnsResponse.data.returns || []);
      } catch (e) {
        setSaleReturns([]);
      }

      setDetailsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching sale details:", error);
      setErrorMessage("Failed to fetch sale details");
      setErrorDialogOpen(true);
    }
  };

  const handleReprint = async (saleId) => {
    try {
      const response = await saleAPI.reprint(saleId);
      if (response.data.printData) {
        printBill(response.data.printData);
      }
    } catch (error) {
      console.error("Error reprinting sale:", error);
      setErrorMessage("Failed to reprint invoice");
      setErrorDialogOpen(true);
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedSales);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSales(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedSales.size === filteredSales.length && filteredSales.length > 0) {
      setSelectedSales(new Set());
    } else {
      setSelectedSales(new Set(filteredSales.map((s) => s._id)));
    }
  };

  const handleBulkPrint = async () => {
    if (selectedSales.size === 0) return;
    try {
      setIsBulkPrinting(true);
      const promises = [...selectedSales].map((id) => saleAPI.reprint(id));
      const responses = await Promise.all(promises);
      const printDataList = responses
        .map((res) => res.data.printData)
        .filter((data) => data); // Filter out any failed matches if any

      if (printDataList.length > 0) {
        printBills(printDataList);
      }
    } catch (error) {
      console.error("Error bulk printing:", error);
      setErrorMessage("Failed to print selected invoices");
      setErrorDialogOpen(true);
    } finally {
      setIsBulkPrinting(false);
    }
  };

  // Return handlers
  const handleOpenReturnDialog = async (sale) => {
    try {
      const response = await saleAPI.getById(sale._id);
      const fullSale = response.data.sale || response.data;
      setReturningSale(fullSale);

      // Fetch previous returns for this sale
      let previousReturns = [];
      try {
        const returnsResponse = await returnAPI.getBySale(sale._id);
        previousReturns = returnsResponse.data.returns || [];
        setSaleReturns(previousReturns);
      } catch (err) {
        console.log("No previous returns found");
      }

      // Calculate already returned quantities per product
      const alreadyReturnedQty = {};
      for (const prevReturn of previousReturns) {
        for (const item of prevReturn.items) {
          const productId = item.productId;
          alreadyReturnedQty[productId] = (alreadyReturnedQty[productId] || 0) + item.qty;
        }
      }

      // Initialize return items with 0 quantity and calculate remaining
      const items = fullSale.items.map(item => {
        const productId = item.product?._id || item.product;
        const originalQty = item.qty;
        const alreadyReturned = alreadyReturnedQty[productId] || 0;
        const remainingQty = Math.max(0, originalQty - alreadyReturned);

        return {
          productId,
          productName: item.product?.name || item.name,
          originalQty,
          alreadyReturned,
          remainingQty,  // Max returnable quantity
          returnQty: 0,
          unitPrice: item.unitPrice
        };
      });
      setReturnItems(items);
      setAddToStock(true);
      setReturnReason("");
      setReturnDialogOpen(true);
    } catch (error) {
      console.error("Error fetching sale for return:", error);
      setErrorMessage("Failed to load sale details");
      setErrorDialogOpen(true);
    }
  };

  const updateReturnQty = (index, qty) => {
    const newItems = [...returnItems];
    const maxQty = newItems[index].remainingQty || newItems[index].originalQty;  // Use remainingQty if available
    newItems[index].returnQty = Math.min(Math.max(0, parseInt(qty) || 0), maxQty);
    setReturnItems(newItems);
  };

  const getReturnTotal = () => {
    return returnItems.reduce((sum, item) => sum + (item.returnQty * item.unitPrice), 0);
  };

  const handleSubmitReturn = async () => {
    const itemsToReturn = returnItems.filter(item => item.returnQty > 0);
    if (itemsToReturn.length === 0) {
      setErrorMessage("Please select at least one item to return");
      setErrorDialogOpen(true);
      return;
    }

    setSubmittingReturn(true);
    try {
      await returnAPI.create({
        saleId: returningSale._id,
        items: itemsToReturn.map(item => ({
          productId: item.productId,
          productName: item.productName,
          qty: item.returnQty,
          unitPrice: item.unitPrice
        })),
        addToStock,
        reason: returnReason
      });

      setErrorMessage("Return created successfully!");
      setErrorDialogOpen(true);
      setReturnDialogOpen(false);
      fetchSales(); // Refresh to update balances
    } catch (error) {
      console.error("Error creating return:", error);
      setErrorMessage(error.response?.data?.message || "Failed to create return");
      setErrorDialogOpen(true);
    } finally {
      setSubmittingReturn(false);
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

  const invoiceStyles = `
    @page { size: A4; margin: 10mm; }
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 15px; }
    .header { text-align: center; margin-bottom: 10px; }
    .header h1 { font-size: 18px; margin: 0; }
    .header p { font-size: 10px; margin: 2px 0; }
    .invoice-title { text-align: center; border: 2px solid #000; padding: 5px; margin: 10px 0; font-size: 14px; font-weight: bold; }
    .meta-section { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .meta-left, .meta-right { width: 48%; }
    .meta-row { display: flex; margin-bottom: 3px; font-size: 10px; }
    .meta-label { width: 120px; font-weight: bold; }
    .meta-value { flex: 1; border-bottom: 1px solid #000; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px; }
    th, td { border: 1px solid #000; padding: 5px 4px; }
    th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .summary { display: flex; justify-content: space-between; margin-top: 10px; }
    .summary-left, .summary-right { width: 48%; }
    .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; }
    .terms { border: 1px solid #000; padding: 8px; font-size: 10px; line-height: 1.7; margin-top: 10px; }
    .terms h4 { margin: 0 0 6px 0; font-size: 11px; text-align: center; border-bottom: 1px solid #000; padding-bottom: 4px; }
    .terms p { margin: 4px 0; text-align: right; }
    .grand-total { font-size: 16px; font-weight: bold; border: 2px solid #000; padding: 8px; margin: 10px 0; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; }
    .page-break { page-break-after: always; display: block; height: 0; content: ""; }
    @media print { .page-break { page-break-after: always; } }
  `;

  const generateInvoiceContent = (printData) => {
    console.log(printData)
    return `
      <div class="invoice-container">
        <div class="header">
          <h1>Khalil Traders Nowshera</h1>
          <p>Near Ordinance Depot Mohallah Eisakhail Badrashi Nowshera</p>
          <p>Phone: 0335-5314415</p>
        </div>

        <div class="invoice-title">SALES INVOICE</div>

        <div class="meta-section">
          <div class="meta-left">
            <div class="meta-row"><span class="meta-label">Customer #:</span><span class="meta-value">${printData.customerNo || ''}</span></div>
            <div class="meta-row"><span class="meta-label">Customer Name:</span><span class="meta-value">${printData.customer?.name || 'Walk-in Customer'}</span></div>
            <div class="meta-row"><span class="meta-label">Address:</span><span class="meta-value">${printData.customer?.address || ''}</span></div>
            <div class="meta-row"><span class="meta-label">Phone:</span><span class="meta-value">${printData.customer?.phone || ''}</span></div>
            <div class="meta-row"><span class="meta-label">Area:</span><span class="meta-value">${printData.area || ''}</span></div>
            <div class="meta-row"><span class="meta-label">Salesman:</span><span class="meta-value">${printData.deliveredBy || ''}</span></div>
            <div class="meta-row"><span class="meta-label">Salesman No:</span><span class="meta-value">${printData.deliveredByNo || ''}</span></div>
            <div class="meta-row"><span class="meta-label">Order Booker:</span><span class="meta-value">${printData.bookedBy || ''}</span></div>
            <div class="meta-row"><span class="meta-label">Order Booker Number #:</span><span class="meta-value">${printData.orderByNo || ''}</span></div>
          </div>

          <div class="meta-right">
            <div class="meta-row"><span class="meta-label">Invoice No:</span><span class="meta-value">${printData.invoiceNumber}</span></div>
            <div class="meta-row"><span class="meta-label">Invoice Date:</span><span class="meta-value">${new Date(printData.date).toLocaleDateString()}</span></div>
            <div class="meta-row"><span class="meta-label">Due Date:</span><span class="meta-value">${printData.dueDate ? new Date(printData.dueDate).toLocaleDateString() : ''}</span></div>
            <div class="meta-row"><span class="meta-label">Order No:</span><span class="meta-value">${printData.orderNo || ''}</span></div>
          </div>
        </div>

        ${Object.entries(printData.categorizedItems || {}).map(([category, items]) => `
          <div style="margin: 15px 0;">
            <h3 style="font-size: 12px; margin: 5px 0; padding: 3px; background-color: #f0f0f0; border-left: 3px solid #000;">${category}</h3>
            <table>
              <thead>
                <tr>
                  <th style="width: 28%;">Item</th>
                  <th style="width: 10%;">Trade Price</th>
                  <th style="width: 10%;">Price</th>
                  <th style="width: 8%;">QTY</th>
                  <th style="width: 8%;">CTN</th>
                  <th style="width: 8%;">PCS</th>
                  <th style="width: 12%;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.name}${item.scheme ? ` <strong style="color: green;">(${item.scheme})</strong>` : ''}</td>
                    <td class="text-right" style="color: #0066cc; font-weight: bold;">Rs ${(item.costPrice || item.tradePrice || 0).toFixed(2)}</td>
                    <td class="text-right">Rs ${item.unitPrice.toFixed(2)}</td>
                    <td class="text-center">${item.scheme ? `${item.paidQty}+${item.freeQty}` : item.qty}</td>
                    <td class="text-center">${item.unit === 'CTN' || item.unit === 'BOX' ? item.qtyInUnits || 0 : 0}</td>
                    <td class="text-center">${item.unit === 'PCS' ? (item.scheme ? `${item.paidQty}+${item.freeQty}` : item.qty) : 0}</td>
                    <td class="text-right"><strong>Rs ${item.lineTotal.toFixed(2)}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}

        ${printData.returns && printData.returns.length > 0 ? `
          <div style="margin: 15px 0;">
            <h3 style="font-size: 12px; margin: 5px 0; padding: 3px; background-color: #ffebee; border-left: 3px solid #d32f2f; color: #d32f2f;">Return Details</h3>
            ${printData.returns.map(ret => `
              <div style="margin-bottom: 10px;">
                <div style="font-size: 10px; font-weight: bold; margin-bottom: 2px;">
                  Return #: ${ret.returnNumber} (${new Date(ret.date).toLocaleDateString()})
                </div>
                <table>
                  <thead>
                    <tr>
                      <th style="width: 50%;">Returned Item</th>
                      <th style="width: 15%;">Return Qty</th>
                      <th style="width: 15%;">Unit Price</th>
                      <th style="width: 20%;">Total Refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ret.items.map(item => `
                      <tr>
                        <td>${item.name}</td>
                        <td class="text-center">${item.qty}</td>
                        <td class="text-right">Rs ${item.unitPrice.toFixed(2)}</td>
                        <td class="text-right" style="color: #d32f2f;">Rs ${item.total.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
          </div>
        ` : ''}

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

            ${printData.totalReturnedAmount > 0 ? `
              <div class="total-row" style="color: #d32f2f;"><span>Less Returns:</span><span>-Rs ${printData.totalReturnedAmount.toFixed(2)}</span></div>
              <div class="total-row" style="font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 4px;">
                <span>Adjusted Total:</span>
                <span>Rs ${(printData.netTotal - printData.totalReturnedAmount).toFixed(2)}</span>
              </div>
            ` : ''}

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
      </div>
    `;
  };

  const printBill = (printData) => {
    printBills([printData]);
  };

  const printBills = (printDataList) => {
    const printWindow = window.open("", "_blank");

    // Join all contents with page breaks
    const bodyContent = printDataList
      .map((data) => generateInvoiceContent(data))
      .join('<div class="page-break"></div>');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Invoices</title>
        <style>${invoiceStyles}</style>
      </head>
      <body>
        ${bodyContent}
      </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
        // Optional: printWindow.close();
      }
    }, 500);
  };

  const filteredSales = sales.filter((sale) =>
    sale.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent dark:border-zinc-50"></div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sales</h1>
        <p className="text-zinc-500 dark:text-zinc-400">View and manage all sales transactions</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search by invoice number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {selectedSales.size > 0 && (
          <Button onClick={handleBulkPrint} disabled={isBulkPrinting}>
            <Printer className="mr-2 h-4 w-4" />
            {isBulkPrinting ? "Printing..." : `Print Selected (${selectedSales.size})`}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sales ({filteredSales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 py-8">
              {searchTerm ? "No sales found matching your search." : "No sales found."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedSales.size === filteredSales.length && filteredSales.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow
                    key={sale._id}
                    className={sale.hasReturns || sale.returnedAmount > 0 ? "border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-900/10" : ""}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedSales.has(sale._id)}
                        onChange={() => toggleSelect(sale._id)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {sale.invoiceNumber}
                        {(sale.hasReturns || sale.returnedAmount > 0) && (
                          <Badge variant="warning" className="text-xs bg-orange-500 text-white">
                            Return
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{sale.customer?.name || "Walk-in"}</TableCell>
                    <TableCell>{formatDate(sale.date || sale.createdAt)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.netTotal)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sale.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(sale)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReprint(sale._id)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReturnDialog(sale)}
                          title="Process Return"
                        >
                          <Undo2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogClose onClick={() => setDetailsDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Sale Details - {selectedSale?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                <div>
                  <p className="text-sm text-zinc-500">Customer</p>
                  <p className="font-medium">{selectedSale.customer?.name || "Walk-in Customer"}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Date</p>
                  <p className="font-medium">{formatDate(selectedSale.date || selectedSale.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Payment Method</p>
                  <Badge variant="secondary">{selectedSale.paymentMethod}</Badge>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Invoice Number</p>
                  <p className="font-medium">{selectedSale.invoiceNumber}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product?.name || "N/A"}</TableCell>
                        <TableCell className="text-right">{item.qty}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.qty * item.unitPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <div className="flex justify-between">
                  <span>Gross Total:</span>
                  <span className="font-medium">{formatCurrency(selectedSale.grossTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(selectedSale.discountAmount
                  )}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Total:</span>
                  <span>{formatCurrency(selectedSale.netTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-medium">{formatCurrency(selectedSale.amountPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balance:</span>
                  <Badge variant={selectedSale.newBalance > 0 ? "destructive" : "success"}>
                    {formatCurrency(selectedSale.newBalance
                      || 0)}
                  </Badge>
                </div>
              </div>

              {/* Returns History Section */}
              {saleReturns.length > 0 && (
                <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Undo2 className="h-4 w-4" />
                    Returns Against This Bill ({saleReturns.length})
                  </h3>
                  <div className="space-y-3">
                    {saleReturns.map((ret, index) => (
                      <div key={index} className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-mono font-medium text-orange-700 dark:text-orange-400">
                              {ret.returnNumber}
                            </p>
                            <p className="text-sm text-zinc-500">
                              {formatDate(ret.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-600">
                              -{formatCurrency(ret.totalAmount)}
                            </p>
                            <Badge variant={ret.addToStock ? "success" : "secondary"} className="text-xs">
                              {ret.addToStock ? "Added to Stock" : "Not Added to Stock"}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm">
                          <p className="text-zinc-600 dark:text-zinc-400 mb-1">Returned Items:</p>
                          <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300">
                            {ret.items.map((item, i) => (
                              <li key={i}>
                                {item.productName} × {item.qty} @ {formatCurrency(item.unitPrice)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {ret.reason && (
                          <p className="text-sm text-zinc-500 mt-2 italic">
                            Reason: {ret.reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleOpenReturnDialog(selectedSale)}>
                  <Undo2 className="mr-2 h-4 w-4" />
                  Process Return
                </Button>
                <Button onClick={() => handleReprint(selectedSale._id)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Reprint Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogClose onClick={() => setReturnDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Process Return</DialogTitle>
          </DialogHeader>
          {returningSale && (
            <div className="space-y-4">
              {/* Original Sale Info */}
              <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-500">Invoice Number</p>
                    <p className="font-mono font-medium">{returningSale.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Date</p>
                    <p className="font-medium">{formatDate(returningSale.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Customer</p>
                    <p className="font-medium">{returningSale.customer?.name || "Walk-in"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Original Total</p>
                    <p className="font-medium">{formatCurrency(returningSale.netTotal)}</p>
                  </div>
                </div>
              </div>

              {/* Items to Return */}
              <div>
                <h3 className="font-semibold mb-3">Select Items to Return</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Purchased</TableHead>
                      <TableHead className="text-center">Return Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Return Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-center">{item.originalQty}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="0"
                            max={item.originalQty}
                            value={item.returnQty}
                            onChange={(e) => updateReturnQty(index, e.target.value)}
                            className="w-20 mx-auto text-center"
                          />
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {item.returnQty > 0 ? formatCurrency(item.returnQty * item.unitPrice) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Options */}
              <div className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="addToStock"
                    checked={addToStock}
                    onChange={(e) => setAddToStock(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="addToStock" className="text-base cursor-pointer">
                    Add returned items back to stock
                  </Label>
                </div>
                <p className="text-sm text-zinc-500 ml-8">
                  {addToStock
                    ? "✓ Returned products will be added back to your inventory"
                    : "✗ Returned products will NOT be added to inventory (e.g., damaged/expired)"}
                </p>

                <div className="space-y-2">
                  <Label htmlFor="returnReason">Return Reason (Optional)</Label>
                  <Input
                    id="returnReason"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="e.g., Damaged, Wrong item, Customer changed mind"
                  />
                </div>
              </div>

              {/* Return Summary */}
              <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Return Amount:</span>
                  <span className="text-orange-600">{formatCurrency(getReturnTotal())}</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  This amount will be credited to the customer's account
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setReturnDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReturn}
                  disabled={submittingReturn || getReturnTotal() === 0}
                >
                  {submittingReturn ? "Processing..." : "Process Return"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Error/Info Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Info</DialogTitle>
          </DialogHeader>
          <p>{errorMessage}</p>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setErrorDialogOpen(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

