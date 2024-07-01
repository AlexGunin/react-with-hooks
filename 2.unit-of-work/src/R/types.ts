export type HTMLElementType = keyof HTMLElementTagNameMap
export type CustomElementType = 'TEXT_ELEMENT'

export type FiberType = HTMLElementType | CustomElementType

export interface TextElementProps {
  nodeValue: string;
  children: Fiber<FiberType>[]
}


export type GenericFiberProps<Type extends FiberType> = Type extends CustomElementType ? TextElementProps : Type extends  HTMLElementType ? HTMLElementTagNameMap[Type] : {}

export type FiberProps<Type extends FiberType = FiberType> = Omit<GenericFiberProps<Type>, 'children'> & {children: Fiber[]}

export interface Fiber<Type extends FiberType = FiberType> {
  type: Type,
  props: FiberProps,
  parent: Fiber,
  dom: HTMLElement | Text | null,
  child?: Fiber | null,
  sibling?: Fiber | null,
  alternate: Fiber<Type> | null;
  effectTag?: 'UPDATE' | 'PLACEMENT' | 'DELETION'
}


export type FiberDom = Fiber['dom']

export type FiberPropsKeys = (keyof FiberProps)[]
