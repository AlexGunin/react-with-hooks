import { globalState } from './global-state.ts';
import { Effect, Fiber, Hook, StateAction, StateHook } from './types';
import { is } from './helpers';
import { fiberOps } from './helpers/fiber-ops.ts';

const addHook = <THook extends Hook>(wipFiber: Fiber | null, hook: THook) => {
    wipFiber?.hooks?.push(hook);
    globalState.hookIndex++;
};

const replaceHook = <THook extends Hook>(wipFiber: Fiber | null, hook: THook, index: number) => {
    if (wipFiber?.hooks) {
        wipFiber.hooks[index] = hook;
    }
    globalState.hookIndex++;
};

const useState = <State>(initial: State) => {
    // Текущий файбер (в терминах реакта для хука он является хост-компонентом)
    const wipFiber = globalState.wipFiber;

    /*
    В реализации реакта это свойство хранится в файбере, а не глобально.
    Реализация реакта более корректная, так как это позволяет между вызовами хуков хост-компонента вызвать хуки другого компонента.

    Пример:

    const Test = () => {
        const [counter, setCounter] = useState(0);

        const jsx = useMemo(() => <Component/>, []) Вот тут вклинивается другой компонент и при глобальном хранении индекса все ломается (при условии что в Component есть свои хуки)

        const [isVisibleFirst, setIsVisibleFirst] = useState(false);
    }
    */

    const hookIndex = globalState.hookIndex;

    // Данные хука с предыдущего рендера
    const oldHook = wipFiber?.alternate?.hooks?.[hookIndex];

    /*
     Ситуация, когда в предыдущем рендере по текущему индексу был хук useState, а в текущем рендере - уже какой-то другой.
     Так как мы завязаны на состояние с предыдущего рендера, то остается либо выкидывать ошибку и бить по рукам,
     либо создавать хук заново с начальными значениями.
     Это причина, по которой кор-команда реакта не рекомендует вызывать хуки по условию/в цикле и тд.
     То есть любые кейсы, когда порядок или количество хуков может измениться
    */
    if (oldHook !== undefined && !is.hook.useState<State>(oldHook)) {
        throw new Error('Dont change order of hooks');
    }

    const hook: StateHook<State> = {
        tag: 'STATE',
        state: oldHook?.state ?? initial,
        queue: oldHook?.queue ?? [],
    };

    hook.queue.forEach((action) => {
        hook.state = is.fn(action) ? action(hook.state) : action;
    });

    hook.queue.length = 0;

    const setState = (action: StateAction<State>) => {
        /* Строка ниже позволяет добиться батчинга при изменении состояния.
         * Так как функциональный компонент - обычная синхронная функция, то получается следующая схема
         * вызвали функциональный компонент => записали экшены для изменения состояния + запустили перерендер => на следующем рендере прошлись по списку экшенов и применили их последовательно
         * */
        hook.queue.push(action);

        if (globalState.pending) {
            const parentCurrentWipRoot = globalState.wipRoot?.parent;
            if (parentCurrentWipRoot) {
                let current = wipFiber?.parent;

                if (current) {
                    while (current && parentCurrentWipRoot !== current) {
                        current = current?.parent;
                    }

                    if (!current) {
                        globalState.wipRoot = wipFiber;
                    }
                } else {
                    globalState.wipRoot = wipFiber;
                }
            }
        } else {
            globalState.wipRoot = wipFiber ?? globalState.currentRoot;
        }

        if (globalState.wipRoot) {
            globalState.wipRoot.alternate = globalState.wipRoot
                ? fiberOps.createAlternate(globalState.wipRoot)
                : null;
        }

        globalState.nextUnitOfWork = globalState.wipRoot;
        globalState.deletions = [];
        globalState.pending = true;
    };

    if (oldHook) {
        replaceHook<StateHook<State>>(wipFiber, hook, hookIndex);
    } else {
        addHook<StateHook<State>>(wipFiber, hook);
    }

    return [hook.state, setState] as const;
};

interface BaseEffectData {
    checker: typeof is.hook.useLayoutEffect | typeof is.hook.useEffect;
    tag: 'EFFECT' | 'LAYOUT_EFFECT';
    key: 'effects' | 'layoutEffects';
}

const useBaseEffect = (type: 'default' | 'layout', fn: Effect, deps: any[]) => {
    const wipFiber = globalState.wipFiber;

    if (!wipFiber) {
        return;
    }

    const hookIndex = globalState.hookIndex;

    const oldHook = wipFiber?.alternate?.hooks?.[hookIndex];

    const data: BaseEffectData =
        type === 'default'
            ? {
                  checker: is.hook.useEffect,
                  tag: 'EFFECT',
                  key: 'effects',
              }
            : {
                  checker: is.hook.useLayoutEffect,
                  tag: 'LAYOUT_EFFECT',
                  key: 'layoutEffects',
              };

    if (oldHook !== undefined && !data.checker(oldHook)) {
        throw new Error('Dont change order of hooks');
    }

    if (oldHook) {
        const prevDeps = oldHook.deps;

        replaceHook(
            wipFiber,
            {
                tag: data.tag,
                fn,
                deps,
                cleanup: oldHook.cleanup,
            },
            hookIndex
        );

        // Проверка на то, что в массиве зависимостей ничего не изменилось

        if (
            prevDeps.length === deps.length &&
            prevDeps.every((item, index) => item === deps[index])
        ) {
            return;
        }
    } else {
        addHook(wipFiber, {
            tag: data.tag,
            fn,
            deps,
        });
    }

    globalState[data.key].push({
        fn,
        fiber: wipFiber,
        hookIndex: hookIndex,
        cleanup: oldHook?.cleanup,
    });
};

const useEffect = (fn: Effect, deps: any[]) => useBaseEffect('default', fn, deps);

const useLayoutEffect = (fn: Effect, deps: any[]) => useBaseEffect('layout', fn, deps);

export default { useState, useEffect, useLayoutEffect };
