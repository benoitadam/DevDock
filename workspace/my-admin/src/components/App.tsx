import { supabase } from '@/api'
import { setCss } from '@common/helpers/html'
import AdminPage from './AdminPage'
import IframePage from './IframePage'
import Toolbar from './Toolbar'
import usePromise from '@common/hooks/usePromise'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { flexCenter } from '@common/helpers/flexBox'

setCss('App', {
  '&': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    bg: '#000',
    fg: '#aaa',
    overflow: 'hidden',
  },
  '&-auth': {
    ...flexCenter()
  },
  '&-auth > div': {
    width: '400px'
  }
})

function App() {
  const session = usePromise(() => supabase.auth.getSession().then(r => r.data.session), [])
  
  console.debug('App', { session });

  if (session === undefined) return null;

  if (session === null) return (
    <div className="App App-auth">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
      />
    </div>
  );

  return (
    <div className="App">
      <IframePage name="supabase" src="/project/default" />
      <IframePage name="code" src="/code/" />
      <IframePage name="n8n" src="/n8n/" />
      <AdminPage />
      <Toolbar />
    </div>
  )
}

export default App
