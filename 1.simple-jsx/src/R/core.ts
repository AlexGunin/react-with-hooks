import {ElementType, RElement, ElementProps} from "./types";


const createTextElement = (text: string): RElement<'TEXT_ELEMENT'> => {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  }
}


// @ts-ignore
export const createElement = <Type extends ElementType>(type: Type, props: ElementProps<Type> = {}, ...children: any[]) => {
  return {type, props: {...props, children: children.map(child => typeof child === 'object' ? child : createTextElement(child))}}
}


export const render = <Type extends ElementType>(element: RElement<Type>, container: HTMLElement | Text) => {
  const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(element.type)

  // @ts-ignore
  element.props.children.forEach((child) => render(child, dom))

  const isProperty = (key: string) => key !== "children"
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(name => {
      // @ts-ignore
      dom[name] = element.props[name]
    })

  container.appendChild(dom)
}
