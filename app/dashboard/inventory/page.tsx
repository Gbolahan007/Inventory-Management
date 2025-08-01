"use client";

import type { RootState } from "@/app/store";
import { Chip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import HeaderInventory from "../../components/HeaderInventory";
import { useProducts } from "../../components/queryhooks/useProducts";
import AddProductModal from "../../components/ui/AddProductModal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { FormatCurrency } from "../../hooks/useFormatCurrency";
import { useAuth } from "@/app/(auth)/hooks/useAuth";
import { useRouter } from "next/navigation";

// ✅ Define product type
interface Product {
  id?: number;
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  profit: number;
  current_stock: number;
  low_stock: number;
  created_at: string;
}

// ✅ Main Inventory Page
export default function Inventory() {
  const { products, isLoading, error } = useProducts();
  const isDarkMode = useSelector((state: RootState) => state.global.theme);
  const router = useRouter();
  const { user, userRole, loading, hasPermission } = useAuth();

  // ✅ Modal state
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ✅ Enhanced auth effect with better role-based routing
  useEffect(() => {
    console.log("🔍 Inventory Auth Check:", {
      loading,
      user: !!user,
      userRole,
      hasAdminPermission: hasPermission("admin"),
    });

    // Don't do anything while still loading auth state
    if (loading) {
      return;
    }

    // If no user is authenticated, redirect to login
    if (!user) {
      console.log("❌ No user found, redirecting to login");
      setIsRedirecting(true);
      router.push("/login");
      return;
    }

    // If user is authenticated but role is salesrep, redirect to sales dashboard
    if (userRole === "salesrep") {
      console.log("🔄 Salesrep detected, redirecting to sales dashboard");
      setIsRedirecting(true);
      router.push("/dashboard/sales");
      return;
    }

    // If user doesn't have admin permission (and is not a salesrep), redirect to login
    if (!hasPermission("admin") && userRole !== null) {
      console.log("❌ No admin permission, redirecting to login");
      setIsRedirecting(true);
      router.push("/login");
      return;
    }

    // If we get here, user has proper access
    console.log("✅ User has admin access to inventory");
    setIsRedirecting(false);
  }, [loading, user, userRole, router, hasPermission]);

  // ✅ Show loading state while checking auth or redirecting
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading dashboard..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  // ✅ Additional safety check - don't render if user doesn't have admin access
  if (!user || (userRole !== null && !hasPermission("admin"))) {
    return null; // This should not be reached due to the redirect above, but good safety measure
  }

  const columns: GridColDef<Product>[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Product Name", width: 200 },
    {
      field: "category",
      headerName: "Category",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
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
      field: "cost_price",
      headerName: "Cost Price",
      width: 130,
      type: "number",
      renderCell: (params) => {
        const value = Number(params.row?.cost_price);
        return isNaN(value) || value === 0
          ? FormatCurrency(0)
          : FormatCurrency(value);
      },
    },
    {
      field: "selling_price",
      headerName: "Selling Price",
      width: 140,
      type: "number",
      renderCell: (params) => {
        const value = Number(params.row?.selling_price);
        return isNaN(value) || value === 0
          ? FormatCurrency(0)
          : FormatCurrency(value);
      },
    },
    {
      field: "profit",
      headerName: "Profit",
      width: 90,
      type: "number",
      renderCell: (params) => {
        const value = Number(params.row?.profit);
        return (
          <span className="text-green-600 dark:text-green-400 font-medium">
            {isNaN(value) || value === 0 ? "$0.00" : `${FormatCurrency(value)}`}
          </span>
        );
      },
    },
    {
      field: "current_stock",
      headerName: "Current Stock",
      width: 140,
      type: "number",
      renderCell: (params) => {
        const stock = Number(params.value);
        const lowStock = Number(params.row.low_stock);
        const isLowStock = stock <= lowStock;

        return (
          <div
            className={`font-medium ${
              isLowStock ? "text-red-600 dark:text-red-400" : "text-foreground"
            }`}
          >
            {stock}pcs
          </div>
        );
      },
    },
    {
      field: "low_stock",
      headerName: "Low Stock Alert",
      width: 150,
      type: "number",
    },
    {
      field: "created_at",
      headerName: "Date Added",
      width: 130,
      renderCell: (params) => {
        const date = params.row?.created_at;
        if (!date) return "N/A";

        const parsedDate = new Date(date);
        return isNaN(parsedDate.getTime())
          ? "Invalid Date"
          : parsedDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <HeaderInventory name="Inventory" />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !products) {
    return (
      <div className="flex flex-col">
        <HeaderInventory name="Inventory" />
        <div className="text-center text-red-500 dark:text-red-400 py-4">
          Failed to fetch products
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((item) => item.current_stock !== 0);
  // ✅ Generate unique IDs for rows that don't have them
  const processedProducts = filteredProducts.map((product, index) => ({
    ...product,
    id: product.id || index + 1,
  }));

  // ✅ DEBUG: Create debug styles object
  const debugStyles = {
    backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
    color: isDarkMode ? "#ffffff" : "#000000",
    fontWeight: "bold",
    fontSize: "16px",
  };

  return (
    <div className="flex flex-col">
      {/* ✅ Header */}
      <HeaderInventory name="Inventory" />

      {/* ✅ Add Product Button */}
      <div className="flex justify-end mb-4 p-3">
        <button
          onClick={() => setIsAddProductModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            isDarkMode
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <DataGrid
        rows={processedProducts}
        columns={columns}
        getRowId={(row) => row.id}
        checkboxSelection
        className="bg-card shadow rounded-lg border border-border text-foreground"
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        disableRowSelectionOnClick
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: debugStyles.backgroundColor,
            color: debugStyles.color,
            fontWeight: debugStyles.fontWeight,
            fontSize: debugStyles.fontSize,
            "& .MuiDataGrid-columnHeaderTitle": {
              color: debugStyles.color,
              fontWeight: debugStyles.fontWeight,
              fontSize: debugStyles.fontSize,
            },
          },

          // ✅ Try multiple selectors to see which one works
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: debugStyles.backgroundColor + " !important",
            color: debugStyles.color + " !important",
          },

          "& .MuiDataGrid-columnHeaderTitleContainer": {
            backgroundColor: debugStyles.backgroundColor + " !important",
            color: debugStyles.color + " !important",
          },

          "& .MuiDataGrid-root .MuiDataGrid-columnHeaders": {
            backgroundColor: debugStyles.backgroundColor + " !important",
            color: debugStyles.color + " !important",
          },

          // ✅ Row hover styles - similar to light mode
          "& .MuiDataGrid-row:hover": {
            backgroundColor: isDarkMode ? "#2d3748" : "#f9fafb",
            cursor: "pointer",
          },

          // Keep other styles minimal for debugging
          "& .MuiDataGrid-cell": {
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            color: isDarkMode ? "#f8fafc" : "#111827",
          },
          "& .MuiTablePagination-displayedRows": {
            color: isDarkMode ? "#ffffff" : "#000000",
          },
          "& .MuiTablePagination-selectLabel": {
            color: isDarkMode ? "#ffffff" : "#000000",
          },
          "& .MuiInputBase-root": {
            color: isDarkMode ? "#ffffff" : "#000000",
          },
          "& .MuiTablePagination-actions": {
            color: isDarkMode ? "#ffffff" : "#000000",
          },
          "& .MuiCheckbox-root": {
            color: isDarkMode ? "#ffffff" : "#000000",
            "&.Mui-checked": {
              color: isDarkMode ? "#ffffff" : "#1976d2",
            },
          },
          // ✅ Row checkbox styling
          "& .MuiDataGrid-cellCheckbox .MuiCheckbox-root": {
            color: isDarkMode ? "#ffffff" : "#000000",
            "&.Mui-checked": {
              color: isDarkMode ? "#ffffff" : "#1976d2",
            },
          },
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: isDarkMode ? "#667688" : "rgba(5, 150, 105, 0.1)",
            "&:hover": {
              backgroundColor: isDarkMode
                ? "#1f2937"
                : "rgba(5, 150, 105, 0.15)",
            },
          },
          backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
          color: isDarkMode ? "#f8fafc" : "#111827",
          border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
        }}
      />

      {/* ✅ Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
