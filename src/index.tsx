import R from './4.example/R';
import * as First from './1.simple-jsx';
import * as Second from './2.unit-of-work';
import * as Third from './3.hooks';
import * as Fourth from './4.example';

const container = document.getElementById('app');

if (container) {
    First.R.render(<First.App />, container);
}

// Для проверки - расскоментировать нужную версию

// if (container) {
//     Second.R.render(<Second.App />, container);
// }
//
// if (container) {
//     Third.R.render(<Third.App />, container);
// }
//
// if (container) {
//     Fourth.R.render(<Fourth.App />, container);
// }
