import { CheckBox, CheckBoxOutlineBlankOutlined } from '@mui/icons-material'
import { Button } from '@mui/material'

const Icon = ({
  todoId,
  isCompleted,
  updateIsCompleted,
} : {
  todoId: string;
  isCompleted: boolean;
  updateIsCompleted: (id: string) => void;
}) => {
  return (
    <div onClick={() => {
      updateIsCompleted(todoId) // Gọi callback để cập nhật trạng thái isCompleted (kèm theo todoId)
    }}>
      {isCompleted ? <CheckBox/> : <CheckBoxOutlineBlankOutlined />}
    </div>
  )
}

export const Todo = ({
  todoId,
  title, 
  isCompleted,
  updateIsCompleted,
} : {
  todoId: string;
  title: string; 
  isCompleted: boolean;
  updateIsCompleted: (id: string) => void;
}) => { 
  return (
    <div>
        <Button 
          fullWidth= {true}
          style={{justifyContent: 'space-between', marginTop: '8px'}}
          variant="contained" 
          color="success"
          endIcon={
            <Icon todoId={todoId} isCompleted={isCompleted} updateIsCompleted= {updateIsCompleted}/>
          }>{title}</Button>
    </div>
  )
}
