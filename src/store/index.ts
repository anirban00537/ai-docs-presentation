import { combineReducers, configureStore } from "@reduxjs/toolkit";
import slidesReducer from "@/store/slices/slidesSlice";
import userReducer from "@/store/slices/userSlice";
import { slidesApiMiddleware } from "@/store/middleware/slidesApiMiddleware";

const rootReducer = combineReducers({
  slides: slidesReducer,
  user: userReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(slidesApiMiddleware),
}) as ReturnType<typeof configureStore>;

// Extract types from rootReducer to avoid circular reference
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
