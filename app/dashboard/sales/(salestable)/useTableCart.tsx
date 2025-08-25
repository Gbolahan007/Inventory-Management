/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useRef } from "react";
import { useTableCartStore } from "@/app/(store)/useTableCartStore";
import { useCreateSale } from "@/app/components/queryhooks/useCreateSale";
import toast from "react-hot-toast";
import type { Product } from "../(sales)/types";
import { supabase } from "@/app/_lib/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface UseTableCartLogicProps {
  products?: Product[];
  currentUser?: { name: string };
  currentUserId?: string;
}

// Table_carts schema
interface TableCart {
  id: string;
  table_id: number;
  sales_rep_id: string;
  product_id: string;
  quantity: number;
  unit_price?: number;
  unit_cost?: number;
  total_price?: number;
  total_cost?: number;
  profit_amount?: number;
  approval_status?: "pending" | "approved" | "rejected";
  request_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Bar_requests schema
interface BarRequest {
  id: string;
  table_id: number;
  product_id: string;
  product_name: string;
  quantity: number;
  sales_rep_id: string;
  sales_rep_name: string;
  status: "pending" | "approved" | "rejected";
  created_at?: string;
  updated_at?: string;
}

export function useTableCartLogic({
  products,
  currentUser,
  currentUserId,
}: UseTableCartLogicProps) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customSellingPrice, setCustomSellingPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [isSendingToBar, setIsSendingToBar] = useState(false);

  // Track subscription to prevent duplicates
  const subscriptionRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const cartSubscriptionRef = useRef<any>(null);

  const createSaleMutation = useCreateSale();

  const {
    selectedTable,
    setCurrentUser,
    loadTableCart,
    syncCartFromDatabase,
    addToTableCart,
    removeFromTableCart,
    updateTableCartItemQuantity,
    clearTableCart,
    getTableCart,
    getTableTotal,
    setTableBarRequestStatus,
    getTableBarRequestStatus,
    getTableApprovedCart,
    getTablePendingCart,
    updateCartItemByRequestId,
    removeCartItemByRequestId,
    updateCartItemRequestId,
    isLoading,
  } = useTableCartStore();

  const currentCart = getTableCart(selectedTable);
  const currentTotal = getTableTotal(selectedTable);
  const tableBarRequestStatus = getTableBarRequestStatus(selectedTable);

  // Initialize user and load cart
  useEffect(() => {
    if (currentUserId) {
      setCurrentUser(currentUserId);
      loadTableCart(selectedTable);
    }
  }, [currentUserId, selectedTable, setCurrentUser, loadTableCart]);

