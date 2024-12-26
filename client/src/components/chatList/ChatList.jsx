import './chatList.css'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
const ChatList = () => {
    const { isPending, error, data } = useQuery({
        queryKey: ['repoData'],
        queryFn: () =>
            fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
                credentials: "include",
            }).then((res) =>
                res.json()),
    });

    return (
        <div className='chatList'>
            <span className='title'>dashboard</span>
            <Link to='/dashboard'>explore muffin ai</Link>
            <Link to='/dashboard'>create a new chat</Link>
            <Link to='/dashboard'>contact</Link>
            <hr />
            <span><div className="title">recent chat</div></span>
            <div className="list">
                {isPending 
                    ? "Loading..." 
                    : error 
                    ? "Something went wrong" 
                    : data?.map((chat) => (
                    <Link to={`/dashboard/chats/${chat._id}`} key={chat._id}>
                        my chat title
                    </Link>
                ))}
            </div>
            <hr />
            <div className="upgrade">
                <img src="/gnash.png" alt="" className='imgupgrade' />
                <div className="texts">
                    <span>upgrade to muffin ganache</span> <br />
                    <span>get unlimited access to all features</span>
                </div>
            </div>
        </div>
    )
}

export default ChatList