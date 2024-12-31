import './newPrompt.css';
import Upload from '../upload/Upload.jsx';
import { useState, useRef, useEffect } from 'react';
import { IKImage } from 'imagekitio-react';
import model from '../../lib/gemini.js';
import Markdown from 'react-markdown'; 

const NewPrompt = ({data}) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: '',
    dbData: {},
    aiData: {},
  });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });

  const endRef = useRef(null);
  const formRef = useRef(null);

  // Smooth scroll to the bottom of the chat container
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data, question, answer, img.dbData]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats${data._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question.length ? question : undefined,
          answer,
          img: img.dbData.filePath ? img.dbData : undefined
        }),
      }).then((res) => res.json());
    },
    onSuccess: (id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["chat",data._id] }).then(() => {;
      formRef.current.reset();
      setQuestion("")
      setAnswer("")
      setImg({
        isLoading: false,
        error: '',
        dbData: {},
        aiData: {},
      });
    });
  },
  onError: (err) => {
    console.log(err);
  },
});

  const add = async (text, isInital) => {
    if(!isInitial) setQuestion(text);
    
    try {
      const result = await chat.sendMessageStream(Object.entries(img.aiData).length ? [img.aiData, text] : [text]);

      if (result && result.response) {
        let accumulatedText = "";
        for await (const chunk of result.stream){
          const chunkText = chunk.text();
          console.log(chunkText);
          accumulatedText+=chunkText;
          setAnswer(accumulatedText);
        }
        setImg({
          isLoading: false,
          error: '',
          dbData: {},
          aiData: {},
        })
        mutation.mutate(); 
      } else {
        console.error('Unexpected response from model.generateContent');
      }
    } catch (error) {
      console.error('Error generating content:', error);
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault(); // Prevent form refresh
    const text = e.target.text.value;
    if(!text) return;

    add(text, false);
  };

  // IN PRODUCTION WE DONT NEED IT
  const hasRun = useRef(false);

  useEffect(() => { 
    if(!hasRun.current){
      if(data?.history?.length === 1){
        add(data.history[0].parts[0].text, true);
      }
    }
      hasRun.current = true;
  }, [])

  return (
    <>
      {/* Add New Chat */}
      {img.isLoading && <div>Loading...</div>}
      {img.dbData?.filePath && (
        <IKImage
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          path={img.dbData?.filePath}
          width={380}
        />
      )}
      {question && <div className="message user">{question}</div>}
      {answer && <div className="message"><Markdown>{answer}</Markdown></div>}
      <div className="endChat">
        <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
          <Upload setImg={setImg} />
          <input
            id="file"
            type="file"
            multiple={false}
            hidden
          />
          <input
            type="text"
            name="text"
            placeholder="Ask Anything..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)} // Update question state
          />
          <button type="submit">
            <img src="/arrow.png" alt="Submit" />
          </button>
        </form>
        <div ref={endRef}></div> {/* Ensure this is visible */}
      </div>
    </>
  );
};

export default NewPrompt;
