import { globalState } from '../global-state.ts';
import { is } from './is.ts';
import { Fiber } from '../types';

/** Метод для вызова эффектов текущего рендера (колбеки useEffect или useLayoutEffect)*/
export const runEffects = (type: 'effects' | 'layoutEffects') => {
    // В продакшн коде конечно нет reverse, а лишь обход с конца, тут так написано исключительно для читаемости
    globalState[type].reverse().forEach((effectObject) => {
        if (effectObject.cleanup) {
            effectObject.cleanup();
        }

        if (effectObject.isUnmount) {
            return;
        }

        const cleanup = effectObject.fn();

        const hook = effectObject.fiber?.hooks?.[effectObject.hookIndex];

        const isEffect = hook !== undefined && (is.useEffect(hook) || is.useLayoutEffect(hook));

        if (cleanup && isEffect) {
            hook.cleanup = cleanup;
        }
    });

    globalState[type].length = 0;
    globalState.hookIndex = 0;
};

/** Метод для планирования вызова cleanup у файбера, который будет размонтирован в текущем рендере */
export const scheduleUnmountEffects = (fiber: Fiber) => {
    if (!fiber.hooks) {
        return;
    }

    fiber.hooks.forEach((hook, index) => {
        if (is.useEffect(hook)) {
            const cleanup = hook.cleanup ?? hook.fn();

            if (!cleanup) {
                return;
            }

            globalState.effects.push({
                fiber,
                hookIndex: index,
                cleanup,
                fn: hook.fn,
                isUnmount: true,
            });
        }

        if (is.useLayoutEffect(hook)) {
            const cleanup = hook.cleanup ?? hook.fn();

            if (!cleanup) {
                return;
            }

            globalState.layoutEffects.push({
                fiber,
                hookIndex: index,
                cleanup,
                fn: hook.fn,
                isUnmount: true,
            });
        }
    });
};

/** Метод для планирования вызова cleanup у поддерева файберов, которое будет размонтировано в текущем рендере */
export const recursiveScheduleUnmountEffects = (fiber?: Fiber | null) => {
    let oldFiber = fiber ?? null;

    if (!oldFiber) {
        return;
    }

    scheduleUnmountEffects(oldFiber);

    recursiveScheduleUnmountEffects(oldFiber.child);
    recursiveScheduleUnmountEffects(oldFiber.sibling);
};

/** Инициализация MessageChannel */
export const initMessageChannel = () => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
        runEffects('effects');
    };

    globalState.messagePort = channel.port2;
};
