import {Fiber, FiberType} from "../types.ts";
import {createDom} from "./creators.ts";

export const fiberOps = {
  addDomeNode: <Type extends FiberType>(fiber: Fiber<Type>) => {
    if (!fiber.dom) {
      fiber.dom = createDom(fiber)
    }
  },
  reconcileChildren: <Type extends FiberType>(wipFiber: Fiber<Type>, elements: Fiber[], deletions: Fiber[]) => {
    let index = 0
    let oldFiber =  (wipFiber.alternate && wipFiber.alternate.child) ?? null
    let prevSibling: Fiber<FiberType> | null = null

    while (index < elements.length || oldFiber !== null) {
      const element = elements[index]

      let newFiber: Fiber | null = null

      const sameType = oldFiber && element && element.type === oldFiber.type

      if(sameType && oldFiber) {
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectTag: "UPDATE",
        }
      }

      if(element && !sameType) {
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectTag: "PLACEMENT",
        }
      }

      if(oldFiber && !sameType) {
        oldFiber.effectTag = 'DELETION'
        deletions.push(oldFiber)
      }

      if(oldFiber) {
        oldFiber = oldFiber.sibling ?? null
      }


      if (index === 0) {
        wipFiber.child = newFiber
      } else if(prevSibling?.sibling) {
        prevSibling.sibling = newFiber
      }

      prevSibling = newFiber
      index++
    }
  },
  getNextUnitOfWork: <Type extends FiberType>(fiber: Fiber<Type>) => {
    if (fiber.child) {
      return fiber.child
    }
    let nextFiber: Fiber<FiberType> = fiber
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling
      }
      nextFiber = nextFiber.parent
    }
  }
}
