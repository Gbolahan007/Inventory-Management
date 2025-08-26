import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SaleItem {
  id?: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  total_cost: number;
  profit_amount: number;
  selling_price: number;
  sales_rep_id?: string;
  sales_rep_name?: string;
}

export interface TableCart {
  tableId: number;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
}

interface TableCartState {
  // State
  carts: Record<number, TableCart>;
  selectedTable: number;
  currentUserId?: string;

  // Actions
  setCurrentUser: (userId: string) => void;
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

  // Getters
  getTableCart: (tableId: number) => SaleItem[];
  getTableTotal: (tableId: number) => number;
  getTableTotalCost: (tableId: number) => number;
  getTableTotalProfit: (tableId: number) => number;
  getActiveTables: () => number[];
  getAllCartsData: () => Record<number, TableCart>;
  finalizeTableSale: (tableId: number) => SaleItem[] | null;
}

export const useTableCartStore = create<TableCartState>()(
  persist(
    (set, get) => ({
      // Initial state
      carts: {},
      selectedTable: 1,
      currentUserId: undefined,

      // Set current user
      setCurrentUser: (userId: string) => {
        set({ currentUserId: userId });
      },

      // Add item to cart (in-memory only)
      addToTableCart: (tableId: number, item: SaleItem) => {
        const { currentUserId, carts } = get();
        if (!currentUserId) throw new Error("User not authenticated");

        const now = new Date().toISOString();
        const currentCart = carts[tableId];

        // Find existing item with same product_id and unit_price
        const existingItemIndex = currentCart?.items.findIndex(
          (cartItem) =>
            cartItem.product_id === item.product_id &&
            cartItem.unit_price === item.unit_price
        );

        let updatedItems: SaleItem[];

        if (currentCart && existingItemIndex !== -1) {
          // Update existing item quantity
          const existingItem = currentCart.items[existingItemIndex];
          const newQuantity = existingItem.quantity + item.quantity;
          const newTotalPrice = item.unit_price * newQuantity;
          const newTotalCost = item.unit_cost * newQuantity;
          const newProfitAmount = newTotalPrice - newTotalCost;

          updatedItems = [...currentCart.items];
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            total_price: newTotalPrice,
            total_cost: newTotalCost,
            profit_amount: newProfitAmount,
          };
        } else {
          // Add new item
          const newItem = {
            ...item,
            id: `local_${Date.now()}_${Math.random()}`, // Local ID
            sales_rep_id: currentUserId,
          };
          updatedItems = currentCart
            ? [...currentCart.items, newItem]
            : [newItem];
        }

        set({
          carts: {
            ...carts,
            [tableId]: {
              tableId,
              items: updatedItems,
              created_at: currentCart?.created_at || now,
              updated_at: now,
            },
          },
        });
      },

      // Remove item from cart
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

      // Update cart item quantity
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
            const newTotalPrice = unitPrice * newQuantity;
            const newTotalCost = item.unit_cost * newQuantity;
            const newProfitAmount = newTotalPrice - newTotalCost;

            return {
              ...item,
              quantity: newQuantity,
              total_price: newTotalPrice,
              total_cost: newTotalCost,
              profit_amount: newProfitAmount,
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

      // Clear table cart
      clearTableCart: (tableId: number) => {
        const { carts } = get();
        const { [tableId]: _, ...rest } = carts;
        set({ carts: rest });
      },

      // Set selected table
      setSelectedTable: (tableId: number) => {
        set({ selectedTable: tableId });
      },

      // Getters
      getTableCart: (tableId: number) => get().carts[tableId]?.items || [],

      getTableTotal: (tableId: number) =>
        get()
          .getTableCart(tableId)
          .reduce((sum, item) => sum + item.total_price, 0),

      getTableTotalCost: (tableId: number) =>
        get()
          .getTableCart(tableId)
          .reduce((sum, item) => sum + item.total_cost, 0),

      getTableTotalProfit: (tableId: number) =>
        get()
          .getTableCart(tableId)
          .reduce((sum, item) => sum + item.profit_amount, 0),

      getActiveTables: () =>
        Object.keys(get().carts)
          .map(Number)
          .filter((id) => get().carts[id]?.items.length > 0)
          .sort((a, b) => a - b),

      getAllCartsData: () => get().carts,

      finalizeTableSale: (tableId: number) => {
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
