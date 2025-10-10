/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  BarRequest,
  Sale,
  SaleItem,
} from "../dashboard/sales/(sales)/types";
import { supabaseServer } from "./supabaseServer";

interface SaleData {
  total_amount: number;
  payment_method: string;
  items: SaleItem[];
  table_id: number;
  sales_rep_id?: string;
  sales_rep_name?: string;
}

type ProfitData = {
  profit_amount: number;
};

// Get Supabase server client with error handling
async function getSupabaseServerClient() {
  const client = await supabaseServer();
  if (!client) {
    throw new Error("Supabase server client not available");
  }
  return client;
}

// Error handling wrapper for server actions
async function withErrorHandling<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  errorMessage: string
): Promise<T> {
  try {
    const result = await operation();
    const { data, error } = result;

    if (error) {
      console.error(`${errorMessage}:`, error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new Error(`${errorMessage}: ${error.message}`);
    }

    return (data as T) ?? ([] as T);
  } catch (err) {
    console.error(`${errorMessage} - Unexpected error:`, err);
    throw err;
  }
}

// ---------------- PRODUCTS ----------------

export async function getProducts() {
  const supabase = await getSupabaseServerClient();
  return withErrorHandling(
    async () => await supabase.from("products").select("*"),
    "Could not fetch products"
  );
}

export async function getDeleteProducts(id: number) {
  const supabase = await getSupabaseServerClient();
  return withErrorHandling(
    async () => await supabase.from("products").delete().eq("id", id),
    "Products could not be deleted"
  );
}

export async function getTotalInventory() {
  const supabase = await getSupabaseServerClient();
  return withErrorHandling(
    async () =>
      await supabase
        .from("products")
        .select("current_stock, profit, low_stock, name"),
    "Inventory could not be loaded"
  );
}

// ---------------- SALES ----------------

export async function getAllSales() {
  const supabase = await getSupabaseServerClient();
  return withErrorHandling(
    async () =>
      await supabase.from("sales").select("id, total_amount, sale_date"),
    "Could not fetch sales"
  );
}

export async function getTodaysSales(start: Date, end: Date): Promise<Sale[]> {
  const supabase = await getSupabaseServerClient();
  return withErrorHandling(
    async () =>
      await supabase
        .from("sales")
        .select("*")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString()),
    "Sales could not be loaded"
  );
}

export async function getTodaysProfit(
  start: Date,
  end: Date
): Promise<ProfitData[]> {
  const supabase = await getSupabaseServerClient();
  return withErrorHandling(
    async () =>
      await supabase
        .from("sale_items")
        .select("profit_amount")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString()),
    "Profit data could not be loaded"
  );
}

export async function getRecentSales() {
  const supabase = await getSupabaseServerClient();
  return withErrorHandling(
    async () => await supabase.from("sales").select("*"),
    "Sales could not be loaded"
  );
}

export async function getTopsellingProducts() {
  const supabase = await getSupabaseServerClient();
  return withErrorHandling(
    async () =>
      await supabase.from("sale_items").select(`
      product_id,
      quantity,
      total_price,
      total_cost,
      sale_id,
      created_at,
      profit_amount,
      products (
        name,
        category
      )
    `),
    "Top selling products could not be loaded"
  );
}

