import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import slidesReducer from "@/store/slices/slidesSlice";
import userReducer from "@/store/slices/userSlice";

const rootReducer = combineReducers({
  slides: slidesReducer,
  user: userReducer,
});

// Migration function to fix persisted state structure
const migrate = async (state: any): Promise<any> => {
  // Ensure slides have rows array
  if (state?.slides?.slides) {
    state.slides.slides = state.slides.slides.map((slide: any) => {
      if (!slide.rows || !Array.isArray(slide.rows)) {
        return {
          ...slide,
          rows: slide.rows || [],
        };
      }
      return slide;
    });
  }
  return Promise.resolve(state);
};

// Redux Persist configuration
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  migrate,
  // Optionally, you can whitelist or blacklist specific reducers
  // whitelist: ['slides'], // only persist slides reducer
  // blacklist: ['user'], // don't persist user reducer
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Extract types from rootReducer to avoid circular reference
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
