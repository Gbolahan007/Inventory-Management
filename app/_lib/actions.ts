/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { BarRequest } from "../dashboard/sales/(sales)/types";
import { supabaseServer } from "@/app/_lib/supabaseServer";

// ---------------- TYPES ----------------

interface SaleData {
  sale_number: string;
  total_amount: number;
  payment_method: string;
  sale_date: string;
}

interface SaleItem {
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
}

export interface BarRequestItem {
  table_id: number;
  product_id: string | null;
  product_name: string;
  quantity: number;
  product_price: number;
  sales_rep_id: string;
  sales_rep_name: string;
  status: "completed" | "pending";
}

interface BarFulfillmentItem {
  table_id: number;
  sales_rep_id: string;
  sales_rep_name: string;
  product_id: string | null;
  product_name: string;
  quantity_approved: number;
  unit_price: number;
}

interface FulfillmentUpdate {
  quantity_fulfilled?: number;
  quantity_returned?: number;
  status?: string;
  fulfilled_at?: string;
  notes?: string;
}

interface BarModification {
  table_id: number;
  sales_rep_id: string;
  sales_rep_name: string;
  modification_type: string;
  original_product_id?: string;
  original_product_name?: string;
  original_quantity?: number;
  new_product_id?: string;
  new_product_name?: string;
  new_quantity?: number;
  reason?: string;
}

// ---------------- PRODUCT ACTIONS ----------------

export async function createProduct(formdata: FormData) {
  const supabase = await supabaseServer();

  const name = formdata.get("name") as string;
  const cost_price = Number(formdata.get("cost_price"));
  const selling_price = Number(formdata.get("selling_price"));
  const current_stock = Number(formdata.get("current_stock"));
  const low_stock = Number(formdata.get("low_stock"));
  const category = formdata.get("category") as string;
  const profit = Number(formdata.get("profit"));

  const { data: existingProduct, error: selectError } = await supabase
    .from("products")
    .select("current_stock")
    .eq("name", name)
    .maybeSingle();

  if (selectError) throw new Error("Error checking existing product");

  if (existingProduct) {
    const updatedStock = existingProduct.current_stock + current_stock;
    const { error: updateError } = await supabase
      .from("products")
      .update({
        current_stock: updatedStock,
        cost_price,
        selling_price,
        low_stock,
        category,
        profit,
        created_at: new Date().toISOString(),
      })
      .eq("name", name);
    if (updateError) throw new Error("Product stock could not be updated");
  } else {
    const newProduct = {
      name,
      cost_price,
      selling_price,
      current_stock,
      low_stock,
      category,
      profit,
      quantity: 1,
      created_at: new Date().toISOString(),
    };
    const { error: insertError } = await supabase
      .from("products")
      .insert(newProduct);
    if (insertError) throw new Error("Product could not be created");
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath("/");
  redirect("/dashboard/inventory");
}

export async function updateProductStock(productId: string, newStock: number) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("products")
    .update({ current_stock: newStock })
    .eq("id", productId);
  if (error) throw new Error("Could not update product stock");
  return data;
}

// ---------------- SALES ACTIONS ----------------

export async function createSale(saleData: SaleData) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("sales")
    .insert(saleData)
    .select()
    .single();
  if (error) throw new Error("Could not create sale");
  return data;
}

export async function createSaleItems(saleItems: SaleItem[]) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("sale_items").insert(saleItems);
  if (error) throw new Error("Could not create sale items");
  return data;
}

// ---------------- ROOM BOOKING ----------------

export async function addRoomBooking(formData: FormData) {
  const supabase = await supabaseServer();
  console.log(formData);
  const category = formData.get("category") as string;
  const customer_type = formData.get("customer_type") as string;
  const room_type = formData.get("room_type") as string;
  const discount_sale = formData.get("discount_sale") === "Yes";
  const num_nights = parseInt(formData.get("num_nights") as string, 10);
  const total_price = parseFloat(formData.get("total") as string);
  const price = parseFloat(formData.get("price") as string);
  const customer_name = formData.get("customer_name") as string;

  const { error } = await supabase.from("room_bookings").insert([
    {
      category,
      customer_type,
      room_type,
      discount_sale,
      num_nights,
      total_price,
      price,
      customer_name,
    },
  ]);

  if (error) throw new Error(error.message);
  return { success: true };
}

// ---------------- BAR REQUESTS ----------------

export async function createBarRequestRecords(
  barRequestItems: Omit<BarRequest, "id">[]
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("bar_requests")
    .insert(barRequestItems)
    .select();

  if (error) {
    return {
      success: false,
      error: `Failed to create bar request records: ${error.message}`,
    };
  }

  return {
    success: true,
    data,
  };
}

export async function updateBarRequestStatus(
  requestId: string,
  newStatus: "given" | "cancelled" | "completed"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("bar_requests")
    .update({ status: newStatus })
    .eq("id", requestId);
  if (error)
    return {
      success: false,
      error: `Failed to update status: ${error.message}`,
    };
  return { success: true };
}

export async function updateMultipleBarRequestsStatus(
  requestIds: string[],
  newStatus: "given" | "cancelled" | "completed"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("bar_requests")
    .update({ status: newStatus })
    .in("id", requestIds);
  if (error)
    return {
      success: false,
      error: `Failed to update statuses: ${error.message}`,
    };
  return { success: true };
}

// ---------------- EXPENSES ----------------

export async function addExpense(formData: FormData) {
  const supabase = await supabaseServer();

  const expense_date = formData.get("expense_date") as string;
  const category = formData.get("category") as string;
  const amount = Number(formData.get("amount"));
  console.log(formData);

  if (!expense_date || !category || !amount) {
    throw new Error("All fields are required");
  }

  const { data, error } = await supabase
    .from("daily_expenses")
    .insert([{ expense_date, category, amount }])
    .select()
    .single();

  if (error) throw new Error("Could not add expense");

  return data;
}

// ---------------- BAR FULFILLMENTS ----------------

export async function createBarFulfillmentRecords(
  barRequestId: string,
  items: BarFulfillmentItem[]
) {
  const supabase = await supabaseServer();

  try {
    const fulfillments = items.map((item) => ({
      bar_request_id: barRequestId,
      table_id: item.table_id,
      sales_rep_id: item.sales_rep_id,
      sales_rep_name: item.sales_rep_name,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity_approved: item.quantity_approved,
      quantity_fulfilled: 0,
      unit_price: item.unit_price,
      total_amount: item.quantity_approved * item.unit_price,
      status: "pending",
    }));

    const { data, error } = await supabase
      .from("bar_fulfillments")
      .insert(fulfillments)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateFulfillmentStatus(
  fulfillmentId: string,
  updates: FulfillmentUpdate
) {
  const supabase = await supabaseServer();

  try {
    const { data, error } = await supabase
      .from("bar_fulfillments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", fulfillmentId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ---------------- BAR MODIFICATIONS ----------------

export async function createBarModification(modification: BarModification) {
  const supabase = await supabaseServer();

  try {
    const { data, error } = await supabase
      .from("bar_modifications")
      .insert({ ...modification, status: "pending" })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function processBarModification(
  modificationId: string,
  action: "approve" | "reject",
  processedBy: string
) {
  const supabase = await supabaseServer();

  try {
    const status = action === "approve" ? "approved" : "rejected";
    const { data, error } = await supabase
      .from("bar_modifications")
      .update({
        status,
        processed_at: new Date().toISOString(),
        processed_by: processedBy,
      })
      .eq("id", modificationId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
