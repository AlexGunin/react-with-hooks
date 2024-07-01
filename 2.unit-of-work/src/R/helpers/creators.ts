import {Fiber, FiberType} from "../types.ts";
import {render} from "../core.ts";

const createTextElement = (text: string) => {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  }
}


// @ts-ignore
export const createElement = <Type extends FiberType>(type: Type, props: FiberProps<Type> = {}, ...children: any[]) => {
  return {type, props: {...props, children: children.map(child => typeof child === 'object' ? child : createTextElement(child))}}
}

export const createDom = <Type extends FiberType>(fiber: Fiber<Type>) => {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(fiber.type)

  // @ts-ignore
  fiber.props.children.forEach((child) => render(child, dom))

  const isProperty = (key: string) => key !== "children"
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      // @ts-ignore
      dom[name] = fiber.props[name]
    })

  return dom
}
