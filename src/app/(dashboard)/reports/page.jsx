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
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, Download } from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("shop-profit");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    area: "",
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await areaAPI.getAll();
      setAreas(response.data || []);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

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
        case "area-sales":
          response = await reportAPI.getAreaSales(filters);
          break;
        case "product-insights":
          response = await reportAPI.getProductInsights(filters);
          break;
        case "shop-profit":
          response = await reportAPI.getShopProfit(filters);
          break;
        case "products-by-area":
          response = await reportAPI.getProductsByArea(filters);
          break;
        default:
          break;
      }

      setReportData(response?.data?.data || null);
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
      case "area-sales":
        csvContent = "Date,Invoice #,Customer,Sales Amount,Profit\n";
        reportData.sales?.forEach((item) => {
          csvContent += `${formatDate(item.date)},${item.invoiceNumber},${item.customerName},${item.netTotal},${item.profit}\n`;
        });
        break;
      case "product-insights":
        csvContent = "Product,Qty Sold,Total Sales,Profit\n";
        reportData.products?.forEach((item) => {
          csvContent += `${item.name},${item.totalQty},${item.totalSales},${item.totalProfit}\n`;
        });
        break;
      case "shop-profit":
        csvContent = "Metric,Value\n";
        csvContent += `Total Revenue,${reportData.summary?.totalRevenue}\n`;
        csvContent += `Sales Profit,${reportData.summary?.totalSalesProfit}\n`;
        csvContent += `Total Expenses,${reportData.summary?.totalExpenses}\n`;
        csvContent += `Net Profit,${reportData.summary?.netProfit}\n`;
        break;
      case "products-by-area":
        csvContent = "Area,Total Sales,Gross Profit,Expenses,Net Profit\n";
        reportData.areas?.forEach((item) => {
          csvContent += `${item.area},${item.totalSales},${item.grossProfit},${item.expenses},${item.netProfit}\n`;
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
                <option value="shop-profit">Overall Shop Profit</option>
                <option value="area-sales">Area Sales Report</option>
                <option value="products-by-area">Products by Area</option>
                <option value="product-insights">Most Selling Products</option>
                <option value="outstanding-customers">Outstanding Customers</option>
                <option value="outstanding-suppliers">Outstanding Suppliers</option>
                <option value="stock">Stock Report</option>
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

            {reportType === "area-sales" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="area">Select Area</Label>
                  <Select
                    id="area"
                    value={filters.area}
                    onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                  >
                    <option value="">All Areas</option>
                    {areas.map((area) => (
                      <option key={area._id} value={area.name}>
                        {area.name}
                      </option>
                    ))}
                  </Select>
                </div>
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

            {reportType === "product-insights" && (
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

            {(reportType === "shop-profit" || reportType === "products-by-area") && (
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
              {reportType === "area-sales" && "Area Sales Report"}
              {reportType === "product-insights" && "Shop Sales Insights"}
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

            {/* Area Sales Report */}
            {reportType === "area-sales" && (
              <div className="space-y-4">
                <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Total Sales Amount</p>
                      <p className="text-2xl font-bold">{formatCurrency(reportData.summary?.totalSales || 0)}</p>
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
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.sales?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>{item.invoiceNumber}</TableCell>
                        <TableCell>{item.customerName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.netTotal)}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(item.profit)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Product Insights Report */}
            {reportType === "product-insights" && (
              <div className="space-y-4">
                <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Total Qty Sold</p>
                      <p className="text-2xl font-bold">{reportData.summary?.totalQty || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Total Sales</p>
                      <p className="text-2xl font-bold">{formatCurrency(reportData.summary?.totalSales || 0)}</p>
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
                      <TableHead className="text-right">Total Sales</TableHead>
                      <TableHead className="text-right">Total Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.products?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.totalQty}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.totalSales)}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(item.totalProfit)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Overall Shop Profit Report */}
            {reportType === "shop-profit" && (
              <div className="space-y-4">
                <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(reportData.summary?.totalRevenue || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Sales Profit</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(reportData.summary?.totalSalesProfit || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600">-{formatCurrency(reportData.summary?.totalExpenses || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Net Profit</p>
                      <p className={`text-2xl font-bold ${(reportData.summary?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(reportData.summary?.netProfit || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                    <h4 className="font-semibold mb-2">Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Sales Count:</span>
                        <span>{reportData.summary?.salesCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Purchase Count:</span>
                        <span>{reportData.summary?.purchaseCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Discount Given:</span>
                        <span>{formatCurrency(reportData.summary?.totalDiscount || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {reportData.expenses?.length > 0 && (
                    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                      <h4 className="font-semibold mb-2">Expense Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        {reportData.expenses.map((exp, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{exp.description}:</span>
                            <span className="text-red-600">-{formatCurrency(exp.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Products by Area Report */}
            {reportType === "products-by-area" && (
              <div className="space-y-4">
                <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-zinc-500">Total Areas</p>
                      <p className="text-2xl font-bold">{reportData.summary?.totalAreas || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Total Expenses (Distributed)</p>
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(reportData.summary?.totalExpenses || 0)}</p>
                    </div>
                  </div>
                </div>

                {reportData.areas?.map((area, index) => (
                  <div key={index} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold">{area.area}</h3>
                      <div className="text-right">
                        <p className="text-sm text-zinc-500">Net Profit</p>
                        <p className={`text-xl font-bold ${area.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(area.netProfit)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-zinc-500">Total Sales:</span>
                        <p className="font-medium">{formatCurrency(area.totalSales)}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Gross Profit:</span>
                        <p className="font-medium">{formatCurrency(area.grossProfit)}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Expenses:</span>
                        <p className="font-medium text-red-600">-{formatCurrency(area.expenses)}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">Net Profit:</span>
                        <p className={`font-medium ${area.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(area.netProfit)}
                        </p>
                      </div>
                    </div>

                    {area.topProducts?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-zinc-500 mb-2">Top Products:</p>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead className="text-right">Sales</TableHead>
                              <TableHead className="text-right">Profit</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {area.topProducts.map((prod, i) => (
                              <TableRow key={i}>
                                <TableCell>{prod.name}</TableCell>
                                <TableCell className="text-right">{prod.qty}</TableCell>
                                <TableCell className="text-right">{formatCurrency(prod.sales)}</TableCell>
                                <TableCell className="text-right text-green-600">{formatCurrency(prod.profit)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
