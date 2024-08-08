export type StateAction<State> = State | ((prev: State) => State);

export interface StateHook<State> {
    tag: 'STATE';
    state: State;
    queue: StateAction<State>[];
}

type Cleanup = () => void;

export type Effect = () => Cleanup | void;

export interface EffectHook {
    tag: 'EFFECT';
    deps: any[];
    fn: Effect;
    cleanup?: () => void;
}

export interface LayoutEffectHook {
    tag: 'LAYOUT_EFFECT';
    deps: any[];
    fn: Effect;
    cleanup?: Cleanup;
}

export type Hook = StateHook<any> | EffectHook | LayoutEffectHook;
