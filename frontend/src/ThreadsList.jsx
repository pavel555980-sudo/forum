import React, { useState, useEffect } from 'react';
import './styles/ThreadsList.css';
import {Link} from "react-router-dom";


const ThreadsList = () => {
  const [threads, setThreads] = useState([]);
  useEffect(() => {
    fetch('http://localhost:8000/main_api/v1/thread')
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setThreads(data);
      });
  }, []);


  return (
    <div>
      {threads && (
        <div className="threadsList">
          {threads.map(thread => (
            <Link to={`/thread/${thread.id}`} className="link">
            <div key={thread.id} className="thread">
              <p className='briefText'>{thread.header}</p>
              <p className='createdAt'>{
                new Intl.DateTimeFormat("ru-RU", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }).format(thread.created_at*1000)
              }</p>
              {/*<p className='createdBy'>{thread.user_id}</p>*/}
            </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreadsList;
