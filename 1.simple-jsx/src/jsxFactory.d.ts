import { ElementType, RElement } from './R';

declare namespace JSX {
    type Element = RElement<ElementType>;
    interface IntrinsicElements {
        [eleName: string]: any;
    }
}
