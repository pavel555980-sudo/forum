import React, { useState, useEffect } from 'react';
import './QuestionPage.css';
import user from './../assets/default-user.png';
import {useParams} from "react-router-dom";
import {Helmet} from 'react-helmet'
import preview from './../assets/preview.png'
import { toast } from 'react-hot-toast';
import userLogo from '../assets/user.png';


const QuestionPage = () => {
  const { id } = useParams();
  const question_id = id;
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [userActionsData, setUserActionsData] = useState([]);
  const sessionToken = localStorage.getItem('sessionToken');
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  const MAX_TEXT_LENGTH = 5000;


  const [userRatings, setUserRatings] = useState({});

  

  useEffect(() => {
    setIsUserAuthenticated(!!sessionToken);
    let answersData = []
    let answersActions = []
    const fetchData = async () => {
      try {
       const questionResponse = await fetch(
        `https://otvetoved.ru/api/v1/questions/${question_id}`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`
          }
        }
      );
        const questionData = await questionResponse.json();
        setQuestion(questionData);

        const answersResponse = await fetch(
            `https://otvetoved.ru/api/v1/questions/${question_id}/answers`,
            {
              headers: {
                Authorization: `Bearer ${sessionToken}`
              }
            }
          );
         answersData = await answersResponse.json();
        const updatedAnswersData = await Promise.all(answersData.map(async (answer) => {
          const ratingResponse = await fetch(
              `https://otvetoved.ru/api/v1/answers/${answer.id}/rating`,
              {
                  headers: {
                      Authorization: `Bearer ${sessionToken}`
                  }
              }
          );
          const ratingData = await ratingResponse.json();
          return { ...answer, likes: ratingData.likes, dislikes: ratingData.dislikes };
      }));
      
      setAnswers(updatedAnswersData);

      const userActionsPromises = answersData.map(async (answer) => {
        const userActionsResponse = await fetch(
          `https://otvetoved.ru/api/v1/answers/${answer.id}/rating/me?session_token=` + sessionToken, {
            headers: {
              Authorization: `Bearer ${sessionToken}`
            }
          }
        );
        const userActionData = await userActionsResponse.json(); 
        const action = userActionData.action; 
        return { answerId: answer.id, action }; 
      });
      
      const userActionsData = await Promise.all(userActionsPromises);
      console.log(userActionsData);
      setUserActionsData(userActionsData);
        
      } catch (error) {
        console.error('Failed to fetch question and answers:', error);
      }
      
    };

    fetchData();
  },[sessionToken]);



  useEffect(() => {

    const fetchUserRatings = async () => {
      console.log("1")
      try {
        const userIds = new Set([...answers.map(answer => answer.created_by_user.id), question?.created_by_user.id]);
        const promises = Array.from(userIds).map(async userId => {
          const response = await fetch(`https://otvetoved.ru/api/v1/user/${userId}/total_rate`, {
            headers: {
              Authorization: `Bearer ${sessionToken}`
            }
          });
          const dataRat = await response.json();
          console.log(`data:${dataRat}`)
          return { [userId]: dataRat.user_rating };
        });
        const ratings = await Promise.all(promises);
        setUserRatings(Object.assign({}, ...ratings));
      } catch (error) {
        console.error('Failed to fetch user ratings:', error);
      }
    };
    console.log(userRatings);

    
    
    fetchUserRatings();
  }, [answers, question, sessionToken]);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();

    if (!newAnswer.trim()) {
      toast.error('Введите ответ.');
      return;
    }

    if (!isUserAuthenticated)
    {
      toast.error('Авторизуйтесь.');
      return;
    }
      
    

    
    try {
      const response = await fetch(`https://otvetoved.ru/api/v1/questions/${question_id}/answers`, { 
        method: 'POST',
        headers: {
           Authorization: `Bearer ${sessionToken}`,            
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newAnswer,
          session_token: sessionToken
        }),
      });

      

      if (response.ok) {
        const newAnswerData = await response.json();
        setAnswers([...answers, newAnswerData]);
        toast.success('Спасибо за ваш ответ!');
        setNewAnswer('');
        setTimeout(() => {
          window.location.reload();
      }, 2000); 
      } else {
        console.error('Failed to submit answer:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleLike = async (id, action) => {
    try {
      const response = await fetch(`https://otvetoved.ru/api/v1/answers/${id}/rating`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          session_token: sessionToken
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        const updatedAnswers = answers.map(answer => {
          if (answer.id === id) {
            return { ...answer, likes: updatedData.likes, dislikes: updatedData.dislikes };
          }
          return answer;
        });
        setAnswers(updatedAnswers);
      } else {
        console.error(`Failed to update ${id}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to update ${id}: ${error}`);
    }
};

function getActionByType(userActionsData, answerId, action) {
  console.log(userActionsData);
  console.log('Searching for action with answerId:', answerId, 'and action:', action);
  const foundAction = userActionsData.find(item => item.answerId === answerId && item.action === action);
  console.log('Found action:', foundAction);
  return foundAction;
}
  
  
  return (
    <div className="question-page">
    <Helmet>
      <title>Ответовед</title>
      <meta name="description" content="Ответовед место для вопросов"/>
      <meta property="og:title" content={question?.brief || 'Заголовок'}/>
      <meta property="og:description" content={question?.text || 'Описание'}/>
      <meta property="og:image" content={preview}/>
      <meta property="og:site_name" content="Ответовед"/>
      <meta property="og:url" content='https://otvetoved.ru/questions'/>
      <meta property="og:type" content="website"/>
      <meta property="og:image_type" content="image/png"/>
    </Helmet>

{question && question.brief && ( 
  <>
    {question.text.length === 0 ? (
      <>
       <div className="date-question-var">
        {
          new Date(question.created_at * 1000).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }
      </div>

        <div className="h2-question-var">
        <h2>Вопрос: {question.brief}</h2>
        <div className="textAndLogo">
        <p className="author-p">by {question.created_by_user.username}</p>
        {/* <img src={userLogo} className="userLogo" alt="Profile" /> */}

        </div>
        

        </div>
      </>
    ) : (
      <>
        <h2 className="h2-question">Вопрос: {question.brief}</h2>
        <div className="date-question">
          {
            new Intl.DateTimeFormat("ru-RU", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit"
            }).format(question.created_at * 1000)
          }
        </div>
        <div className="author-info">
          <div className="profile">
            <img className="user-question" src={user} alt="Аватарка" />
            <div className="author-name">{question.created_by_user.username} </div>
          </div>
          <div className="question-info">
            <div className="question-text">{question.text}</div>
          </div>
        </div>
      </>
    )}
  </>
)}


          <h2 className="h2-answers">Ответы</h2>
      {answers.length > 0 && (
        <div className="answers">
          {answers.map(answer => (
            <div key={answer.id} className="answer" style={{wordWrap:'break-word'}}>
              <div className="date-question">{
                new Intl.DateTimeFormat("ru-RU", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit"
                }).format(answer.created_at*1000)
              }</div>
              <div className="author-info">
                <div className="profile">
                  <img className="user-question" src={user} alt="Аватарка" />
                  <div className="author-name">{answer.created_by_user.username} 
                  </div>
                  <div className="rating">
                  {((userRatings[answer.created_by_user.id] * 100).toFixed(0)) + '%'}
                  </div>
                </div>
                <div className="answer-info">
                  <div className="answer-text">{answer.text}</div>
                </div>
              </div>
              <div className="answer-actions">
              <button onClick={() => handleLike(answer.id, 'like')} className={`like-btn ${getActionByType(userActionsData, answer.id, 'like') ? 'actioned' : ''}`}>👍 Лайк {answer.likes}</button>
              <button onClick={() => handleLike(answer.id, 'dislike')} className={`dislike-btn ${getActionByType(userActionsData, answer.id, 'dislike') ? 'actioned' : ''}`}>👎 Дизлайк {answer.dislikes}</button>
   
              </div>
            </div>
          ))}
        </div>
      )}


      <form className="answer-form" onSubmit={handleAnswerSubmit}>
        <div className="author-info">
          <div className="profile">
            <img className="user-question" src={user} alt="Аватарка" />
            <div className="author-name">Вы</div>
          </div>
          <textarea
            placeholder="Введите ваш ответ"
            className="response-textarea"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            maxLength={MAX_TEXT_LENGTH}
          ></textarea>
           <small className="limit-2">{newAnswer.length}/{MAX_TEXT_LENGTH}</small>
          <button className="submit-btn" type="submit">Отправить</button>
        </div>
      </form>
    </div>
  );
};

export default QuestionPage;
