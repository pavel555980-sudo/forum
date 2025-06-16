import React, { useState} from 'react';
import './Modal.css';
import { toast } from 'react-hot-toast';

const QuestionCreatingPage = ({ onClose }) => {
  const [brief, setBrief] = useState('');
  const [text, setText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const sessionToken = localStorage.getItem('sessionToken');

  
  const MAX_BRIEF_LENGTH = 200;
  const MAX_TEXT_LENGTH = 5000;

  const handlePublication = () => {
    if (!brief.trim()) {
      toast.error('Введите заголовок вопроса.');
      return;
    }

    // if (!text.trim()) {
    //   alert('Введите описание вопроса.');
    //   return;
    // }

    const data = {
      brief,
      text,
      session_token: sessionToken, 
    };

    fetch('https://otvetoved.ru/api/v1/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (response.ok) {
          console.log('Question successfully submitted');
          toast.success("Вопрос успешно создан!");
          setTimeout(() => {
            window.location.reload();
        }, 2000); 
          onClose();
        } else {
          console.error('Failed to submit the question');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };


  
  return (
    <div className="question-modal">
      <div className="question-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2 className="question-head">Создание вопроса</h2>
        <form onSubmit={e => {
          e.preventDefault();
          handlePublication(); 
        }}>
          <p className="question-p">Заголовок</p>
          <input
            type="text"
            className="question-input"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            maxLength={MAX_BRIEF_LENGTH}
          />
          <small className="limit">{brief.length}/{MAX_BRIEF_LENGTH}</small>
          <p className="question-p">Текст вопроса</p>
          <textarea
            className="question-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_TEXT_LENGTH}
          ></textarea>
          <small className="limit">{text.length}/{MAX_TEXT_LENGTH}</small>
          <button type="submit" className="question-button">Опубликовать</button>
        </form>
      </div>
    </div>
  );
};

export default QuestionCreatingPage;