  // Real-time sync for bar_requests table
  useEffect(() => {
    if (!currentUserId) return;

    // Cleanup existing subscription
    if (subscriptionRef.current && isSubscribedRef.current) {
      subscriptionRef.current.unsubscribe();
      isSubscribedRef.current = false;
    }

    // Create new subscription for bar_requests
    const channelName = `bar_requests_${currentUserId}_${Date.now()}`;

    subscriptionRef.current = supabase
      .channel(channelName)
      .on<RealtimePostgresChangesPayload<BarRequest>>(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bar_requests",
          filter: `sales_rep_id=eq.${currentUserId}`,
        },
        handleBarRequestUpdate
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          isSubscribedRef.current = true;
          console.log(`Subscribed to bar requests for user: ${currentUserId}`);
        }
      });

    return () => {
      if (subscriptionRef.current && isSubscribedRef.current) {
        subscriptionRef.current.unsubscribe();
        isSubscribedRef.current = false;
      }
    };
  }, [currentUserId]);

  // Real-time sync for table_carts table
  useEffect(() => {
    if (!currentUserId) return;

    // Cleanup existing cart subscription
    if (cartSubscriptionRef.current) {
      cartSubscriptionRef.current.unsubscribe();
    }

    // Create new subscription for table_carts
    const cartChannelName = `table_carts_${currentUserId}_${Date.now()}`;

    cartSubscriptionRef.current = supabase
      .channel(cartChannelName)
      .on<RealtimePostgresChangesPayload<TableCart>>(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "table_carts",
          filter: `sales_rep_id=eq.${currentUserId}`,
        },
        async (payload) => {
          console.log("Cart change detected:", payload);

          const newRow = payload.new as TableCart | undefined;
          const oldRow = payload.old as TableCart | undefined;

          if (newRow?.table_id) {
            await syncCartFromDatabase(newRow.table_id);
          } else if (oldRow?.table_id) {
            await syncCartFromDatabase(oldRow.table_id);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to cart changes for user: ${currentUserId}`);
        }
      });

    return () => {
      if (cartSubscriptionRef.current) {
        cartSubscriptionRef.current.unsubscribe();
      }
    };
  }, [currentUserId, syncCartFromDatabase]);

  // Handle bar request updates
  const handleBarRequestUpdate = async (payload: any) => {
    const updatedRequest = payload.new;
    const requestId = updatedRequest.id;

    // Only process if it's for the current table
    if (updatedRequest.table_id !== selectedTable) return;

    if (updatedRequest.status === "approved") {
      const success = await updateCartItemByRequestId(
        selectedTable,
        requestId,
        "approved"
      );

      if (success) {
        toast.success(`${updatedRequest.product_name} approved by bartender!`);

        // Check if all items are now approved
        const updatedCart = getTableCart(selectedTable);
        const stillHasPending = updatedCart.some(
          (item) => !item.approval_status || item.approval_status === "pending"
        );

        if (!stillHasPending && updatedCart.length > 0) {
          setTableBarRequestStatus(selectedTable, "given");
          toast.success(
            `All items for Table ${selectedTable} are now approved!`
          );
        } else {
          setTableBarRequestStatus(selectedTable, "none");
        }
      }
    }

    if (updatedRequest.status === "rejected") {
      toast.error(`${updatedRequest.product_name} rejected by bartender`);

      const success = await removeCartItemByRequestId(selectedTable, requestId);

      if (success) {
        setTableBarRequestStatus(selectedTable, "none");
      }
    }
  };

  // Enhanced add to cart with database sync
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

    // Stock check
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

    // Create item for database
    const newItem = {
      product_id: selectedProductData.id,
      name: selectedProductData.name,
      quantity: quantity,
      unit_price: unitPrice,
      unit_cost: unitCost,
      total_price: totalPrice,
      total_cost: unitCost * quantity,
      profit_amount: profitAmount,
      selling_price: unitPrice,
      approval_status: "pending" as const,
      sales_rep_name: currentUser?.name || "",
    };

    try {
      await addToTableCart(selectedTable, newItem);
      toast.success(`${newItem.name} added to cart! Send to bar for approval.`);

      // Reset form
      setSelectedProduct("");
      setQuantity(1);
      setCustomSellingPrice(0);
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(`Failed to add item: ${error.message}`);
    }
  };

  // Enhanced send to bar with database sync
  const handleSendToBar = async () => {
    const pendingItemsToSend = currentCart.filter(
      (item) => !item.approval_status || item.approval_status === "pending"
    );

    if (pendingItemsToSend.length === 0) {
      toast.error("No pending items to send to bar");
      return;
    }

    if (tableBarRequestStatus === "pending") {
      toast.error(
        "Bar request already pending. Wait for current items to be processed."
      );
      return;
    }

    if (!currentUser || !currentUserId) {
      toast.error("User information not available");
      return;
    }

    try {
      setIsSendingToBar(true);

      // Create bar requests with only essential data
      const barRequestItems = pendingItemsToSend.map((item) => ({
        table_id: selectedTable,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        sales_rep_id: currentUserId,
        sales_rep_name: currentUser.name,
        status: "pending",
      }));

      // Insert and get the created records with their IDs
      const { data: createdRequests, error } = await supabase
        .from("bar_requests")
        .insert(barRequestItems)
        .select("id, product_id, quantity");

      if (error) throw error;

      // Update cart items with their corresponding request_id
      if (createdRequests) {
        for (let i = 0; i < createdRequests.length; i++) {
          const request = createdRequests[i];
          const cartItem = pendingItemsToSend[i];

          await updateCartItemRequestId(
            selectedTable,
            cartItem.product_id,
            cartItem.unit_price,
            request.id
          );
        }
      }

      setTableBarRequestStatus(selectedTable, "pending");
      toast.success(
        `${pendingItemsToSend.length} item(s) sent to bar for approval!`
      );
    } catch (error: any) {
      console.error("Error sending to bar:", error);
      toast.error(`Failed to send bar request: ${error.message}`);
    } finally {
      setIsSendingToBar(false);
    }
  };

  // Enhanced finalize sale with database sync
  const handleFinalizeSale = async () => {
    if (currentCart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const hasPendingItems = currentCart.some(
      (item) => !item.approval_status || item.approval_status === "pending"
    );

    if (hasPendingItems) {
      toast.error("Cannot complete sale! Some items still need bar approval.");
      return;
    }

    const allItemsApproved = currentCart.every(
      (item) => item.approval_status === "approved"
    );

    if (!allItemsApproved) {
      toast.error(
        "All items must be approved by barman before completing sale."
      );
      return;
    }

    if (tableBarRequestStatus === "pending") {
      toast.error("Wait for barman to approve pending items.");
      return;
    }

    if (!currentUser || !currentUserId) {
      toast.error("User information not available");
      return;
    }

    try {
      const saleData = {
        total_amount: currentTotal,
        payment_method: paymentMethod,
        items: currentCart,
        table_id: selectedTable,
        sales_rep_id: currentUserId,
        sales_rep_name: currentUser.name,
      };

      await createSaleMutation.mutateAsync(saleData);

      // Clean up bar requests for this table and user
      await supabase
        .from("bar_requests")
        .delete()
        .eq("sales_rep_id", currentUserId)
        .eq("table_id", selectedTable);

      // Clear cart from database
      await clearTableCart(selectedTable);
      setTableBarRequestStatus(selectedTable, "none");

      toast.success(`Sale completed for Table ${selectedTable}!`);
    } catch (error: any) {
      console.error("Error finalizing sale:", error);
      toast.error(`Failed to complete sale: ${error.message}`);
    }
  };

  // Remove from cart with database sync
  const removeFromCart = async (productId: string, unitPrice: number) => {
    if (tableBarRequestStatus === "pending") {
      toast.error("Cannot modify cart while waiting for bar approval.");
      return;
    }

    try {
      await removeFromTableCart(selectedTable, productId, unitPrice);
      toast.success("Item removed from cart");
    } catch (error: any) {
      toast.error(`Failed to remove item: ${error.message}`);
    }
  };

  // Update cart item quantity with database sync
  const updateCartItemQuantity = async (
    productId: string,
    unitPrice: number,
    newQuantity: number
  ) => {
    if (tableBarRequestStatus === "pending") {
      toast.error("Cannot modify cart while waiting for bar approval.");
      return;
    }

    if (newQuantity <= 0) {
      await removeFromCart(productId, unitPrice);
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
      await updateTableCartItemQuantity(
        selectedTable,
        productId,
        unitPrice,
        newQuantity
      );
    } catch (error: any) {
      toast.error(`Failed to update quantity: ${error.message}`);
    }
  };

  // Helper calculations
  const selectedProductData = products?.find(
    (product) => product.name === selectedProduct
  );
  const unitPrice =
    customSellingPrice || selectedProductData?.selling_price || 0;
  const totalPrice = unitPrice * quantity;
  const approvedItems = getTableApprovedCart?.(selectedTable) || [];
  const pendingItems = getTablePendingCart?.(selectedTable) || [];
  const approvedTotal = approvedItems.reduce(
    (sum, item) => sum + item.total_price,
    0
  );
  const pendingTotal = pendingItems.reduce(
    (sum, item) => sum + item.total_price,
    0
  );
  const currentTotalProfit = currentCart.reduce(
    (sum, item) => sum + item.profit_amount,
    0
  );

  const hasPendingItems = currentCart.some(
    (item) => !item.approval_status || item.approval_status === "pending"
  );

  const canFinalizeSale =
    currentCart.length > 0 &&
    currentCart.every((item) => item.approval_status === "approved") &&
    tableBarRequestStatus !== "pending";

  // Event handlers
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
    if (!isNaN(numValue) && numValue >= 0) {
      setQuantity(numValue);
    }
  };

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSellingPrice(Number(e.target.value));
  };

  return {
    selectedProduct,
    quantity,
    customSellingPrice,
    paymentMethod,
    selectedProductData,
    currentCart,
    currentTotal,
    currentTotalProfit,
    tableBarRequestStatus,
    unitPrice,
    totalPrice,
    approvedItems,
    pendingItems,
    approvedTotal,
    pendingTotal,
    hasPendingItems,
    canFinalizeSale,
    isLoading,
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
    handleSendToBar,
    handleFinalizeSale,
    createSaleMutation,
    isSendingToBar,
  };
}
