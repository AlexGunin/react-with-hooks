import { Fiber, FiberProps, FunctionComponent } from '../types';

export const is = {
    fn: (value: unknown): value is Function => value instanceof Function,
    functionComponent: (fiber: Fiber): fiber is Fiber<FunctionComponent> => is.fn(fiber.type),
    hiddenNode: (value: unknown) => value === null || value === undefined || value === false,
    textNode: (dom: unknown): dom is Text => dom instanceof Text,

    props: {
        event: (key: keyof FiberProps) => key.startsWith('on'),
        style: (key: keyof FiberProps) => key === 'style',
        property: (key: keyof FiberProps) => key !== 'children' && !is.props.event(key),
        new: (prev: FiberProps, next: FiberProps) => (key: keyof FiberProps) =>
            prev[key] !== next[key],
        gone: (next: FiberProps) => (key: keyof FiberProps) => !(key in next),
    },
};
