# Todo App – Luồng hoạt động (Quick Learn)

Tài liệu này mô tả **luồng đi của dữ liệu + sự kiện** trong app Todo hiện tại, dựa trên các file:
- `src/App.tsx`
- `src/components/CreateNewTodo.tsx`
- `src/components/TodoList.tsx`
- `src/components/Todo.tsx`

---

## 1) Tổng quan kiến trúc

### Component tree

`App`
- `CreateNewTodo` (input + nút thêm)
- `TodoList` (render danh sách)
  - `Todo` (render 1 item)
    - `Icon` (hiển thị checkbox & bắt sự kiện toggle)

### Nguyên tắc thiết kế đang dùng

- **Single source of truth**: State chính (`todos`, `inputValue`) nằm ở `App`.
- **Props down, events up**:
  - Dữ liệu (state) được truyền xuống bằng props.
  - Sự kiện từ UI gọi callback props để “báo ngược” về `App` cập nhật state.
- **Immutability**: Không sửa trực tiếp mảng/object cũ; dùng `map`, spread (`...`) để tạo bản mới.

---

## 2) Data model (TypeScript)

Trong `src/App.tsx` có type:

```ts
export type TodoType = {
  id: string;
  title: string;
  isCompleted: boolean;
};
```

Ý nghĩa:
- `id`: định danh duy nhất (được tạo bằng `uuidv4()`)
- `title`: nội dung todo
- `isCompleted`: trạng thái hoàn thành

Ghi chú:
- TypeScript **không set default value trong type/interface**. Default `false` được set khi tạo object todo mới.

---

## 3) State trong App

Trong `App`:

- `todos: TodoType[]`
  - Ban đầu là `[]`.
  - Mỗi lần thêm/toggle sẽ tạo ra mảng mới và set lại.

- `inputValue: string`
  - Ban đầu là `""`.
  - Luôn là “single source” cho giá trị `TextField` (controlled input).

---

## 4) Luồng sự kiện (Event Flow) chi tiết

### 4.1 Người dùng gõ vào input

**UI**: `CreateNewTodo` render `TextField` với `value={inputValue}`.

**Luồng gọi hàm**:

1. Người dùng gõ ký tự
2. `TextField` bắn `onChange(event)`
3. `CreateNewTodo` gọi `handleInputChange(event)` (props)
4. `App.handleInputChange` chạy:

```ts
setInputValue(event.target.value)
```

**Kết quả**:
- `inputValue` đổi → `App` re-render → `CreateNewTodo` nhận `inputValue` mới → `TextField` hiển thị đúng text.

Từ khoá: đây là **controlled component**.

---

### 4.2 Người dùng bấm “Thêm” để tạo todo

**UI**: `CreateNewTodo` render `Button` với `onClick={handleAddTodo}`.

**Luồng gọi hàm**:

1. Click nút “Thêm”
2. `CreateNewTodo` gọi `handleAddTodo()` (props)
3. `App.handleAddTodo` tạo todo mới:

```ts
const newTodo: TodoType = {
  id: uuidv4(),
  title: inputValue,
  isCompleted: false,
};
```

4. Cập nhật state danh sách:

```ts
setTodos([newTodo, ...todos]);
```

5. Reset input:

```ts
setInputValue(""ाना)
```

> Lưu ý: trong code thật là `setInputValue("")`. (Dòng trên chỉ minh hoạ)

**Kết quả**:
- `todos` đổi → `TodoList` re-render → hiển thị thêm item mới ở **đầu danh sách**.
- `inputValue` về rỗng → input được clear.

Ghi chú quan trọng:
- `setTodos([newTodo, ...todos])` đang dùng `todos` từ closure.
  - Thường vẫn chạy đúng, nhưng pattern an toàn hơn là dùng callback form:
    `setTodos(prev => [newTodo, ...prev])`

---

### 4.3 Người dùng toggle hoàn thành (checkbox icon)

