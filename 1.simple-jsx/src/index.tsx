import R from './R';

const element = (
    <div>
        <p>Hello World</p>
        <button>Click</button>
    </div>
);

const container = document.getElementById('app');

if (container) {
    R.render(element, container);
}
