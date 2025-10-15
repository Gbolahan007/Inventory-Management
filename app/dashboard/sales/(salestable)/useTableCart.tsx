/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTableCartStore } from "@/app/(store)/useTableCartStore";
import { useExpensesStore } from "@/app/(store)/useExpensesStore";
import { useCreateSale } from "@/app/components/queryhooks/useCreateSale";
import { supabase } from "@/app/_lib/supabase";
import toast from "react-hot-toast";
import type { Product } from "../(sales)/types";
import { BarRequestItem, createBarRequestRecords } from "@/app/_lib/actions";
import { subscribeToTable } from "@/app/_lib/client-data-service";

interface UseTableCartLogicProps {
  products?: Product[];
  currentUser?: { name: string };
  currentUserId?: string;
}

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

  // Bar request status tracking
  const [tableBarRequestStatus, setTableBarRequestStatus] = useState<
    "none" | "pending" | "approved"
  >("none");
  const [pendingBarRequestId, setPendingBarRequestId] = useState<string | null>(
    null
  );

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
  } = useTableCartStore();

  const {
    addExpense,
    removeExpense,
    clearExpenses,
    getExpenses,
    getTotalExpenses,
  } = useExpensesStore();

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

  // ---------- INITIALIZE USER ----------
  useEffect(() => {
    if (currentUserId) setCurrentUser(currentUserId);
  }, [currentUserId, setCurrentUser]);

  // ---------- CHECK BAR REQUEST STATUS ----------
  useEffect(() => {
    const checkBarRequestStatus = async () => {
      if (!selectedTable || currentCart.length === 0) {
        setTableBarRequestStatus("none");
        setPendingBarRequestId(null);
        return;
      }

      try {
        // Only look for active requests (not cancelled)
        const { data, error } = await supabase
          .from("bar_requests")
          .select("*")
          .eq("table_id", selectedTable)
          .in("status", ["pending", "accepted"]) // Exclude cancelled
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking bar request status:", error);
          return;
        }

        if (data) {
          if (data.status === "accepted") {
            setTableBarRequestStatus("approved");
            setPendingBarRequestId(data.id);
          } else if (data.status === "pending") {
            setTableBarRequestStatus("pending");
            setPendingBarRequestId(data.id);
          }
        } else {
          setTableBarRequestStatus("none");
          setPendingBarRequestId(null);
        }
      } catch (error) {
        console.error("Error checking bar request status:", error);
      }
    };

    checkBarRequestStatus();
  }, [selectedTable, currentCart.length]);

  // ---------- REALTIME UPDATES ----------
  useEffect(() => {
    const tables = ["sales", "products", "expenses", "bar_requests"];

    const channels = tables.map((table) => {
      const channel = subscribeToTable(table, (payload) => {
        console.log(`🔁 ${table} updated:`, payload);
        queryClient.invalidateQueries({ queryKey: [table] });

        // Update bar request status when bar_requests table changes
        if (table === "bar_requests" && payload.new) {
          const data = payload.new as any;
          if (data.table_id === selectedTable) {
            if (data.status === "accepted") {
              setTableBarRequestStatus("approved");
              setPendingBarRequestId(data.id);
              toast.success("Bar has approved your request!");
            } else if (data.status === "rejected") {
              setTableBarRequestStatus("none");
              setPendingBarRequestId(null);
              toast.error("Bar rejected your request");
            }
          }
        }
      });
      return channel;
    });

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [queryClient, selectedTable]);

  // ---------- HANDLERS ----------
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
      addToTableCart(selectedTable, newItem);
      toast.success(`${newItem.name} added to cart!`);
      setSelectedProduct("");
      setQuantity(1);
      setCustomSellingPrice(0);

      // ⚠️ CRITICAL: Invalidate bar approval when cart is modified
      if (
        tableBarRequestStatus === "approved" ||
        tableBarRequestStatus === "pending"
      ) {
        // Cancel/invalidate existing bar requests for this table
        if (pendingBarRequestId) {
          await supabase
            .from("bar_requests")
            .update({ status: "cancelled" })
            .eq("table_id", selectedTable)
            .in("status", ["pending", "accepted"]);
        }

        setTableBarRequestStatus("none");
        setPendingBarRequestId(null);
        toast("⚠️ Cart modified. Please send to bar again for approval.", {
          icon: "⚠️",
        });
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(`Failed to add item: ${error.message}`);
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

  // ---------- SEND TO BAR ----------
  const handleSendToBar = async () => {
    if (currentCart.length === 0) {
      toast.error("Cart is empty. Add items before sending to bar.");
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
      // First, cancel any existing requests for this table
      await supabase
        .from("bar_requests")
        .update({ status: "cancelled" })
        .eq("table_id", selectedTable)
        .in("status", ["pending", "accepted"]);

      // Then create new bar request for ALL current cart items
      const barRequestItems: BarRequestItem[] = currentCart.map((item) => ({
        table_id: selectedTable,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        product_price: item.selling_price,
        sales_rep_id: currentUserId,
        sales_rep_name: currentUser.name,
        status: "pending",
      }));

      const result = await createBarRequestRecords(barRequestItems);

      if (!result.success) {
        throw new Error(result.error || "Failed to send request to bar");
      }

      setTableBarRequestStatus("pending");
      if (result.data && result.data.length > 0) {
        setPendingBarRequestId(result.data[0].id);
      }

      toast.success(
        `Request sent to bar for Table ${selectedTable}. Waiting for approval...`
      );

      await queryClient.invalidateQueries({ queryKey: ["bar_requests"] });
    } catch (error: any) {
      console.error("Error sending to bar:", error);
      toast.error(`Failed to send to bar: ${error.message}`);
    } finally {
      setIsSendingToBar(false);
    }
  };

  // ---------- FINALIZE SALE (Only after bar approval) ----------
  const handleFinalizeSale = async () => {
    const hasCartItems = currentCart.length > 0;
    const hasExpenses = currentExpenses.length > 0;

    if (!hasCartItems && !hasExpenses) {
      toast.error("Cart is empty and no expenses added");
      return;
    }

    // Check if cart items need bar approval
    if (hasCartItems && tableBarRequestStatus !== "approved") {
      toast.error("Please send items to bar and wait for approval first");
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

      const saleData = {
        total_amount: finalTotal,
        cart_total: currentTotal,
        expenses_total: currentExpensesTotal,
        expenses: formattedExpenses,
        payment_method: paymentMethod,
        items: currentCart,
        table_id: selectedTable,
        sales_rep_id: currentUserId,
        sales_rep_name: currentUser.name,
        is_pending: isPending,
        pending_customer_name: isPending ? pendingCustomer : null,
      };

      console.log("SALE DATA RECEIVED:", saleData);

      await createSaleMutation.mutateAsync(saleData);

      // Update bar request status to completed
      if (hasCartItems && pendingBarRequestId) {
        await supabase
          .from("bar_requests")
          .update({ status: "completed" })
          .eq("id", pendingBarRequestId);
      }

      clearTableCart(selectedTable);
      clearExpenses(selectedTable);
      setTableBarRequestStatus("none");
      setPendingBarRequestId(null);

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
      removeFromTableCart(selectedTable, productId, unitPrice);
      toast.success("Item removed from cart");

      // ⚠️ CRITICAL: Invalidate bar approval when cart is modified
      if (
        tableBarRequestStatus === "approved" ||
        tableBarRequestStatus === "pending"
      ) {
        // Cancel existing bar requests for this table
        await supabase
          .from("bar_requests")
          .update({ status: "cancelled" })
          .eq("table_id", selectedTable)
          .in("status", ["pending", "accepted"]);

        setTableBarRequestStatus("none");
        setPendingBarRequestId(null);
        toast("⚠️ Cart modified. Please send to bar again for approval.", {
          icon: "⚠️",
        });
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
      updateTableCartItemQuantity(
        selectedTable,
        productId,
        unitPrice,
        newQuantity
      );

      // ⚠️ CRITICAL: Invalidate bar approval when cart is modified
      if (
        tableBarRequestStatus === "approved" ||
        tableBarRequestStatus === "pending"
      ) {
        // Cancel existing bar requests for this table
        await supabase
          .from("bar_requests")
          .update({ status: "cancelled" })
          .eq("table_id", selectedTable)
          .in("status", ["pending", "accepted"]);

        setTableBarRequestStatus("none");
        setPendingBarRequestId(null);
        toast("⚠️ Cart modified. Please send to bar again for approval.", {
          icon: "⚠️",
        });
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

  // Can only finalize if cart items are approved OR only expenses exist
  const canFinalizeSale =
    (currentCart.length > 0 && tableBarRequestStatus === "approved") ||
    (currentCart.length === 0 && currentExpenses.length > 0);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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

  // Separate pending and approved items
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
  };
}
