import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GlobalState {
  user: { name: string } | null;
  theme: boolean;
  isCollapsed: boolean;
}

const initialState: GlobalState = {
  user: null,
  theme: false,
  isCollapsed: false,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<GlobalState["user"]>) => {
      state.user = action.payload;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.theme = action.payload;
    },
    setIsCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isCollapsed = action.payload;
    },
  },
});

export const { setUser, setIsDarkMode, setIsCollapsed } = globalSlice.actions;
export default globalSlice.reducer;
