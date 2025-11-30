import { combineReducers, configureStore } from "@reduxjs/toolkit";
import editorUiReducer from "@/store/slices/editorUiSlice";
import slidesReducer from "@/store/slices/slidesSlice";
import userReducer from "@/store/slices/userSlice";
import { autoSaveMiddleware } from "./middleware/autoSaveMiddleware";

const rootReducer = combineReducers({
  slides: slidesReducer,
  editorUi: editorUiReducer,
  user: userReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(autoSaveMiddleware),
});

// Extract types from rootReducer to avoid circular reference
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
