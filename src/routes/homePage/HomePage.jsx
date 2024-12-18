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
        <h1 className='muffinTitle'>muffin<h1 className='dot'>.</h1><h1 className='letter-a'>a</h1><h1 className='letter-i'>i</h1></h1>
        <h2>enhance your knowledge with an online buddy</h2>
        <h3>have a personalized experience with the brand new muffinbot, an online helper who can zip-zap anything.</h3>
        <Link to='/dashboard'>Get Started</Link>
      </div>
      <div className="right">
        <div className="imgContainer">
          <img src="/muffinbot2.png" alt="" className='bot' />
          <div className="chat">
            <img src={typingStatus === "Human-1" ? "/human1.jpeg" : typingStatus === 'Human-2' ? "/human2.jpeg" : "/muffinbot2.png"}alt="" className='chatImage'/>
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                'Human:We produce food for Mice',
                2000, ()=>{
                  setTypingStatus('Bot')
                },
                'Bot:We produce food for Hamsters',
                2000, ()=>{
                  setTypingStatus('Human-2')
                },
                'Human:We produce food for Guinea Pigs',
                2000, ()=>{
                  setTypingStatus('Bot')
                },
                'Bot:We produce food for Chinchillas',
                2000, ()=>{
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