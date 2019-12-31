import { QSize, QMainWindow } from "@nodegui/nodegui"

let savedPosition = null
export const savePosition = windowRef => {
  const nativeWin: QMainWindow = windowRef.current.native
  const size = new QSize(nativeWin.size())
  const pos = nativeWin.pos()
  savedPosition = {
    x: pos.x,
    y: pos.y,
    w: size.width(),
    h: size.height()
  }
  console.log("saved window position: ", savedPosition)
}

export const restorePosition = windowRef => {
  if (!savedPosition) return
  console.log("restoring window position: ")
  windowRef.current.setGeometry(savedPosition.x, savedPosition.y, savedPosition.w, savedPosition.h)
  savedPosition = null
}