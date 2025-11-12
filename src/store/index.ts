import { configureStore } from "@reduxjs/toolkit";
import editorUiReducer from "@/store/slices/editorUiSlice";
import slidesReducer from "@/store/slices/slidesSlice";

export const store = configureStore({
  reducer: {
    slides: slidesReducer,
    editorUi: editorUiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

