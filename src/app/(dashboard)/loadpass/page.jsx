"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { reportAPI } from "@/lib/api";
import { FileText, Printer, Package, Receipt, Boxes } from "lucide-react";

// Helper to get local date string in YYYY-MM-DD format
const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function LoadPassPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(getLocalDateString());

    useEffect(() => {
        fetchLoadPass();
    }, [selectedDate]);

    const fetchLoadPass = async () => {
        try {
            setLoading(true);
            const response = await reportAPI.getLoadPass({ date: selectedDate });
            setData(response.data.data);
        } catch (error) {
            console.error("Error fetching loadpass:", error);
            alert("Failed to fetch loadpass data");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");

        const categoriesHtml = data?.categories?.map(cat => `
      <div style="margin-bottom: 20px;">
        <h3 style="background: #f0f0f0; padding: 8px; margin: 0; border-left: 4px solid #333;">${cat.category}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #e0e0e0;">
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Product</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Category (Company)</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: center; width: 100px;">Qty (Units)</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: center; width: 100px;">Total PCS</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: center; width: 80px;">Unit</th>
            </tr>
          </thead>
          <tbody>
            ${cat.items.map(item => `
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${item.name}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${item.category || cat.category}</td>
                <td style="border: 1px solid #ccc; padding: 8px; text-align: center; font-weight: bold;">${item.totalQtyInUnits || 0}</td>
                <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${item.totalQty}</td>
                <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${item.unit}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('') || '';

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>LoadPass - ${selectedDate}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0; color: #666; }
          .summary { display: flex; justify-content: space-around; margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
          .summary-item { text-align: center; }
          .summary-item .label { font-size: 12px; color: #666; }
          .summary-item .value { font-size: 24px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Khalil Traders Nowshera</h1>
          <p>Near Ordinance Depot Mohallah Eisakhail Badrashi Nowshera</p>
          <p>Phone: 0335-5314415</p>
        </div>
        <div style="text-align: center; margin-bottom: 15px;">
          <h2 style="margin: 0;">📦 LOAD PASS</h2>
          <p style="margin: 5px 0;">Daily Stock Requirement</p>
          <p><strong>Date: ${new Date(selectedDate).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <div class="label">Total Invoices</div>
            <div class="value">${data?.summary?.totalInvoices || 0}</div>
          </div>
          <div class="summary-item">
            <div class="label">Products Sold</div>
            <div class="value">${data?.summary?.totalProducts || 0}</div>
          </div>
          <div class="summary-item">
            <div class="label">Total Items</div>
            <div class="value">${data?.summary?.totalItems || 0}</div>
          </div>
        </div>
        
        ${categoriesHtml}
        
        <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #999;">
          Generated on ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `);

        printWindow.document.close();
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 500);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent dark:border-zinc-50"></div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading LoadPass...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Package className="h-8 w-8" />
                        LoadPass
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Daily stock requirement based on today's sales</p>
                </div>
                <Button onClick={handlePrint} disabled={!data?.categories?.length}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print LoadPass
                </Button>
            </div>

            {/* Date Picker */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Select Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={getLocalDateString()}
                            />
                        </div>
                        <Button variant="outline" onClick={() => setSelectedDate(getLocalDateString())}>
                            Today
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data?.summary?.totalInvoices || 0}</div>
                        <p className="text-xs text-muted-foreground">Bills generated today</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data?.summary?.totalProducts || 0}</div>
                        <p className="text-xs text-muted-foreground">Different products</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Boxes className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data?.summary?.totalItems || 0}</div>
                        <p className="text-xs text-muted-foreground">Total quantity sold</p>
                    </CardContent>
                </Card>
            </div>

            {/* Products by Category */}
            {!data?.categories?.length ? (
                <Card>
                    <CardContent className="py-12">
                        <p className="text-center text-zinc-500">No sales found for this date</p>
                    </CardContent>
                </Card>
            ) : (
                data.categories.map((cat, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{cat.category}</span>
                                <Badge variant="secondary">{cat.items.length} products</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Category (Company)</TableHead>
                                        <TableHead className="text-center w-[120px]">Qty (Units)</TableHead>
                                        <TableHead className="text-center w-[120px]">Total PCS</TableHead>
                                        <TableHead className="text-center w-[80px]">Unit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cat.items.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{item.category || cat.category}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="default" className="text-lg px-3">
                                                    {item.totalQtyInUnits || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center text-zinc-500">
                                                {item.totalQty}
                                            </TableCell>
                                            <TableCell className="text-center text-zinc-500">
                                                {item.unit}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}
