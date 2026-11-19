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

function instanceIn(
  scope: Partial<typeof globalThis> | null | undefined,
  value: unknown,
  type: keyof DomTypes
) {
  const constructor = scope?.[type]
  return !!constructor && value instanceof constructor
}

// An element has the classes of the window that made it, which can differ from
// the one it's in, like one an app renders or moves into a window it opened.
function isInstance<K extends keyof DomTypes>(
  value: unknown,
  type: K
): value is DomTypes[K] {
  return (
    instanceIn(globalThis, value, type) ||
    instanceIn((value as Node | null)?.ownerDocument?.defaultView, value, type)
  )
}

export { isBrowser, isInstance, isIOS, isRTL }
