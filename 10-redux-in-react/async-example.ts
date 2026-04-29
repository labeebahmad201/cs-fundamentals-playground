/**
 * Async Thunk Example using Redux Toolkit
 *
 * Demonstrates:
 *  - createAsyncThunk for API calls
 *  - Loading / success / error states
 *  - Extra reducers for handling thunk lifecycle
 *  - Why Redux is useful for caching async server data
 */

import {
  configureStore,
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
}

interface UsersState {
  list: User[];
  loading: boolean;
  error: string | null;
}

// ── Simulated API ────────────────────────────────────────────────────────────

// Simulates an API call that may randomly fail
async function fetchUsersFromApi(): Promise<User[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 20% failure rate for demo purposes
      if (Math.random() < 0.2) {
        reject(new Error("Network error: failed to fetch users"));
      } else {
        resolve([
          { id: 1, name: "Alice Johnson", email: "alice@example.com" },
          { id: 2, name: "Bob Smith", email: "bob@example.com" },
          { id: 3, name: "Charlie Brown", email: "charlie@example.com" },
        ]);
      }
    }, 100);
  });
}

// ── Async Thunk ──────────────────────────────────────────────────────────────

// createAsyncThunk generates action types:
//   'users/fetchUsers/pending'
//   'users/fetchUsers/fulfilled'
//   'users/fetchUsers/rejected'
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const users = await fetchUsersFromApi();
      return users;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

// ── Slice ────────────────────────────────────────────────────────────────────

const initialState: UsersState = {
  list: [],
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // For optimistic removal (remove a user before server confirms)
    userRemoved: (state, action: PayloadAction<number>) => {
      state.list = state.list.filter((u) => u.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  // Handle async thunk lifecycle
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { userRemoved, clearError } = usersSlice.actions;

// ── Store ────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: {
    users: usersSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ── Selectors ────────────────────────────────────────────────────────────────

export const selectUsers = (state: RootState) => state.users.list;
export const selectUsersLoading = (state: RootState) => state.users.loading;
export const selectUsersError = (state: RootState) => state.users.error;

// ── Usage Simulation ─────────────────────────────────────────────────────────

export async function simulateAsyncFlow(): Promise<string[]> {
  const log: string[] = [];

  function logState() {
    const { list, loading, error } = store.getState().users;
    log.push(`  Loading: ${loading}`);
    log.push(`  Error: ${error ?? "null"}`);
    log.push(`  Users: ${list.length > 0 ? list.map((u) => u.name).join(", ") : "(empty)"}`);
  }

  log.push("=== Initial State (no users loaded yet) ===");
  logState();

  log.push("\n=== Dispatching fetchUsers (pending...) ===");
  const resultAction = await store.dispatch(fetchUsers());
  logState();

  if (fetchUsers.fulfilled.match(resultAction)) {
    log.push("\n=== Removing user (optimistic) ===");
    store.dispatch(userRemoved(2)); // Remove Bob
    logState();
  }

  log.push("\n=== Fetch again (second call) ===");
  await store.dispatch(fetchUsers());
  logState();

  return log;
}
