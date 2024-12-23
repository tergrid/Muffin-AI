import './newPrompt.css';
import Upload from '../upload/Upload.jsx';
import { useState, useRef, useEffect } from 'react';
import { IKImage } from 'imagekitio-react';
import model from '../../lib/gemini.js';
import Markdown from 'react-markdown'; 

const NewPrompt = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: '',
    dbData: {},
    aiData: {},
  });

  const endRef = useRef(null);

  // Smooth scroll to the bottom of the chat container
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [question, answer, img.dbData]);

  const add = async (text) => {
    try {
      const result = await model.generateContent(Object.entries(img.aiData).length ? [img.aiData, text] : [text]);

      if (result && result.response) {
        const responseText = await result.response.text();
        setAnswer(response.text);
        setImg({
          isLoading: false,
          error: '',
          dbData: {},
          aiData: {},
        })
      } else {
        console.error('Unexpected response from model.generateContent');
      }
    } catch (error) {
      console.error('Error generating content:', error);
    }
  };


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

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form refresh
    if (question.trim()) {
      add(question); // Call the add function with the user-provided question
    }
  };

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
        <form className="newForm" onSubmit={handleSubmit}>
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
