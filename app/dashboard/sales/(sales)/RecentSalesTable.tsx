/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  Chip,
  Modal,
  Box,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import { X } from "lucide-react";
import { useState } from "react";
import type { Sale } from "./types";
import { getDataGridStyles } from "./getDataGridStyles";
import { compareDesc, parseISO } from "date-fns";

type SaleItem = {
  id?: string;
  sale_id?: string | number;
  product_id: string;
  quantity: number;
  unit_price?: number;
  unit_cost?: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
  created_at?: string;
  products?: {
    name: string;
    category?: string;
  };
};

interface RecentSalesTableProps {
  sales: Sale[];
  salesItems?: SaleItem[];
  isDarkMode: boolean;
}

export function RecentSalesTable({
  sales,
  salesItems,
  isDarkMode,
}: RecentSalesTableProps) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function getFilteredSales(sales?: Sale[]): Sale[] {
    if (!sales?.length) return [];

    const r = [...sales].sort((a, b) =>
      compareDesc(
        parseISO(a.created_at || a.sale_date),
        parseISO(b.created_at || b.sale_date)
      )
    );
    return r;
  }

  const getSaleItems = (saleId: string | number): SaleItem[] => {
    return (
      salesItems?.filter(
        (item) => item.sale_id === saleId || item.sale_id === saleId.toString()
      ) || []
    );
  };

  const handleRowClick = (params: any) => {
    const sale = sales.find((s) => s.id === params.row.id);
    if (sale) {
      setSelectedSale(sale);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSale(null);
  };
  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    maxWidth: "90vw",
    maxHeight: "90vh",
    overflow: "auto",
    bgcolor: isDarkMode ? "#1f2937" : "#ffffff",
    color: isDarkMode ? "#f8fafc" : "#111827",
    border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  const salesColumns: GridColDef[] = [
    {
      field: "id",
      headerName: "Sale ID",
      width: 120,
      renderCell: (params) => `#${params.value.toString().slice(-6)}`,
    },
    {
      field: "total_amount",
      headerName: "Amount",
      width: 130,
      type: "number",
      renderCell: (params) => {
        const value = Number(params.value);
        return `₦${value.toLocaleString()}`;
      },
    },
    {
      field: "payment_method",
      headerName: "Payment",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value || "Cash"}
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
      field: "sale_date",
      headerName: "Date",
      width: 130,
      renderCell: (params) => {
        const date = params.value;
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

  const processedSales = getFilteredSales(sales).map((sale, index) => ({
    ...sale,
    id: sale.id || index + 1,
  }));

  const saleItems = selectedSale ? getSaleItems(selectedSale.id) : [];

  return (
    <>
      <Card
        className={
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }
      >
        <CardHeader>
          <CardTitle className={isDarkMode ? "text-white" : "text-gray-900"}>
            Recent Sales
          </CardTitle>
          <CardDescription
            className={isDarkMode ? "text-gray-400" : "text-gray-500"}
          >
            Latest transactions - Click on a row to view details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={processedSales}
              columns={salesColumns}
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
              onRowClick={handleRowClick}
              sx={{
                ...getDataGridStyles(isDarkMode),
                "& .MuiDataGrid-row": {
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="transaction-details-modal"
        aria-describedby="transaction-details-description"
      >
        <Box sx={modalStyle}>
          <div className="flex justify-between items-center mb-4">
            <Typography
              id="transaction-details-modal"
              variant="h6"
              component="h2"
              sx={{ color: isDarkMode ? "#f8fafc" : "#111827" }}
            >
              Transaction Details
            </Typography>
            <IconButton
              onClick={handleCloseModal}
              sx={{ color: isDarkMode ? "#f8fafc" : "#111827" }}
            >
              <X size={20} />
            </IconButton>
          </div>

          {selectedSale && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Typography
                    variant="body2"
                    sx={{ color: isDarkMode ? "#9ca3af" : "#6b7280" }}
                  >
                    Sale ID
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: isDarkMode ? "#f8fafc" : "#111827" }}
                  >
                    #{selectedSale.id.toString().slice(-6)}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="body2"
                    sx={{ color: isDarkMode ? "#9ca3af" : "#6b7280" }}
                  >
                    Sale Number
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: isDarkMode ? "#f8fafc" : "#111827" }}
                  >
                    {selectedSale.sale_number || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="body2"
                    sx={{ color: isDarkMode ? "#9ca3af" : "#6b7280" }}
                  >
                    Date
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: isDarkMode ? "#f8fafc" : "#111827" }}
                  >
                    {new Date(selectedSale.sale_date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="body2"
                    sx={{ color: isDarkMode ? "#9ca3af" : "#6b7280" }}
                  >
                    Payment Method
                  </Typography>
                  <Chip
                    label={selectedSale.payment_method || "Cash"}
                    variant="outlined"
                    size="small"
                    sx={{
                      textTransform: "capitalize",
                      borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                      color: isDarkMode ? "#f8fafc" : "#111827",
                      backgroundColor: isDarkMode ? "#1e293b" : "#f9fafb",
                      mt: 1,
                    }}
                  />
                </div>
              </div>

              <Divider
                sx={{ bgcolor: isDarkMode ? "#374151" : "#e5e7eb", my: 2 }}
              />

              <Typography
                variant="h6"
                sx={{ color: isDarkMode ? "#f8fafc" : "#111827", mb: 2 }}
              >
                Items Purchased
              </Typography>

              {saleItems?.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {saleItems.map((item, index) => (
                    <div
                      key={item.id || index}
                      className={`p-3 rounded-lg ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <Typography
                            variant="body1"
                            sx={{
                              color: isDarkMode ? "#f8fafc" : "#111827",
                              fontWeight: 500,
                            }}
                          >
                            {item.products?.name || "Unknown Product"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: isDarkMode ? "#9ca3af" : "#6b7280" }}
                          >
                            Quantity: {item.quantity}
                          </Typography>
                        </div>
                        <Typography
                          variant="body1"
                          sx={{
                            color: isDarkMode ? "#f8fafc" : "#111827",
                            fontWeight: 500,
                          }}
                        >
                          ₦{item.total_price.toLocaleString()}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: isDarkMode ? "#9ca3af" : "#6b7280", mb: 4 }}
                >
                  No items found for this sale
                </Typography>
              )}

              <Divider
                sx={{ bgcolor: isDarkMode ? "#374151" : "#e5e7eb", my: 2 }}
              />

              <div className="flex justify-between items-center">
                <Typography
                  variant="h6"
                  sx={{ color: isDarkMode ? "#f8fafc" : "#111827" }}
                >
                  Total Amount
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: isDarkMode ? "#10b981" : "#059669",
                    fontWeight: 600,
                  }}
                >
                  ₦{selectedSale.total_amount.toLocaleString()}
                </Typography>
              </div>
            </div>
          )}
        </Box>
      </Modal>
    </>
  );
}
