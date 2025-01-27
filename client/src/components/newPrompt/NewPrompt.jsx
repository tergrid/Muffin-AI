import './newPrompt.css';
import Upload from '../upload/Upload.jsx';
import { useState, useRef, useEffect } from 'react';
import { IKImage } from 'imagekitio-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Markdown from 'react-markdown'; // Retain Markdown parsing

const NewPrompt = ({ data }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [img, setImg] = useState({
    isLoading: false,
    error: '',
    dbData: {},
    aiData: {},
  });

  const chat = data.history || []; // Preserve existing chat history initialization

  const endRef = useRef(null);
  const formRef = useRef(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          answer,
          img: img.dbData.filePath ? img.dbData : undefined,
        }),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', data._id] });
      formRef.current.reset();
      setQuestion('');
      setAnswer('');
      setImg({ isLoading: false, error: '', dbData: {}, aiData: {} });
    },
    onError: (err) => {
      console.error('Error updating chat:', err);
    },
  });

  const add = async (text) => {
    setQuestion(text);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      const result = await response.json();
      setAnswer(result.completion || '');
    } catch (error) {
      console.error('Error fetching response:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;

    add(text);
  };

  // Smooth scroll to the bottom of the chat container
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data, question, answer, img.dbData]);

  return (
    <>
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
            type="text"
            name="text"
            placeholder="Ask Anything..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button type="submit">
            <img src="/arrow.png" alt="Submit" />
          </button>
        </form>
        <div ref={endRef}></div>
      </div>
    </>
  );
};

export default NewPrompt;
