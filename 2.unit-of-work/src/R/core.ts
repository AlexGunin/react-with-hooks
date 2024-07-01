import {FiberType, Fiber  } from "./types";
import {updateDom} from "./helpers";
import {fiberOps} from "./helpers/fiber-ops.ts";

let nextUnitOfWork: Fiber<FiberType> | null = null
let wipRoot: Fiber | null = null
let currentRoot: Fiber | null = null
const deletions: Fiber[] = []

export const render = <Type extends FiberType>(element: Fiber<Type>, container: HTMLElement) => {
  wipRoot = {
    dom: container,
    // @ts-ignore
    props: {
      children: [element]
    },
    alternate: currentRoot
  }

  deletions.length = 0
  nextUnitOfWork = wipRoot
}

const applyEffectTags = (fiber: Fiber, domParent: HTMLElement | Text) => {
  console.log('APPLY EFFECT TAGS', fiber, fiber.dom, domParent)
  if(!fiber.dom) {
    return
  }

  if(fiber.effectTag === 'PLACEMENT') {
    console.log('PLACEMENT', domParent, fiber.dom)
    domParent.appendChild(fiber.dom)
  } else if(fiber.effectTag === 'UPDATE') {
    updateDom(fiber.dom, fiber.props, fiber.alternate?.props)
  }

  else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom)
  }
}

const commitWork = (fiber?: Fiber | null) => {
  console.log('COMMIT WORK', fiber)
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom
  if(!domParent) {
    return
  }

  applyEffectTags(fiber, domParent)


  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

const commitRoot = () => {
  deletions.forEach(commitWork)
  commitWork(wipRoot?.child)
  currentRoot = wipRoot
  wipRoot = null
}

const performUnitOfWork = <Type extends FiberType>(fiber: Fiber<Type>) => {
  fiberOps.addDomeNode(fiber)
  fiberOps.reconcileChildren(fiber, fiber.props.children.flat(), deletions)
  return fiberOps.getNextUnitOfWork(fiber)
}

const workLoop: IdleRequestCallback = (deadline) => {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    ) ?? null
    shouldYield = deadline.timeRemaining() < 1
  }

  if(!nextUnitOfWork && wipRoot) {
    commitRoot()
  }


  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)


