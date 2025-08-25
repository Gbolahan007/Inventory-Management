import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/app/_lib/supabase";

export interface SaleItem {
  id?: string; // Database ID
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
  selling_price: number;
  approval_status?: "pending" | "approved" | "rejected";
  request_id?: string;
  sales_rep_id?: string;
  sales_rep_name?: string;
}

export interface TableCart {
  tableId: number;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
  barRequestStatus?: "none" | "pending" | "given";
}

interface TableCartState {
  // State
  carts: Record<number, TableCart>;
  selectedTable: number;
  isLoading: boolean;
  currentUserId?: string;

  // Actions
  setCurrentUser: (userId: string) => void;
  loadTableCart: (tableId: number) => Promise<void>;
  addToTableCart: (tableId: number, item: SaleItem) => Promise<void>;
  removeFromTableCart: (
    tableId: number,
    productId: string,
    unitPrice: number
  ) => Promise<void>;
  updateTableCartItemQuantity: (
    tableId: number,
    productId: string,
    unitPrice: number,
    newQuantity: number
  ) => Promise<void>;
  clearTableCart: (tableId: number) => Promise<void>;
  setSelectedTable: (tableId: number) => void;

  // Bar request status
  setTableBarRequestStatus: (
    tableId: number,
    status: "none" | "pending" | "given"
  ) => void;
  getTableBarRequestStatus: (tableId: number) => "none" | "pending" | "given";

  // Database sync methods
  syncCartFromDatabase: (tableId: number) => Promise<void>;
  updateCartItemByRequestId: (
    tableId: number,
    requestId: string,
    status: "approved" | "rejected"
  ) => Promise<boolean>;
  removeCartItemByRequestId: (
    tableId: number,
    requestId: string
  ) => Promise<boolean>;
  updateCartItemRequestId: (
    tableId: number,
    productId: string,
    unitPrice: number,
    requestId: string
  ) => Promise<boolean>;

  // Getters (unchanged)
  getTableCart: (tableId: number) => SaleItem[];
  getTableTotal: (tableId: number) => number;
  getTableTotalCost: (tableId: number) => number;
  getTableTotalProfit: (tableId: number) => number;
  getActiveTables: () => number[];
  getAllCartsData: () => Record<number, TableCart>;
  getTableApprovedCart: (tableId: number) => SaleItem[];
  getTablePendingCart: (tableId: number) => SaleItem[];
  moveSpecificItemsToApproved: (
    tableId: number,
    approvedItems: { product_id: string; quantity: number }[]
  ) => Promise<void>;
  moveItemsToApproved: (tableId: number) => Promise<void>;
  getTableApprovedTotal: (tableId: number) => number;
  getTablePendingTotal: (tableId: number) => number;
  finalizeTableSale: (tableId: number) => Promise<SaleItem[] | null>;
}

