import React, { useState } from 'react';
import './styles/App.css'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Header from './header/Header'
import Footer from './footer/Footer'
import QuestionPage from './components/QuestionPage';
import Home from "./Home.jsx";


function App() {
  
  return (
    <>
      
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
              path="/questions/:id"
              element={<QuestionPage/>}
          />
        </Routes>
      </Router>
      <Footer />
    </>
  )
}

export default App
