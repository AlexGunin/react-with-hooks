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
    return {
        type,
        props: {
            ...props,
            children: children.reduce((acc, child) => {
                if (is.hiddenNode(child)) {
                    return acc;
                }

                if (Array.isArray(child)) {
                    acc.push(...child);
                } else if (typeof child === 'object') {
                    acc.push(child);
                } else {
                    acc.push(createTextElement(child));
                }

                return acc;
            }, []),
        },
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
