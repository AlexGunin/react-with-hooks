import { EffectHook, Hook } from './hooks.ts';

// TODO
export type CSSProperties = any;
export type RNode = any;

export type HTMLElementType = keyof HTMLElementTagNameMap;
export type CustomElementType = 'TEXT_ELEMENT';
export type FunctionComponent = <Props extends Record<string, unknown>>(props: Props) => RNode;

export type FiberPrimitiveType = HTMLElementType | CustomElementType;
export type FiberType = FiberPrimitiveType | FunctionComponent;

export interface TextElementProps {
    nodeValue: string;
    children: Fiber<FiberType>[];
}

export type GenericFiberProps<Type extends FiberType> = Type extends CustomElementType
    ? TextElementProps
    : Type extends HTMLElementType
      ? HTMLElementTagNameMap[Type]
      : FunctionComponent;

export type FiberProps<Type extends FiberType = FiberType> = Omit<
    GenericFiberProps<Type>,
    'children'
    // Вместо any должен быть аналог CSSProperties
> & { children?: Fiber[]; style?: CSSProperties };

export interface Fiber<Type extends FiberType = FiberType> {
    /** Тип файбера. В текущей реализации есть 3 типа
     * Текстовая нода
     * HTML-элемент
     * Функциональный компонент
     *
     * В реакте этих типов очень много (Context, Suspense, memo, Fragment)
     * */
    type: Type;

    props: FiberProps;

    /** Ссылка на родителя */
    parent: Fiber | null;

    /** Ссылка на DOM-ноду. У файберов функциональных компонентов это поле равно null. Поэтому для них dom определяется по детям */
    dom: HTMLElement | Text | null;

    /** Ссылка на ребенка */
    child?: Fiber | null;

    /** Ссылка на "соседа справа" */
    sibling?: Fiber | null;

    /** Предыдущая версия файбера */
    alternate: Fiber<Type> | null;

    hooks?: Hook[];

    /** На этапе реконсиляции реакт помечает файберы тегами, которые обозначают, что именно нужно сделать с ними на этапе коммита
     * UPDATE - сверить предыдущие и текущие пропсы и поменять только изменившиеся аттрибуты
     * PLACEMENT - добавить элемент в DOM
     * DELETION - удалить из DOM
     * */
    effectTag?: 'UPDATE' | 'PLACEMENT' | 'DELETION';
}

export type FiberDom = Fiber['dom'];

export type FiberPropsKeys = (keyof FiberProps)[];

interface EffectObject extends Pick<EffectHook, 'fn' | 'cleanup'> {
    fiber: Fiber;
    hookIndex: number;
    isUnmount?: boolean;
}

export interface GlobalState {
    /** Мельчайшая единица работы в терминологии реакта.
     * Чаще всего представляет из себя ссылка на файбер над которым либо планируется либо уже идет работа по реконсиляции родителя + детей первого уровня */
    nextUnitOfWork: Fiber | null;

    /** Корень дерева файберов над которым ведется работа в текущий момент */
    wipRoot: Fiber | null;

    /** Предыдущая версия корня дерева файберов */
    currentRoot: Fiber | null;

    /** Список файберов помеченных для удаления на фазе коммита */
    deletions: Fiber[];

    /** Файбер над которым в текущий момент идет работа */
    wipFiber: Fiber | null;

    /** Индекс текущего обрабатываемого хука */
    hookIndex: number;

    /** useEffect колбеки, которые надо исполнить в рамках текущего рендера */
    effects: EffectObject[];

    /** useLayoutEffect колбеки, которые надо исполнить в рамках текущего рендера */
    layoutEffects: EffectObject[];

    /** После вызова render сюда будет записан порт, через который будут отправляться postMessage для срабатывания колбеков из useEffect */
    messagePort: MessagePort | null;

    pending: boolean;
}
