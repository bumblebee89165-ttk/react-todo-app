import type { TodoType } from '../App';
import { Todo } from './Todo';

export const TodoList = ({
    todos,
    updateIsCompleted,
} : {
    todos: TodoType[],
    updateIsCompleted: (id: string) => void;
}) => {
  return (
    <div>
        {
          todos.map((todo) => {
                return <Todo 
                        todoId={todo.id} 
                        key={todo.id} 
                        title={todo.title} 
                        isCompleted={todo.isCompleted} 
                        updateIsCompleted={updateIsCompleted}/>;
          })
        }
    </div>
  )
}
