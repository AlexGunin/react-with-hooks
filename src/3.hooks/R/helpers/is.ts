import {
    EffectHook,
    Fiber,
    FiberProps,
    FunctionComponent,
    Hook,
    LayoutEffectHook,
    StateHook,
} from '../types';

export const is = {
    fn: (value: unknown): value is Function => value instanceof Function,
    functionComponent: (fiber: Fiber): fiber is Fiber<FunctionComponent> => is.fn(fiber.type),
    hiddenNode: (value: unknown) => value === null || value === undefined || value === false,
    textNode: (dom: unknown): dom is Text => dom instanceof Text,

    hook: {
        useState: <State>(hook: Hook): hook is StateHook<State> =>
            'tag' in hook && hook.tag === 'STATE',
        useEffect: (hook: Hook): hook is EffectHook => 'tag' in hook && hook.tag === 'EFFECT',
        useLayoutEffect: (hook: Hook): hook is LayoutEffectHook =>
            'tag' in hook && hook.tag === 'LAYOUT_EFFECT',
    },

    props: {
        event: (key: keyof FiberProps) => key.startsWith('on'),
        style: (key: keyof FiberProps) => key === 'style',
        property: (key: keyof FiberProps) => key !== 'children' && !is.props.event(key),
        new: (prev: FiberProps, next: FiberProps) => (key: keyof FiberProps) =>
            prev[key] !== next[key],
        gone: (next: FiberProps) => (key: keyof FiberProps) => !(key in next),
    },
};
