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
interface BarApprovalUpdate {
  modification_type?: string;
  new_product_id?: string;
  new_product_name?: string;
  new_quantity?: number;
  status?: string;
  modified_at?: string;
  modified_by?: string;
}

interface BarModificationRecord {
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
  notes?: string;
  modified_by_barman?: boolean;
}

interface ModificationData {
  tableId: number;
  salesRepId: string;
  salesRepName: string;
  fulfillmentId: string;
  modificationType: "exchange" | "quantity_change" | "remove";
  originalProductId?: string;
  originalProductName?: string;
  originalQuantity?: number;
  newProductId?: string;
  newProductName?: string;
  newQuantity?: number;
  unitPrice?: number;
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

export async function updateBarApprovalItem(
  fulfillmentId: string,
  updates: BarApprovalUpdate
) {
  const supabase = await supabaseServer();

  try {
    const { data, error } = await supabase
      .from("bar_fulfillments")
      .update(updates)
      .eq("id", fulfillmentId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createBarModificationRecord(
  modification: BarModificationRecord
) {
  const supabase = await supabaseServer();

  try {
    const { data, error } = await supabase
      .from("bar_modifications")
      .insert({
        ...modification,
        status: "approved",
        processed_at: new Date().toISOString(),
        processed_by: "barman",
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getModificationHistory(fulfillmentId: string) {
  const supabase = await supabaseServer();

  try {
    const { data, error } = await supabase
      .from("bar_modifications")
      .select("*")
      .eq("fulfillment_id", fulfillmentId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTableModifications(tableId: number) {
  const supabase = await supabaseServer();

  try {
    const { data, error } = await supabase
      .from("bar_modifications")
      .select("*")
      .eq("table_id", tableId)
      .eq("modified_by_barman", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Modify a bar fulfillment item (barman can edit approved items)
 */

export async function modifyBarFulfillment(modification: ModificationData) {
  const supabase = await supabaseServer();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("❌ Auth error:", userError);
      return { success: false, error: "User not authenticated" };
    }

    // ✅ Get existing fulfillment
    const { data: existingFulfillment, error: fetchError } = await supabase
      .from("bar_fulfillments")
      .select("*, bar_requests!inner(table_id, status)")
      .eq("id", modification.fulfillmentId)
      .single();

    if (fetchError || !existingFulfillment) {
      console.error("❌ Fulfillment not found:", fetchError);
      return { success: false, error: "Fulfillment record not found" };
    }

    const requestId = existingFulfillment.request_id;
    const tableId = modification.tableId;

    // ============================================
    // HANDLE REMOVE - Requires Re-approval
    // ============================================
    if (modification.modificationType === "remove") {
      // Mark for deletion, not immediate deletion
      const { error: updateError } = await supabase
        .from("bar_fulfillments")
        .update({
          pending_modification: true,
          pending_quantity: 0, // Signal for removal
          modification_requested_at: new Date().toISOString(),
          modification_requested_by: user.id,
          status: "pending_modification",
        })
        .eq("id", modification.fulfillmentId);

      if (updateError) {
        console.error("❌ Error marking for removal:", updateError);
        return { success: false, error: updateError.message };
      }

      // Log history
      await supabase.from("bar_fulfillment_history").insert({
        fulfillment_id: modification.fulfillmentId,
        request_id: requestId,
        table_id: tableId,
        modified_by: user.id,
        modification_type: "remove_requested",
        old_product_id: modification.originalProductId,
        old_product_name: modification.originalProductName,
        old_quantity: modification.originalQuantity,
        old_unit_price: modification.unitPrice,
        notes: `Removal requested - awaiting bar approval`,
      });

      return {
        success: true,
        requiresApproval: true,
        data: {
          fulfillmentId: modification.fulfillmentId,
          status: "pending_modification",
          changesSummary: `${modification.originalProductName} - removal requested`,
        },
      };
    }

    // ============================================
    // HANDLE EXCHANGE - Requires Re-approval
    // ============================================
    if (modification.modificationType === "exchange") {
      // Store pending changes, don't apply immediately
      const { error: updateError } = await supabase
        .from("bar_fulfillments")
        .update({
          pending_modification: true,
          pending_product_id: modification.newProductId,
          pending_product_name: modification.newProductName,
          pending_quantity: modification.newQuantity,
          pending_unit_price: modification.unitPrice,
          modification_requested_at: new Date().toISOString(),
          modification_requested_by: user.id,
          status: "pending_modification",
        })
        .eq("id", modification.fulfillmentId);

      if (updateError) {
        console.error("❌ Error storing pending exchange:", updateError);
        return { success: false, error: updateError.message };
      }

      // Log history
      await supabase.from("bar_fulfillment_history").insert({
        fulfillment_id: modification.fulfillmentId,
        request_id: requestId,
        table_id: tableId,
        modified_by: user.id,
        modification_type: "exchange_requested",
        old_product_id: modification.originalProductId,
        old_product_name: modification.originalProductName,
        old_quantity: modification.originalQuantity,
        old_unit_price: existingFulfillment.unit_price,
        new_product_id: modification.newProductId,
        new_product_name: modification.newProductName,
        new_quantity: modification.newQuantity,
        new_unit_price: modification.unitPrice,
        notes: `Exchange requested: ${modification.originalProductName} → ${modification.newProductName} - awaiting bar approval`,
      });

      return {
        success: true,
        requiresApproval: true,
        data: {
          fulfillmentId: modification.fulfillmentId,
          pending_product_id: modification.newProductId,
          pending_product_name: modification.newProductName,
          pending_quantity: modification.newQuantity,
          pending_unit_price: modification.unitPrice,
          status: "pending_modification",
          changesSummary: `Exchange to ${modification.newProductName} - awaiting approval`,
        },
      };
    }

    // ============================================
    // HANDLE QUANTITY CHANGE - Requires Re-approval
    // ============================================
    if (modification.modificationType === "quantity_change") {
      const { error: updateError } = await supabase
        .from("bar_fulfillments")
        .update({
          pending_modification: true,
          pending_quantity: modification.newQuantity,
          modification_requested_at: new Date().toISOString(),
          modification_requested_by: user.id,
          status: "pending_modification",
        })
        .eq("id", modification.fulfillmentId);

      if (updateError) {
        console.error("❌ Error storing pending quantity change:", updateError);
        return { success: false, error: updateError.message };
      }

      // Log history
      await supabase.from("bar_fulfillment_history").insert({
        fulfillment_id: modification.fulfillmentId,
        request_id: requestId,
        table_id: tableId,
        modified_by: user.id,
        modification_type: "quantity_change_requested",
        old_quantity: modification.originalQuantity,
        new_quantity: modification.newQuantity,
        notes: `Quantity change requested: ${modification.originalQuantity} → ${modification.newQuantity} - awaiting bar approval`,
      });

      return {
        success: true,
        requiresApproval: true,
        data: {
          fulfillmentId: modification.fulfillmentId,
          pending_quantity: modification.newQuantity,
          status: "pending_modification",
          changesSummary: `Quantity change to ${modification.newQuantity} - awaiting approval`,
        },
      };
    }

    return { success: false, error: "Invalid modification type" };
  } catch (error: any) {
    console.error("❌ Error in modifyBarFulfillment:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// 3. NEW ACTION: Approve Modification
// ============================================
export async function approveModification(fulfillmentId: string) {
  const supabase = await supabaseServer();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get the pending modification
    const { data: fulfillment, error: fetchError } = await supabase
      .from("bar_fulfillments")
      .select("*")
      .eq("id", fulfillmentId)
      .eq("pending_modification", true)
      .single();

    if (fetchError || !fulfillment) {
      return { success: false, error: "No pending modification found" };
    }

    // Handle removal approval
    if (fulfillment.pending_quantity === 0) {
      const { error: deleteError } = await supabase
        .from("bar_fulfillments")
        .delete()
        .eq("id", fulfillmentId);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      // Log approval
      await supabase.from("bar_fulfillment_history").insert({
        fulfillment_id: fulfillmentId,
        request_id: fulfillment.request_id,
        table_id: fulfillment.table_id,
        modified_by: user.id,
        modification_type: "removal_approved",
        notes: "Item removal approved by bar",
      });

      return {
        success: true,
        data: {
          action: "removed",
          fulfillmentId,
        },
      };
    }

    // Apply pending changes
    const updateData: any = {
      pending_modification: false,
      modification_requested_at: null,
      modification_requested_by: null,
      status: "pending",
      modification_count: (fulfillment.modification_count || 0) + 1,
      updated_at: new Date().toISOString(),
    };

    // Apply product exchange if present
    if (fulfillment.pending_product_id) {
      updateData.product_id = fulfillment.pending_product_id;
      updateData.product_name = fulfillment.pending_product_name;
      updateData.unit_price = fulfillment.pending_unit_price;
      updateData.pending_product_id = null;
      updateData.pending_product_name = null;
      updateData.pending_unit_price = null;
    }

    // Apply quantity change if present
    if (fulfillment.pending_quantity !== null) {
      updateData.quantity_approved = fulfillment.pending_quantity;
      updateData.pending_quantity = null;
    }

    const { error: updateError } = await supabase
      .from("bar_fulfillments")
      .update(updateData)
      .eq("id", fulfillmentId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Log approval
    await supabase.from("bar_fulfillment_history").insert({
      fulfillment_id: fulfillmentId,
      request_id: fulfillment.request_id,
      table_id: fulfillment.table_id,
      modified_by: user.id,
      modification_type: "modification_approved",
      notes: "Modification approved by bar",
    });

    // Broadcast the approved change
    const broadcastChannel = supabase.channel(
      `bar-modifications-${Date.now()}`
    );

    broadcastChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await broadcastChannel.send({
          type: "broadcast",
          event: "fulfillment-modified",
          payload: {
            tableId: Number(fulfillment.table_id),
            fulfillmentId,
            modificationType: "approved",
            updatedData: {
              product_id: updateData.product_id || fulfillment.product_id,
              product_name: updateData.product_name || fulfillment.product_name,
              quantity_approved:
                updateData.quantity_approved || fulfillment.quantity_approved,
              unit_price: updateData.unit_price || fulfillment.unit_price,
              status: "pending",
            },
            timestamp: new Date().toISOString(),
          },
        });

        setTimeout(() => supabase.removeChannel(broadcastChannel), 1000);
      }
    });

    return {
      success: true,
      data: {
        action: "approved",
        fulfillmentId,
        updatedData: updateData,
      },
    };
  } catch (error: any) {
    console.error("❌ Error approving modification:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// 4. NEW ACTION: Reject Modification
// ============================================
export async function rejectModification(fulfillmentId: string) {
  const supabase = await supabaseServer();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get the pending modification
    const { data: fulfillment, error: fetchError } = await supabase
      .from("bar_fulfillments")
      .select("*")
      .eq("id", fulfillmentId)
      .eq("pending_modification", true)
      .single();

    if (fetchError || !fulfillment) {
      return { success: false, error: "No pending modification found" };
    }

    // Clear pending changes and restore to pending status
    const { error: updateError } = await supabase
      .from("bar_fulfillments")
      .update({
        pending_modification: false,
        pending_product_id: null,
        pending_product_name: null,
        pending_quantity: null,
        pending_unit_price: null,
        modification_requested_at: null,
        modification_requested_by: null,
        status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", fulfillmentId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Log rejection
    await supabase.from("bar_fulfillment_history").insert({
      fulfillment_id: fulfillmentId,
      request_id: fulfillment.request_id,
      table_id: fulfillment.table_id,
      modified_by: user.id,
      modification_type: "modification_rejected",
      notes: "Modification rejected by bar - reverted to original",
    });

    return {
      success: true,
      data: {
        action: "rejected",
        fulfillmentId,
      },
    };
  } catch (error: any) {
    console.error("❌ Error rejecting modification:", error);
    return { success: false, error: error.message };
  }
}
