"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { saleAPI, productAPI, customerAPI, reportAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, Users, ShoppingCart, TrendingUp, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    todaySales: 0,
    totalRevenue: 0,
  });
  const [latestSales, setLatestSales] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch products
      const productsRes = await productAPI.getAll({ page: 1, limit: 50 });
      const products = productsRes.data.data.products || [];
      // Fetch customers
      const customersRes = await customerAPI.getAll({ page: 1, limit: 50 });
      const customers = customersRes.data.data.customers || [];

      // Fetch latest sales
      const salesRes = await saleAPI.getAll({ page: 1, limit: 5 });
      const sales = salesRes.data.data.sales || [];

      // Calculate today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaySalesData = sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        saleDate.setHours(0, 0, 0, 0);
        return saleDate.getTime() === today.getTime();
      });

      const todayRevenue = todaySalesData.reduce((sum, sale) => sum + (sale.netTotal || 0), 0);

      // Find low stock products
      const lowStockProducts = products.filter(p => p.stock <= (p.minStock || 10));

      setStats({
        totalProducts: products.length,
        totalCustomers: customers.length,
        todaySales: todaySalesData.length,
        totalRevenue: todayRevenue,
      });

      setLatestSales(sales);
      setLowStock(lowStockProducts.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent dark:border-zinc-50"></div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Welcome to your shop management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-zinc-500">Active products in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-zinc-500">Registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaySales}</div>
            <p className="text-xs text-zinc-500">Sales transactions today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-zinc-500">Total revenue today</p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {latestSales.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 py-4">No sales yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestSales.map((sale) => (
                  <TableRow key={sale._id}>
                    <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                    <TableCell>{sale.customer?.name || "Walk-in"}</TableCell>
                    <TableCell>{formatDate(sale.createdAt)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.netTotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Min Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category?.name || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={product.stock === 0 ? "destructive" : "warning"}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{product.minStock || 10}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

