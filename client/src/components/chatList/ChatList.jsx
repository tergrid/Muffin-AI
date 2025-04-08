import './chatList.css';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
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
  
  const deleteMutation = useMutation({
    mutationFn: async (chatId) => {
      const token = await getToken();
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete chat');
      }
      
     return res.json();
    },
    onSuccess: (_, deletedChatId) => {
      // Optimistic UI update - update the data in the cache directly
      const currentData = QueryClient.getQueryData(['repoData']);
      if (currentData) {
        const updatedData = currentData.filter(chat => chat._id !== deletedChatId);
        QueryClient.setQueryData(['repoData'], updatedData);
      }
      
      // Also invalidate the query to fetch fresh data from the server
      QueryClient.invalidateQueries({ queryKey: ['repoData'] });
      
      // If we're currently viewing the deleted chat, navigate to dashboard
      const currentPath = window.location.pathname;
      if (currentPath.includes(`/dashboard/chats/${deletedChatId}`)) {
        navigate('/dashboard');
      }
    }
  });

  const handleDelete = (e, chatId) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteMutation.mutate(chatId);
    }
  };

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
                <button 
                  className="delete-btn" 
                  onClick={(e) => handleDelete(e, chat._id)}
                  title="Delete chat"
                >
                  <img src="/bin.png" alt="Delete" />
                </button>
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
