import './homePage.css'
import { Link } from "react-router-dom"

const HomePage = () => {
  return (
    <div className='homePage'>
      <Link to='/dashboard'>Dashboard</Link>
    </div>
  )
}

export default HomePage