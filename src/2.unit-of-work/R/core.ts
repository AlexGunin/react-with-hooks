import { is, updateDom } from './helpers';
import { fiberOps } from './helpers/fiber-ops.ts';
import { globalState } from './global-state.ts';
import { Fiber, FiberPrimitiveType, FiberType } from './types';

const workLoop: IdleRequestCallback = (deadline) => {
    let shouldYield = false;

    // Делаем прерывания в работе реконсиляции, чтобы браузер мог выполнить нужную ему работу
    while (globalState.nextUnitOfWork && !shouldYield) {
        globalState.nextUnitOfWork = performUnitOfWork(globalState.nextUnitOfWork) ?? null;
        shouldYield = deadline.timeRemaining() < 1;
    }

    // Реконсиляция закончена, можно приступать к фазе коммита
    if (!globalState.nextUnitOfWork && globalState.wipRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop);
};

export const startWorkLoop = () => requestIdleCallback(workLoop);

const performUnitOfWork = <Type extends FiberType>(fiber: Fiber<Type>) => {
    if (is.functionComponent(fiber)) {
        fiberOps.updateFunctionComponent(fiber);
    } else {
        fiberOps.updateHostComponent(fiber as Fiber<FiberPrimitiveType>);
    }

    return fiberOps.getNextUnitOfWork(fiber);
};

const commitRoot = () => {
    globalState.deletions.forEach(commitWork);

    // Основа фазы коммита. На это этапе происходят операции над DOM (если речь про браузер) на основе "меток" на файберах - effectTag
    commitWork(globalState.wipRoot?.child);

    updateGlobalStateAfterCommit();
};

const commitWork = (fiber?: Fiber | null) => {
    if (!fiber) {
        return;
    }

    let domParentFiber = fiber.parent;

    while (!domParentFiber?.dom && domParentFiber) {
        domParentFiber = domParentFiber.parent;
    }
    const domParent = domParentFiber?.dom;

    if (!domParent || !domParentFiber) {
        return;
    }

    applyEffectTags(fiber, domParent);

    fiber.alternate = fiberOps.createAlternate(fiber);

    if (fiber.effectTag === 'DELETION') {
        if (domParentFiber.child === fiber) {
            domParentFiber.child = fiber.sibling;
        }

        commitWork(fiber.sibling);
    } else {
        commitWork(fiber.child);
        commitWork(fiber.sibling);
    }
};

const applyEffectTags = (fiber: Fiber, domParent: HTMLElement | Text | null) => {
    if (!domParent) {
        return;
    }

    switch (fiber.effectTag) {
        case 'PLACEMENT': {
            if (!fiber.dom) {
                return;
            }

            return domParent.appendChild(fiber.dom);
        }
        case 'UPDATE': {
            if (!fiber.dom) {
                return;
            }

            return updateDom(fiber.dom, fiber.props, fiber.alternate?.props);
        }
        case 'DELETION': {
            return commitDeletion(fiber);
        }
    }
};

const commitDeletion = (fiber: Fiber) => {
    if (fiber.dom) {
        fiber.dom.remove();
    } else if (fiber.child) {
        commitDeletion(fiber.child);
    }
};

const updateGlobalStateAfterCommit = () => {
    globalState.currentRoot = globalState.wipRoot;
    globalState.wipRoot = null;
    globalState.wipFiber = null;
};
