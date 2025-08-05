import React, { useState} from 'react';
import './Modal.css';
import { toast } from 'react-hot-toast';

const ThreadCreatingPage = ({ onClose }) => {
  const [header, setHeader] = useState('');
  const [content, setContent] = useState('');
  const [user_id, setUserId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const sessionToken = localStorage.getItem('sessionToken');
  const jwtToken = localStorage.getItem('jwtToken');


  const MAX_BRIEF_LENGTH = 200;
  const MAX_TEXT_LENGTH = 5000;

  const handlePublication = async () => {
    if (!header.trim()) {
      toast.error('Введите заголовок ветки.');
      return;
    }

    try {
      const userResponse = await fetch(
          `http://localhost:8000/api/v1/auth?session_token=${localStorage.getItem('sessionToken')}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
      );

      if (!userResponse.ok) {
        console.error('Failed to get user ID');
        return;
      }

      const userData = await userResponse.json();
      const userId = userData.id;
      console.log('User ID:', userId);

      const threadData = {
        header,
        content,
        jwt: jwtToken,
      };

      const threadResponse = await fetch(
          'http://localhost:8000/main_api/v1/thread',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(threadData),
          }
      );

      if (threadResponse.ok) {
        console.log('Thread successfully submitted');
        toast.success("Ветка успешно создана!");
        setTimeout(() => window.location.reload(), 2000);
        onClose();
      } else {
        console.error('Failed to submit thread');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };



  return (
    <div className="thread-modal">
      <div className="thread-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2 className="thread-head">Создание ветки</h2>
        <form onSubmit={e => {
          e.preventDefault();
          handlePublication();
        }}>
          <p className="thread-p">Заголовок</p>
          <input
            type="text"
            className="thread-input"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            maxLength={MAX_BRIEF_LENGTH}
          />
          <small className="limit">{content.length}/{MAX_BRIEF_LENGTH}</small>
          <p className="thread-p">Текст ветки</p>
          <textarea
            className="thread-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_TEXT_LENGTH}
          ></textarea>
          <small className="limit">{content.length}/{MAX_TEXT_LENGTH}</small>
          <button type="submit" className="thread-button">Опубликовать</button>

        </form>
      </div>
    </div>
  );
};

export default ThreadCreatingPage;
