import Page from './Page'
// import { Css } from '@common/helpers/html'
// import useCss from '@common/hooks/useCss'
// import { supabase } from '@/api'
// import usePromise from '@common/hooks/usePromise'

// const listCss: Css = {
//   '&': {

//   },
//   '&-error': {
//     color: 'red',
//   },
// }

// const AssetsList = ({ parentId }: { parentId: string }) => {
//     const className = useCss('AssetsList', listCss)

//     const [assetsRes] = usePromise(async () => {
//       if (parentId) return null
//       return supabase.from('assets').select('*').is('parent_id', null)
//     }, []);
//     const assetsError = assetsRes?.error;
//     const assets = assetsRes?.data || [];

//     if (assetsError) {
//       return (
//         <div className={`${className} ${className}-error`}>
//           <p>Erreur:</p>
//           <p>Code: {assetsError.code}</p>
//           <p>Message: {assetsError.message}</p>
//           <p>Details: {assetsError.details}</p>
//         </div>
//       )
//     }
    
//     return (
//       <div className={className}>
//         {assets.map(a => (
//           <div className={className}>
//             {JSON.stringify(a)}
//           </div>
//         ))}
//       </div>
//     )
// }

const AdminPage = () => {
  return (
    <Page name="admin">
      Admin
        {/* <AssetsList parentId="" /> */}
    </Page>
  )
}

export default AdminPage;
