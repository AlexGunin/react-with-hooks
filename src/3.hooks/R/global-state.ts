import { GlobalState } from './types';

export const globalState: GlobalState = {
    nextUnitOfWork: null,
    wipRoot: null,
    currentRoot: null,
    deletions: [],
    wipFiber: null,
    hookIndex: 0,

    effects: [],
    layoutEffects: [],

    messagePort: null,

    pending: false,
};
