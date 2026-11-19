const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined"

// iPhone and iPad, including iPads that report a Mac.
function isIOS() {
  return (
    isBrowser &&
    (/iP(hone|ad|od)/.test(navigator.platform) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
  )
}

/**
 * Whether `el` lays out right to left, from its computed direction. False on the server.
 * @stable
 */
function isRTL(el: Element | null | undefined) {
  return !!el && isBrowser && getComputedStyle(el).direction === "rtl"
}

type DomTypes = {
  Node: Node
  Element: Element
  HTMLElement: HTMLElement
  HTMLIFrameElement: HTMLIFrameElement
  HTMLInputElement: HTMLInputElement
  HTMLSlotElement: HTMLSlotElement
  ShadowRoot: ShadowRoot
}

// `instanceof HTMLElement` is false for an element of another window, like one
// an app renders into a window it opened, so each node checks its own window's.
function isInstance<K extends keyof DomTypes>(
  value: unknown,
  type: K
): value is DomTypes[K] {
  const view = (value as Node | null)?.ownerDocument?.defaultView
  const constructor = (view ?? (globalThis as Partial<typeof globalThis>))[type]
  return !!constructor && value instanceof constructor
}

export { isBrowser, isInstance, isIOS, isRTL }
