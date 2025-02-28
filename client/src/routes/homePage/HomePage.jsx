import './homePage.css'
import { Link } from "react-router-dom"
import { TypeAnimation } from 'react-type-animation'
import { useState } from 'react';

const HomePage = () => {

  const [typingStatus, setTypingStatus] = useState("Human-1");
  return (
    <div className='homePage'>
      <img src="./orbital-3.png" alt="" className='orbital' />
      <div className="left">
        <h1 className='muffinTitle'>muffin
          <h2 className='dot'>.</h2>
          <h2 className='letter-a'>a</h2>
          <h2 className='letter-i'>i</h2>
        </h1>
        <h2>enhance your knowledge with an online buddy</h2>
        <h3>have a personalized experience with the brand new muffinbot, an online helper who can zip-zap anything.</h3>
        <Link to='/dashboard'>Get Started</Link>
      </div>
      <div className="right">
        <div className="imgContainer">
          <img src="/muffinbot2.png" alt="" className='bot' />
          <div className="chat">
            <img src={typingStatus === "Human-1" ? "/human1.jpeg" : typingStatus === 'Human-2' ? "/human2.jpeg" : "/muffinbot2.png"} alt="" className='chatImage' />
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                'Human: What is the capital of India',
                2000, () => {
                  setTypingStatus('Bot')
                },
                'Bot:It is New Delhi',
                2000, () => {
                  setTypingStatus('Human-2')
                },
                'Human:What is the CSS property to change elevation',
                2000, () => {
                  setTypingStatus('Bot')
                },
                'Bot:Z-index is used for changing the elevation',
                2000, () => {
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