import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GameTracker from './pages/GameTracker'; 

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/tracker" element={<GameTracker />} /> 
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);
