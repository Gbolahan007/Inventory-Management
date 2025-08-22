// stores/useTableCartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SaleItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
  selling_price: number;
}

export interface TableCart {
  tableId: number;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
  barRequestStatus?: "none" | "pending" | "given"; // Add bar request status
}

interface TableCartState {
  // State
  carts: Record<number, TableCart>;
  selectedTable: number;

  // Actions
  addToTableCart: (tableId: number, item: SaleItem) => void;
  removeFromTableCart: (
    tableId: number,
    productId: string,
    unitPrice: number
  ) => void;
  updateTableCartItemQuantity: (
    tableId: number,
    productId: string,
    unitPrice: number,
    newQuantity: number
  ) => void;
  clearTableCart: (tableId: number) => void;
  setSelectedTable: (tableId: number) => void;

  // NEW: Bar request status methods
  setTableBarRequestStatus: (
    tableId: number,
    status: "none" | "pending" | "given"
  ) => void;
  getTableBarRequestStatus: (tableId: number) => "none" | "pending" | "given";

  // Getters
  getTableCart: (tableId: number) => SaleItem[];
  getTableTotal: (tableId: number) => number;
  getTableTotalCost: (tableId: number) => number;
  getTableTotalProfit: (tableId: number) => number;
  getActiveTables: () => number[];
  getAllCartsData: () => Record<number, TableCart>;

  // Finalize sale
  finalizeTableSale: (tableId: number) => SaleItem[] | null;
}

export const useTableCartStore = create<TableCartState>()(
  persist(
    (set, get) => ({
      // Initial state
      carts: {},
      selectedTable: 1,

      // Add item to specific table's cart
      addToTableCart: (tableId: number, item: SaleItem) => {
        const { carts } = get();
        const currentCart = carts[tableId];
        const currentItems = currentCart?.items || [];

        // Check if item already exists with same product_id and unit_price
        const existingItemIndex = currentItems.findIndex(
          (cartItem) =>
            cartItem.product_id === item.product_id &&
            cartItem.unit_price === item.unit_price
        );

        let updatedItems: SaleItem[];

        if (existingItemIndex >= 0) {
          // Update existing item
          const existingItem = currentItems[existingItemIndex];
          updatedItems = currentItems.map((cartItem, index) =>
            index === existingItemIndex
              ? {
                  ...existingItem,
                  quantity: existingItem.quantity + item.quantity,
                  total_price: existingItem.total_price + item.total_price,
                  total_cost: existingItem.total_cost + item.total_cost,
                  profit_amount:
                    existingItem.profit_amount + item.profit_amount,
                }
              : cartItem
          );
        } else {
          // Add new item
          updatedItems = [...currentItems, item];
        }

        const now = new Date().toISOString();

        set({
          carts: {
            ...carts,
            [tableId]: {
              tableId,
              items: updatedItems,
              created_at: currentCart?.created_at || now,
              updated_at: now,
              barRequestStatus: currentCart?.barRequestStatus || "none", // Preserve existing status
            },
          },
        });
      },

      // Remove item from specific table's cart
      removeFromTableCart: (
        tableId: number,
        productId: string,
        unitPrice: number
      ) => {
        const { carts } = get();
        const currentCart = carts[tableId];

        if (!currentCart) return;

        const updatedItems = currentCart.items.filter(
          (item) =>
            !(item.product_id === productId && item.unit_price === unitPrice)
        );

        if (updatedItems.length === 0) {
          // Remove entire cart if no items left
          const { [tableId]: removed, ...remainingCarts } = carts;
          set({ carts: remainingCarts });
        } else {
          set({
            carts: {
              ...carts,
              [tableId]: {
                ...currentCart,
                items: updatedItems,
                updated_at: new Date().toISOString(),
              },
            },
          });
        }
      },

      // Update item quantity in specific table's cart
      updateTableCartItemQuantity: (
        tableId: number,
        productId: string,
        unitPrice: number,
        newQuantity: number
      ) => {
        if (newQuantity <= 0) {
          get().removeFromTableCart(tableId, productId, unitPrice);
          return;
        }

        const { carts } = get();
        const currentCart = carts[tableId];

        if (!currentCart) return;

        const updatedItems = currentCart.items.map((item) => {
          if (item.product_id === productId && item.unit_price === unitPrice) {
            return {
              ...item,
              quantity: newQuantity,
              total_price: item.unit_price * newQuantity,
              total_cost: item.unit_cost * newQuantity,
              profit_amount:
                item.unit_price * newQuantity - item.unit_cost * newQuantity,
            };
          }
          return item;
        });

        set({
          carts: {
            ...carts,
            [tableId]: {
              ...currentCart,
              items: updatedItems,
              updated_at: new Date().toISOString(),
            },
          },
        });
      },

      // Clear specific table's cart
      clearTableCart: (tableId: number) => {
        const { carts } = get();
        const { [tableId]: removed, ...remainingCarts } = carts;
        set({ carts: remainingCarts });
      },

      // Set selected table
      setSelectedTable: (tableId: number) => {
        set({ selectedTable: tableId });
      },

      // NEW: Set bar request status for a table
      setTableBarRequestStatus: (
        tableId: number,
        status: "none" | "pending" | "given"
      ) => {
        const { carts } = get();
        const currentCart = carts[tableId];

        if (!currentCart) {
          // If no cart exists but we're setting status, create an empty cart with status
          const now = new Date().toISOString();
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
              updated_at: new Date().toISOString(),
            },
          },
        });
      },

      // NEW: Get bar request status for a table
      getTableBarRequestStatus: (tableId: number) => {
        const { carts } = get();
        return carts[tableId]?.barRequestStatus || "none";
      },

      // Get cart for specific table
      getTableCart: (tableId: number) => {
        const { carts } = get();
        return carts[tableId]?.items || [];
      },

      // Get cart total for specific table
      getTableTotal: (tableId: number) => {
        const { carts } = get();
        const cart = carts[tableId];
        if (!cart) return 0;
        return cart.items.reduce((total, item) => total + item.total_price, 0);
      },

      // Get cart total cost for specific table
      getTableTotalCost: (tableId: number) => {
        const { carts } = get();
        const cart = carts[tableId];
        if (!cart) return 0;
        return cart.items.reduce((total, item) => total + item.total_cost, 0);
      },

      // Get cart total profit for specific table
      getTableTotalProfit: (tableId: number) => {
        const { carts } = get();
        const cart = carts[tableId];
        if (!cart) return 0;
        return cart.items.reduce(
          (total, item) => total + item.profit_amount,
          0
        );
      },

      // Get all active tables (tables with items in cart)
      getActiveTables: () => {
        const { carts } = get();
        return Object.keys(carts)
          .map(Number)
          .filter(
            (tableId) => carts[tableId] && carts[tableId].items.length > 0
          )
          .sort((a, b) => a - b);
      },

      // Get all carts data
      getAllCartsData: () => {
        const { carts } = get();
        return carts;
      },

      // Finalize sale for specific table
      finalizeTableSale: (tableId: number) => {
        const { carts } = get();
        const cart = carts[tableId];

        if (!cart || cart.items.length === 0) {
          return null;
        }

        const saleItems = [...cart.items];

        // Clear the cart after getting the items
        get().clearTableCart(tableId);

        return saleItems;
      },
    }),
    {
      name: "table-cart-storage", // localStorage key
      partialize: (state) => ({
        carts: state.carts,
        selectedTable: state.selectedTable,
      }),
    }
  )
);
