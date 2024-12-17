import { useEffect, useRef} from 'react';
import './chatPage.css';
import NewPrompt from '../../components/newPrompt/NewPrompt.jsx'
const ChatPage = () => {

  const endRef = useRef(null);

  useEffect(()=>{
    endRef.current.scrollIntoView({behavior:"smooth"});
  },[])
  return (
    <div className='chatPage'>
      <div className="wrapper">
        <div className="chat">
          <div className="message">Test messge from ai</div>
          <div className="message user">Test message from user Lorem ipsum, dolor sit amet consectetur adipisicing elit. Mollitia a perferendis reiciendis consequuntur et ex veritatis neque! Similique, inventore! Modi quaerat odio officia laudantium veritatis. Eos obcaecati beatae odit iure!</div>
          <div className="message">Test message from ai</div>
          <div className="message user">Test message from user</div>
          <div className="message">Test messge from ai</div>
          <div className="message user">Test message from user</div>
          <div className="message">Test message from ai</div>
          <div className="message user">Test message from user</div>
          <div className="message">Test messge from ai</div>
          <div className="message user">Test message from user</div>
          <div className="message">Test message from ai</div>
          <div className="message user">Test message from user</div>
          <div className="message">Test message from ai</div>
          <NewPrompt></NewPrompt>
          <div ref={endRef}></div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage