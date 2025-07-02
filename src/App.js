// src/App.js
import React from 'react';
import MissionPage from './pages/MissionPage';
import ConsolePage from './pages/ConsolePage';
import './App.css';

function App() {
  // URL 경로가 '/console'을 포함하는지 확인하여 콘솔 페이지를 보여줍니다.
  // GitHub Pages에서는 주소가 조금 복잡해지므로 '/console' 포함 여부로 확인하는 것이 안정적입니다.
  const isConsolePage = window.location.pathname.includes('/console');

  return (
    <div className="App">
      {isConsolePage ? <ConsolePage /> : <MissionPage />}
    </div>
  );
}

export default App;
