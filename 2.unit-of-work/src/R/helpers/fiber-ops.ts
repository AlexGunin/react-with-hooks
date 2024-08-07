import { Fiber, FiberType, FunctionComponent } from '../types';
import { createDom } from './creators.ts';
import { globalState } from '../global-state.ts';

export const fiberOps = {
    /** Метод для реконсиляции нефункционального компонента  */
    updateHostComponent: <Type extends Exclude<FiberType, FunctionComponent>>(
        fiber: Fiber<Type>
    ) => {
        if (!fiber.dom) {
            fiber.dom = createDom(fiber);
        }

        const children = fiber.props.children ? fiber.props.children.filter(Boolean) : [];

        fiberOps.reconcileChildren(fiber, children);
    },
    /** Метод для реконсиляции функционального компонента  */
    updateFunctionComponent: (fiber: Fiber<FunctionComponent>) => {
        globalState.wipFiber = fiber;
        fiber.hooks = [];
        globalState.hookIndex = 0;

        const children = [fiber.type(fiber.props)].filter(Boolean);
        fiberOps.reconcileChildren(fiber, children);
    },
    /** Метод для создания предыдущей версии файбера. Убирает у текущего файбера свойство alternate,
     * иначе garbage collector не сможет удалить неактуальные файберы  */
    createAlternate: (fiber: Fiber): Fiber => {
        const { alternate, ...other } = fiber;

        return { ...other, alternate: null };
    },
    getFiberByKey: (key: string, fiber: Fiber) => {
        let current: Fiber | null | undefined = fiber;

        while (current?.key !== key && current) {
            current = current.sibling;
        }

        return current;
    },
    /** Основной метод реконсиляции. Помечает файберы тегами PLACEMENT/UPDATE/DELETION .
     * Проходит только по детям первого уровня. Не делает никаких манипуляций с DOM.
     * Работа исключительно с деревом файберов */
    reconcileChildren: <Type extends FiberType>(
        wipFiber: Fiber<Type>,
        elements: (Fiber | null)[] = []
    ) => {
        let index = 0;

        let oldFiber = wipFiber.alternate?.child ?? null;
        const visited = new Set<Fiber>();

        let prevSibling: Fiber<FiberType> | null = null;

        while (index < elements.length || oldFiber !== null) {
            const element = elements[index];

            let newFiber: Fiber | null = null;

            const sameType = oldFiber && element && element.type === oldFiber.type;

            if (sameType && oldFiber) {
                if (element?.key) {
                    const sameFiber = fiberOps.getFiberByKey(element.key, oldFiber);

                    if (sameFiber && !visited.has(sameFiber)) {
                        visited.add(sameFiber);

                        sameFiber.effectTag = 'UPDATE';
                        sameFiber.alternate = fiberOps.createAlternate(sameFiber);
                        sameFiber.props = { ...element.props };
                        sameFiber.key = element.key;

                        newFiber = sameFiber;
                    } else {
                        oldFiber.effectTag = 'DELETION';
                        globalState.deletions.push(oldFiber);

                        newFiber = {
                            type: element.type,
                            props: element.props,
                            dom: null,
                            parent: wipFiber,
                            alternate: null,
                            effectTag: 'PLACEMENT',
                            key: element.key,
                        };
                    }
                } else {
                    oldFiber.effectTag = 'UPDATE';
                    oldFiber.alternate = fiberOps.createAlternate(oldFiber);
                    oldFiber.props = { ...element.props };
                    oldFiber.key = element.key;

                    newFiber = oldFiber;
                }
            }

            if (element && !sameType) {
                newFiber = {
                    type: element.type,
                    props: element.props,
                    dom: null,
                    parent: wipFiber,
                    alternate: null,
                    effectTag: 'PLACEMENT',
                    key: element.key,
                };
            }

            if (oldFiber && (!sameType || !element)) {
                oldFiber.effectTag = 'DELETION';
                globalState.deletions.push(oldFiber);
            }

            if (oldFiber) {
                oldFiber = oldFiber.sibling ?? null;
            }

            if (index === 0) {
                wipFiber.child = newFiber;
            } else if (prevSibling && element) {
                prevSibling.sibling = newFiber;
            }

            prevSibling = newFiber;

            index++;
        }
    },
    /** Метод для обхода дерева файберов. По сути является реализацией алгоритма обхода в глубину */
    getNextUnitOfWork: <Type extends FiberType>(fiber: Fiber<Type>) => {
        if (fiber.child) {
            return fiber.child;
        }

        let nextFiber: Fiber<FiberType> | null = fiber;
        while (nextFiber) {
            if (nextFiber.sibling) {
                return nextFiber.sibling;
            }

            nextFiber = nextFiber.parent;
        }
    },
};
