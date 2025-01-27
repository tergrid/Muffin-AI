import './chatList.css';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const clerkToken = "your_clerk_token_here"; // Ensure this is correctly defined

const ChatList = () => {
   const { isLoading, error, data } = useQuery({
     queryKey: ['repoData'],
     queryFn: () =>
       fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
         credentials: "include",
         headers: {
           'Authorization': `Bearer ${clerkToken}`
         }
       }).then((res) => {
        console.log("Raw Response:", res); // Debug log
        return res.json();
      })
      .then((json) => {
        console.log("Parsed JSON:", json); // Debug log
        return json;
       }),})
   if (error) {
     console.error("Error fetching chats:", error);
   } else {
     console.log("Fetched chats data:", data);
   }

   

  return (
    <div className='chatList'>
      <span className='title'>dashboard</span>
      <Link to='/dashboard'>explore muffin ai</Link>
      <Link to='/dashboard'>create a new chat</Link>
      <Link to='/dashboard'>contact</Link>
      <hr />
      <span><div className="title">recent chat</div></span>
      <div className="list">
        {isLoading
          ? "Loading..."
          : error
            ? "Something went wrong"
            : data?.map((chat) => (
              <Link to={`/dashboard/chats/${chat._id}`} key={chat._id}>
                {chat.title || 'Untitled Chat'}
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
  );
};

export default ChatList;