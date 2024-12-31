import { useEffect, useRef} from 'react';
import './chatPage.css';
import NewPrompt from '../../components/newPrompt/NewPrompt.jsx'
const ChatPage = () => {
  const path = useLocation().pathname;
  const chatId = path.split("/").pop();

  const {isPending, error, data } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  const endRef = useRef(null);

  useEffect(()=>{
    endRef.current.scrollIntoView({behavior:"smooth"});
  },[])
  return (
    <div className='chatPage'>
      <div className="wrapper">
        <div className="chat">
          <div className="message">Test messge from ai</div>
          {isPending 
            ? "Loading..."
            : error
            ? "Something went wrong!"
            : data?.history?.map((message, i)=>
            <>
            {message.img && (

              <IKImage
              urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
              path = {message.img}
              height = "300"
              width = "400"
              transformation={[{ height: 300, width: 400 }]}
              loading = "lazy"
              lqip={{ active: true, quality: 20 }}
              />
            )}
            <div className={message.role === "user" ? "message.user" : "message"} key={i}>
              <Markdown>{message.parts[0].text}</Markdown>
            </div>
            </>
            )}
          { data && <NewPrompt data = {data}></NewPrompt>}
          <div ref={endRef}></div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage