"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { reportAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, Download } from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("profit");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const fetchReport = async () => {
    try {
      setLoading(true);
      let response;

      switch (reportType) {
        case "profit":
          response = await reportAPI.getProfit(filters);
          break;
        case "category":
          response = await reportAPI.getCategory(filters);
          break;
        case "stock":
          response = await reportAPI.getStock();
          break;
        case "outstanding-customers":
          response = await reportAPI.getOutstandingCustomers();
          break;
        case "outstanding-suppliers":
          response = await reportAPI.getOutstandingSuppliers();
          break;
        default:
          break;
      }

      setReportData(response?.data || null);
    } catch (error) {
      console.error("Error fetching report:", error);
      alert("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    let csvContent = "";
    let filename = `${reportType}-report.csv`;

    switch (reportType) {
      case "profit":
        csvContent = "Product,Quantity Sold,Total Revenue,Total Cost,Profit\n";
        reportData.products?.forEach((item) => {
          csvContent += `${item.product},${item.quantitySold},${item.totalRevenue},${item.totalCost},${item.profit}\n`;
        });
        break;
      case "category":
        csvContent = "Category,Total Sales,Total Revenue\n";
        reportData.categories?.forEach((item) => {
          csvContent += `${item.category},${item.totalSales},${item.totalRevenue}\n`;
        });
        break;
      case "stock":
        csvContent = "Product,Category,Current Stock,Min Stock,Status\n";
        reportData.products?.forEach((item) => {
          csvContent += `${item.name},${item.category},${item.stock},${item.minStock},${item.status}\n`;
        });
        break;
      case "outstanding-customers":
        csvContent = "Customer,Phone,Balance\n";
        reportData.customers?.forEach((item) => {
          csvContent += `${item.name},${item.phone || "N/A"},${item.balance}\n`;
        });
        break;
      case "outstanding-suppliers":
        csvContent = "Supplier,Phone,Balance\n";
        reportData.suppliers?.forEach((item) => {
          csvContent += `${item.name},${item.phone || "N/A"},${item.balance}\n`;
        });
        break;
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Generate and export business reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select
                id="reportType"
                value={reportType}
                onChange={(e) => {
                  setReportType(e.target.value);
                  setReportData(null);
                }}
              >
                <option value="profit">Profit Report</option>
                <option value="category">Category Sales Report</option>
                <option value="stock">Stock Report</option>
                <option value="outstanding-customers">Outstanding Customers</option>
                <option value="outstanding-suppliers">Outstanding Suppliers</option>
              </Select>
            </div>

            {(reportType === "profit" || reportType === "category") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={fetchReport} disabled={loading}>
              <FileText className="mr-2 h-4 w-4" />
              {loading ? "Generating..." : "Generate Report"}
            </Button>
            {reportData && (
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>
              {reportType === "profit" && "Profit Report"}
              {reportType === "category" && "Category Sales Report"}
              {reportType === "stock" && "Stock Movement Report"}
              {reportType === "outstanding-customers" && "Outstanding Customer Dues"}
              {reportType === "outstanding-suppliers" && "Outstanding Supplier Payments"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Profit Report */}
            {reportType === "profit" && (
              <div className="space-y-4">
                <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(reportData.summary?.totalRevenue || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Total Cost</p>
                      <p className="text-2xl font-bold">{formatCurrency(reportData.summary?.totalCost || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Total Profit</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.summary?.totalProfit || 0)}</p>
                    </div>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.products?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product}</TableCell>
                        <TableCell className="text-right">{item.quantitySold}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.totalRevenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.totalCost)}</TableCell>
                        <TableCell className="text-right">
                          <span className={item.profit >= 0 ? "text-green-600" : "text-red-600"}>
                            {formatCurrency(item.profit)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Category Report */}
            {reportType === "category" && (
              <div className="space-y-4">
                <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Total Sales</p>
                      <p className="text-2xl font-bold">{reportData.summary?.totalSales || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(reportData.summary?.totalRevenue || 0)}</p>
                    </div>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Total Sales</TableHead>
                      <TableHead className="text-right">Total Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.categories?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">{item.totalSales}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.totalRevenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Stock Report */}
            {reportType === "stock" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Min Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.products?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">{item.stock}</TableCell>
                      <TableCell className="text-right">{item.minStock}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "Low Stock" ? "destructive" : "success"}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Outstanding Customers */}
            {reportType === "outstanding-customers" && (
              <div className="space-y-4">
                <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                  <div>
                    <p className="text-sm text-zinc-500">Total Outstanding</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(reportData.summary?.totalOutstanding || 0)}
                    </p>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.customers?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.phone || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive">{formatCurrency(item.balance)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Outstanding Suppliers */}
            {reportType === "outstanding-suppliers" && (
              <div className="space-y-4">
                <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                  <div>
                    <p className="text-sm text-zinc-500">Total Outstanding</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(reportData.summary?.totalOutstanding || 0)}
                    </p>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.suppliers?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.phone || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="warning">{formatCurrency(item.balance)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

