import { ElementType, RElement, ElementProps, CSSProperties } from './types';

const isProperty = (key: string) => key !== 'children';

const isFn = (value: unknown): value is Function => value instanceof Function;

const updateStyle = (dom: HTMLElement, styleObject?: CSSProperties) => {
    if (styleObject !== null && typeof styleObject === 'object') {
        Object.keys(styleObject).forEach((key) => {
            const propValue = styleObject[key];
            // @ts-ignore
            dom.style[key] = typeof propValue === 'number' ? `${propValue}px` : propValue;
        });
    }
};

const updateAttributes = <Type extends ElementType>(
    element: RElement<Type>,
    dom: HTMLElement | Text
) => {
    Object.entries(element.props).forEach(([name, value]) => {
        if (name === 'style' && !(dom instanceof Text)) {
            updateStyle(dom, value);
        } else if (isProperty(name)) {
            // @ts-ignore
            dom[name] = value;
        }
    });
};

const createTextElement = (text: string): RElement<'TEXT_ELEMENT'> => {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: [],
        },
    };
};

export const createElement = <Type extends ElementType>(
    type: Type,
    props: ElementProps<Type> = {} as ElementProps<Type>,
    ...children: any[]
) => {
    return {
        type,
        props: {
            ...props,
            children: children.reduce((acc, child) => {
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

export const render = <Type extends ElementType>(
    element: RElement<Type>,
    container: HTMLElement | Text
) => {
    if (isFn(element.type)) {
        render(element.type(element.props), container);
        return;
    }

    const dom =
        element.type === 'TEXT_ELEMENT'
            ? document.createTextNode('')
            : document.createElement(element.type);

    const children = element.props?.children as RElement<ElementType>[];

    if (!children) {
        return;
    }

    children.forEach((child) => render(child, dom));

    updateAttributes(element, dom);

    container.appendChild(dom);
};
