import { createElement } from './helpers';
import hooks from './hooks';
import { render } from './render.ts';

export * from './types';

const R = {
    createElement,
    render,
    ...hooks,
};

export default R;
