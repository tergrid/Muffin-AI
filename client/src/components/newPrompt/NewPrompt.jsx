import './newPrompt.css';
import Upload from '../upload/Upload.jsx';
import { useState, useRef, useEffect } from 'react';
import { IKImage } from 'imagekitio-react';
import model from '../../lib/gemini.js';

const NewPrompt = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: '',
    dbData: {},
  });

  const endRef = useRef(null);

  // Smooth scroll to the bottom of the chat container
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [question, answer]);

  const add = async (text) => {
    try {
      setQuestion(text);
      const result = await model.generateContent(text);

      if (result && result.response) {
        const responseText = await result.response.text();
        setAnswer(responseText);
      } else {
        console.error('Unexpected response from model.generateContent');
      }
    } catch (error) {
      console.error('Error generating content:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page refresh
    if (question.trim()) {
      add(question);
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
      {answer && <div className="message">{answer}</div>}
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
            onChange={(e) => setQuestion(e.target.value)}
          />
          {/* Use the submit button correctly */}
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
