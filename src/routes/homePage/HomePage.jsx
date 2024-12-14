import './homePage.css'
import { Link } from "react-router-dom"
import { TypeAnimation } from 'react-type-animation'
import { useState } from 'react';

const HomePage = () => {

  const [typingStatus, setTypingStatus] = useState("Human-1");
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
          <img src="/muffinbot.webp" alt="" className='bot' />
          <div className="chat">
            <img src={typingStatus === "Human-1" ? "/human1.jpeg" : typingStatus === 'Human-2' ? "/human2.jpeg" : "/muffinbot.webp"}alt="" className='chatImage'/>
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                'Human:We produce food for Mice',
                1000, ()=>{
                  setTypingStatus('Bot')
                },
                'Bot:We produce food for Hamsters',
                1000, ()=>{
                  setTypingStatus('Human-2')
                },
                'Human:We produce food for Guinea Pigs',
                1000, ()=>{
                  setTypingStatus('Bot')
                },
                'Bot:We produce food for Chinchillas',
                1000, ()=>{
                  setTypingStatus('Human-1')
                }
              ]}
              wrapper="span"
              repeat={Infinity}
              cursor={true}
              omitDeletionAnimation={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage