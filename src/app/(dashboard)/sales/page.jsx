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

