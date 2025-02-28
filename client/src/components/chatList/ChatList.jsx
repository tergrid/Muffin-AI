import './chatList.css';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';

const ChatList = () => {
  const { getToken } = useAuth();

  const { isLoading, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: async () => {
      const token = await getToken();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return res.json();
    }
  });

  return (
    <div className='chatList'>
      <div className='list'>
        <span className='title'>dashboard</span>
        <Link to='/dashboard'>explore muffin ai</Link>
        <Link to='/dashboard'>create a new chat</Link>
        <Link to='/dashboard'>contact</Link>
        <hr />
      </div>
      <span><div className="title">recent chat</div></span>

      {/* ✅ Chats now displayed in a proper vertical list */}
      <div className="list">
        {isLoading ? (
          "Loading..."
        ) : error ? (
          "Something went wrong"
        ) : (
          data?.map((chat) => (
            chat._id ? (
              <Link to={`/dashboard/chats/${chat._id}`} key={chat._id}>
                {chat.title || 'Untitled Chat'}
              </Link>
            ) : null
          ))
        )}
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
  );
};

export default ChatList;
