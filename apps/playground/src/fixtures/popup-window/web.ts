const styles = `
  body { margin: 0; font: 14px sans-serif; }
  .page { display: flex; flex-direction: column; align-items: start; gap: 8px; height: 100vh; box-sizing: border-box; padding: 16px; }
  .popup, .dialog { background: white; border: 1px solid; padding: 8px; }
  .edge { margin-top: auto; }
`

const content = `
  <div class="page">
    <ui-popover>
      <ui-popover-trigger><button>Popover</button></ui-popover-trigger>
      <ui-popover-content class="popup" side="bottom">
        <button>Inside popover</button>
      </ui-popover-content>
    </ui-popover>
    <ui-menu>
      <ui-menu-trigger><button>Menu</button></ui-menu-trigger>
      <ui-menu-content class="popup">
        <ui-menu-item value="rename">Rename</ui-menu-item>
        <ui-menu-item value="duplicate">Duplicate</ui-menu-item>
      </ui-menu-content>
    </ui-menu>
    <ui-dialog>
      <ui-dialog-trigger><button>Dialog</button></ui-dialog-trigger>
      <ui-dialog-content class="dialog">
        <ui-dialog-title>Dialog</ui-dialog-title>
        <input aria-label="Name" />
        <ui-dialog-close><button>Close</button></ui-dialog-close>
      </ui-dialog-content>
    </ui-dialog>
    <ui-popover class="edge">
      <ui-popover-trigger><button>Edge popover</button></ui-popover-trigger>
      <ui-popover-content class="popup" side="bottom">Flips above</ui-popover-content>
    </ui-popover>
  </div>
`

async function mount(root: HTMLElement) {
  root.innerHTML = `<div class="fixture"><button>Before</button><button id="pop">Pop out</button></div>`
  await import("@ui-sdk/web/popover")
  await import("@ui-sdk/web/menu")
  await import("@ui-sdk/web/dialog")
  root.querySelector("#pop")!.addEventListener("click", () => {
    const view = window.open("", "", "popup,width=480,height=360")!
    const style = view.document.createElement("style")
    style.textContent = styles
    view.document.head.append(style)
    const holder = document.createElement("div")
    holder.innerHTML = content
    customElements.upgrade(holder)
    view.document.body.append(...holder.childNodes)
  })
}

export { mount }
