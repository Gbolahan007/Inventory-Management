import { useTableCartStore } from "@/app/(store)/useTableCartStore";
import { supabase } from "@/app/_lib/supabase";

/**
 * Updates approved quantities when bar approves items
 * ✅ This should be called ONLY when bar actually approves
 */
export async function handleBarApprovalUpdate(
  tableId: number,
  approvedItems: Array<{
    product_id: string | null;
    product_price: number;
    quantity: number; // This is the TOTAL approved quantity for this batch
  }>
): Promise<void> {
  const store = useTableCartStore.getState();

  approvedItems.forEach((approvedItem) => {
    // ✅ Add the newly approved quantity to existing approved_quantity
    store.updateCartItemApprovedQuantity(
      tableId,
      approvedItem.product_id,
      approvedItem.product_price,
      approvedItem.quantity // Increment by the newly approved amount
    );
  });

  console.log(
    "✅ Updated approved quantities for table",
    tableId,
    approvedItems
  );
}

/**
 * Sets up real-time listener for bar approvals
 */
export function setupBarApprovalListener(
  tableId: number,
  tableBarRequestStatus: string | null,
  lastApprovedRequestId: string | null
) {
  // ✅ Only do initial fetch if status is approved AND we haven't synced yet
  if (tableBarRequestStatus === "approved" && lastApprovedRequestId) {
    fetchApprovedItems(tableId, lastApprovedRequestId);
  }

  // Real-time listener for new approvals
  const channel = supabase
    .channel(`bar_approvals_${tableId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "bar_requests",
        filter: `table_id=eq.${tableId}`,
      },
      async (payload) => {
        const newData = payload.new as { id: string; status: string };
        if (newData.status === "approved") {
          console.log("🔔 Real-time approval received for table", tableId);
          await fetchApprovedItems(tableId, newData.id);
        }
      }
    )
    .subscribe();

  return () => {
    console.log("🧹 Unsubscribing from bar approvals for table", tableId);
    supabase.removeChannel(channel);
  };
}

/**
 * Fetch approved items from bar_fulfillments
 */
async function fetchApprovedItems(tableId: number, requestId: string) {
  try {
    const { data, error } = await supabase
      .from("bar_fulfillments")
      .select("product_id, unit_price, quantity_approved")
      .eq("bar_request_id", requestId)
      .eq("status", "approved");

    if (error) throw error;

    if (data && data.length > 0) {
      const approvedItems = data.map((item) => ({
        product_id: item.product_id,
        product_price: item.unit_price,
        quantity: item.quantity_approved,
      }));

      await handleBarApprovalUpdate(tableId, approvedItems);
    }
  } catch (error) {
    console.error("❌ Error fetching approved items:", error);
  }
}

/**
 * Resets approved quantities ONLY when completing a sale
 * ✅ Call this explicitly after sale completion, not on every render
 */
export function resetApprovedQuantitiesOnSaleCompletion(tableId: number): void {
  const store = useTableCartStore.getState();
  store.resetApprovedQuantities(tableId);
  console.log("🧾 Reset approved quantities for table", tableId);
}
