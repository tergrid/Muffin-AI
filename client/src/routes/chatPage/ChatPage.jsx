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

  const sendMessage = useMutation({
    mutationFn: async (newMessage) => {
      setSending(true);

      // ✅ Ensure correct chat ID is used
      if (!chatId) {
        console.error("Chat ID is missing!");
        setSending(false);
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        method: "PUT", // ✅ Ensuring existing chat is updated
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: newMessage }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      return res.json();
    },
    onSuccess: (updatedChat) => {
      queryClient.setQueryData(['chat', chatId], updatedChat); // ✅ Updates chat history
      sendMessage(""); // ✅ Clears input field
      setSending(false);
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
                <div className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}>
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
