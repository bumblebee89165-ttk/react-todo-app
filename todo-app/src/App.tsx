import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { CreateNewTodo } from "./components/CreateNewTodo";
import { TodoList } from "./components/TodoList";

export type TodoType = { // Dùng export để có thể sử dụng type này ở các file khác
  id: string;
  title: string;
  isCompleted: boolean;
};

function  App() {
  const [todos, setTodos] = useState<TodoType[]>(
    () => {
      const storedTodos = localStorage.getItem("todos");
      return storedTodos ? JSON.parse(storedTodos) : [];
    }
  );
  const [inputValue, setInputValue] = useState<string>("");

  // Hàm xử lý khi thay đổi giá trị trong ô input
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }

  // Hàm thêm todo mới
  const handleAddTodo = () => {
    const newTodo: TodoType = {
      id: uuidv4(),
      title: inputValue,
      isCompleted: false
    };
    setTodos([newTodo, ...todos]);
    setInputValue("");
  }

  // Callback để cập nhật trạng thái isCompleted của todo
  const updateIsCompleted = (id: string) => {
    setTodos(prevState =>{
      return prevState.map(todo => {
        if (todo.id === id) {
          return {...todo, isCompleted: !todo.isCompleted}; // Tạo một object mới với thuộc tính isCompleted được thay đổi
        }
        return todo;
      })
    })
  }

  // Lưu todos vào localStorage mỗi khi todos thay đổi
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
    sessionStorage.setItem("todos_session", JSON.stringify(todos));
  }, [todos]);

  return (
    <>
      <p>Khang Todo App</p>
      <CreateNewTodo inputValue={inputValue} handleInputChange={handleInputChange} handleAddTodo={handleAddTodo}/>
      <TodoList todos={todos} updateIsCompleted={updateIsCompleted}/>
    </>
  );
}

export default App;
