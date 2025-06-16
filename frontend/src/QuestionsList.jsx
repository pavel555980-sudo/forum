import React, { useState, useEffect } from 'react';
import './styles/QuestionsList.css';
import arrow from './assets/arrow.png';
import {Link} from "react-router-dom";


const QuestionsList = () => {
  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    fetch('https://otvetoved.ru/api/v1/questions')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setQuestions(data);
      });
  }, []);


  return (
    <div>
      {questions && (
        <div className="questionsList">
          {questions.map(question => (
            <Link to={`/questions/${question.id}`} className="link">
            <div key={question.id} className="question">
              <img src={arrow} className="arrow" alt='стрелка' />
              <p className='briefText'>{question.brief}</p>
              <p className='createdAt'>{
                new Intl.DateTimeFormat("ru-RU", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }).format(question.created_at*1000)
              }</p>
              <p className='createdBy'>{question.created_by_user.username}</p>
            </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionsList;
