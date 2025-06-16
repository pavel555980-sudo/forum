import React, { useState } from 'react';
import AuthenticationModal from './AuthenticationModal.jsx'; 
import { toast } from 'react-hot-toast';
import './Modal.css'

const RegistrationModal = ({ onClose, onLoginClick }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showAuthentication, setShowAuthentication] = useState(false); 
  const [sessionToken, setSessionToken] = useState(localStorage.getItem('sessionToken') || '');

  const handleRegister = () => {

    if (!username.trim()) {
      toast.error('Введите никнейм.');
      return;
    }

    if (!password.trim()) {
      toast.error('Введите пароль.');
      return;
    }

    if (username.length > 20) {
      toast.error('Имя пользователя слишком длинное.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Введите корректный адрес почты.');
      return;
    }

    fetch('https://otvetoved.ru/api/v1/authentication/register', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            email,
            password,
        }),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(error => Promise.reject(error));
        }
    })
    .then(data => {
        toast.success(`Вы успешно зарегистрировались: ${data.username}`);
        console.log('Sending data:', { username, password });

        return fetch('https://otvetoved.ru/api/v1/authentication', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(error => Promise.reject(error));
        }
    })
    .then(data => {
        const token = data.session_token;
        localStorage.setItem('sessionToken', token);
        setTimeout(() => {
          window.location.reload();
      }, 2000); 
    })
    .catch(error => {
        console.error('Error occurred: ', error);
        if (error.detail) {
            toast.error('Ошибка: ' + error.detail);
        } else {
            toast.error('Произошла ошибка. Пожалуйста, попробуйте позже.');
        }
    });
};
  

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2 className="modal-head">Регистрация</h2>
        <form>
          <input type="text" className="modal-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Имя пользователя" />
          <input type="email" className="modal-input"  value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Почта" />
          <input type="password" className="modal-input"  value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" />
          <button className="modal-button" type="button"  onClick={handleRegister}>Зарегистрироваться</button>
        </form>
        <p className="modal-p" >Уже есть аккаунт? <span className="modal-span" onClick={onLoginClick}>Войдите</span></p>
        {showAuthentication && <AuthenticationModal onClose={() => setShowAuthentication(false)} onRegisterClick={() => setShowAuthentication(false)} />}
      </div>
    </div>
  );
};

export default RegistrationModal;
