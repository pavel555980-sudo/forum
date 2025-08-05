import React, { useState, useEffect, useRef } from 'react';
import './ChatPage.css';

const ChatPage = () => {
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [typingStatus, setTypingStatus] = useState('');

    const jwtToken = localStorage.getItem('jwtToken');
    const userId = localStorage.getItem('userId');
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Загрузка списка контактов
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                // Используем новый эндпоинт с user_session
                const response = await fetch(`http://localhost:8000/api/v1/user/${userId}/get_friends`, {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    // Обрабатываем новый формат данных
                    const formattedContacts = data.map(friend => ({
                        id: friend.id,
                        name: friend.nick, // используем поле nick для имени
                        avatar: friend.avatar || '/default-avatar.png',
                        is_online: friend.is_online || false,
                        last_message: friend.last_message_content || 'Начните общение',
                        unread_count: friend.unread_count || 0,
                        last_activity: friend.last_activity || Date.now() / 1000
                    }));

                    setContacts(formattedContacts);

                    if (formattedContacts.length > 0 && !activeContact) {
                        setActiveContact(formattedContacts[0].id);
                    }
                }
            } catch (error) {
                console.error('Ошибка загрузки контактов:', error);
            }
        };

        if (userId) {
            fetchContacts();
        }
    }, [jwtToken, activeContact, userId]);

    // Загрузка истории сообщений при смене контакта
    useEffect(() => {
        if (!activeContact) return;

        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/v1/messages/${activeContact}`, {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessages(data.messages);
                }
            } catch (error) {
                console.error('Ошибка загрузки сообщений:', error);
            }
        };

        fetchMessages();
    }, [activeContact, jwtToken]);

    // Установка WebSocket соединения
    useEffect(() => {
        if (!userId || !jwtToken) return;

        socketRef.current = new WebSocket(`ws://localhost:8000/ws/chat?token=${jwtToken}&user_id=${userId}`);

        socketRef.current.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        };

        socketRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case 'new_message':
                    if (message.sender_id === activeContact || message.recipient_id === activeContact) {
                        setMessages(prev => [...prev, message]);
                    }
                    break;

                case 'typing_indicator':
                    if (message.sender_id === activeContact) {
                        setTypingStatus(message.status);
                    }
                    break;

                case 'message_read':
                    if (message.sender_id === activeContact) {
                        setMessages(prev => prev.map(msg =>
                            msg.id === message.message_id ? {...msg, is_read: true} : msg
                        ));
                    }
                    break;

                default:
                    console.log('Unknown message type:', message.type);
            }
        };

        socketRef.current.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        };

        socketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsConnected(false);
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [userId, jwtToken, activeContact]);

    // Прокрутка к последнему сообщению
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Отправка сообщения
    const sendMessage = () => {
        if (!newMessage.trim() || !socketRef.current || !activeContact) return;

        const message = {
            type: 'new_message',
            recipient_id: activeContact,
            content: newMessage,
            timestamp: Date.now()
        };

        socketRef.current.send(JSON.stringify(message));

        setMessages(prev => [...prev, {
            id: `temp_${Date.now()}`,
            sender_id: userId,
            recipient_id: activeContact,
            content: newMessage,
            timestamp: Date.now(),
            is_read: false
        }]);

        setNewMessage('');
    };

    // Отправка индикатора набора текста
    const handleTyping = (isTyping) => {
        if (!socketRef.current || !activeContact) return;

        const message = {
            type: 'typing_indicator',
            recipient_id: activeContact,
            status: isTyping ? 'typing...' : ''
        };

        socketRef.current.send(JSON.stringify(message));
        setTypingStatus(isTyping ? 'typing...' : '');
    };

    // Отправка подтверждения прочтения
    const markMessagesAsRead = () => {
        if (!socketRef.current || !activeContact) return;

        const unreadMessages = messages.filter(
            msg => msg.sender_id === activeContact && !msg.is_read
        );

        unreadMessages.forEach(msg => {
            const readReceipt = {
                type: 'message_read',
                message_id: msg.id,
                sender_id: activeContact
            };

            socketRef.current.send(JSON.stringify(readReceipt));

            setMessages(prev => prev.map(m =>
                m.id === msg.id ? {...m, is_read: true} : m
            ));
        });
    };

    // Форматирование даты сообщения
    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-page">
            <div className="chat-sidebar">
                <div className="chat-header">
                    <h2>Чаты</h2>
                    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                        {isConnected ? 'В сети' : 'Не в сети'}
                    </div>
                </div>

                <div className="contact-list">
                    {contacts.map(contact => (
                        <div
                            key={contact.id}
                            className={`contact ${activeContact === contact.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveContact(contact.id);
                                markMessagesAsRead();
                            }}
                        >
                            <div className="contact-info">
                                <div className="contact-name">{contact.name}</div>
                                <div className="contact-preview">
                                    {contact.last_message}
                                </div>
                                <div className={`online-status ${contact.is_online ? 'online' : 'offline'}`} />
                            </div>
                            {contact.unread_count > 0 && (
                                <div className="unread-count">{contact.unread_count}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-main">
                {activeContact ? (
                    <>
                        <div className="chat-header">
                            <div className="contact-info-header">
                                <div>
                                    <div className="contact-name">
                                        {contacts.find(c => c.id === activeContact)?.name}
                                    </div>
                                    <div className="typing-status">{typingStatus}</div>
                                </div>
                                <div className={`online-status ${contacts.find(c => c.id === activeContact)?.is_online ? 'online' : 'offline'}`} />
                            </div>
                        </div>

                        <div className="messages-container" onScroll={markMessagesAsRead}>
                            {messages.map(message => (
                                <div
                                    key={message.id}
                                    className={`message ${message.sender_id === userId ? 'sent' : 'received'}`}
                                >
                                    <div className="message-content">{message.content}</div>
                                    <div className="message-meta">
                                        <span>{formatMessageTime(message.timestamp)}</span>
                                        {message.sender_id === userId && (
                                            <span className={`read-status ${message.is_read ? 'read' : 'unread'}`}>
                        {message.is_read ? '✓✓' : '✓'}
                      </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="message-input">
              <textarea
                  value={newMessage}
                  onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping(e.target.value.length > 0);
                  }}
                  placeholder="Введите сообщение..."
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                      }
                  }}
              />
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                            >
                                Отправить
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-contact-selected">
                        <div className="welcome-message">
                            <h2>Добро пожаловать в чат</h2>
                            <p>Выберите контакт для начала общения</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;