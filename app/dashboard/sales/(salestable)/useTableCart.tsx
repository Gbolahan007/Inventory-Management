/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTableCartStore } from "@/app/(store)/useTableCartStore";
import { useExpensesStore } from "@/app/(store)/useExpensesStore";
import { useCreateSale } from "@/app/components/queryhooks/useCreateSale";
import { supabase } from "@/app/_lib/supabase";
import toast from "react-hot-toast";
import type { Product } from "../(sales)/types";
import {
  type BarRequestItem,
  createBarRequestRecords,
  updateFulfillmentStatus,
} from "@/app/_lib/actions";
import { subscribeToTable } from "@/app/_lib/client-data-service";
import {
  calculateUnapprovedItems,
  formatBarRequestItems,
} from "../(barapprovals)/utils/calculateUnapprovedItems";
import { resetApprovedQuantitiesOnSaleCompletion } from "../(barapprovals)/utils/handleBarApprovalUpdate";

interface UseTableCartLogicProps {
  products?: Product[];
  currentUser?: { name: string };
  currentUserId?: string;
}

const needsBarApproval = (
  productName: string,
  productCategory?: string
): boolean => {
  const name = productName.toLowerCase();
  const category = productCategory?.toLowerCase() || "";

  if (
    name.includes("cigarette") ||
    name.includes("cigar") ||
    category === "cigarette"
  ) {
    return true;
  }

  const foodCategories = ["kitchen", "asun", "suya", "food"];
  if (foodCategories.some((cat) => category.includes(cat))) {
    return false;
  }

  return true;
};

