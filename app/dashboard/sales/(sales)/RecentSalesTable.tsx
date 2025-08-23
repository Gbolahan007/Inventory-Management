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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { X } from "lucide-react";
import { useState, useMemo } from "react";
import type { Sale } from "./types";
import { getDataGridStyles } from "./getDataGridStyles";
import { compareDesc, parseISO } from "date-fns";

// Type definition for a sale item
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

// Component props interface
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
  // State to manage selected sale and modal visibility
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSalesRep, setSelectedSalesRep] = useState<string>("all");

  // Get unique sales rep names for filter dropdown
  const salesRepNames = useMemo(() => {
    const uniqueNames = new Set<string>();
    sales.forEach((sale) => {
      if (sale.sales_rep_name) {
        uniqueNames.add(sale.sales_rep_name);
      }
    });
    return Array.from(uniqueNames).sort();
  }, [sales]);

  // Sorts sales by descending date and filters by sales rep if selected
  function getFilteredSales(sales?: Sale[]): Sale[] {
    if (!sales?.length) return [];

    let filtered = [...sales];

    // Filter by sales rep if not "all"
    if (selectedSalesRep !== "all") {
      filtered = filtered.filter(
        (sale) => sale.sales_rep_name === selectedSalesRep
      );
    }

    // Sort by date descending
    const sorted = filtered.sort((a, b) =>
      compareDesc(
        parseISO(a.created_at || a.sale_date),
        parseISO(b.created_at || b.sale_date)
      )
    );

    return sorted;
  }

  // Filters sale items by sale ID
  const getSaleItems = (saleId: string | number): SaleItem[] => {
    return (
      salesItems?.filter(
        (item) => item.sale_id === saleId || item.sale_id === saleId.toString()
      ) || []
    );
  };

  // Prepare sales data for DataGrid, ensuring each row has an ID
  const processedSales = getFilteredSales(sales).map((sale, index) => ({
    ...sale,
    id: sale.id || index + 1,
  }));

  // Get items for the currently selected sale
  const saleItems = selectedSale ? getSaleItems(selectedSale.id) : [];

  // Handle row click in DataGrid
  const handleRowClick = (params: any) => {
    const sale = sales.find((s) => s.id === params.row.id);
    if (sale) {
      setSelectedSale(sale);
      setIsModalOpen(true);
    }
  };

  // Close the modal and reset state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSale(null);
  };

  // Handle sales rep filter change
  const handleSalesRepChange = (event: any) => {
    setSelectedSalesRep(event.target.value);
  };

  // Modal styling (light or dark mode aware)
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

  // DataGrid columns configuration
  const salesColumns: GridColDef[] = [
    {
      field: "id",
      headerName: "Sale ID",
      width: 100,
      renderCell: (params) => `#${params.value.toString().slice(-6)}`,
    },
    {
      field: "table_id",
      headerName: "Table",
      width: 80,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "sales_rep_name",
      headerName: "Sales Rep",
      width: 120,
      renderCell: (params) => params.value || "Unknown",
    },
    {
      field: "total_amount",
      headerName: "Amount",
      width: 120,
      type: "number",
      renderCell: (params) => {
        const value = Number(params.value);
        return `₦${value.toLocaleString()}`;
      },
    },
    {
      field: "payment_method",
      headerName: "Payment",
      width: 100,
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

  return (
    <>
      {/* Card containing the sales DataGrid */}
      <Card
        className={
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }
      >
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle
                className={isDarkMode ? "text-white" : "text-gray-900"}
              >
                Recent Sales
              </CardTitle>
              <CardDescription
                className={isDarkMode ? "text-gray-400" : "text-gray-500"}
              >
                Latest transactions - Click on a row to view details
              </CardDescription>
            </div>

            {/* Sales Rep Filter */}
            <FormControl
              size="small"
              sx={{
                minWidth: 150,
                "& .MuiOutlinedInput-root": {
                  color: isDarkMode ? "#f8fafc" : "#111827",
                  "& fieldset": {
                    borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                  },
                  "&:hover fieldset": {
                    borderColor: isDarkMode ? "#4b5563" : "#d1d5db",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isDarkMode ? "#6366f1" : "#3b82f6",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: isDarkMode ? "#9ca3af" : "#6b7280",
                },
              }}
            >
              <InputLabel>Filter by Sales Rep</InputLabel>
              <Select
                value={selectedSalesRep}
                onChange={handleSalesRepChange}
                label="Filter by Sales Rep"
                sx={{
                  "& .MuiSelect-select": {
                    color: isDarkMode ? "#f8fafc" : "#111827",
                  },
                  "& .MuiSvgIcon-root": {
                    color: isDarkMode ? "#9ca3af" : "#6b7280",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: isDarkMode ? "#1f2937" : "#ffffff",
                      border: isDarkMode
                        ? "1px solid #374151"
                        : "1px solid #e5e7eb",
                      "& .MuiMenuItem-root": {
                        color: isDarkMode ? "#f8fafc" : "#111827",
                        "&:hover": {
                          backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="all">All Sales Reps</MenuItem>
                {salesRepNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
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

      {/* Modal to display sale details */}
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
              {/* Summary info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Typography
                    variant="body2"
                    sx={{ color: isDarkMode ? "#9ca3af" : "#6b7280" }}
                  >
                    Sale ID
                  </Typography>
                  <Typography variant="body1">
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
                  <Typography variant="body1">
                    {selectedSale.sale_number || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="body2"
                    sx={{ color: isDarkMode ? "#9ca3af" : "#6b7280" }}
                  >
                    Table
                  </Typography>
                  <Typography variant="body1">
                    {selectedSale.table_id || "N/A"}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="body2"
                    sx={{ color: isDarkMode ? "#9ca3af" : "#6b7280" }}
                  >
                    Sales Rep
                  </Typography>
                  <Typography variant="body1">
                    {selectedSale.sales_rep_name || "Unknown"}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="body2"
                    sx={{ color: isDarkMode ? "#9ca3af" : "#6b7280" }}
                  >
                    Date
                  </Typography>
                  <Typography variant="body1">
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

              {/* Sale Items */}
              <Typography variant="h6" sx={{ mb: 2 }}>
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
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {item.products?.name || "Unknown Product"}
                          </Typography>
                          <Typography variant="body2">
                            Quantity: {item.quantity}
                          </Typography>
                        </div>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          ₦{item.total_price.toLocaleString()}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Typography variant="body2" sx={{ mb: 4 }}>
                  No items found for this sale
                </Typography>
              )}

              <Divider
                sx={{ bgcolor: isDarkMode ? "#374151" : "#e5e7eb", my: 2 }}
              />

              {/* Total amount display */}
              <div className="flex justify-between items-center">
                <Typography variant="h6">Total Amount</Typography>
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
