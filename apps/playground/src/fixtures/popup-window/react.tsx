import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu"
import { Popover, PopoverContent, PopoverTrigger } from "@ui-sdk/react/popover"
import * as React from "react"
import { createPortal } from "react-dom"
import { createRoot } from "react-dom/client"

const styles = `
  body { margin: 0; font: 14px sans-serif; }
  .page { display: flex; flex-direction: column; align-items: start; gap: 8px; height: 100vh; box-sizing: border-box; padding: 16px; }
  .popup, .dialog { background: white; border: 1px solid; padding: 8px; }
  .edge { margin-top: auto; }
`

function Content() {
  return (
    <div className="page">
      <Popover>
        <PopoverTrigger>Popover</PopoverTrigger>
        <PopoverContent className="popup" side="bottom">
          <button>Inside popover</button>
        </PopoverContent>
      </Popover>
      <Menu>
        <MenuTrigger>Menu</MenuTrigger>
        <MenuContent className="popup">
          <MenuItem value="rename">Rename</MenuItem>
          <MenuItem value="duplicate">Duplicate</MenuItem>
        </MenuContent>
      </Menu>
      <Dialog>
        <DialogTrigger>Dialog</DialogTrigger>
        <DialogContent className="dialog">
          <DialogTitle>Dialog</DialogTitle>
          <input aria-label="Name" />
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
      <Popover>
        <PopoverTrigger className="edge">Edge popover</PopoverTrigger>
        <PopoverContent className="popup" side="bottom">
          Flips above
        </PopoverContent>
      </Popover>
    </div>
  )
}

function Fixture() {
  const [body, setBody] = React.useState<HTMLElement | null>(null)
  const popOut = () => {
    const view = window.open("", "", "popup,width=480,height=360")!
    const style = view.document.createElement("style")
    style.textContent = styles
    view.document.head.append(style)
    setBody(view.document.body)
  }
  return (
    <div className="fixture">
      <button>Before</button>
      <button onClick={popOut}>Pop out</button>
      {body && createPortal(<Content />, body)}
    </div>
  )
}

function mount(root: HTMLElement) {
  createRoot(root).render(
    <React.StrictMode>
      <Fixture />
    </React.StrictMode>
  )
}

export { Fixture, mount }
