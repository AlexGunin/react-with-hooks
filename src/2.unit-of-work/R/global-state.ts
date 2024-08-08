import { GlobalState } from './types';

export const globalState: GlobalState = {
    nextUnitOfWork: null,
    wipRoot: null,
    currentRoot: null,
    deletions: [],
    wipFiber: null,
};
