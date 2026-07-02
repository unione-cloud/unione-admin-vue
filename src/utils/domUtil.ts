export const setDocumentTitle = function (title: string) {
  document.title = title
  const ua = navigator.userAgent
  // eslint-disable-next-line
  const regex = /\bMicroMessenger\/([\d\.]+)/
  if (regex.test(ua) && /ip(hone|od|ad)/i.test(ua)) {
    const i = document.createElement('iframe')
    i.src = '/favicon.ico'
    i.style.display = 'none'
    i.onload = function () {
      setTimeout(function () {
        i.remove()
      }, 9)
    }
    document.body.appendChild(i)
  }
}

/**
 * 获得dom对象的offset
 * @param {} dom
 */
export const getOffSet = (dom: any) => {
  const parent = dom.offsetParent
  const offset = {
    top: dom.offsetTop || 0,
    left: dom.offsetLeft || 0
  }
  if (parent) {
    const poffset = getOffSet(parent)
    offset.top += poffset.top
    offset.left += poffset.left
  }
  return offset
}
