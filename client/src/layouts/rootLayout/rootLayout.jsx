import { Link, Outlet } from 'react-router-dom'
import './rootLayout.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { SignedIn, UserButton } from '@clerk/clerk-react' 
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const RootLayout = () => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
       <QueryClientProvider client={queryClient}>
      <div className='rootLayout'>
        <header>
          <Link to="/" className='logo'>
            {/* <span><img src="/muffin_logo_chocolate.png" alt="" /></span> */}
            <span>muffin</span>
          </Link>
          <div className="user">
            <header>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </header>
          </div>
        </header>
        <main>
          <Outlet></Outlet>
        </main>
      </div>
      </QueryClientProvider>
    </ClerkProvider>
  )
}


export default RootLayout