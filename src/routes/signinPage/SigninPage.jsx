import './signinPage.css'
import { SignIn } from "@clerk/clerk-react";

const SigninPage = () => {
  return (
    <div className='signinPage'><SignIn path="/sign-in" /></div>
  )
}

export default SigninPage