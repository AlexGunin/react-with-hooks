import R from './R';
import './styles.css';
import { Todo, Todos, useFetch } from './todo-list';

const DEFAULT_TODOS: Todo[] = [];

const App = () => {
    const { data, isLoading, error } = useFetch<Todo[]>({
        url: 'https://jsonplaceholder.typicode.com/todos',
        defaultValue: DEFAULT_TODOS,
        transform: (todos) => {
            return todos.slice(0, 10);
        },
        delay: 2000,
    });

    if (isLoading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (error) {
        return <div>Ошибка: {error.message}</div>;
    }

    return <Todos initialTodos={data} />;
};

export default App;