**UI**:
- `TodoList` map `todos` và render `Todo`.
- `Todo` render `Button` (MUI) và truyền `endIcon={<Icon .../>}`.
- `Icon` hiển thị:
  - Nếu `isCompleted` true → `<CheckBox />`
  - Nếu false → `<CheckBoxOutlineBlankOutlined />`

**Luồng gọi hàm**:

1. Người dùng click vào icon
2. `Icon` bắt `onClick` và gọi:

```ts
updateIsCompleted(todoId)
```

3. Đây là callback prop trỏ về `App.updateIsCompleted`
4. `App.updateIsCompleted(id)` dùng callback form của `setTodos`:

```ts
setTodos(prevState => {
  return prevState.map(todo => {
    if (todo.id === id) {
      return { ...todo, isCompleted: !todo.isCompleted };
    }
    return todo;
  });
});
```

**Kết quả**:
- Chỉ todo có `id` trùng sẽ bị đảo `isCompleted`.
- React re-render → `TodoList` + `Todo` re-render → icon đổi trạng thái.

---

## 5) Luồng render (Render Flow)

### App render
`App` render:
- Tiêu đề: `<p>Todo App</p>`
- `CreateNewTodo` với 3 props:
  - `inputValue`
  - `handleInputChange`
  - `handleAddTodo`
- `TodoList` với 2 props:
  - `todos`
  - `updateIsCompleted`

### TodoList render
`TodoList`:
- `todos.map(todo => <Todo ... />)`
- Dùng `key={todo.id}` (đúng best practice khi render list).

### Todo render
`Todo`:
- Render `Button` full width.
- `endIcon` là component `Icon`.
- Nội dung `Button` là `{title}`.

---

## 6) Props contract giữa các component

### CreateNewTodo props
```ts
type CreateNewTodoProps = {
  inputValue: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddTodo: () => void;
}
```

Ý nghĩa:
- `inputValue`: giá trị input hiện tại
- `handleInputChange`: callback báo về `App` khi user gõ
- `handleAddTodo`: callback báo về `App` khi user bấm thêm

### TodoList props
```ts
{
  todos: TodoType[];
  updateIsCompleted: (id: string) => void;
}
```

Ý nghĩa:
- `todos`: mảng cần render
- `updateIsCompleted`: callback toggle completion

### Todo props
```ts
{
  todoId: string;
  title: string;
  isCompleted: boolean;
  updateIsCompleted: (id: string) => void;
}
```

### 4.1) Load từ localStorage khi app mount (khởi tạo state)
- `useState` đang dùng **lazy initializer**:
  - Đọc `localStorage.getItem("todos")`
  - Nếu có thì `JSON.parse(...)` để ra mảng todos
  - Nếu không có thì `[]`
- Mục tiêu: chỉ đọc localStorage **1 lần** lúc khởi tạo state (tránh đọc mỗi lần re-render)

### 4.2) Lưu vào localStorage mỗi khi `todos` thay đổi
- `useEffect(() => { ... }, [todos])`
  - Mỗi lần `todos` đổi (add/toggle/...), effect chạy:
  - `localStorage.setItem("todos", JSON.stringify(todos))`
- Mục tiêu: đảm bảo refresh trang vẫn giữ được danh sách todo

### 4.3) Notes nhanh
- `localStorage` chỉ lưu **string** → phải `JSON.stringify` khi lưu và `JSON.parse` khi đọc.
- (Optional) Nên bọc `JSON.parse` trong `try/catch` để tránh crash nếu data hỏng.
---

## 7) Checklist nhanh để hiểu app trong 30s

- State nằm ở `App`: `todos`, `inputValue`.
- `CreateNewTodo` = UI nhập + gọi callback để update state.
- `TodoList` = chỉ render list.
- `Todo` = render 1 item.
- `Icon` = phần toggle, gọi `updateIsCompleted(todoId)`.

---

## 8) Một vài lưu ý/thói quen tốt (optional)

- Nên chặn việc thêm todo rỗng (trim) nếu cần.
- Nên dùng `setTodos(prev => [newTodo, ...prev])` để tránh stale state.
- Nếu sau này có “xoá todo”, pattern sẽ tương tự toggle nhưng dùng `filter`.
