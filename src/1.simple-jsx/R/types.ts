export type HTMLElementType = keyof HTMLElementTagNameMap;
export type CustomElementType = 'TEXT_ELEMENT';
export type FunctionComponent = Function;

export type ElementType = HTMLElementType | CustomElementType | FunctionComponent;

// TODO
export type CSSProperties = any;
export type RNode = any;

export interface TextElementProps {
    nodeValue: string;
    children: RElement<ElementType>[];
}

interface BaseProps {
    children: any[];
    style?: CSSProperties;
}

export type ElementProps<
    Type extends ElementType,
    Props extends BaseProps = { children: [] },
> = Type extends CustomElementType
    ? TextElementProps
    : Type extends HTMLElementType
      ? HTMLElementTagNameMap[Type]
      : Type extends FunctionComponent
        ? Props
        : {};

export interface RElement<Type extends ElementType> {
    type: Type;
    props: ElementProps<Type>;
}
