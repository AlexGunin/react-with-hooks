import { EffectHook, Fiber, FunctionComponent, Hook, StateHook } from '../types';

export const is = {
    useState: <State>(hook: Hook): hook is StateHook<State> =>
        'tag' in hook && hook.tag === 'STATE',
    useEffect: (hook: Hook): hook is EffectHook => 'tag' in hook && hook.tag === 'EFFECT',
    useLayoutEffect: (hook: Hook): hook is EffectHook =>
        'tag' in hook && hook.tag === 'LAYOUT_EFFECT',
    fn: (value: unknown): value is Function => value instanceof Function,
    functionComponent: (fiber: Fiber): fiber is Fiber<FunctionComponent> => is.fn(fiber.type),
    hideNode: (value: unknown) => value === null || value === undefined || value === false,
};
