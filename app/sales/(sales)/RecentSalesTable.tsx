import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Chip } from "@mui/material";
import type { Sale } from "./types";
import { getDataGridStyles } from "./getDataGridStyles";

interface RecentSalesTableProps {
  sales: Sale[];
  isDarkMode: boolean;
}

export function RecentSalesTable({ sales, isDarkMode }: RecentSalesTableProps) {
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

  const processedSales = sales.map((sale, index) => ({
    ...sale,
    id: sale.id || index + 1,
  }));
  return (
    <Card
      className={
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }
    >
      <CardHeader>
        <CardTitle className={isDarkMode ? "text-white" : "text-gray-900"}>
          Recent Sales
        </CardTitle>
        <CardDescription
          className={isDarkMode ? "text-gray-400" : "text-gray-500"}
        >
          Latest transactions
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
            sx={getDataGridStyles(isDarkMode)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
