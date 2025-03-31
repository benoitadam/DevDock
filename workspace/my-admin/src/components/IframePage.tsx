import { Css } from '../helpers/html'
import Page from './Page'

const css: Css = {
  '& iframe': {
    width: '100vw',
    height: '100vh',
    border: 'none',
  },
}

const IframePage = ({ name, src }: { name: string, src: string }) => {
  return (
    <Page name={name} css={css}>
      <iframe title={name} className="Iframe" src={src} />
    </Page>
  )
}

export default IframePage;
