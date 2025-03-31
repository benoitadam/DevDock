import useCss from '@/hooks/useCss'
import { Css } from '../helpers/html'
import Page from './Page'
import { supabase } from '@/api'
import usePromise from '@/hooks/usePromise'

const listCss: Css = {
  '&': {

  },
  '&-error': {
    color: 'red',
  },
}

const AssetsList = ({ parentId }: { parentId: string }) => {
    const className = useCss('AssetsList', listCss)

    const assetsRes = usePromise(() => parentId ? null : supabase.from('assets').select('*').is('parent_id', null), []);
    const assetsError = assetsRes?.error;
    const assets = assetsRes?.data || [];

    if (assetsError) {
      return (
        <div className={`${className} ${className}-error`}>
          <p>Erreur:</p>
          <p>Code: {assetsError.code}</p>
          <p>Message: {assetsError.message}</p>
          <p>Details: {assetsError.details}</p>
        </div>
      )
    }
    
    return (
      <div className={className}>
        {assets.map(a => (
          <div className={className}>
            {JSON.stringify(a)}
          </div>
        ))}
      </div>
    )
}

const AssetsPage = () => {
  return (
    <Page name="assets">
        <AssetsList parentId="" />
    </Page>
  )
}

export default AssetsPage;
