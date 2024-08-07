export type HTMLElementType = keyof HTMLElementTagNameMap;
export type CustomElementType = 'TEXT_ELEMENT';

export type ElementType = HTMLElementType | CustomElementType;

export interface TextElementProps {
    nodeValue: string;
    children: RElement<ElementType>[];
}

export type ElementProps<Type extends ElementType> = Type extends CustomElementType
    ? TextElementProps
    : Type extends HTMLElementType
      ? HTMLElementTagNameMap[Type]
      : {};

export interface RElement<Type extends ElementType> {
    type: Type;
    props: ElementProps<Type>;
}
