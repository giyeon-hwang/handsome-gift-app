// src/components/console/SubmissionList.js
import React from 'react';

/**
 * 제출된 선물 목록을 UI에 표시하는 컴포넌트.
 * @param {{
 * submissions: Array<{id: string, userName: string, userPhone: string, selectedGift: string, createdAt: any}>,
 * onReset: () => void,
 * loading: boolean,
 * error: string | null
 * }} props
 */
function SubmissionList({ submissions, onReset, loading, error }) {

  // 간단한 인라인 스타일
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '40px auto',
      padding: '20px 30px',
      fontFamily: 'sans-serif',
      backgroundColor: '#f9f9f9',
      border: '1px solid #ddd',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '2px solid #eee',
      paddingBottom: '15px',
      marginBottom: '20px'
    },
    title: {
      color: '#2c3e50',
      margin: 0
    },
    resetButton: {
      padding: '8px 15px',
      fontSize: '0.9rem',
      color: 'white',
      backgroundColor: '#e74c3c',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    list: {
      listStyleType: 'none',
      padding: 0
    },
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '15px 10px',
      borderBottom: '1px solid #eee',
      backgroundColor: '#fff',
      marginBottom: '8px',
      borderRadius: '6px'
    },
    gift: {
      fontWeight: '600',
      color: '#34495e',
      flex: '2 1 0'
    },
    user: {
      color: '#7f8c8d',
      flex: '1 1 0',
      textAlign: 'right'
    },
    statusMessage: {
      textAlign: 'center',
      padding: '50px 20px',
      color: '#7f8c8d',
      fontSize: '1.1rem'
    }
  };

  // 로딩 중일 때 표시할 UI
  if (loading) {
    return <div style={styles.container}><p style={styles.statusMessage}>데이터를 불러오는 중입니다...</p></div>;
  }

  // 에러가 발생했을 때 표시할 UI
  if (error) {
    return <div style={styles.container}><p style={styles.statusMessage} role="alert">{error}</p></div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>핸섬에게 온 선물 목록</h1>
        <button onClick={onReset} style={styles.resetButton} aria-label="모든 선물 기록 초기화">
          리스트 초기화
        </button>
      </header>
      
      {submissions.length === 0 ? (
        <p style={styles.statusMessage}>아직 도착한 선물이 없습니다.</p>
      ) : (
        <ul style={styles.list}>
          {submissions.map((item) => (
            <li key={item.id} style={styles.listItem}>
              <span style={styles.gift}>{item.selectedGift}</span>
              <span style={styles.user}>{item.userName} ({item.userPhone})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SubmissionList;
