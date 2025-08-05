import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import './Modal.css';

const AuthenticationModal = ({ onClose, onRegisterClick }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sessionToken, setSessionToken] = useState(null);

  const handleLogin = () => {
    if (!username.trim()) {
      toast.error('Введите никнейм.');
      return;
    }
    if (!password.trim()) {
      toast.error('Введите пароль.');
      return;
    }

    console.log('Sending data:', { username, password });
    fetch('http://localhost:8000/api/v1/auth', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nick: username,
        password: password,
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
          const token = data.session_token;
          localStorage.setItem('sessionToken', token);
          setSessionToken(token);
          toast.success('Вы успешно вошли!');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        })
        .catch(error => {
          console.error('Error occurred while logging in: ', error);
          if (error.detail) {
            toast.error('Произошла ошибка входа: ' + error.detail);
          } else {
            toast.error('Произошла ошибка входа. Пожалуйста, попробуйте позже.');
          }
        });
  };

  return (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2 className="modal-head">Вход</h2>
          <form>
            <input
                className="modal-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Имя пользователя"
            />
            <input
                className="modal-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Пароль"
            />
            <button className="modal-button" type="button" onClick={handleLogin}>
              Войти
            </button>
          </form>
          <p className="modal-p">
            Нет аккаунта?{' '}
            <span className="modal-span" onClick={onRegisterClick}>
            Регистрация
          </span>
          </p>
        </div>
        <Toaster /> {/* Ensure Toaster is included for toast notifications */}
      </div>
  );
};

export default AuthenticationModal;