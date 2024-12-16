import { Link, Outlet } from 'react-router-dom'
import './rootLayout.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { SignedIn, UserButton } from '@clerk/clerk-react' 

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const RootLayout = () => {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <div className='rootLayout'>
        <header>
          <Link to="/" className='logo'>
            <span><img src="/muffin_logo_icon.png" alt="" /></span>
            {/* <span>muffin ai</span> */}
          </Link>
          <div className="user">User
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
    </ClerkProvider>
  )
}


export default RootLayout