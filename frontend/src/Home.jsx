import React, { useState, useEffect } from 'react';
import './styles/App.css'
import ThreadsList from './ThreadsList.jsx'
import ThreadCreatingPage from './components/ThreadCreatingPage.jsx'
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
      <div className='body'>
        {isUserAuthenticated ? (
          <button className='createQuestion' onClick={openModal}>
            Создать ветку
          </button>
        ) : (
          <button className='createQuestion notAuth' disabled>
            Вы должны быть авторизованы
          </button>
        )}
        {isModalOpen && <ThreadCreatingPage onClose={closeModal} />}
        <ThreadsList />
      </div>
    </>
  )
}

export default Home