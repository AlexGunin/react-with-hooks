import R, { RNode } from './R';

interface BaseProps {
    id: number;
    children?: RNode;
}

const Item = (props: BaseProps) => (
    <li style={{ display: 'flex', gap: 10 }}>
        <p>{props.id}</p>
        <p>{props.children}</p>
    </li>
);

const List = () => (
    <ul>
        {['First', 'Second', 'Third'].map((item, index) => (
            <Item id={index + 1}>{item}</Item>
        ))}
    </ul>
);
const App = () => (
    <div>
        <p>Hello World</p>
        <button>Click</button>
        <List />
    </div>
);

export default App;