export function useTableCartLogic({
  products,
  currentUser,
  currentUserId,
}: UseTableCartLogicProps) {
  // ---------- STATES ----------
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customSellingPrice, setCustomSellingPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [isPending, setIsPending] = useState(false);
  const [pendingCustomer, setPendingCustomer] = useState("");
  const [isSendingToBar, setIsSendingToBar] = useState(false);

  // Split payment states
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [cashAmount, setCashAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);

  const createSaleMutation = useCreateSale();
  const queryClient = useQueryClient();

  // ---------- STORE HOOKS ----------
  const {
    selectedTable,
    setCurrentUser,
    addToTableCart,
    removeFromTableCart,
    updateTableCartItemQuantity,
    clearTableCart,
    getTableCart,
    getTableTotal,
    getTableTotalCost,
    getTableTotalProfit,
    syncCartWithBarFulfillment,
    updateTableCartItemFulfillmentId,
    getBarRequestStatus,
    getPendingBarRequestId,
    setBarRequestStatus,
  } = useTableCartStore();

  const {
    addExpense,
    removeExpense,
    clearExpenses,
    getExpenses,
    getTotalExpenses,
  } = useExpensesStore();

  // Get bar request status from store instead of local state
  const tableBarRequestStatus = getBarRequestStatus(selectedTable);
  const pendingBarRequestId = getPendingBarRequestId(selectedTable);

  // ---------- CURRENT TABLE DATA ----------
  const currentCart = getTableCart(selectedTable);
  const currentTotal = getTableTotal(selectedTable);
  const currentTotalCost = getTableTotalCost(selectedTable);
  const currentTotalProfit = getTableTotalProfit(selectedTable);

  const currentExpenses = getExpenses(selectedTable);
  const currentExpensesTotal = getTotalExpenses(selectedTable);

  // ---------- CALCULATIONS ----------
  const excludedCategories = ["kitchen", "asun", "suya"];
  const includedExpenses = currentExpenses.filter(
    (exp) => !excludedCategories.includes(exp.category.toLowerCase())
  );
  const includedExpensesTotal = includedExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  const finalTotal = currentTotal + includedExpensesTotal;

  // ---------- FILTER BAR APPROVAL ITEMS ----------
  const barApprovalItems = [
    ...currentCart.filter((item) => {
      const product = products?.find((p) => p.id === item.product_id);
      return needsBarApproval(item.name, product?.category);
    }),

    ...currentExpenses
      .filter((exp) => exp.category?.toLowerCase().trim() === "cigarette")
      .map((exp) => ({
        id: exp.id,
        name: exp.category,
        quantity: 1,
        selling_price: exp.amount,
        total_price: exp.amount,
        product_id: null,
        table_id: exp.tableId,
      })),
  ];

  const hasBarApprovalItems = barApprovalItems.length > 0;

  // ---------- INITIALIZE USER ----------
  useEffect(() => {
    if (currentUserId) setCurrentUser(currentUserId);
  }, [currentUserId, setCurrentUser]);

  // ---------- CHECK BAR REQUEST STATUS ON MOUNT/TABLE CHANGE ----------
  useEffect(() => {
    if (selectedTable && barApprovalItems.length > 0) {
      checkBarRequestStatus();
    }
  }, [selectedTable]); // Only run when table changes

  // ---------- CHECK BAR REQUEST STATUS ----------
  const checkBarRequestStatus = useCallback(async () => {
    if (!selectedTable || barApprovalItems.length === 0) {
      setBarRequestStatus(selectedTable, "none", null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("bar_requests")
        .select("*")
        .eq("table_id", selectedTable)
        .in("status", ["pending", "accepted"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking bar request status:", error);
        return;
      }

      if (data) {
        if (data.status === "accepted") {
          setBarRequestStatus(selectedTable, "approved", data.id);
        } else if (data.status === "pending") {
          setBarRequestStatus(selectedTable, "pending", data.id);
        }
      } else {
        setBarRequestStatus(selectedTable, "none", null);
      }
    } catch (error) {
      console.error("Error checking bar request status:", error);
    }
  }, [selectedTable, setBarRequestStatus, barApprovalItems.length]);

  // ---------- BROADCAST LISTENER (for bar modifications from other users) ----------
  useEffect(() => {
    const broadcastChannel = supabase
      .channel("bar-modifications")
      .on("broadcast", { event: "fulfillment-modified" }, (payload) => {
        console.log("📻 Broadcast received:", payload);
        console.log("inside");
        const { tableId, fulfillmentId, updatedData } = payload.payload;

        console.log("🔍 Broadcast tableId check:", {
          broadcastTableId: tableId,
          selectedTable: selectedTable,
          matches: tableId === selectedTable,
          types: {
            broadcastTableId: typeof tableId,
            selectedTable: typeof selectedTable,
          },
        });

        // ✅ Ensure type consistency - convert both to numbers for comparison
        if (Number(tableId) === Number(selectedTable)) {
          try {
            syncCartWithBarFulfillment(selectedTable, fulfillmentId, {
              product_id: updatedData.product_id,
              product_name: updatedData.product_name,
              quantity_approved: updatedData.quantity_approved,
              unit_price: updatedData.unit_price,
              status: updatedData.status,
            });

            toast("🔄 Bar modified your order — cart updated!", {
              icon: "🔁",
            });

            queryClient.invalidateQueries({ queryKey: ["bar_fulfillments"] });
          } catch (error) {
            console.error("❌ Error processing broadcast:", error);
          }
        } else {
          console.log("❌ Table mismatch - ignoring broadcast");
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(broadcastChannel);
    };
  }, [selectedTable, queryClient]);

  // ---------- REAL-TIME SUBSCRIPTIONS ----------
  useEffect(() => {
    const tables = [
      "sales",
      "products",
      "expenses",
      "bar_requests",
      "bar_fulfillments",
    ];

    const channels = tables.map((table) => {
      const channel = subscribeToTable(table, async (payload) => {
        // Invalidate queries for all table events
        await queryClient.invalidateQueries({ queryKey: [table] });

        // Handle bar-specific events
        if (["bar_requests", "bar_fulfillments"].includes(table)) {
          const data = payload.new || payload.old;

          console.log("🔍 Checking table match:", {
            eventTableId: data?.table_id,
            selectedTable: selectedTable,
            matches: data && Number(data.table_id) === Number(selectedTable),
          });

          // ✅ Ensure type consistency
          if (data && Number(data.table_id) === Number(selectedTable)) {
            // Handle bar request status changes
            if (
              table === "bar_requests" &&
              payload.eventType === "UPDATE" &&
              payload.new
            ) {
              if (payload.new.status === "accepted") {
                toast.success("✅ Bar has approved your request!");
                setBarRequestStatus(selectedTable, "approved", payload.new.id);
              } else if (payload.new.status === "rejected") {
                toast.error("❌ Bar rejected your request");
                setBarRequestStatus(selectedTable, "none", null);
              }
            }

            // ✅ Handle bar fulfillment updates (quantity/price changes from database)
            // Note: Broadcast handles modifications from other users

            if (
              table === "bar_fulfillments" &&
              payload.eventType === "UPDATE"
            ) {
              const fulfillment = payload.new;

              console.log("🔄 Bar fulfillment UPDATE detected (DB event):", {
                fulfillmentId: fulfillment.id,
                productId: fulfillment.product_id,
                productName: fulfillment.product_name,
                oldQuantity: payload.old?.quantity_approved,
                newQuantity: fulfillment.quantity_approved,
                oldPrice: payload.old?.unit_price,
                newPrice: fulfillment.unit_price,
                status: fulfillment.status,
              });

              // Only sync if there's an actual change
              const hasQuantityChange =
                payload.old?.quantity_approved !==
                fulfillment.quantity_approved;
              const hasPriceChange =
                payload.old?.unit_price !== fulfillment.unit_price;
              const hasProductChange =
                payload.old?.product_id !== fulfillment.product_id;

              if (hasQuantityChange || hasPriceChange || hasProductChange) {
                console.log("🔄 Syncing cart with database changes...");

                try {
                  syncCartWithBarFulfillment(selectedTable, fulfillment.id, {
                    product_id: fulfillment.product_id,
                    product_name: fulfillment.product_name,
                    quantity_approved: fulfillment.quantity_approved,
                    unit_price: fulfillment.unit_price,
                    status: fulfillment.status,
                  });
                } catch (error) {
                  console.error("❌ Error syncing cart:", error);
                }
              }
            }
          } else {
            console.log("❌ Event table mismatch - ignoring");
          }
        }
      });

      return channel;
    });

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [
    queryClient,
    selectedTable,
    barApprovalItems.length,
    setBarRequestStatus,
  ]);

  // ✅ Listen for bar modifications broadcast
  useEffect(() => {
    const channel = supabase
      .channel("bar-modifications")
      .on("broadcast", { event: "fulfillment-modified" }, (payload) => {
        console.log("🔄 Fulfillment modified broadcast received:", payload);

        const { tableId, fulfillmentId, updatedData } = payload.payload;

        // ✅ Sync the cart for this table
        if (tableId && fulfillmentId && updatedData) {
          console.log("🧩 Syncing cart with bar fulfillment changes...");
          syncCartWithBarFulfillment(tableId, fulfillmentId, updatedData);
        } else {
          console.warn("⚠️ Incomplete broadcast payload:", payload);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [syncCartWithBarFulfillment]);

  // ---------- HANDLERS ----------
  // Replace the handleAddToCart function in useTableCartLogic.tsx

  const handleAddToCart = async () => {
    if (!selectedProduct || quantity <= 0) {
      toast.error("Please select a product and enter a valid quantity");
      return;
    }

    const selectedProductData = products?.find(
      (p) => p.name === selectedProduct
    );

    if (!selectedProductData) {
      toast.error("Product not found");
      return;
    }

    const existingCartQuantity = currentCart
      .filter((item) => item.product_id === selectedProductData.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (existingCartQuantity + quantity > selectedProductData.current_stock) {
      toast.error("Not enough stock available");
      return;
    }

    const unitPrice =
      customSellingPrice || selectedProductData.selling_price || 0;
    const unitCost = selectedProductData.cost_price || 0;
    const totalPrice = unitPrice * quantity;
    const profitAmount = totalPrice - unitCost * quantity;

    const newItem = {
      product_id: selectedProductData.id,
      name: selectedProductData.name,
      quantity,
      unit_price: unitPrice,
      unit_cost: unitCost,
      total_price: totalPrice,
      total_cost: unitCost * quantity,
      profit_amount: profitAmount,
      selling_price: unitPrice,
      sales_rep_name: currentUser?.name || "",
    };

    try {
      const isBarItem = needsBarApproval(
        newItem.name,
        selectedProductData.category
      );

      // ✅ 1. Add to cart first
      addToTableCart(selectedTable, newItem);

      toast.success(
        `${newItem.name} added to cart!${
          isBarItem ? " (Requires bar approval)" : ""
        }`
      );

      // ✅ 2. Reset input fields
      setSelectedProduct("");
      setQuantity(1);
      setCustomSellingPrice(0);

      // ✅ 3. Handle bar approval logic ONLY if it's a bar item
      if (!isBarItem) {
        return; // Exit early for non-bar items
      }

      // ✅ 4. Check current bar request status
      if (
        tableBarRequestStatus === "approved" ||
        tableBarRequestStatus === "pending"
      ) {
        // Cancel existing request since cart was modified
        if (pendingBarRequestId) {
          await supabase
            .from("bar_requests")
            .update({ status: "cancelled" })
            .eq("table_id", selectedTable)
            .in("status", ["pending", "accepted"]);
        }

        setBarRequestStatus(selectedTable, "none", null);

        toast("⚠️ Cart modified. Please send to bar again for approval.", {
          icon: "⚠️",
        });
        return; // Don't auto-send
      }

      // ✅ 5. Only auto-send if status is "none"
      if (tableBarRequestStatus === "none") {
        // Wait for Zustand store to commit the state change
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Show loading toast
        const sendingToast = toast.loading("Sending to bar for approval...");

        try {
          // ✅ Read the latest cart state directly from the store
          const latestStore = useTableCartStore.getState();
          const latestCart = latestStore.carts[selectedTable]?.items || [];

          console.log("🔍 Latest cart before sending to bar:", {
            itemCount: latestCart.length,
            items: latestCart.map((i) => ({ name: i.name, qty: i.quantity })),
          });

          // ✅ Filter bar items from the latest cart state
          const latestBarItems = latestCart.filter((item) => {
            const product = products?.find((p) => p.id === item.product_id);
            return needsBarApproval(item.name, product?.category);
          });

          if (latestBarItems.length === 0) {
            toast.dismiss(sendingToast);
            toast.error("No bar items found to send");
            return;
          }

          console.log("📤 Sending bar items:", latestBarItems);

          // ✅ Send to bar with the latest cart state
          await handleSendToBarWithItems(latestBarItems);

          toast.dismiss(sendingToast);
          toast.success("Request sent to bar!");
        } catch (err: any) {
          toast.dismiss(sendingToast);
          console.error("Error sending to bar:", err);
          toast.error("Failed to send updated cart to bar");
        }
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(`Failed to add item: ${error.message}`);
    }
  };

  // Send specific items to bar
  const handleSendToBarWithItems = async (itemsToSend: any[]) => {
    if (!currentUser || !currentUserId) {
      throw new Error("User information not available");
    }

    try {
      // Cancel any existing pending/accepted bar requests for this table
      await supabase
        .from("bar_requests")
        .update({ status: "cancelled" })
        .eq("table_id", selectedTable)
        .in("status", ["pending", "accepted"]);

      // Prepare bar request items from the provided items
      const barRequestItems: BarRequestItem[] = itemsToSend.map((item) => ({
        table_id: selectedTable,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        product_price: item.unit_price,
        sales_rep_id: currentUserId,
        sales_rep_name: currentUser.name,
        status: "pending",
      }));

      // Create bar request records
      const result = await createBarRequestRecords(barRequestItems);

      if (!result.success) {
        throw new Error(result.error || "Failed to send request to bar");
      }

      // Update request status locally
      if (result.data && result.data.length > 0) {
        const requestId = result.data[0].id;
        setBarRequestStatus(selectedTable, "pending", requestId);

        // Fetch and map fulfillment IDs
        const { data: fulfillments, error: fulfillErr } = await supabase
          .from("bar_fulfillments")
          .select("*")
          .eq("request_id", requestId);

        if (fulfillErr) {
          console.error("❌ Error fetching fulfillments:", fulfillErr);
        } else if (fulfillments && fulfillments.length > 0) {
          console.log("📋 Mapping fulfillment IDs:", fulfillments);

          // Get the absolute latest cart state again
          const currentStore = useTableCartStore.getState();
          const currentCartItems =
            currentStore.carts[selectedTable]?.items || [];

          fulfillments.forEach((fulfillment) => {
            const cartItem = currentCartItems.find(
              (item) =>
                item.product_id === fulfillment.product_id &&
                item.unit_price === fulfillment.unit_price
            );

            if (cartItem) {
              updateTableCartItemFulfillmentId(
                selectedTable,
                cartItem.product_id,
                cartItem.unit_price,
                fulfillment.id
              );
            }
          });
        }
      }

      // Refresh bar requests
      await queryClient.invalidateQueries({ queryKey: ["bar_requests"] });
      setTimeout(() => checkBarRequestStatus(), 300);
    } catch (error: any) {
      console.error("❌ Error in handleSendToBarWithItems:", error);
      throw error;
    }
  };

  const handleAddExpense = (category: string, amount: number) => {
    if (!category || amount <= 0) {
      toast.error("Please select a category and enter a valid amount");
      return;
    }

    try {
      addExpense(category, amount, selectedTable);
      toast.success(`${category} expense of ₦${amount.toFixed(2)} added!`);
    } catch (error: any) {
      console.error("Error adding expense:", error);
      toast.error(`Failed to add expense: ${error.message}`);
    }
  };

  const handleRemoveExpense = (expenseId: string) => {
    try {
      removeExpense(expenseId);
      toast.success("Expense removed!");
    } catch (error: any) {
      console.error("Error removing expense:", error);
      toast.error(`Failed to remove expense: ${error.message}`);
    }
  };

  // ============================================
  // handleSendToBar
  // ============================================
  const handleSendToBar = async () => {
    if (selectedTable === null) {
      toast.error("Table not selected");
      return;
    }

    const latestStore = useTableCartStore.getState();
    const latestCart = latestStore.carts[selectedTable]?.items || [];

    const latestExpensesStore = useExpensesStore.getState();
    const latestExpenses = latestExpensesStore.getExpenses(selectedTable);

    const unapprovedCartItems = calculateUnapprovedItems(
      latestCart,
      needsBarApproval,
      products
    );

    const unapprovedExpenses = latestExpenses
      .filter((exp) => exp.category?.toLowerCase().trim() === "cigarette")
      .map((exp) => ({
        id: exp.id,
        product_id: exp.id || `expense-${exp.id}`,
        name: exp.category,
        quantity: 1,
        approved_quantity: 0,
        unit_price: exp.amount,
        unit_cost: 0,
        selling_price: exp.amount,
        total_price: exp.amount,
        total_cost: 0,
        profit_amount: exp.amount,
      }));
    const unapprovedItems = [...unapprovedCartItems, ...unapprovedExpenses];

    console.log("Unapproved items to send to bar:", {
      count: unapprovedItems.length,
      items: unapprovedItems.map((i) => ({
        name: i.name,
        pending_qty: i.quantity,
        already_approved: i.approved_quantity || 0,
      })),
    });

    if (unapprovedItems.length === 0) {
      toast.success("All items already approved or no new items to send.");
      return;
    }

    if (!currentUser || !currentUserId) {
      toast.error("User information not available");
      return;
    }

    if (tableBarRequestStatus === "pending") {
      toast.error("Request already sent to bar. Waiting for approval.");
      return;
    }

    if (tableBarRequestStatus === "approved") {
      toast.error("Request already approved. You can complete the sale.");
      return;
    }

    setIsSendingToBar(true);

    try {
      // Cancel any existing pending/accepted bar requests for this table
      await supabase
        .from("bar_requests")
        .update({ status: "cancelled" })
        .eq("table_id", selectedTable)
        .in("status", ["pending", "accepted"]);

      const barRequestItems: BarRequestItem[] = formatBarRequestItems(
        unapprovedItems,
        selectedTable,
        currentUserId,
        currentUser.name
      );

      // Create bar request records
      const result = await createBarRequestRecords(barRequestItems);

      if (!result.success) {
        throw new Error(result.error || "Failed to send request to bar");
      }

      // ✅ FIXED: Do NOT update approved_quantity here!
      // We only mark items as "sent for approval" via request status

      // Update request status
      if (result.data && result.data.length > 0) {
        const requestId = result.data[0].id;
        setBarRequestStatus(selectedTable, "pending", requestId);

        // Fetch fulfillments
        const { data: fulfillments, error: fulfillErr } = await supabase
          .from("bar_fulfillments")
          .select("*")
          .eq("request_id", requestId);

        if (fulfillErr) {
          console.error("Error fetching fulfillments:", fulfillErr);
        } else if (fulfillments && fulfillments.length > 0) {
          const currentStoreState = useTableCartStore.getState();
          const currentCartItems =
            currentStoreState.carts[selectedTable]?.items || [];

          fulfillments.forEach((fulfillment) => {
            const cartItem = currentCartItems.find(
              (item) =>
                item.product_id === fulfillment.product_id &&
                item.unit_price === fulfillment.unit_price
            );

            if (cartItem) {
              updateTableCartItemFulfillmentId(
                selectedTable,
                cartItem.product_id,
                cartItem.unit_price,
                fulfillment.id
              );
            }
          });
        }
      }

      toast.success(
        `${unapprovedItems.length} new item(s) sent to bar for approval.`
      );

      await queryClient.invalidateQueries({ queryKey: ["bar_requests"] });
      setTimeout(() => checkBarRequestStatus(), 500);
    } catch (error: any) {
      console.error("Error sending to bar:", error);
      toast.error(`Failed to send to bar: ${error.message}`);
    } finally {
      setIsSendingToBar(false);
    }
  };

  // ---------- FINALIZE SALE ----------
  const handleFinalizeSale = async () => {
    if (createSaleMutation.isPending) {
      toast.error("Sale is already being processed. Please wait...");
      return;
    }
    const hasCartItems = currentCart.length > 0;
    const hasExpenses = currentExpenses.length > 0;

    if (!hasCartItems && !hasExpenses) {
      toast.error("Cart is empty and no expenses added");
      return;
    }

    if (hasBarApprovalItems && tableBarRequestStatus !== "approved") {
      toast.error(
        "Please send drinks/cigarettes to bar and wait for approval first"
      );
      return;
    }

    if (!currentUser || !currentUserId) {
      toast.error("User information not available");
      return;
    }

    try {
      const formattedExpenses = currentExpenses.map((exp) => ({
        amount: exp.amount,
        category: exp.category,
        createdAt:
          exp.createdAt instanceof Date
            ? exp.createdAt.toISOString()
            : exp.createdAt,
        tableId: exp.tableId || selectedTable,
      }));

      // Update fulfillment records before creating sale
      if (hasBarApprovalItems && pendingBarRequestId) {
        const { data: fulfillments, error: fulfillErr } = await supabase
          .from("bar_fulfillments")
          .select("*")
          .eq("table_id", selectedTable)
          .in("status", ["pending", "partial"]);

        if (fulfillErr) {
          console.error("Error fetching fulfillments:", fulfillErr);
        }

        if (fulfillments && fulfillments.length > 0) {
          for (const fulfillment of fulfillments) {
            const cartItem = currentCart.find(
              (item) => item.product_id === fulfillment.product_id
            );

            if (cartItem) {
              await updateFulfillmentStatus(fulfillment.id, {
                quantity_fulfilled: cartItem.quantity,
                status:
                  cartItem.quantity === fulfillment.quantity_approved
                    ? "fulfilled"
                    : "partial",
                fulfilled_at: new Date().toISOString(),
              });
            } else {
              // Item was removed from cart - mark as returned
              await updateFulfillmentStatus(fulfillment.id, {
                quantity_returned: fulfillment.quantity_approved,
                status: "returned",
                fulfilled_at: new Date().toISOString(),
                notes: "Item removed from cart before sale completion",
              });
            }
          }
        }
      }

      // Proceed to sale creation after updating fulfillments
      let finalPaymentMethod = paymentMethod;
      let paymentDetails: any = {};

      if (isSplitPayment) {
        finalPaymentMethod = "split";
        paymentDetails = {
          cash_amount: cashAmount,
          transfer_amount: transferAmount,
          total_amount: cashAmount + transferAmount,
        };
      }

      const saleData = {
        total_amount: finalTotal,
        cart_total: currentTotal,
        expenses_total: currentExpensesTotal,
        expenses: formattedExpenses,
        payment_method: finalPaymentMethod,
        payment_details: isSplitPayment ? paymentDetails : null,
        items: currentCart,
        table_id: selectedTable,
        sales_rep_id: currentUserId,
        sales_rep_name: currentUser.name,
        is_pending: isPending,
        pending_customer_name: isPending ? pendingCustomer : null,
      };

      await createSaleMutation.mutateAsync(saleData);

      // ✅ NOW reset approved quantities after successful sale
      resetApprovedQuantitiesOnSaleCompletion(selectedTable);

      // Update bar request status to completed
      if (hasBarApprovalItems && pendingBarRequestId) {
        await supabase
          .from("bar_requests")
          .update({ status: "completed" })
          .eq("id", pendingBarRequestId);
      }

      clearTableCart(selectedTable);
      clearExpenses(selectedTable);
      setBarRequestStatus(selectedTable, "none", null);
      setIsSplitPayment(false);
      setCashAmount(0);
      setTransferAmount(0);

      toast.success(
        isPending
          ? `Pending sale recorded for ${pendingCustomer || "Customer"}`
          : hasCartItems && hasExpenses
          ? `Sale with expenses completed for Table ${selectedTable}!`
          : hasExpenses
          ? `Expenses recorded for Table ${selectedTable}!`
          : `Sale completed for Table ${selectedTable}!`
      );

      setIsPending(false);
      setPendingCustomer("");

      await queryClient.invalidateQueries({ queryKey: ["sales"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["bar_requests"] });
    } catch (error: any) {
      console.error("Error finalizing sale:", error);
      toast.error(`Failed to complete sale: ${error.message}`);
    }
  };

  const removeFromCart = async (productId: string, unitPrice: number) => {
    try {
      const itemToRemove = currentCart.find(
        (item) => item.product_id === productId && item.unit_price === unitPrice
      );

      removeFromTableCart(selectedTable, productId, unitPrice);
      toast.success("Item removed from cart");

      if (itemToRemove) {
        const product = products?.find((p) => p.id === productId);
        const isBarItem = needsBarApproval(
          itemToRemove.name,
          product?.category
        );

        if (
          isBarItem &&
          (tableBarRequestStatus === "approved" ||
            tableBarRequestStatus === "pending")
        ) {
          await supabase
            .from("bar_requests")
            .update({ status: "cancelled" })
            .eq("table_id", selectedTable)
            .in("status", ["pending", "accepted"]);

          setBarRequestStatus(selectedTable, "none", null);
          toast("⚠️ Cart modified. Please send to bar again for approval.", {
            icon: "⚠️",
          });
        }
      }
    } catch (error: any) {
      toast.error(`Failed to remove item: ${error.message}`);
    }
  };

  const updateCartItemQuantity = async (
    productId: string,
    unitPrice: number,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, unitPrice);
      return;
    }

    const product = products?.find((p) => p.id === productId);
    if (product) {
      const otherItemsQuantity = currentCart
        .filter(
          (cartItem) =>
            !(
              cartItem.product_id === productId &&
              cartItem.unit_price === unitPrice
            )
        )
        .filter((cartItem) => cartItem.product_id === product.id)
        .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      if (otherItemsQuantity + newQuantity > product.current_stock) {
        toast.error("Not enough stock available");
        return;
      }
    }

    try {
      const cartItem = currentCart.find(
        (item) => item.product_id === productId && item.unit_price === unitPrice
      );

      updateTableCartItemQuantity(
        selectedTable,
        productId,
        unitPrice,
        newQuantity
      );

      if (cartItem) {
        const isBarItem = needsBarApproval(cartItem.name, product?.category);

        if (
          isBarItem &&
          (tableBarRequestStatus === "approved" ||
            tableBarRequestStatus === "pending")
        ) {
          await supabase
            .from("bar_requests")
            .update({ status: "cancelled" })
            .eq("table_id", selectedTable)
            .in("status", ["pending", "accepted"]);

          setBarRequestStatus(selectedTable, "none", null);
          toast("⚠️ Cart modified. Please send to bar again for approval.", {
            icon: "⚠️",
          });
        }
      }
    } catch (error: any) {
      toast.error(`Failed to update quantity: ${error.message}`);
    }
  };

  // ---------- UI HELPERS ----------
  const selectedProductData = products?.find(
    (product) => product.name === selectedProduct
  );
  const unitPrice =
    customSellingPrice || selectedProductData?.selling_price || 0;
  const totalPrice = unitPrice * quantity;

  const canFinalizeSale =
    (currentCart.length > 0 || currentExpenses.length > 0) &&
    (!hasBarApprovalItems || tableBarRequestStatus === "approved");

  const handleProductChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const productName = e.target.value;
    setSelectedProduct(productName);

    if (productName) {
      const product = products?.find((p) => p.name === productName);
      setCustomSellingPrice(product?.selling_price || 0);
    } else {
      setCustomSellingPrice(0);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setQuantity(0);
      return;
    }
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0) setQuantity(numValue);
  };

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSellingPrice(Number(e.target.value));
  };

  const hasPendingItems = tableBarRequestStatus === "pending";
  const approvedItems = tableBarRequestStatus === "approved" ? currentCart : [];
  const pendingItems = tableBarRequestStatus === "pending" ? currentCart : [];
  const approvedTotal = tableBarRequestStatus === "approved" ? currentTotal : 0;
  const pendingTotal = tableBarRequestStatus === "pending" ? currentTotal : 0;

  // ---------- RETURN ----------
  return {
    selectedProduct,
    quantity,
    customSellingPrice,
    paymentMethod,
    selectedProductData,
    currentCart,
    currentTotal,
    currentTotalCost,
    currentTotalProfit,
    unitPrice,
    totalPrice,
    canFinalizeSale,
    setSelectedProduct,
    setQuantity,
    setCustomSellingPrice,
    setPaymentMethod,
    handleProductChange,
    handleQuantityChange,
    handleSellingPriceChange,
    handleAddToCart,
    removeFromCart,
    updateCartItemQuantity,
    handleFinalizeSale,
    createSaleMutation,
    currentExpenses,
    currentExpensesTotal,
    finalTotal,
    handleAddExpense,
    handleRemoveExpense,
    tableBarRequestStatus,
    hasPendingItems,
    approvedItems,
    pendingItems,
    approvedTotal,
    pendingTotal,
    handleSendToBar,
    isSendingToBar,
    isPending,
    setIsPending,
    pendingCustomer,
    setPendingCustomer,
    checkBarRequestStatus,
    hasBarApprovalItems,
    barApprovalItems,
    isSplitPayment,
    setIsSplitPayment,
    cashAmount,
    setCashAmount,
    transferAmount,
    setTransferAmount,
  };
}
