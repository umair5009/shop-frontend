"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { saleAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye, Printer, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching sale details:", error);
      alert("Failed to fetch sale details");
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
      alert("Failed to reprint invoice");
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
                <span class="meta-value">${printData.customerNo || ''}</span>
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
                <span class="meta-value">${printData.area || ''}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Delivered By:</span>
                <span class="meta-value">${printData.deliveredBy || ''}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Booked By:</span>
                <span class="meta-value">${printData.bookedBy || ''}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">License #:</span>
                <span class="meta-value">${printData.licenseNo || ''}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">CNIC:</span>
                <span class="meta-value">${printData.cnic || ''}</span>
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
                <span class="meta-value">${printData.dueDate ? new Date(printData.dueDate).toLocaleDateString() : ''}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Order No:</span>
                <span class="meta-value">${printData.orderNo || ''}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Page Number:</span>
                <span class="meta-value">1 of 1</span>
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
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search by invoice number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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
                  <TableRow key={sale._id}>
                    <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                    <TableCell>{sale.customer?.name || "Walk-in"}</TableCell>
                    <TableCell>{formatDate(sale.createdAt)}</TableCell>
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
                  <p className="font-medium">{formatDate(selectedSale.createdAt)}</p>
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

              <div className="flex justify-end">
                <Button onClick={() => handleReprint(selectedSale._id)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Reprint Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

