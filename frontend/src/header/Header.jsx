import React, { useEffect, useState } from 'react';
import './Header.css';
import userLogo from '../assets/user.png';
import exit from '../assets/exit.png';
import AuthenticationModal from '../components/AuthenticationModal.jsx';
import RegistrationModal from '../components/RegistrationModal.jsx';
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const isJWTValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded["expire_date"] > currentTime;
  } catch (error) {
    return false;
  }
};

const getUserInfoFromJWT = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded["nick"];
  } catch (error) {
    return null;
  }
};

export default function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState('');
  const sessionToken = localStorage.getItem('sessionToken');
  const jwtToken = localStorage.getItem('jwtToken');
  const isLoggedIn = !!sessionToken;

  const generateJWT = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/auth/${sessionToken}/JWT`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_token: sessionToken })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('jwtToken', data["access_token"]);
        return data["access_token"];
      } else {
        throw new Error('Failed to generate JWT');
      }
    } catch (error) {
      console.error('Error generating JWT:', error);
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('jwtToken');
    window.location.reload();
  };

  const handleExit = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/auth?session_token=${sessionToken}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        handleLogout();
      } else {
        throw new Error('Failed to close session');
      }
    } catch (error) {
      console.error('Error closing session:', error);
      handleLogout();
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (jwtToken && isJWTValid(jwtToken)) {
        const usernameFromToken = getUserInfoFromJWT(jwtToken);
        if (usernameFromToken) {
          setUsername(usernameFromToken);
          return;
        }
      }

      if (sessionToken) {
        try {
          const newJWT = await generateJWT();
          if (newJWT) {
            const usernameFromToken = getUserInfoFromJWT(newJWT);
            if (usernameFromToken) {
              setUsername(usernameFromToken);
              return;
            }
          }

          const response = await fetch(
              `http://localhost:8000/api/v1/auth?session_token=${sessionToken}`,
              { method: 'GET' }
          );

          if (response.ok) {
            const data = await response.json();
            setUsername(data.user_id);
          } else {
            if (response.status === 419) {
              alert("Session expired. Please log in again.");
            }
            throw new Error('Failed to fetch user information');
          }
        } catch (error) {
          console.error('Authentication error:', error);
          handleLogout();
        }
      }
    };

    fetchUserData().then(r => console.log(r));

    const jwtCheckInterval = setInterval(async () => {
      if (jwtToken && !isJWTValid(jwtToken)) {
        await generateJWT();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(jwtCheckInterval);
  }, [sessionToken, jwtToken]);

  return (
      <div className='header'>
        <div className="navButtons">
          <Link to="/" className="linkSiteName">
            <h1 className='siteName'>Forum</h1>
          </Link>
          {/*
          <h2>Поиск</h2>
          <Link to={"/Chat"} className="linkSite">
            <h2>Личные сообщения</h2>
          </Link>
          <h2>Настройки</h2>
          */}
        </div>
        <div className='user' onClick={() => {
          if (!sessionToken) {
            setShowLogin(true);
          }
        }}>
          <h1 className='userText'>{username || 'Войти'}</h1>
          <img src={userLogo} className="userLogo" alt="Profile" />
          {isLoggedIn && (
              <button type="button" onClick={handleExit} className="exit">Exit</button>
          )}
          {showLogin && <AuthenticationModal onClose={() => setShowLogin(false)} onRegisterClick={() => {
            setShowLogin(false);
            setShowRegister(true);
          }} />}
          {showRegister && <RegistrationModal onClose={() => setShowRegister(false)} onLoginClick={() => {
            setShowRegister(false);
            setShowLogin(true);
          }} />}
        </div>
      </div>
  );
}