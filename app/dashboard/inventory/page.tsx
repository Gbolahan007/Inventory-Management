/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import type { RootState } from "@/app/store";
import { Chip, IconButton, Tooltip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import HeaderInventory from "../../components/HeaderInventory";
import { useProducts } from "../../components/queryhooks/useProducts";
import AddProductModal from "../../components/ui/AddProductModal";
import { useDeleteProduct } from "@/app/components/queryhooks/useDeleteproduct";
import DeleteProductInverntoryModal from "@/app/components/ui/DeleteProductInverntoryModal";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { FormatCurrency } from "../../hooks/useFormatCurrency";
import { useAuth } from "@/app/(auth)/hooks/useAuth";

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

// ✅ Main Inventory Page - NOW MUCH SIMPLER!
export default function Inventory() {
  // Only use useAuth for loading state - middleware handles authentication
  const { loading } = useAuth();

  const { products, isLoading, error, refetch } = useProducts();
  const isDarkMode = useSelector((state: RootState) => state.global.theme);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  // ✅ Modal states
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductForDelete, setSelectedProductForDelete] =
    useState<Product | null>(null);

  // ✅ Fixed row click handler
  const handleRowClick = (params: any) => {
    const product = products?.find((p) => p.id === params.row.id);
    if (product) {
      console.log("Selected product:", product);
    }
  };

  // ✅ Handle opening delete modal
  const handleOpenDeleteModal = (product: Product) => {
    setSelectedProductForDelete(product);
    setIsDeleteModalOpen(true);
  };

  // ✅ Handle closing delete modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProductForDelete(null);
  };

  // ✅ Handle delete product through modal
  const handleDeleteProduct = async (productId: number) => {
    return new Promise<void>((resolve, reject) => {
      deleteProduct(productId, {
        onSuccess: () => {
          toast.success("Product deleted successfully");
          refetch(); // Refresh the products list
          resolve();
        },
        onError: (error) => {
          console.error("Error deleting product:", error);
          toast.error("Failed to delete product. Please try again.");
          reject(error);
        },
      });
    });
  };

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
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <div className="flex items-center mt-3 space-x-1">
            <Tooltip title="Delete Product" arrow>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDeleteModal(params.row);
                }}
                size="small"
                disabled={isDeleting}
                sx={{
                  color: isDarkMode ? "#f87171" : "#dc2626",
                  "&:hover": {
                    backgroundColor: isDarkMode ? "#7f1d1d" : "#fef2f2",
                  },
                  "&:disabled": {
                    opacity: 0.5,
                  },
                }}
              >
                <Trash2 className="w-4 h-4" />
              </IconButton>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  // ✅ Show loading spinner only for auth loading (middleware handles auth checks)
  if (loading) {
    return (
      <div className="flex flex-col">
        <HeaderInventory name="Inventory" />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // ✅ Show loading for products data
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

  // ✅ Show error state
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

  // ✅ Process products data
  const filteredProducts = products.filter((item) => item.current_stock !== 0);
  const processedProducts = filteredProducts.map((product, index) => ({
    ...product,
    id: product.id || index + 1,
  }));

  const debugStyles = {
    backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
    color: isDarkMode ? "#ffffff" : "#000000",
    fontWeight: "bold",
    fontSize: "16px",
  };

  // ✅ If we reach here, middleware has already verified:
  // - User is authenticated
  // - User has admin permissions
  // - No need for manual redirects!
  return (
    <div className="flex flex-col">
      {/* <HeaderInventory name="Inventory" /> */}

      {/* ✅ Add Product Button */}
      <div className="flex justify-end mb-4 p-5">
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
        onRowClick={handleRowClick}
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
          "& .MuiDataGrid-row:hover": {
            backgroundColor: isDarkMode ? "#2d3748" : "#f9fafb",
            cursor: "pointer",
          },
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

      {/* ✅ Delete Product Modal */}
      <DeleteProductInverntoryModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onDelete={handleDeleteProduct}
        product={selectedProductForDelete}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
