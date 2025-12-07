import { combineReducers, configureStore } from "@reduxjs/toolkit";
import slidesReducer from "@/store/slices/slidesSlice";
import userReducer from "@/store/slices/userSlice";

const rootReducer = combineReducers({
  slides: slidesReducer,
  user: userReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

// Extract types from rootReducer to avoid circular reference
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