export const useTableCartStore = create<TableCartState>()(
  persist(
    (set, get) => ({
      // Initial state
      carts: {},
      selectedTable: 1,
      isLoading: false,
      currentUserId: undefined,

      // Set current user
      setCurrentUser: (userId: string) => {
        set({ currentUserId: userId });
      },

      // Load cart from database
      loadTableCart: async (tableId: number) => {
        const { currentUserId } = get();
        if (!currentUserId) return;

        try {
          set({ isLoading: true });
          await get().syncCartFromDatabase(tableId);
        } finally {
          set({ isLoading: false });
        }
      },

      // Sync cart from database
      syncCartFromDatabase: async (tableId: number) => {
        const { currentUserId, carts } = get();
        if (!currentUserId) return;

        try {
          const { data: cartItems, error } = await supabase
            .from("table_carts")
            .select("*")
            .eq("table_id", tableId)
            .eq("sales_rep_id", currentUserId)
            .order("created_at", { ascending: true });

          if (error) throw error;

          const items: SaleItem[] =
            cartItems?.map((item) => ({
              id: item.id,
              product_id: item.product_id,
              name: item.name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              unit_cost: item.unit_cost,
              total_price: item.total_price,
              total_cost: item.total_cost,
              profit_amount: item.profit_amount,
              selling_price: item.selling_price,
              approval_status: item.approval_status,
              request_id: item.request_id,
              sales_rep_id: item.sales_rep_id,
              sales_rep_name: item.sales_rep_name,
            })) || [];

          const now = new Date().toISOString();
          const currentCart = carts[tableId];

          set({
            carts: {
              ...carts,
              [tableId]: {
                tableId,
                items,
                created_at: currentCart?.created_at || now,
                updated_at: now,
                barRequestStatus: currentCart?.barRequestStatus || "none",
              },
            },
          });
        } catch (error) {
          console.error("Error syncing cart from database:", error);
          throw error;
        }
      },

      // Add item to cart (with database sync)
      addToTableCart: async (tableId: number, item: SaleItem) => {
        const { currentUserId } = get();
        if (!currentUserId) throw new Error("User not authenticated");

        try {
          // Prepare item for database
          const dbItem = {
            table_id: tableId,
            product_id: item.product_id,
            name: item.name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            unit_cost: item.unit_cost,
            total_price: item.total_price,
            total_cost: item.total_cost,
            profit_amount: item.profit_amount,
            selling_price: item.selling_price,
            approval_status: item.approval_status || "pending",
            request_id: item.request_id,
            sales_rep_id: currentUserId,
            sales_rep_name: item.sales_rep_name,
          };

          // Try to find existing item to update quantity
          const { data: existingItems } = await supabase
            .from("table_carts")
            .select("*")
            .eq("table_id", tableId)
            .eq("product_id", item.product_id)
            .eq("unit_price", item.unit_price)
            .eq("sales_rep_id", currentUserId)
            .eq("approval_status", dbItem.approval_status);

          if (existingItems && existingItems.length > 0) {
            // Update existing item
            const existingItem = existingItems[0];
            const newQuantity = existingItem.quantity + item.quantity;
            const newTotalPrice = item.unit_price * newQuantity;
            const newTotalCost = item.unit_cost * newQuantity;
            const newProfitAmount = newTotalPrice - newTotalCost;

            const { error } = await supabase
              .from("table_carts")
              .update({
                quantity: newQuantity,
                total_price: newTotalPrice,
                total_cost: newTotalCost,
                profit_amount: newProfitAmount,
              })
              .eq("id", existingItem.id);

            if (error) throw error;
          } else {
            // Insert new item
            const { error } = await supabase.from("table_carts").insert(dbItem);

            if (error) throw error;
          }

          // Sync local state
          await get().syncCartFromDatabase(tableId);
        } catch (error) {
          console.error("Error adding to cart:", error);
          throw error;
        }
      },

      // Remove item from cart (with database sync)
      removeFromTableCart: async (
        tableId: number,
        productId: string,
        unitPrice: number
      ) => {
        const { currentUserId } = get();
        if (!currentUserId) throw new Error("User not authenticated");

        try {
          const { error } = await supabase
            .from("table_carts")
            .delete()
            .eq("table_id", tableId)
            .eq("product_id", productId)
            .eq("unit_price", unitPrice)
            .eq("sales_rep_id", currentUserId);

          if (error) throw error;

          // Sync local state
          await get().syncCartFromDatabase(tableId);
        } catch (error) {
          console.error("Error removing from cart:", error);
          throw error;
        }
      },

      // Update cart item quantity (with database sync)
      updateTableCartItemQuantity: async (
        tableId: number,
        productId: string,
        unitPrice: number,
        newQuantity: number
      ) => {
        const { currentUserId } = get();
        if (!currentUserId) throw new Error("User not authenticated");

        if (newQuantity <= 0) {
          await get().removeFromTableCart(tableId, productId, unitPrice);
          return;
        }

        try {
          const { data: items } = await supabase
            .from("table_carts")
            .select("*")
            .eq("table_id", tableId)
            .eq("product_id", productId)
            .eq("unit_price", unitPrice)
            .eq("sales_rep_id", currentUserId);

          if (items && items.length > 0) {
            const item = items[0];
            const newTotalPrice = unitPrice * newQuantity;
            const newTotalCost = item.unit_cost * newQuantity;
            const newProfitAmount = newTotalPrice - newTotalCost;

            const { error } = await supabase
              .from("table_carts")
              .update({
                quantity: newQuantity,
                total_price: newTotalPrice,
                total_cost: newTotalCost,
                profit_amount: newProfitAmount,
              })
              .eq("id", item.id);

            if (error) throw error;

            // Sync local state
            await get().syncCartFromDatabase(tableId);
          }
        } catch (error) {
          console.error("Error updating cart item quantity:", error);
          throw error;
        }
      },

      // Clear table cart (with database sync)
      clearTableCart: async (tableId: number) => {
        const { currentUserId, carts } = get();
        if (!currentUserId) throw new Error("User not authenticated");

        try {
          const { error } = await supabase
            .from("table_carts")
            .delete()
            .eq("table_id", tableId)
            .eq("sales_rep_id", currentUserId);

          if (error) throw error;

          // Update local state
          const { [tableId]: _, ...rest } = carts;
          set({ carts: rest });
        } catch (error) {
          console.error("Error clearing cart:", error);
          throw error;
        }
      },

      // Update cart item by request ID (with database sync)
      updateCartItemByRequestId: async (
        tableId: number,
        requestId: string,
        status: "approved" | "rejected"
      ): Promise<boolean> => {
        const { currentUserId } = get();
        if (!currentUserId) return false;

        try {
          const { error } = await supabase
            .from("table_carts")
            .update({ approval_status: status })
            .eq("request_id", requestId)
            .eq("table_id", tableId)
            .eq("sales_rep_id", currentUserId);

          if (error) throw error;

          // Sync local state
          await get().syncCartFromDatabase(tableId);
          return true;
        } catch (error) {
          console.error("Error updating cart item by request ID:", error);
          return false;
        }
      },

      // Remove cart item by request ID (with database sync)
      removeCartItemByRequestId: async (
        tableId: number,
        requestId: string
      ): Promise<boolean> => {
        const { currentUserId } = get();
        if (!currentUserId) return false;

        try {
          const { error } = await supabase
            .from("table_carts")
            .delete()
            .eq("request_id", requestId)
            .eq("table_id", tableId)
            .eq("sales_rep_id", currentUserId);

          if (error) throw error;

          // Sync local state
          await get().syncCartFromDatabase(tableId);
          return true;
        } catch (error) {
          console.error("Error removing cart item by request ID:", error);
          return false;
        }
      },

      // Update cart item request ID (with database sync)
      updateCartItemRequestId: async (
        tableId: number,
        productId: string,
        unitPrice: number,
        requestId: string
      ): Promise<boolean> => {
        const { currentUserId } = get();
        if (!currentUserId) return false;

        try {
          const { error } = await supabase
            .from("table_carts")
            .update({ request_id: requestId })
            .eq("table_id", tableId)
            .eq("product_id", productId)
            .eq("unit_price", unitPrice)
            .eq("sales_rep_id", currentUserId)
            .is("request_id", null); // Only update items without request_id

          if (error) throw error;

          // Sync local state
          await get().syncCartFromDatabase(tableId);
          return true;
        } catch (error) {
          console.error("Error updating cart item request ID:", error);
          return false;
        }
      },

      // Other methods remain the same but now work with database-synced data...
      setSelectedTable: (tableId) => {
        set({ selectedTable: tableId });
        // Auto-load cart when table changes
        get().loadTableCart(tableId);
      },

      setTableBarRequestStatus: (tableId, status) => {
        const { carts } = get();
        const currentCart = carts[tableId];
        const now = new Date().toISOString();

        if (!currentCart) {
          set({
            carts: {
              ...carts,
              [tableId]: {
                tableId,
                items: [],
                created_at: now,
                updated_at: now,
                barRequestStatus: status,
              },
            },
          });
          return;
        }

        set({
          carts: {
            ...carts,
            [tableId]: {
              ...currentCart,
              barRequestStatus: status,
              updated_at: now,
            },
          },
        });
      },

      getTableBarRequestStatus: (tableId) =>
        get().carts[tableId]?.barRequestStatus || "none",

      // All other getter methods remain unchanged
      getTableCart: (tableId) => get().carts[tableId]?.items || [],
      getTableTotal: (tableId) =>
        get()
          .getTableCart(tableId)
          .reduce((s, i) => s + i.total_price, 0),
      getTableTotalCost: (tableId) =>
        get()
          .getTableCart(tableId)
          .reduce((s, i) => s + i.total_cost, 0),
      getTableTotalProfit: (tableId) =>
        get()
          .getTableCart(tableId)
          .reduce((s, i) => s + i.profit_amount, 0),

      getTableApprovedCart: (tableId) =>
        get()
          .getTableCart(tableId)
          .filter((i) => i.approval_status === "approved"),
      getTablePendingCart: (tableId) =>
        get()
          .getTableCart(tableId)
          .filter((i) => !i.approval_status || i.approval_status === "pending"),

      moveSpecificItemsToApproved: async (tableId, approvedItems) => {
        const { currentUserId } = get();
        if (!currentUserId) return;

        try {
          // Update in database
          for (const approvedItem of approvedItems) {
            await supabase
              .from("table_carts")
              .update({ approval_status: "approved" })
              .eq("table_id", tableId)
              .eq("product_id", approvedItem.product_id)
              .eq("sales_rep_id", currentUserId)
              .eq("approval_status", "pending");
          }

          // Sync local state
          await get().syncCartFromDatabase(tableId);
        } catch (error) {
          console.error("Error moving items to approved:", error);
        }
      },

      moveItemsToApproved: async (tableId) => {
        const { currentUserId } = get();
        if (!currentUserId) return;

        try {
          const { error } = await supabase
            .from("table_carts")
            .update({ approval_status: "approved" })
            .eq("table_id", tableId)
            .eq("sales_rep_id", currentUserId)
            .eq("approval_status", "pending");

          if (error) throw error;

          // Sync local state
          await get().syncCartFromDatabase(tableId);
        } catch (error) {
          console.error("Error moving all items to approved:", error);
        }
      },

      getTableApprovedTotal: (tableId) =>
        get()
          .getTableApprovedCart(tableId)
          .reduce((s, i) => s + i.total_price, 0),
      getTablePendingTotal: (tableId) =>
        get()
          .getTablePendingCart(tableId)
          .reduce((s, i) => s + i.total_price, 0),

      getActiveTables: () =>
        Object.keys(get().carts)
          .map(Number)
          .filter((id) => get().carts[id]?.items.length > 0)
          .sort((a, b) => a - b),

      getAllCartsData: () => get().carts,

      finalizeTableSale: async (tableId) => {
        const cart = get().carts[tableId];
        if (!cart || cart.items.length === 0) return null;
        const saleItems = [...cart.items];
        await get().clearTableCart(tableId);
        return saleItems;
      },
    }),
    {
      name: "table-cart-storage",
      partialize: (state) => ({
        selectedTable: state.selectedTable,
        // Don't persist carts - they'll be loaded from database
      }),
    }
  )
);
