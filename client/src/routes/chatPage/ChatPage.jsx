import { useEffect, useRef } from 'react';
import './chatPage.css';
import NewPrompt from '../../components/newPrompt/NewPrompt.jsx';
import { useQuery } from '@tanstack/react-query';
import { IKImage } from 'imagekitio-react';
import Markdown from 'react-markdown';

const ChatPage = () => {
  const path = useLocation().pathname;
  const chatId = path.split('/').pop();

  const { isLoading, error, data } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        credentials: 'include',
      }).then((res) => res.json()),
  });

  const endRef = useRef(null);

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
                  className={`message ${
                    message.role === 'user' ? 'user' : ''
                  }`}
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
