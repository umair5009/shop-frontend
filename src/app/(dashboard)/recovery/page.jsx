"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { reportAPI, areaAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Printer, Users, Wallet } from "lucide-react";

// Helper to get local date string in YYYY-MM-DD format
const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function RecoverySheetPage() {
    const [data, setData] = useState(null);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(getLocalDateString());
    const [selectedArea, setSelectedArea] = useState("");

    useEffect(() => {
        fetchAreas();
    }, []);

    useEffect(() => {
        fetchRecoverySheet();
    }, [selectedDate, selectedArea]);

    const fetchAreas = async () => {
        try {
            const response = await areaAPI.getAll();
            setAreas(response.data || []);
        } catch (error) {
            console.error("Error fetching areas:", error);
        }
    };

    const fetchRecoverySheet = async () => {
        try {
            setLoading(true);
            const params = { date: selectedDate };
            if (selectedArea) params.area = selectedArea;
            const response = await reportAPI.getRecoverySheet(params);
            setData(response.data.data);
        } catch (error) {
            console.error("Error fetching recovery sheet:", error);
            alert("Failed to fetch recovery sheet");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");

        const rowsHtml = data?.customers?.map((customer, index) => `
      <tr>
        <td style="border: 1px solid #333; padding: 8px; text-align: center;">${index + 1}</td>
        <td style="border: 1px solid #333; padding: 8px;">${customer.name}</td>
        <td style="border: 1px solid #333; padding: 8px; text-align: right;">Rs ${customer.previousBalance.toLocaleString()}</td>
        <td style="border: 1px solid #333; padding: 8px; text-align: right;">Rs ${customer.currentBalance.toLocaleString()}</td>
        <td style="border: 1px solid #333; padding: 8px; text-align: right; font-weight: bold;">Rs ${customer.totalBalance.toLocaleString()}</td>
        <td style="border: 1px solid #333; padding: 8px; min-width: 100px;"></td>
      </tr>
    `).join('') || '';

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recovery Sheet - ${selectedDate}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { font-family: Arial, sans-serif; padding: 15px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 22px; }
          .header p { margin: 3px 0; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #333; color: white; padding: 10px 8px; text-align: center; }
          .totals-row { background: #f0f0f0; font-weight: bold; }
          .totals-row td { border: 2px solid #333; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Khalil Traders Nowshera</h1>
          <p>Near Ordinance Depot Mohallah Eisakhail Badrashi Nowshera</p>
          <p>Phone: 0335-5314415</p>
        </div>
        <div style="text-align: center; margin-bottom: 15px;">
          <h2 style="margin: 0;">💰 RECOVERY SHEET</h2>
          <p><strong>Date: ${new Date(selectedDate).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
          ${selectedArea ? `<p>Area: <strong>${selectedArea}</strong></p>` : '<p>All Areas</p>'}
          <p>Total Customers: ${data?.customerCount || 0}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th style="text-align: left;">Customer Name</th>
              <th style="width: 120px;">Previous Balance</th>
              <th style="width: 120px;">Current Balance</th>
              <th style="width: 120px;">Total Balance</th>
              <th style="width: 120px;">Recovery</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr class="totals-row">
              <td colspan="2" style="border: 2px solid #333; padding: 10px; text-align: right;">TOTAL:</td>
              <td style="border: 2px solid #333; padding: 10px; text-align: right;">Rs ${data?.totals?.previousBalance?.toLocaleString() || 0}</td>
              <td style="border: 2px solid #333; padding: 10px; text-align: right;">Rs ${data?.totals?.currentBalance?.toLocaleString() || 0}</td>
              <td style="border: 2px solid #333; padding: 10px; text-align: right;">Rs ${data?.totals?.totalBalance?.toLocaleString() || 0}</td>
              <td style="border: 2px solid #333; padding: 10px;"></td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
          <div style="text-align: center;">
            <p>_______________________</p>
            <p>Salesman Signature</p>
          </div>
          <div style="text-align: center;">
            <p>_______________________</p>
            <p>Admin Signature</p>
          </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center; font-size: 10px; color: #999;">
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
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading Recovery Sheet...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Wallet className="h-8 w-8" />
                        Recovery Sheet
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Customer balances for salesman collection</p>
                </div>
                <Button onClick={handlePrint} disabled={!data?.customers?.length}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Recovery Sheet
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-end gap-4">
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
                        <div className="space-y-2">
                            <Label htmlFor="area">Filter by Area</Label>
                            <Select
                                id="area"
                                value={selectedArea}
                                onChange={(e) => setSelectedArea(e.target.value)}
                            >
                                <option value="">All Areas</option>
                                {areas.map((a) => (
                                    <option key={a._id} value={a.name}>
                                        {a.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <Button variant="outline" onClick={() => {
                            setSelectedDate(getLocalDateString());
                            setSelectedArea("");
                        }}>
                            Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data?.customerCount || 0}</div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 dark:bg-blue-900/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Previous Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(data?.totals?.previousBalance || 0)}</div>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50 dark:bg-amber-900/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{formatCurrency(data?.totals?.currentBalance || 0)}</div>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 dark:bg-red-900/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(data?.totals?.totalBalance || 0)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Customer Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Customer Balances</CardTitle>
                </CardHeader>
                <CardContent>
                    {!data?.customers?.length ? (
                        <p className="text-center text-zinc-500 py-8">No customers with outstanding balance</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>Customer Name</TableHead>
                                    <TableHead>Area</TableHead>
                                    <TableHead className="text-right">Previous Balance</TableHead>
                                    <TableHead className="text-right">Current Balance</TableHead>
                                    <TableHead className="text-right">Total Balance</TableHead>
                                    <TableHead className="text-center w-[120px]">Recovery</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.customers.map((customer, index) => (
                                    <TableRow key={customer.customerId}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{customer.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{customer.area || '-'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-blue-600">
                                            {formatCurrency(customer.previousBalance)}
                                        </TableCell>
                                        <TableCell className="text-right text-amber-600">
                                            {formatCurrency(customer.currentBalance)}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-red-600">
                                            {formatCurrency(customer.totalBalance)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-400">
                                                ---
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {/* Totals Row */}
                                <TableRow className="bg-zinc-100 dark:bg-zinc-800 font-bold">
                                    <TableCell colSpan={3} className="text-right">TOTAL:</TableCell>
                                    <TableCell className="text-right text-blue-600">
                                        {formatCurrency(data.totals.previousBalance)}
                                    </TableCell>
                                    <TableCell className="text-right text-amber-600">
                                        {formatCurrency(data.totals.currentBalance)}
                                    </TableCell>
                                    <TableCell className="text-right text-red-600">
                                        {formatCurrency(data.totals.totalBalance)}
                                    </TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
