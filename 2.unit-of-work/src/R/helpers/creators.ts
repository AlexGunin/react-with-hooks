import { Fiber, FiberProps, FiberType, FunctionComponent } from '../types';
import { updateDom } from './handle-dom-attributes.ts';
import { is } from './is.ts';

const createTextElement = (text: string) => {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: [],
        },
    };
};

export const createElement = <Type extends FiberType>(
    type: Type,
    // @ts-ignore
    props: FiberProps<Type> = {},
    ...children: any[]
) => {
    const { key, ...delegated } = props ?? {};
    return {
        type,
        props: {
            ...delegated,
            children: children
                .filter((value) => !is.hideNode(value))
                .map((child) => (typeof child === 'object' ? child : createTextElement(child))),
        },
        key,
    };
};

export const createDom = <Type extends Exclude<FiberType, FunctionComponent>>(
    fiber: Fiber<Type>
) => {
    const dom =
        fiber.type === 'TEXT_ELEMENT'
            ? document.createTextNode('')
            : document.createElement(fiber.type);

    updateDom(dom, fiber.props, {});
    return dom;
};
