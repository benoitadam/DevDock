import { Css } from '../helpers/html'
import useMsg from '../hooks/useMsg'
import page$ from '../messages/page$'
import useAnimState from '../hooks/useAnimState'
import useCss from '@/hooks/useCss'
import { ReactNode } from 'react'

const pageCss: Css = {
  '&': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    border: 'none',
    opacity: 0,
    visibility: 'hidden',
    zIndex: 870,
    anim: true,
  },
  '&-hide': {
    transform: 'translateX(-100%)',
  },
  '&-hiding': {
    visibility: 'visible',
    transform: 'translateX(+100%)',
  },
  '&-showing': {
    visibility: 'visible',
    transform: 'translateX(-100%)',
    zIndex: 880,
  },
  '&-show': {
    opacity: 1,
    visibility: 'visible',
    transform: 'translateX(0%)',
    zIndex: 890,
  },
}

const Page = ({ name, children, css }: { name: string, children: ReactNode, css?: Css }) => {
  const page = useMsg(page$)
  const isShow = page === name;
  const state = useAnimState(isShow, 300)
  const pageClass = useCss('Page', pageCss, isShow)
  const customClass = useCss('Page-' + name, css, isShow)
  return state ? (
    <div className={`${pageClass} ${pageClass}-${state} ${customClass} ${customClass}-${state}`}>
      {children}
    </div>
  ) : null
}

export default Page;
