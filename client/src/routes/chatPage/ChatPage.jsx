import { useEffect, useRef, useState } from 'react';
import './chatPage.css';
import NewPrompt from '../../components/newPrompt/NewPrompt.jsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IKImage } from 'imagekitio-react';
import Markdown from 'react-markdown';
import { useLocation } from "react-router-dom";

const ChatPage = () => {
  const path = useLocation().pathname;
  const chatId = path.split('/').pop();

  const queryClient = useQueryClient();
  const endRef = useRef(null);
  const [message, setMessage] = useState("");

  // ✅ Fetch chat history
  const { isLoading, error, data } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        credentials: 'include',
      });
      return res.json();
    },
  });

  // ✅ Mutation for sending messages
  const sendMessage = useMutation({
    mutationFn: async (newMessage) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: newMessage }),
      });
      return res.json();
    },
    onSuccess: (updatedChat) => {
      queryClient.setQueryData(['chat', chatId], updatedChat); // ✅ Update chat state instantly
      setMessage(""); // ✅ Clear input field
    },
  });

  // ✅ Auto-scroll to the latest message
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data]);

  return (
    <div className="chatPage">
      <div className="wrapper">
        <div className="chat">
          {isLoading ? (
            'Loading...'
          ) : error ? (
            'Something went wrong!'
          ) : (
            data?.history?.map((message, i) => (
              <div key={i}>
                {message.img && (
                  <IKImage
                    urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                    path={message.img}
                    width={400}
                    height={300}
                    loading="lazy"
                  />
                )}
                <div
                  className={`message ${message.role === 'user' ? 'user' : ''}`}
                >
                  <Markdown>{message.parts[0].text}</Markdown>
                </div>
              </div>
            ))
          )}
          {data && <NewPrompt data={data} />}
          <div ref={endRef}></div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
