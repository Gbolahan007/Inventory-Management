import { supabase } from "@/app/_lib/supabase";

// Define the shape of the returned data
type Sale = {
  id: string;
  quantity_sold: number;
  total_revenue: number;
  profits: number;
  total_cost: number;
  created_at: string;
  inventory: {
    id: string;
    subcategories: {
      name: string;
      categories: {
        name: string;
      };
    };
  };
};

export async function getAllSales() {
  const { data, error } = await supabase
    .from("sales")
    .select("id, total_amount, sale_date");

  if (error) {
    console.error(error);
    throw new Error("Could not fetch sales");
  }

  return data ?? [];
}

export async function getTodaysSales(start: Date, end: Date): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  if (error) {
    console.error(error);
    throw new Error("Sales could not be loaded");
  }
  return data as Sale[];
}

export async function getTotalInventory() {
  const { data, error } = await supabase
    .from("products")
    .select("current_stock, profit");

  if (error) {
    console.error(error);
    throw new Error("Sales could not be loaded");
  }
  return data;
}

export async function getTopsellingProducts() {
  const { data, error } = await supabase
    .from("sale_items")
    .select("product_id, quantity, total_price, products(name)");

  if (error) {
    console.error(error);
    throw new Error("Sales could not be loaded");
  }
  return data;
}
