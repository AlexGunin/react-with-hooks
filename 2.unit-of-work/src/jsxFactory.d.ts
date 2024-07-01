import {FiberType, RElement} from "./R";

declare namespace JSX {
  type Element = RElement<FiberType>;
  interface IntrinsicElements {
    [eleName: string]: any;
  }
}
