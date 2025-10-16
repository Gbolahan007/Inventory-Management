// PRODUCT
export interface Product {
  id: string;
  name: string;
  category?: string;
  cost_price: number;
  selling_price: number;
  profit_margin?: number;
  current_stock: number;
  minimum_stock?: number;
  low_stock?: boolean;
  profit?: number;
  is_active?: boolean;
}

// USER ( Sales Rep or Admin )
export interface User {
  id: string;
  name: string;
  role?: string;
}
type Expense = {
  id: number;
  category: string;
  amount: number;
  sale_id: string | number;
  created_at?: string;
};

// SALE
export interface Sale {
  id: string;
  sale_number?: string;
  total_amount: number;
  payment_method?: string;
  sale_date: string;
  created_at?: string;
  quantity_sold?: number;
  total_revenue?: number;
  profits?: number;
  total_cost?: number;
  sales_rep_name?: string;
  table_id?: number;

  // Optional inventory relationship
  inventory?: {
    id: string;
    subcategories: {
      name: string;
      categories: {
        name: string;
      };
    };
  };

  // Optional expenses relationship
  expenses?: Expense[];
}

// SALE ITEM (used in normal sale and cart)
export interface SaleItem {
  id?: string;
  sale_id?: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
  selling_price: number;
  approval_status?: "pending" | "approved" | "rejected";
  bar_request_id?: string;
  products?: {
    name: string;
  };
}

// If you want to link a sale item to a bar request / bar status
export interface SaleItemWithBarStatus extends SaleItem {
  bar_request_status?: "pending" | "given" | "cancelled" | "none";
}

// BAR REQUEST
export interface BarRequest {
  id: string; // UUID (PK)
  table_id: number | string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  sales_rep_id: string;
  sales_rep_name: string;
  status: "pending" | "given" | "cancelled " | "completed";
  created_at?: string;
  updated_at?: string;
}

export interface TableCart {
  id: number;
  items: SaleItem[];
  total: number;
  status?: string;
}

// Statistics you show on dashboard
export interface Stats {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockItems: number;
}
