import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

type SlidesState = Record<string, never>;

const initialState: SlidesState = {} as SlidesState;

const slidesSlice = createSlice({
  name: "slides",
  initialState,
  reducers: {},
});

export const {} = slidesSlice.actions;

export const selectSlidesState = (state: RootState) => state.slides;

export default slidesSlice.reducer;
