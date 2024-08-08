import R from './R';

const Counter = () => {
    const [counter, setCounter] = R.useState(0);

    R.useEffect(() => {
        return () => {
            console.log('Unmount');
        };
    }, []);

    return (
        <div>
            <p>Hello World {counter}</p>
            <button onClick={() => setCounter(counter + 1)}>Click</button>
        </div>
    );
};

const App = () => {
    const [isVisible, setIsVisible] = R.useState(true);

    R.useLayoutEffect(() => {
        console.log('ON CHANGE VISIBLE');
    }, [isVisible]);

    R.useEffect(() => {
        console.log('Effect');

        setInterval(() => {
            setIsVisible((prev) => !prev);
        }, 5000);
    }, []);

    return <div>{isVisible && <Counter />}</div>;
};

export default App;
