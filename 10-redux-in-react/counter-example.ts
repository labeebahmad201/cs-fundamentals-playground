/**
 * Counter Example using Redux Toolkit
 *
 * Demonstrates:
 *  - createSlice for state + reducers
 *  - configureStore for store creation
 *  - Selectors for reading state
 *  - Dispatching actions
 */

import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ── Slice ────────────────────────────────────────────────────────────────────

interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    incremented: (state) => {
      // Immer allows "mutative" syntax — it produces immutable updates
      state.value += 1;
    },
    decremented: (state) => {
      state.value -= 1;
    },
    reset: (state) => {
      state.value = 0;
    },
    amountAdded: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { incremented, decremented, reset, amountAdded } = counterSlice.actions;

// ── Store ────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

// ── Selectors ────────────────────────────────────────────────────────────────

export const selectCount = (state: RootState) => state.counter.value;

// Type helpers for use throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ── Usage Simulation ─────────────────────────────────────────────────────────

export function simulateCounter(): { actions: string[]; finalState: CounterState } {
  const actions: string[] = [];

  actions.push(`Initial: count = ${selectCount(store.getState())}`);

  store.dispatch(incremented());
  actions.push(`After increment: count = ${selectCount(store.getState())}`);

  store.dispatch(incremented());
  actions.push(`After increment: count = ${selectCount(store.getState())}`);

  store.dispatch(decremented());
  actions.push(`After decrement: count = ${selectCount(store.getState())}`);

  store.dispatch(amountAdded(5));
  actions.push(`After adding 5: count = ${selectCount(store.getState())}`);

  store.dispatch(reset());
  actions.push(`After reset: count = ${selectCount(store.getState())}`);

  return { actions, finalState: store.getState().counter };
}
