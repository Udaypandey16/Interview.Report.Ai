import { RouterProvider } from 'react-router'
import { router } from './app.routes.jsx'
import { AuthProvider } from './features/auth/auth.context.jsx'
import { InteviewProvider } from './features/interview/interview.context.jsx'

function App() {
  return (

   <AuthProvider>  
    <InteviewProvider>
      <RouterProvider router={router} />
    </InteviewProvider>
   </AuthProvider>
  )
}
export default App
