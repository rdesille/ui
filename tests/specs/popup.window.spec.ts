import type { Page } from "@playwright/test"
import { expect, test } from "../fixtures"

async function popOut(page: Page) {
  const [view] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole("button", { name: "Pop out" }).click(),
  ])
  await view.getByRole("button", { name: "Dialog" }).waitFor()
  return view
}

test.beforeEach(async ({ open }) => {
  await open("popup-window")
})

test("a popover focuses its first control and gives focus back to its trigger", async ({
  page,
}) => {
  const view = await popOut(page)
  const trigger = view.getByRole("button", { name: "Popover", exact: true })
  await trigger.click()
  await expect(
    view.getByRole("button", { name: "Inside popover" })
  ).toBeFocused()
  await view.keyboard.press("Escape")
  await expect(trigger).toBeFocused()
})

test("a menu opened with Enter focuses its first item and gives focus back to its trigger", async ({
  page,
}) => {
  const view = await popOut(page)
  const trigger = view.getByRole("button", { name: "Menu" })
  await trigger.focus()
  await view.keyboard.press("Enter")
  await expect(view.getByRole("menuitem", { name: "Rename" })).toBeFocused()
  await view.keyboard.press("ArrowDown")
  await expect(view.getByRole("menuitem", { name: "Duplicate" })).toBeFocused()
  await view.keyboard.press("Escape")
  await expect(trigger).toBeFocused()
})

test("a menu opened with a click moves focus into it while the opener draws no frames", async ({
  page,
}) => {
  const view = await popOut(page)
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0
  })
  await view.getByRole("button", { name: "Menu" }).click()
  await expect
    .poll(() =>
      view.evaluate(() => !!document.activeElement?.closest('[role="menu"]'))
    )
    .toBe(true)
})

test("a modal dialog keeps Tab inside and gives focus back to its trigger", async ({
  page,
}) => {
  const view = await popOut(page)
  const trigger = view.getByRole("button", { name: "Dialog" })
  await trigger.click()
  const name = view.getByRole("textbox", { name: "Name" })
  const close = view.getByRole("button", { name: "Close" })
  await expect(name).toBeFocused()
  await view.keyboard.press("Tab")
  await expect(close).toBeFocused()
  await view.keyboard.press("Tab")
  await expect(name).toBeFocused()
  await view.keyboard.press("Escape")
  await expect(trigger).toBeFocused()
})

test("a modal dialog makes the rest of its window inert", async ({ page }) => {
  const view = await popOut(page)
  await view.getByRole("button", { name: "Dialog" }).click()
  await expect(view.getByRole("dialog")).toBeVisible()
  const outside = view.locator("button", { hasText: /^Popover$/ })
  await expect
    .poll(() => outside.evaluate((el) => !!el.closest("[inert]")))
    .toBe(true)
})

test("a popover's room variables don't reach what's inside it", async ({
  page,
}) => {
  const view = await popOut(page)
  await view.getByRole("button", { name: "Popover", exact: true }).click()
  const inside = view.getByRole("button", { name: "Inside popover" })
  await expect(inside).toBeVisible()
  expect(
    await inside.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--available-height")
    )
  ).toBe("")
})

test("a popover near the bottom of the window flips above its trigger", async ({
  page,
}) => {
  const view = await popOut(page)
  const trigger = view.getByRole("button", { name: "Edge popover" })
  await trigger.click()
  const content = view.getByText("Flips above")
  await expect(content).toBeVisible()
  const [popup, anchor] = await Promise.all([
    content.boundingBox(),
    trigger.boundingBox(),
  ])
  expect(popup!.y + popup!.height).toBeLessThanOrEqual(anchor!.y + 1)
})

test("a drawer dragged down closes and gives focus back to its trigger", async ({
  page,
}) => {
  const view = await popOut(page)
  const trigger = view.getByRole("button", { name: "Drawer" })
  await trigger.click()
  const drawer = view.getByRole("dialog", { name: "Drag me" })
  await expect(drawer).toBeVisible()
  await expect
    .poll(() =>
      drawer.evaluate((el) =>
        el
          .getAnimations()
          .every((animation) => animation.playState !== "running")
      )
    )
    .toBe(true)
  const title = await view.getByText("Drag me").boundingBox()
  const x = title!.x + 10
  const y = title!.y + title!.height / 2
  await view.mouse.move(x, y)
  await view.mouse.down()
  await view.mouse.move(x, y + 300, { steps: 20 })
  await view.mouse.up()
  await expect(drawer).toBeHidden()
  await expect(trigger).toBeFocused()
})

test("inline editing started in the window gives focus back to where it started", async ({
  page,
}) => {
  const focusedBack = await page.evaluate(async () => {
    const { loadCoreModule } = window as unknown as {
      loadCoreModule: (name: string) => Promise<unknown>
    }
    const { createStore } = (await loadCoreModule("store")) as {
      createStore: (state: object, live: string[]) => unknown
    }
    const { createInlineEdit } = (await loadCoreModule("inline-edit")) as {
      createInlineEdit: (
        context: { store: unknown },
        options: { key: string; value: () => string; commit: () => boolean }
      ) => {
        keydown: (event: KeyboardEvent, id: string) => boolean
        bindInput: (el: HTMLInputElement) => void
        cancel: () => void
      }
    }
    const view = window.open("", "", "popup,width=320,height=200")!
    const cell = view.document.createElement("button")
    const input = view.document.createElement("input")
    view.document.body.append(cell, input)
    const edit = createInlineEdit(
      { store: createStore({ editing: null }, []) },
      { key: "editing", value: () => "Name", commit: () => true }
    )
    cell.addEventListener("keydown", (event) => edit.keydown(event, "row"))
    cell.focus()
    cell.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))
    edit.bindInput(input)
    input.remove()
    edit.cancel()
    await Promise.resolve()
    return view.document.activeElement === cell
  })
  expect(focusedBack).toBe(true)
})

test("a roving group asked to focus an item before any renders focuses it once it does", async ({
  page,
}) => {
  await page.evaluate(async () => {
    const { loadCoreModule } = window as unknown as {
      loadCoreModule: (name: string) => Promise<unknown>
    }
    const { createStore } = (await loadCoreModule("store")) as {
      createStore: (state: object, live: string[]) => unknown
    }
    const { createRovingFocus } = (await loadCoreModule("roving-focus")) as {
      createRovingFocus: (
        context: { store: unknown; onDestroy: (cleanup: () => void) => void },
        options: { slot: string; key: string }
      ) => {
        focus: (key: string) => void
        bind: (el: HTMLElement, part: { key: string; props: object }) => void
      }
    }
    const roving = createRovingFocus(
      { store: createStore({ stop: null }, []), onDestroy: () => {} },
      { slot: "item", key: "stop" }
    )
    const before = document.querySelector("button")!
    before.focus()
    roving.focus("a")
    const item = document.createElement("button")
    item.textContent = "Item"
    document.body.append(item)
    roving.bind(item, { key: "a", props: {} })
  })
  await expect(page.getByRole("button", { name: "Item" })).toBeFocused()
})
