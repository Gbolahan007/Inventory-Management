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
  approval_status?: "pending" | "approved";
}

export interface TableCart {
  tableId: number;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
  barRequestStatus?: "none" | "pending" | "given"; // Bar request status
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

  // Bar request status
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

  // Approval-based getters
  getTableApprovedCart: (tableId: number) => SaleItem[];
  getTablePendingCart: (tableId: number) => SaleItem[];
  moveSpecificItemsToApproved: (
    tableId: number,
    approvedItems: { product_id: string; quantity: number }[]
  ) => void;
  moveItemsToApproved: (tableId: number) => void;
  getTableApprovedTotal: (tableId: number) => number;
  getTablePendingTotal: (tableId: number) => number;

  // Finalize
  finalizeTableSale: (tableId: number) => SaleItem[] | null;
}

export const useTableCartStore = create<TableCartState>()(
  persist(
    (set, get) => ({
      // Initial state
      carts: {},
      selectedTable: 1,

      // Add item
      addToTableCart: (tableId, item) => {
        const { carts } = get();
        const currentCart = carts[tableId];
        const currentItems = currentCart?.items || [];

        // Force new items to be pending if not set
        const itemWithStatus: SaleItem = {
          ...item,
          approval_status: item.approval_status || "pending",
        };

        // Find matching item (same product, same unit_price, same approval status)
        const existingItemIndex = currentItems.findIndex(
          (cartItem) =>
            cartItem.product_id === item.product_id &&
            cartItem.unit_price === item.unit_price &&
            cartItem.approval_status === itemWithStatus.approval_status
        );

        let updatedItems: SaleItem[];

        if (existingItemIndex >= 0) {
          const existingItem = currentItems[existingItemIndex];
          updatedItems = currentItems.map((cartItem, idx) =>
            idx === existingItemIndex
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
          updatedItems = [...currentItems, itemWithStatus];
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
              barRequestStatus: currentCart?.barRequestStatus || "none",
            },
          },
        });
      },

      // Remove item
      removeFromTableCart: (tableId, productId, unitPrice) => {
        const { carts } = get();
        const currentCart = carts[tableId];
        if (!currentCart) return;

        const updatedItems = currentCart.items.filter(
          (i) => !(i.product_id === productId && i.unit_price === unitPrice)
        );

        if (updatedItems.length === 0) {
          // remove the whole cart if no items left
          const { [tableId]: _, ...rest } = carts;
          set({ carts: rest });
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

      // Update item qty
      updateTableCartItemQuantity: (
        tableId,
        productId,
        unitPrice,
        newQuantity
      ) => {
        if (newQuantity <= 0) {
          get().removeFromTableCart(tableId, productId, unitPrice);
          return;
        }
        const { carts } = get();
        const currentCart = carts[tableId];
        if (!currentCart) return;

        const updatedItems = currentCart.items.map((item) =>
          item.product_id === productId && item.unit_price === unitPrice
            ? {
                ...item,
                quantity: newQuantity,
                total_price: item.unit_price * newQuantity,
                total_cost: item.unit_cost * newQuantity,
                profit_amount: (item.unit_price - item.unit_cost) * newQuantity,
              }
            : item
        );

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

      // Clear cart
      clearTableCart: (tableId) => {
        const { carts } = get();
        const { [tableId]: _, ...rest } = carts;
        set({ carts: rest });
      },

      // Select table
      setSelectedTable: (tableId) => set({ selectedTable: tableId }),

      // Bar request status
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

      // Totals
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

      // Approval getters
      getTableApprovedCart: (tableId) =>
        get()
          .getTableCart(tableId)
          .filter((i) => i.approval_status === "approved"),
      getTablePendingCart: (tableId) =>
        get()
          .getTableCart(tableId)
          .filter((i) => !i.approval_status || i.approval_status === "pending"),

      moveSpecificItemsToApproved: (tableId, approvedItems) => {
        const { carts } = get();
        const currentCart = carts[tableId];
        if (!currentCart) return;

        const updatedItems = currentCart.items.map((item) => {
          const match = approvedItems.find(
            (ap) =>
              ap.product_id === item.product_id &&
              item.approval_status === "pending"
          );
          return match
            ? { ...item, approval_status: "approved" as const }
            : item;
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

      moveItemsToApproved: (tableId) => {
        const { carts } = get();
        const currentCart = carts[tableId];
        if (!currentCart) return;

        const updatedItems = currentCart.items.map((i) => ({
          ...i,
          approval_status:
            i.approval_status === "pending"
              ? ("approved" as const)
              : i.approval_status,
        }));

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

      getTableApprovedTotal: (tableId) =>
        get()
          .getTableApprovedCart(tableId)
          .reduce((s, i) => s + i.total_price, 0),
      getTablePendingTotal: (tableId) =>
        get()
          .getTablePendingCart(tableId)
          .reduce((s, i) => s + i.total_price, 0),

      // Active tables
      getActiveTables: () =>
        Object.keys(get().carts)
          .map(Number)
          .filter((id) => get().carts[id]?.items.length > 0)
          .sort((a, b) => a - b),

      getAllCartsData: () => get().carts,

      // Finalize
      finalizeTableSale: (tableId) => {
        const cart = get().carts[tableId];
        if (!cart || cart.items.length === 0) return null;
        const saleItems = [...cart.items];
        get().clearTableCart(tableId);
        return saleItems;
      },
    }),
    {
      name: "table-cart-storage",
      partialize: (state) => ({
        carts: state.carts,
        selectedTable: state.selectedTable,
      }),
    }
  )
);
