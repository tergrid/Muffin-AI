import './chatList.css'
import { Link } from 'react-router-dom'
const ChatList = () => {
  return (
    <div className='chatList'>
        <span className='title'>dashboard</span>
        <Link to='/dashboard'>explore muffin ai</Link>
        <Link to='/dashboard'>create a new chat</Link>
        <Link to='/dashboard'>contact</Link>
        <hr />
        <span><div className="title">recent chat</div></span>
            <div className="list">
                <Link to='/dashboard/chats'>my chat title</Link> <br />
            </div>
        <hr />
        <div className="upgrade">
            <img src="/gnash.png" alt="" className='imgupgrade'/>
            <div className="texts">
                <span>upgrade to muffin ganache</span> <br />
                <span>get unlimited access to all features</span>
            </div>
        </div>
    </div>
  )
}

export default ChatList