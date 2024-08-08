import { CSSProperties, Fiber, FiberDom, FiberProps, FiberPropsKeys } from '../types';
import { is } from './is';
import { keys } from '../../../utils';

const updateStyle = (dom: HTMLElement, styleObject?: CSSProperties) => {
    if (styleObject && typeof styleObject === 'object') {
        keys(styleObject).forEach((key) => {
            const propValue = styleObject[key];
            // @ts-ignore
            dom.style[key] = typeof propValue === 'number' ? `${propValue}px` : propValue;
        });
    }
};

const removeUnusedListeners = (
    dom: NonNullable<FiberDom>,
    nextProps: FiberProps,
    prevProps: FiberProps,
    prevPropsKeys: FiberPropsKeys
) => {
    prevPropsKeys.forEach((name) => {
        const isOld = !(name in nextProps) || is.props.new(prevProps, nextProps)(name);
        if (!is.props.event(name) || !isOld) {
            return;
        }

        const eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(
            eventType,
            // @ts-ignore
            prevProps[name]
        );
    });
};

const removeOldProperties = (
    dom: NonNullable<FiberDom>,
    nextProps: FiberProps,
    prevPropsKeys: FiberPropsKeys
) => {
    prevPropsKeys.forEach((name) => {
        if (!is.props.property(name) || !is.props.gone(nextProps)) {
            return;
        }
        // @ts-ignore
        dom[name] = '';
    });
};

const updateProperties = (
    dom: NonNullable<FiberDom>,
    nextProps: FiberProps,
    prevProps: FiberProps,
    nextPropsKeys: FiberPropsKeys
) => {
    nextPropsKeys.forEach((name) => {
        if (!is.props.property(name) || !is.props.new(prevProps, nextProps)) {
            return;
        }

        if (is.props.style(name) && !is.textNode(dom)) {
            updateStyle(dom, nextProps[name]);
            return;
        }

        // @ts-ignore
        dom[name] = nextProps[name];
    });
};

const addListeners = (
    dom: NonNullable<FiberDom>,
    nextProps: FiberProps,
    prevProps: FiberProps,
    nextPropsKeys: FiberPropsKeys
) => {
    nextPropsKeys.forEach((name) => {
        if (!is.props.event(name) || !is.props.new(prevProps, nextProps)) {
            return;
        }

        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(
            eventType,
            // @ts-ignore
            nextProps[name]
        );
    });
};

export const updateDom = (
    dom: Fiber['dom'],
    nextProps: FiberProps,
    alternateProps?: FiberProps
) => {
    if (!dom) {
        return;
    }

    // В react все эти операции написано более оптимально, за меньшее количество проходов.
    // В данном случае исключительно учебный пример, чтобы было легче читать

    const prevProps = alternateProps ?? ({} as FiberProps);

    const prevPropsKeys = keys(prevProps);
    const nextPropsKeys = keys(nextProps);

    removeUnusedListeners(dom, nextProps, prevProps, prevPropsKeys);
    removeOldProperties(dom, nextProps, prevPropsKeys);
    updateProperties(dom, nextProps, prevProps, nextPropsKeys);
    addListeners(dom, nextProps, prevProps, nextPropsKeys);
};
