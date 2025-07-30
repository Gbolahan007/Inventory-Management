export const getDataGridStyles = (isDarkMode: boolean) => ({
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
    color: isDarkMode ? "#ffffff" : "#000000",
    fontWeight: "bold",
    "& .MuiDataGrid-columnHeaderTitle": {
      color: isDarkMode ? "#ffffff" : "#000000",
      fontWeight: "bold",
    },
  },
  "& .MuiDataGrid-columnHeader": {
    backgroundColor: isDarkMode ? "#1e293b !important" : "#ffffff !important",
    color: isDarkMode ? "#ffffff !important" : "#000000 !important",
  },
  "& .MuiDataGrid-columnHeaderTitleContainer": {
    backgroundColor: isDarkMode ? "#1e293b !important" : "#ffffff !important",
    color: isDarkMode ? "#ffffff !important" : "#000000 !important",
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
      backgroundColor: isDarkMode ? "#1f2937" : "rgba(5, 150, 105, 0.15)",
    },
  },
  backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
  color: isDarkMode ? "#f8fafc" : "#111827",
  border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
});
