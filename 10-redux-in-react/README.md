# Redux in React

## What is Redux?

**Redux** is a predictable state container (state management library) for JavaScript applications. It helps you manage global application state in a single store with a strict unidirectional data flow.

It was inspired by Flux (Facebook's application architecture) and Elm architecture, combining the concepts into a simpler, more predictable pattern.

---

## When to use Redux (and when NOT to)

### Use Redux when:

1. **Multiple unrelated components need the same data**
   - e.g., user profile shown in a sidebar nav, a header avatar, and a settings page.
2. **State is shared across many routes/pages**
   - e.g., a shopping cart that persists as you navigate a product catalog.
3. **Complex state interactions** where one action updates data in several unrelated places.
4. **Caching server data** with normalized shapes (e.g., `entities` pattern).
5. **You need time-travel debugging or action replay** for debugging complex flows.
6. **Undo/redo functionality** is needed.

### DON'T use Redux when:

1. **Component-local state is sufficient** — React's `useState` or `useReducer` works fine.
2. **Simple prop drilling** — just passing data through 1-2 levels is not a problem.
3. **Your app is small** — Redux adds boilerplate; simpler solutions exist.
4. **You mainly need server state caching** — prefer **React Query (TanStack Query)**, **SWR**, or **RTK Query** (built into Redux Toolkit).

### Current consensus (2024+):

> **Start with React built-in state, then add Redux Toolkit (RTK) only when you feel the pain of passing props too deep or coordinating state across too many components.**

Redux Toolkit (RTK) has significantly reduced the boilerplate that made early Redux painful.

---

## Core Concepts

### 1. Single Store (Single Source of Truth)

The entire application state lives in one plain JavaScript object tree inside a single store.

```typescript
{
  todos: {
    items: [
      { id: 1, text: "Learn Redux", completed: false },
      { id: 2, text: "Build something", completed: true }
    ],
    filter: "all"
  },
  user: {
    name: "Alice",
    isLoggedIn: true
  }
}
```

### 2. State is Read-Only (via Actions)

You never mutate state directly. The only way to change state is to dispatch an **action** — a plain object describing what happened.

```typescript
// Action (what happened)
{ type: "todos/todoAdded", payload: "Buy groceries" }
```

### 3. Pure Reducers

A **reducer** is a pure function that takes the current state + an action, and returns the **next state** (immutably).

```typescript
function todosReducer(state = [], action) {
  switch (action.type) {
    case "todos/todoAdded":
      return [...state, { id: nextId(), text: action.payload, completed: false }];
    case "todos/todoToggled":
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    default:
      return state;
  }
}
```

### 4. Unidirectional Data Flow

```
Action -> Dispatch -> Reducer -> Store -> Re-render UI
```

The UI dispatches actions. Reducers compute new state. The store notifies subscribers. React re-renders.

---

## Redux + React: How They Connect

In a React + Redux app:

1. **React components** dispatch actions (user events, API calls, etc.)
2. **Redux store** runs the reducer, computes new state
3. **React-Redux `useSelector`** hook reads the Redux state and subscribes to changes
4. **React-Redux `useDispatch`** hook gives components a way to dispatch actions
5. When the store updates, subscribed components re-render automatically

---

## Examples

### Example 1: Basic Counter (Redux Toolkit)

This shows the minimal Redux setup — useful as a starting point.

See: [`counter-example.ts`](counter-example.ts)

### Example 2: Todo App (Redux Toolkit)

A more realistic example with CRUD operations and filtering.

See: [`todo-example.ts`](todo-example.ts)

### Example 3: Async Thunks (API Calls)

Demonstrates handling async operations (API calls) with Redux Toolkit's `createAsyncThunk`.

See: [`async-example.ts`](async-example.ts)

---

## Redux Toolkit (RTK) vs Classic Redux

| Feature | Classic Redux | Redux Toolkit (RTK) |
|---------|--------------|---------------------|
| Store setup | Manual with `createStore`, middleware wiring | `configureStore` with sensible defaults |
| Reducers | Switch statements, hand-written immutable updates | `createSlice` with Immer (mutate syntax, immutable output) |
| Actions | Action type constants, action creators manually | Auto-generated from slice |
| Async logic | `redux-thunk` manually, lots of boilerplate | `createAsyncThunk` |
| DevTools | Manual setup | Auto-enabled |
| Recommended? | Legacy | Current standard |

> **Always use Redux Toolkit for new projects.**

---

## Modern Alternatives to Redux

| Tool | When to use |
|------|------------|
| **React Context + useReducer** | Small-medium apps, simple global state |
| **Zustand** | Minimal boilerplate, simple API, great for mid-size apps |
| **Jotai / Recoil** | Atomic state, good for fine-grained re-renders |
| **TanStack Query (React Query)** | Server state (caching, fetching, mutations) — use alongside local state |
| **RTK Query** | Built into RTK, server state + caching |
| **XState** | State machines for complex UI flows |

---

## Run

```bash
npm test -- 10-redux-in-react/redux-in-react.test.ts
```
