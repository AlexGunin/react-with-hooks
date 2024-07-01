import {Fiber, FiberDom, FiberProps, FiberPropsKeys} from "../types.ts";
import {keys} from "./utility.ts";


const isEvent = (key: keyof FiberProps) => key.startsWith('on')

const isProperty = (key: keyof FiberProps) => key !== "children" && !isEvent(key)
const isNew = (prev: FiberProps, next: FiberProps) => (key: keyof FiberProps) =>
  prev[key] !== next[key]
const isGone = (next: FiberProps) => (key: keyof FiberProps) => !(key in next)

const removeUnusedListeners = (dom: NonNullable<FiberDom>, nextProps: FiberProps, prevProps: FiberProps, prevPropsKeys: FiberPropsKeys) => {
  prevPropsKeys
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        // @ts-ignore
        prevProps[name]
      )
    })
}

const removeOldProperties = (nextProps: FiberProps, prevPropsKeys: FiberPropsKeys) => {
  prevPropsKeys
    .filter(isProperty)
    .filter(isGone(nextProps))
    .forEach(name => {
      // @ts-ignore
      dom[name] = ""
    })
}

const updateProperties = (nextProps: FiberProps, prevProps: FiberProps, nextPropsKeys: FiberPropsKeys) => {
  nextPropsKeys
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      // @ts-ignore
      dom[name] = nextProps[name]
    })
}

const addListeners = (dom: NonNullable<FiberDom>, nextProps: FiberProps, prevProps: FiberProps, nextPropsKeys: FiberPropsKeys) => {
  nextPropsKeys
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        // @ts-ignore
        nextProps[name]
      )
    })
}


export const updateDom = (dom: Fiber['dom'], nextProps: FiberProps, alternateProps?: FiberProps) => {
  if(!dom) {
    return
  }

  const prevProps = alternateProps ?? ({} as FiberProps)

  const prevPropsKeys = keys(prevProps)
  const nextPropsKeys = keys(nextProps)


  removeUnusedListeners(dom, nextProps, prevProps, prevPropsKeys)
  removeOldProperties(nextProps, prevPropsKeys)
  updateProperties(nextProps, prevProps, nextPropsKeys)
  addListeners(dom, nextProps, prevProps, nextPropsKeys)
}
