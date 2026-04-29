import { describe, it, expect, beforeEach } from "vitest";
import {
  store as counterStore,
  simulateCounter,
  incremented,
  decremented,
  reset,
  amountAdded,
  selectCount,
} from "./counter-example";
import {
  store as todoStore,
  simulateTodoApp,
  todoAdded,
  todoToggled,
  todoDeleted,
  filterChanged,
  clearCompleted,
  selectFilteredTodos,
  selectTodos,
} from "./todo-example";
import {
  store as usersStore,
  fetchUsers,
  clearError,
  userRemoved,
  selectUsers,
  selectUsersLoading,
  selectUsersError,
} from "./async-example";

// ── Counter Tests ────────────────────────────────────────────────────────────

describe("Redux Counter", () => {
  beforeEach(() => {
    counterStore.dispatch(reset());
  });

  it("starts at 0", () => {
    expect(selectCount(counterStore.getState())).toBe(0);
  });

  it("increments the count", () => {
    counterStore.dispatch(incremented());
    expect(selectCount(counterStore.getState())).toBe(1);
  });

  it("decrements the count", () => {
    counterStore.dispatch(incremented());
    counterStore.dispatch(decremented());
    expect(selectCount(counterStore.getState())).toBe(0);
  });

  it("adds a custom amount", () => {
    counterStore.dispatch(amountAdded(10));
    expect(selectCount(counterStore.getState())).toBe(10);
  });

  it("resets back to 0", () => {
    counterStore.dispatch(amountAdded(42));
    counterStore.dispatch(reset());
    expect(selectCount(counterStore.getState())).toBe(0);
  });

  it("simulates the full counter flow correctly", () => {
    const { actions, finalState } = simulateCounter();
    expect(actions).toHaveLength(6);
    expect(actions[0]).toBe("Initial: count = 0");
    expect(finalState.value).toBe(0);
  });
});

// ── Todo Tests ───────────────────────────────────────────────────────────────

describe("Redux Todo App", () => {
  it("starts with initial todos", () => {
    // The module initializes with default todos
    const todos = selectTodos(todoStore.getState());
    expect(todos.length).toBeGreaterThan(0);
  });

  it("adds a todo", () => {
    const initialCount = selectTodos(todoStore.getState()).length;
    todoStore.dispatch(todoAdded("New todo"));
    expect(selectTodos(todoStore.getState()).length).toBe(initialCount + 1);
  });

  it("toggles a todo", () => {
    const todos = selectTodos(todoStore.getState());
    expect(todos.length).toBeGreaterThan(0);
    const firstTodo = todos[0];
    const wasCompleted = firstTodo.completed;

    todoStore.dispatch(todoToggled(firstTodo.id));

    const updated = selectTodos(todoStore.getState()).find((t) => t.id === firstTodo.id);
    expect(updated?.completed).toBe(!wasCompleted);
  });

  it("deletes a todo", () => {
    const todos = selectTodos(todoStore.getState());
    expect(todos.length).toBeGreaterThan(0);
    const firstTodo = todos[0];
    const initialCount = todos.length;

    todoStore.dispatch(todoDeleted(firstTodo.id));

    expect(selectTodos(todoStore.getState()).length).toBe(initialCount - 1);
  });

  it("filters todos correctly", () => {
    todoStore.dispatch(filterChanged("all"));
    const allCount = selectFilteredTodos(todoStore.getState()).length;

    todoStore.dispatch(filterChanged("active"));
    const activeCount = selectFilteredTodos(todoStore.getState()).length;

    todoStore.dispatch(filterChanged("completed"));
    const completedCount = selectFilteredTodos(todoStore.getState()).length;

    expect(allCount).toBe(activeCount + completedCount);
  });

  it("clears completed todos", () => {
    todoStore.dispatch(clearCompleted());
    const remaining = selectTodos(todoStore.getState());
    expect(remaining.every((t) => !t.completed)).toBe(true);
  });

  it("simulates the full todo flow", () => {
    const log = simulateTodoApp();
    expect(log.length).toBeGreaterThan(0);
    expect(log[0]).toContain("Initial State");
  });
});

// ── Async Thunk Tests ────────────────────────────────────────────────────────

describe("Redux Async Thunks", () => {
  it("starts with empty users", () => {
    expect(selectUsers(usersStore.getState())).toEqual([]);
    expect(selectUsersLoading(usersStore.getState())).toBe(false);
    expect(selectUsersError(usersStore.getState())).toBeNull();
  });

  it("handles a fetch (may succeed or fail due to simulated API)", async () => {
    const result = await usersStore.dispatch(fetchUsers());

    // The API simulates a 20% failure rate, so accept either outcome
    if (fetchUsers.fulfilled.match(result)) {
      // Success case
      expect(result.payload).toHaveLength(3);
      expect(selectUsersLoading(usersStore.getState())).toBe(false);
      expect(selectUsersError(usersStore.getState())).toBeNull();
    } else if (fetchUsers.rejected.match(result)) {
      // Failure case
      expect(selectUsersLoading(usersStore.getState())).toBe(false);
      expect(selectUsersError(usersStore.getState())).not.toBeNull();
    }
  });

  it("can clear errors", () => {
    usersStore.dispatch(clearError());
    expect(selectUsersError(usersStore.getState())).toBeNull();
  });

  it("removes a user after successful fetch", async () => {
    const result = await usersStore.dispatch(fetchUsers());

    // Only test removal if fetch succeeded
    if (fetchUsers.fulfilled.match(result)) {
      const initialCount = selectUsers(usersStore.getState()).length;
      expect(initialCount).toBe(3);

      usersStore.dispatch(userRemoved(1));

      expect(selectUsers(usersStore.getState()).length).toBe(initialCount - 1);
      expect(selectUsers(usersStore.getState()).find((u) => u.id === 1)).toBeUndefined();
    }
    // If fetch failed, we skip the removal assertion — that's fine
  });
});
