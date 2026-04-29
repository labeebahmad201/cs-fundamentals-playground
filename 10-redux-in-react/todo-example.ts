/**
 * Todo Example using Redux Toolkit
 *
 * Demonstrates:
 *  - CRUD operations (add, toggle, delete, edit)
 *  - Filtering state (all / active / completed)
 *  - Selectors with memoization (createSelector)
 *  - Normalized state shape
 */

import {
  configureStore,
  createSlice,
  createSelector,
  type PayloadAction,
} from "@reduxjs/toolkit";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export type Filter = "all" | "active" | "completed";

interface TodosState {
  items: Todo[];
  filter: Filter;
}

let nextId = 1;
function generateId(): string {
  return `todo-${nextId++}`;
}

// ── Slice ────────────────────────────────────────────────────────────────────

const initialState: TodosState = {
  items: [
    { id: generateId(), text: "Learn Redux basics", completed: true },
    { id: generateId(), text: "Understand createSlice", completed: false },
    { id: generateId(), text: "Build a real app with RTK", completed: false },
  ],
  filter: "all",
};

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    todoAdded: {
      reducer(state, action: PayloadAction<Todo>) {
        state.items.push(action.payload);
      },
      prepare(text: string) {
        return { payload: { id: generateId(), text, completed: false } };
      },
    },
    todoToggled(state, action: PayloadAction<string>) {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    todoDeleted(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    todoEdited(state, action: PayloadAction<{ id: string; text: string }>) {
      const todo = state.items.find((t) => t.id === action.payload.id);
      if (todo) {
        todo.text = action.payload.text;
      }
    },
    filterChanged(state, action: PayloadAction<Filter>) {
      state.filter = action.payload;
    },
    clearCompleted(state) {
      state.items = state.items.filter((t) => !t.completed);
    },
  },
});

export const {
  todoAdded,
  todoToggled,
  todoDeleted,
  todoEdited,
  filterChanged,
  clearCompleted,
} = todosSlice.actions;

// ── Store ────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: {
    todos: todosSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ── Selectors (with memoization) ─────────────────────────────────────────────

export const selectTodos = (state: RootState) => state.todos.items;
export const selectFilter = (state: RootState) => state.todos.filter;

export const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.completed);
      case "completed":
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  },
);

export const selectTodoStats = createSelector([selectTodos], (todos) => ({
  total: todos.length,
  active: todos.filter((t) => !t.completed).length,
  completed: todos.filter((t) => t.completed).length,
}));

// ── Usage Simulation ─────────────────────────────────────────────────────────

export function simulateTodoApp(): string[] {
  const log: string[] = [];

  function logState() {
    const stats = selectTodoStats(store.getState());
    const filtered = selectFilteredTodos(store.getState());
    log.push(`  Stats: ${JSON.stringify(stats)}`);
    log.push(`  Visible (${store.getState().todos.filter}): ${filtered.map((t) => `${t.text} [${t.completed ? "✓" : "○"}]`).join(", ")}`);
  }

  log.push("=== Initial State ===");
  logState();

  log.push("\n=== Add 'Buy groceries' ===");
  store.dispatch(todoAdded("Buy groceries"));
  logState();

  log.push("\n=== Toggle 'Understand createSlice' ===");
  store.dispatch(todoToggled("todo-2"));
  logState();

  log.push("\n=== Filter to active ===");
  store.dispatch(filterChanged("active"));
  logState();

  log.push("\n=== Filter back to all ===");
  store.dispatch(filterChanged("all"));

  log.push("\n=== Delete 'Learn Redux basics' ===");
  store.dispatch(todoDeleted("todo-1"));
  logState();

  log.push("\n=== Clear completed ===");
  store.dispatch(clearCompleted());
  logState();

  return log;
}
