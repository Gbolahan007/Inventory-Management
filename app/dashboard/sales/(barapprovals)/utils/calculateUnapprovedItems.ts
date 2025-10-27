/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SaleItem } from "@/app/(store)/useTableCartStore";
import { BarRequestItem } from "@/app/_lib/actions";

// Calculate only unapproved items (difference between current and approved quantities)

export function calculateUnapprovedItems(
  cartItems: SaleItem[],
  needsBarApprovalFn: (name: string, category?: string) => boolean,
  products?: any[]
): SaleItem[] {
  return cartItems
    .filter((item) => {
      const product = products?.find((p) => p.id === item.product_id);
      return needsBarApprovalFn(item.name, product?.category);
    })
    .map((item) => {
      const approvedQty = Number(item.approved_quantity) || 0;
      const pendingQty = Number(item.quantity) - approvedQty;

      return {
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        quantity: pendingQty,
        approved_quantity: item.approved_quantity || 0,
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
    quantity: item.quantity,
    product_price: item.unit_price,
    sales_rep_id: currentUserId,
    sales_rep_name: currentUserName,
    status: "pending",
  }));
}
