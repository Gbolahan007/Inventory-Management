/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SaleItem } from "@/app/(store)/useTableCartStore";
import { BarRequestItem } from "@/app/_lib/actions";
import { supabase } from "@/app/_lib/supabase";

// ============================================
// UPDATED: Calculate unapproved items by checking database
// ============================================

export async function calculateUnapprovedItems(
  cartItems: SaleItem[],
  needsBarApprovalFn: (name: string, category?: string) => boolean,
  products?: any[],
  tableId?: number
): Promise<SaleItem[]> {
  // Filter items that need bar approval
  const itemsNeedingApproval = cartItems.filter((item) => {
    const product = products?.find((p) => p.id === item.product_id);
    return needsBarApprovalFn(item.name, product?.category);
  });

  if (itemsNeedingApproval.length === 0) {
    return [];
  }

  //  NEW: Fetch approved quantities from database for cross-device sync
  const approvedQuantitiesMap = new Map<string, number>();

  if (tableId) {
    try {
      // Get all active fulfillments for this table from database
      const { data: fulfillments, error } = await supabase
        .from("bar_fulfillments")
        .select("product_id, unit_price, quantity_approved, status")
        .eq("table_id", tableId)
        .in("status", ["pending", "approved"]);

      console.log(fulfillments);
      if (!error && fulfillments) {
        // Create map of product_id + unit_price -> total quantity_approved
        fulfillments.forEach((f) => {
          const key = `${f.product_id}-${f.unit_price}`;
          const currentApproved = approvedQuantitiesMap.get(key) || 0;
          // Sum up all approved quantities for this product (in case of multiple fulfillments)
          approvedQuantitiesMap.set(
            key,
            currentApproved + (f.quantity_approved || 0)
          );
        });
      }
    } catch (error) {
      console.error("Error fetching approved quantities from database:", error);
      // Continue with local approved_quantity as fallback
    }
  }

  // Calculate pending quantities (cart quantity - database approved quantity)
  return itemsNeedingApproval
    .map((item) => {
      // Check database first, fallback to local state
      const key = `${item.product_id}-${item.unit_price}`;
      const approvedQty = approvedQuantitiesMap.has(key)
        ? approvedQuantitiesMap.get(key)!
        : Number(item.approved_quantity) || 0;

      const pendingQty = Number(item.quantity) - approvedQty;

      return {
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        quantity: pendingQty, // Only unapproved quantity
        approved_quantity: approvedQty, // Track what's already approved
        unit_price: item.unit_price,
        unit_cost: item.unit_cost,
        total_price: item.unit_price * pendingQty,
        total_cost: item.unit_cost * pendingQty,
        profit_amount: (item.unit_price - item.unit_cost) * pendingQty,
        selling_price: item.selling_price,
        sales_rep_id: item.sales_rep_id,
        sales_rep_name: item.sales_rep_name,
        fulfillment_id: item.fulfillment_id,
      } as SaleItem;
    })
    .filter((item) => item.quantity > 0);
}

/**
 * Convert unapproved items to bar request format
 */
export function formatBarRequestItems(
  unapprovedItems: SaleItem[],
  tableId: number,
  currentUserId: string,
  currentUserName: string
): BarRequestItem[] {
  return unapprovedItems.map((item) => ({
    table_id: tableId,
    product_id: typeof item.product_id === "number" ? item.product_id : null,
    product_name: item.name,
    quantity: item.quantity, // Only the pending/unapproved quantity
    product_price: item.unit_price,
    sales_rep_id: currentUserId,
    sales_rep_name: currentUserName,
    status: "pending",
  }));
}
