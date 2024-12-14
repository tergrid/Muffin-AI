import './homePage.css'
import { Link } from "react-router-dom"

const HomePage = () => {
  return (
    <div className='homePage'>
      <img src="./orbital.png" alt="" className='orbital' />
      <div className="left">
        <h1>muffin.ai</h1>
        <h2>enhance your knowledge with an online buddy</h2>
        <h3>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maxime aperiam similique quas tempore sed laboriosam harum possimus, cum est illum soluta aliquam provident quae molestiae commodi eum itaque inventore ratione.</h3>
        <Link to='/dashboard'>Get Started</Link>
      </div>
      <div className="right">
        <div className="imgContainer">
            <img src="/muffinbot.webp" alt="" className='bot'/>
          </div>
        </div>
    </div>
  )
}

export default HomePage