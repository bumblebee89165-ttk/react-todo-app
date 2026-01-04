import { TextField, Button } from '@mui/material';

type CreateNewTodoProps = {
  inputValue: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddTodo: () => void;
}

export const CreateNewTodo = (
    {
        inputValue,
        handleInputChange,
        handleAddTodo
    } : CreateNewTodoProps) => {
    return (
    <div>
        <TextField label="Outlined" variant="outlined" size="small" value={inputValue} onChange={handleInputChange}/>
        <Button variant="contained" onClick={handleAddTodo}>Thêm</Button>
    </div>
  )
}
