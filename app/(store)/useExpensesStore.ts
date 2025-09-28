import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Expense {
  id: string;
  category: string;
  amount: number;
  createdAt: Date;
  tableId?: number;
}

interface ExpensesState {
  expenses: Expense[];

  // Actions
  addExpense: (category: string, amount: number, tableId?: number) => void;
  removeExpense: (id: string) => void;
  clearExpenses: (tableId?: number) => void;
  clearAllExpenses: () => void;

  // Getters
  getExpenses: (tableId?: number) => Expense[];
  getTotalExpenses: (tableId?: number) => number;
  getExpensesByCategory: (category: string, tableId?: number) => Expense[];
}

export const useExpensesStore = create<ExpensesState>()(
  persist(
    (set, get) => ({
      expenses: [],

      addExpense: (category: string, amount: number, tableId?: number) => {
        const newExpense: Expense = {
          id: crypto.randomUUID(),
          category,
          amount,
          createdAt: new Date(),
          tableId,
        };

        set((state) => ({
          expenses: [...state.expenses, newExpense],
        }));
      },

      removeExpense: (id: string) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
      },

      clearExpenses: (tableId?: number) => {
        if (tableId) {
          // Clear expenses for specific table
          set((state) => ({
            expenses: state.expenses.filter(
              (expense) => expense.tableId !== tableId
            ),
          }));
        } else {
          // Clear all expenses without tableId (global expenses)
          set((state) => ({
            expenses: state.expenses.filter(
              (expense) => expense.tableId !== undefined
            ),
          }));
        }
      },

      clearAllExpenses: () => {
        set({ expenses: [] });
      },

      getExpenses: (tableId?: number) => {
        const state = get();
        if (tableId) {
          return state.expenses.filter(
            (expense) => expense.tableId === tableId
          );
        }
        return state.expenses.filter((expense) => !expense.tableId);
      },

      getTotalExpenses: (tableId?: number) => {
        const expenses = get().getExpenses(tableId);
        return expenses.reduce((total, expense) => total + expense.amount, 0);
      },

      getExpensesByCategory: (category: string, tableId?: number) => {
        const expenses = get().getExpenses(tableId);
        return expenses.filter((expense) => expense.category === category);
      },
    }),
    {
      name: "expenses-storage",
      partialize: (state) => ({ expenses: state.expenses }),
    }
  )
);
