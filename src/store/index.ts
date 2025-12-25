import { combineReducers, configureStore } from "@reduxjs/toolkit";
import slidesReducer from "@/store/slices/slidesSlice";
import userReducer from "@/store/slices/userSlice";
import subscriptionReducer from "@/store/slices/subscriptionSlice";
import { slidesApiMiddleware } from "@/store/middleware/slidesApiMiddleware";

const rootReducer = combineReducers({
  slides: slidesReducer,
  user: userReducer,
  subscription: subscriptionReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Increase serializable check threshold for undo history
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(slidesApiMiddleware),
});

export { store };

// Extract types from rootReducer to avoid circular reference
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
