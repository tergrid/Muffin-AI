import './newPrompt.css';
import Upload from '../upload/Upload.jsx';
import { useState, useRef, useEffect } from 'react';
import { IKImage } from 'imagekitio-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Markdown from 'react-markdown';

const NewPrompt = ({ data }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [img, setImg] = useState({
    isLoading: false,
    error: '',
    dbData: {},
    aiData: {},
  });

  const endRef = useRef(null);
  const formRef = useRef(null);
  const queryClient = useQueryClient();

  // Mutation for updating an existing chat
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
          img: img.dbData.filePath ? img.dbData : undefined,
        }),
      }).then((res) => res.json()),
    onSuccess: (data) => {
      // If the response contains an answer, update it locally
      if (data.answer) {
        setAnswer(data.answer);
      }
      
      queryClient.invalidateQueries({ queryKey: ['chat', data._id] });
      formRef.current.reset();
      setQuestion('');
      setImg({ isLoading: false, error: '', dbData: {}, aiData: {} });
    },
    onError: (err) => {
      console.error('Error updating chat:', err);
    },
  });

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;

    setQuestion(text);
    
    // If we already have a chat ID, use the mutation to update it
    if (data._id) {
      mutation.mutate();
    } else {
      // Otherwise create a new chat
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        console.log("API Response:", result);
        setAnswer(result.completion || '');
      } catch (error) {
        console.error('Error fetching response:', error);
        setAnswer("Sorry, there was an error processing your request.");
      }
    }
  };

  // Smooth scroll to the bottom of the chat container
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data, question, answer, img.dbData]);

   return (
    <>
      {img.isLoading && <div>Uploading image...</div>}
      
      {/* Image preview */}
      {img.previewUrl && !img.dbData.filePath && (
        <div className="image-preview">
          <img src={img.previewUrl} alt="Preview" style={{ maxWidth: '300px', borderRadius: '10px' }} />
          <button 
            className="remove-image" 
            onClick={() => setImg({ isLoading: false, error: '', previewUrl: null, dbData: {}, aiData: {} })}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Uploaded image */}
      {img.dbData?.filePath && (
        <div className="image-preview">
          <IKImage
            urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
            path={img.dbData?.filePath}
            width={300}
            height="auto"
            transformation={[{
              height: 300,
              width: 400,
              cropMode: 'maintain_ratio'
            }]}
          />
          <button 
            className="remove-image" 
            onClick={() => setImg({ isLoading: false, error: '', previewUrl: null, dbData: {}, aiData: {} })}
          >
            ✕
          </button>
        </div>
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
          />
          <button type="submit" disabled={img.isLoading}>
            <img src="/arrow.png" alt="Submit" />
          </button>
        </form>
        <div ref={endRef}></div>
      </div>
    </>
  );
};

export default NewPrompt;
