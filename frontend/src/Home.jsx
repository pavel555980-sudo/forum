import React, { useState, useEffect } from 'react';
import './styles/App.css'
import QuestionsList from './QuestionsList'
import QuestionCreatingPage from './components/QuestionCreatingPage'
import {Helmet} from 'react-helmet'
import preview from './assets/preview.png'

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    const sessionToken = localStorage.getItem('sessionToken');
    setIsUserAuthenticated(!!sessionToken);
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>

    <Helmet>
      <title>Forum</title>
      <meta name="description" content="Ответовед место для вопросов"/>
      <meta property="og:title" content="Ответовед.ру"/>
      <meta property="og:description" content="Задайте вопрос и получите ответ от пользователей!"/>
      <meta property="og:image" content={preview}/>
      <meta property="og:site_name" content="Ответовед"/>
      <meta property="og:url" content="https://otvetoved.ru"/>
      <meta property="og:type" content="website"/>
      <meta property="og:image_type" content="image/png"/>
      
      
    </Helmet>

      <div className='body'>
        {isUserAuthenticated ? (
          <button className='createQuestion' onClick={openModal}>
            Создать вопрос
          </button>
        ) : (
          <button className='createQuestion notAuth' disabled>
            Вы должны быть авторизованы
          </button>
        )}
        {isModalOpen && <QuestionCreatingPage onClose={closeModal} />}
        <QuestionsList />
      </div>
    </>
  )
}

export default Home