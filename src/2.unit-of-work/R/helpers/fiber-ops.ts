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

        const content = fiber.type(fiber.props) as Fiber;

        fiberOps.reconcileChildren(fiber, content ? [content] : []);
    },
    /** Метод для создания предыдущей версии файбера. Убирает у текущего файбера свойство alternate,
     * иначе garbage collector не сможет удалить неактуальные файберы  */
    createAlternate: (fiber: Fiber): Fiber => {
        const { alternate, ...other } = fiber;

        return { ...other, alternate: null };
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

        let prevSibling: Fiber<FiberType> | null = null;

        while (index < elements.length || oldFiber !== null) {
            const element = elements[index];

            let newFiber: Fiber | null = null;

            const sameType = oldFiber && element && element.type === oldFiber.type;

            // Тип не изменился и был старый файбер - значит все что нужно сделать - обновить свойства в DOM
            if (sameType && oldFiber) {
                oldFiber.effectTag = 'UPDATE';
                oldFiber.alternate = fiberOps.createAlternate(oldFiber);
                oldFiber.props = { ...element.props };

                newFiber = oldFiber;

                // Это значит, что на этом месте в предыдущем рендере или ничего не было или было что-то другое
            } else if (element && !sameType) {
                newFiber = {
                    type: element.type,
                    props: element.props,
                    dom: null,
                    parent: wipFiber,
                    alternate: null,
                    effectTag: 'PLACEMENT',
                };
            }

            // Пометить старый файбер на удаление, если на текущем месте или что-то другое или уже ничего нет
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

            // Ситуация, когда поднимаясь вверх мы дошли до корня поддерева в котором был запущен перерендер.
            // Нужно проверять именно родителей по ссылке, а не детей, так как в процессе реконсиляции изменится ссылка на fiber который изначально был wipRoot
            if (nextFiber?.parent === globalState.wipRoot?.parent) {
                return;
            }
        }
    },
};
