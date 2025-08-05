import React, { useState, useEffect, useCallback } from 'react';
import './ThreadPage.css';
import user from './../assets/default-user.png';
import { useParams } from "react-router-dom";
import { Helmet } from 'react-helmet';
import preview from './../assets/preview.png';
import { toast } from 'react-hot-toast';

const ThreadPage = () => {
  const { id } = useParams();
  const jwtToken = localStorage.getItem('jwtToken');
  const thread_id = id;
  const [thread, setThread] = useState(null);
  const [newComment, setNewComment] = useState('');
  const sessionToken = localStorage.getItem('sessionToken');
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [usersMap, setUsersMap] = useState({});
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const MAX_TEXT_LENGTH = 5000;

  // Функция для загрузки данных треда
  const fetchThreadData = useCallback(async () => {
    try {
      const threadResponse = await fetch(
          `http://localhost:8000/main_api/v1/thread/${thread_id}`,
          {
            method: 'GET',
            headers: { Authorization: `Bearer ${sessionToken}` }
          }
      );

      const threadData = await threadResponse.json();
      setThread(threadData);
    } catch (error) {
      console.error('Failed to fetch thread:', error);
      toast.error('Ошибка загрузки треда');
    }
  }, [sessionToken, thread_id]);

  // Эффект для загрузки треда
  useEffect(() => {
    setIsUserAuthenticated(!!sessionToken);
    fetchThreadData();
  }, [sessionToken, thread_id, fetchThreadData]);

  // Функция для загрузки данных пользователя
  const fetchUser = useCallback(async (userId) => {
    if (!userId || usersMap[userId]) return;

    try {
      const response = await fetch(`http://localhost:8000/api/v1/user/${userId}`, {
        method: 'GET'
      });

      if (response.ok) {
        const userData = await response.json();
        setUsersMap(prev => ({ ...prev, [userId]: userData.nick }));
      } else {
        setUsersMap(prev => ({ ...prev, [userId]: "Пользователь" }));
      }
    } catch (error) {
      setUsersMap(prev => ({ ...prev, [userId]: "Пользователь" }));
    }
  }, [sessionToken, usersMap]);

  // Эффект для загрузки пользователей
  useEffect(() => {
    if (!thread) return;

    const userIds = new Set();
    if (thread.user_id) userIds.add(thread.user_id);

    thread.comments?.forEach(comment => {
      if (comment.user_id) userIds.add(comment.user_id);
      comment.replies?.forEach(reply => {
        if (reply.user_id) userIds.add(reply.user_id);
      });
    });

    userIds.forEach(userId => fetchUser(userId));
  }, [thread, fetchUser]);

  // Отправка основного комментария
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Комментарий не может быть пустым');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/main_api/v1/thread/${thread_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jwt: jwtToken,
          content: newComment
        })
      });

      if (response.ok) {
        setNewComment('');
        await fetchThreadData();
        toast.success('Комментарий добавлен');
      } else {
        console.log(response);
        toast.error('Ошибка при добавлении комментария');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    }
  };

  // Отправка ответа на комментарий
  const handleReplySubmit = async (parentId) => {
    if (!replyContent.trim()) {
      toast.error('Ответ не может быть пустым');
      return;
    }

    try {
      const response = await fetch(
          `http://localhost:8000/main_api/v1/thread/${thread_id}/${parentId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
              jwt: jwtToken,
              content: replyContent
            })
          }
      );

      if (response.ok) {
        setReplyContent('');
        setActiveReplyCommentId(null);
        await fetchThreadData();
        toast.success('Ответ добавлен');
      } else {
        toast.error('Ошибка при добавлении ответа');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    }
  };

  return (
      <div className="thread-page">
        {thread && (
            <>
              {thread.content.length === 0 ? (
                  <>
                    <div className="date-question-var">
                      {new Date(thread.created_at * 1000).toLocaleString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="h2-question-var">
                      <h2>{thread.header}</h2>
                      <div className="textAndLogo">
                        <p className="author-p">by {usersMap[thread.user_id] || "Загрузка..."}</p>
                      </div>
                    </div>
                  </>
              ) : (
                  <>
                    <h2 className="h2-question">{thread.header}</h2>
                    <div className="date-question">
                      {new Intl.DateTimeFormat("ru-RU", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      }).format(thread.created_at * 1000)}
                    </div>
                    <div className="author-info">
                      <div className="profile">
                        <img className="user-question" src={user} alt="Аватарка" />
                        <div className="author-name">{usersMap[thread.user_id] || "Загрузка..."}</div>
                      </div>
                      <div className="thread-info">
                        <div className="thread-text">{thread.content}</div>
                      </div>
                    </div>
                  </>
              )}
            </>
        )}

        <h2 className="h2-answers">Комментарии</h2>
        {thread && thread.comments && thread.comments.length > 0 && (
            <div className="answers">
              {thread.comments.map(comment => (
                  <div key={comment.id} className="answer" style={{ wordWrap: 'break-word' }}>
                    <div className="date-question">
                      {new Intl.DateTimeFormat("ru-RU", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      }).format(comment.created_at * 1000)}
                    </div>
                    <div className="author-info">
                      <div className="profile">
                        <img className="user-question" src={user} alt="Аватарка" />
                        <div className="author-name">{usersMap[comment.user_id] || "Загрузка..."}</div>
                      </div>
                      <div className="answer-info">
                        <div className="answer-text">{comment.content}</div>
                      </div>
                    </div>

                    {/* Кнопка ответа на комментарий */}
                    {isUserAuthenticated && (
                        <button
                            className="reply-button"
                            onClick={() => setActiveReplyCommentId(
                                activeReplyCommentId === comment.id ? null : comment.id
                            )}
                        >
                          {activeReplyCommentId === comment.id ? "Отмена" : "Ответить"}
                        </button>
                    )}

                    {/* Форма ответа на комментарий */}
                    {activeReplyCommentId === comment.id && isUserAuthenticated && (
                        <div className="reply-form">
                  <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Напишите ваш ответ..."
                      maxLength={MAX_TEXT_LENGTH}
                  />
                          <div className="form-footer">
                            <button
                                type="button"
                                className="submit-button"
                                onClick={() => handleReplySubmit(comment.id)}
                            >
                              Отправить
                            </button>
                          </div>
                        </div>
                    )}

                    {comment.replies && comment.replies.length > 0 && (
                        <div className="replies">
                          {comment.replies.map(reply => (
                              <div key={reply.id} className="reply" style={{ wordWrap: 'break-word' }}>
                                <div className="date-question">
                                  {new Intl.DateTimeFormat("ru-RU", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  }).format(reply.created_at * 1000)}
                                </div>
                                <div className="author-info">
                                  <div className="profile">
                                    <img className="user-question" src={user} alt="Аватарка" />
                                    <div className="author-name">{usersMap[reply.user_id] || "Загрузка..."}</div>
                                  </div>
                                  <div className="reply-info">
                                    <div className="reply-text">{reply.content}</div>
                                  </div>
                                </div>

                                {/* Кнопка ответа на reply */}
                                {isUserAuthenticated && (
                                    <button
                                        className="reply-button"
                                        onClick={() => setActiveReplyCommentId(
                                            activeReplyCommentId === reply.id ? null : reply.id
                                        )}
                                    >
                                      {activeReplyCommentId === reply.id ? "Отмена" : "Ответить"}
                                    </button>
                                )}

                                {/* Форма ответа на reply */}
                                {activeReplyCommentId === reply.id && isUserAuthenticated && (
                                    <div className="reply-form">
                          <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Напишите ваш ответ..."
                              maxLength={MAX_TEXT_LENGTH}
                          />
                                      <div className="form-footer">
                                        <button
                                            type="button"
                                            className="submit-button"
                                            onClick={() => handleReplySubmit(reply.id)}
                                        >
                                          Отправить
                                        </button>
                                      </div>
                                    </div>
                                )}
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
              ))}
            </div>
        )}

        {/* Форма основного комментария */}
        {isUserAuthenticated && (
            <form className="answer-form" onSubmit={handleAnswerSubmit}>
              <h3>Оставить комментарий</h3>
              <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Напишите ваш комментарий..."
                  maxLength={MAX_TEXT_LENGTH}
              />
              <div className="form-footer">
                <button type="submit" className="submit-button">
                  Отправить
                </button>
              </div>
            </form>
        )}
      </div>
  );
};

export default ThreadPage;