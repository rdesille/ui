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
