import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";
import { getDataGridStyles } from "./getDataGridStyles";
import type { Product } from "./types";

interface ProductInventoryTableProps {
  products: Product[];
  isDarkMode: boolean;
}

export function ProductInventoryTable({
  products,
  isDarkMode,
}: ProductInventoryTableProps) {
  const productColumns: GridColDef<Product>[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Product Name", width: 200 },
    {
      field: "category",
      headerName: "Category",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value || "General"}
          variant="outlined"
          size="small"
          sx={{
            textTransform: "capitalize",
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            color: isDarkMode ? "#f8fafc" : "#111827",
            backgroundColor: isDarkMode ? "#1e293b" : "#f9fafb",
          }}
        />
      ),
    },
    {
      field: "selling_price",
      headerName: "Price",
      width: 130,
      type: "number",
      renderCell: (params) => {
        const value = Number(params.row?.selling_price);
        return isNaN(value) || value === 0
          ? "₦0.00"
          : `₦${value.toLocaleString()}`;
      },
    },
    {
      field: "current_stock",
      headerName: "Stock",
      width: 100,
      type: "number",
      renderCell: (params) => {
        const stock = Number(params.value);
        const isLowStock = params.row.low_stock;
        return (
          <div
            className={`font-medium ${
              isLowStock
                ? "text-red-600 dark:text-red-400"
                : isDarkMode
                ? "text-gray-200"
                : "text-foreground"
            }`}
          >
            {stock}pcs
          </div>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Badge variant={params.row.low_stock ? "destructive" : "default"}>
          {params.row.low_stock ? "Low Stock" : "In Stock"}
        </Badge>
      ),
    },
  ];

  const processedProducts = products.map((product, index) => ({
    ...product,
    id: product.id || index + 1,
  }));

  return (
    <Card
      className={
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }
    >
      <CardHeader>
        <CardTitle className={isDarkMode ? "text-white" : "text-gray-900"}>
          Product Inventory
        </CardTitle>
        <CardDescription
          className={isDarkMode ? "text-gray-400" : "text-gray-500"}
        >
          Current stock levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={processedProducts.slice(0, 10)}
            columns={productColumns}
            getRowId={(row) => row.id}
            className="bg-card shadow rounded-lg border border-border text-foreground"
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5, 10]}
            disableRowSelectionOnClick
            sx={getDataGridStyles(isDarkMode)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