export async function getSaleItemsWithCategories() {
  const supabase = await getSupabaseServerClient();
  try {
    const { data, error } = await supabase.from("sale_items").select(`
      *,
      products!inner(
        name,
        category
      )
    `);

    if (error) {
      console.error("Error fetching sale items with categories:", error);
      throw new Error(`Could not fetch sale items: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error("Unexpected error in getSaleItemsWithCategories:", err);
    throw err;
  }
}

// ---------------- DASHBOARD STATS ----------------

export async function getStats() {
  const supabase = await getSupabaseServerClient();
  try {
    const [salesResult, lowStockResult, productsResult] =
      await Promise.allSettled([
        supabase.from("sales").select("total_amount"),
        supabase.from("products").select("id").eq("low_stock", true),
        supabase.from("products").select("id, current_stock"),
      ]);

    const salesData =
      salesResult.status === "fulfilled" ? salesResult.value.data : [];
    const lowStockData =
      lowStockResult.status === "fulfilled" ? lowStockResult.value.data : [];
    const productsData =
      productsResult.status === "fulfilled" ? productsResult.value.data : [];

    const totalRevenue =
      salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

    return {
      totalSales: salesData?.length || 0,
      totalRevenue,
      lowStockItems: lowStockData?.length || 0,
      totalProducts:
        productsData?.filter((item) => item.current_stock !== 0).length || 0,
    };
  } catch (error) {
    console.error("Error in getStats:", error);
    return {
      totalSales: 0,
      totalRevenue: 0,
      lowStockItems: 0,
      totalProducts: 0,
    };
  }
}

// ---------------- CREATE SALE ----------------

function generateSaleNumber(): number {
  const now = new Date();
  return Number(
    `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(
      now.getMinutes()
    ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}${String(
      now.getMilliseconds()
    ).padStart(3, "0")}`
  );
}

export async function createSales(saleData: SaleData) {
  const supabase = await getSupabaseServerClient();
  let saleId: string | null = null;

  try {
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        sale_number: generateSaleNumber(),
        total_amount: saleData.total_amount,
        payment_method: saleData.payment_method,
        sale_date: new Date().toISOString(),
        table_id: saleData.table_id,
        sales_rep_id: saleData.sales_rep_id,
        sales_rep_name: saleData.sales_rep_name,
      })
      .select()
      .single();

    if (saleError)
      throw new Error(`Could not create sale: ${saleError.message}`);

    saleId = sale.id;

    const saleItemsToInsert = saleData.items.map((item) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      unit_cost: item.unit_cost,
      total_price: item.total_price,
      total_cost: item.total_cost,
      profit_amount: item.profit_amount,
    }));

    const { error: itemsError } = await supabase
      .from("sale_items")
      .insert(saleItemsToInsert);

    if (itemsError)
      throw new Error(`Could not create sale items: ${itemsError.message}`);

    // Update product stock
    await Promise.all(
      saleData.items.map(async (item) => {
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("current_stock")
          .eq("id", item.product_id)
          .single();

        if (fetchError) throw new Error(fetchError.message);

        const newStock = Math.max(0, product.current_stock - item.quantity);

        const { error: updateError } = await supabase
          .from("products")
          .update({ current_stock: newStock })
          .eq("id", item.product_id);

        if (updateError) throw new Error(updateError.message);
      })
    );

    return sale;
  } catch (error) {
    if (saleId) {
      try {
        await supabase.from("sales").delete().eq("id", saleId);
      } catch (rollbackError) {
        console.error("Failed to rollback sale:", rollbackError);
      }
    }
    throw error;
  }
}

// ---------------- USERS ----------------

export async function getUserData() {
  const supabase = await getSupabaseServerClient();
  return withErrorHandling(
    async () => await supabase.from("users").select("*"),
    "Users could not be loaded"
  );
}

// ---------------- BAR REQUESTS ----------------

export async function getBarRequests() {
  const supabase = await getSupabaseServerClient();
  return withErrorHandling(
    async () => await supabase.from("bar_requests").select("*"),
    "Could not fetch bar requests"
  );
}

export async function createBarRequests(
  barRequestItems: Omit<BarRequest, "id">[]
) {
  const supabase = await getSupabaseServerClient();
  return withErrorHandling(
    async () =>
      await supabase.from("bar_requests").insert(barRequestItems).select(),
    "Could not create bar requests"
  );
}

export async function updateRequestStatus(
  requestId: string,
  newStatus: "given" | "cancelled"
) {
  const supabase = await getSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("bar_requests")
      .update({ status: newStatus })
      .eq("id", requestId);

    if (error) throw new Error(`Could not update status: ${error.message}`);

    return { success: true, requestId, newStatus };
  } catch (error) {
    console.error("Error updating request status:", error);
    throw error;
  }
}

export async function updateMultipleRequestsStatus(
  requestIds: string[],
  newStatus: "given" | "cancelled"
) {
  const supabase = await getSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("bar_requests")
      .update({ status: newStatus })
      .in("id", requestIds);

    if (error) throw new Error(`Could not update statuses: ${error.message}`);

    return { success: true, requestIds, newStatus };
  } catch (error) {
    console.error("Error updating multiple request statuses:", error);
    throw error;
  }
}
