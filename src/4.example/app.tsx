import R from './R';
import './styles.css';
import {
    DeleteTodo,
    NewTodoForm,
    OnSubmitCreateTodo,
    Todo,
    TodoList,
    ToggleTodo,
} from './todo-list';

const getTodo = () => {
    const localValue = localStorage.getItem('ITEMS');
    if (localValue == null) return [];

    return JSON.parse(localValue);
};

const useTodos = () => {
    const [todos, setTodos] = R.useState<Todo[]>(getTodo());

    const addTodo: OnSubmitCreateTodo = (title) => {
        setTodos((currentTodos) => {
            return [...currentTodos, { id: crypto.randomUUID(), title, completed: false }];
        });
    };

    const toggleTodo: ToggleTodo = (id, completed) => {
        setTodos((currentTodos) => {
            return currentTodos.map((todo) => {
                if (todo.id === id) {
                    return { ...todo, completed };
                }

                return todo;
            });
        });
    };

    const deleteTodo: DeleteTodo = (id) => {
        setTodos((currentTodos) => {
            return currentTodos.filter((todo) => todo.id !== id);
        });
    };

    R.useEffect(() => {
        localStorage.setItem('ITEMS', JSON.stringify(todos));
    }, [todos]);

    return {
        todos,
        addTodo,
        toggleTodo,
        deleteTodo,
    };
};

const App = () => {
    const { addTodo, toggleTodo, deleteTodo, todos } = useTodos();

    return (
        <>
            <NewTodoForm onSubmit={addTodo} />
            <h1 className="header">TodoList</h1>
            <TodoList todos={todos} toggleTodo={toggleTodo} deleteTodo={deleteTodo} />
        </>
    );
};

export default App;
