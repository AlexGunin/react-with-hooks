import { Fiber, FiberType } from './types';
import { globalState } from './global-state.ts';
import { startWorkLoop } from './core.ts';

export const render = <Type extends FiberType>(element: Fiber<Type>, container: HTMLElement) => {
    // @ts-ignore
    globalState.wipRoot = {
        dom: container,
        // @ts-ignore
        props: {
            children: [element],
        },
        alternate: globalState.currentRoot,
    };
    globalState.deletions.length = 0;
    globalState.nextUnitOfWork = globalState.wipRoot;

    startWorkLoop();
};
