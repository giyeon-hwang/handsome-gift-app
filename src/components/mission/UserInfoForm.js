// src/components/mission/UserInfoForm.js
import React, { useState } from 'react';

/**
 * 사용자의 이름과 휴대폰 번호 끝 4자리를 입력받는 폼 컴포넌트.
 * @param {{onSubmit: (data: {name: string, phone: string}) => void}} props
 */
function UserInfoForm({ onSubmit }) {
  // 폼 입력값을 관리하는 상태
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // 오류 메시지를 관리하는 상태
  const [error, setError] = useState('');

  /**
   * '다음' 버튼 클릭 시 호출되는 제출 핸들러.
   * @param {React.FormEvent<HTMLFormElement>} e - 폼 이벤트 객체
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 것을 방지

    // 간단한 유효성 검사
    if (!name.trim()) {
      setError('참가자 이름을 입력해주세요.');
      return;
    }
    if (!phone.trim() || !/^\d{4}$/.test(phone.trim())) {
      setError('휴대폰 번호 끝 4자리를 정확히 입력해주세요.');
      return;
    }

    // 오류가 없으면 에러 메시지를 초기화하고 부모 컴포넌트로 데이터를 전달
    setError('');
    onSubmit({ name: name.trim(), phone: phone.trim() });
  };
  
  // 간단한 인라인 스타일
  const styles = {
    container: {
      maxWidth: '400px',
      margin: '50px auto',
      padding: '30px',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      textAlign: 'center',
      fontFamily: 'sans-serif'
    },
    title: {
      marginBottom: '25px',
      color: '#333'
    },
    formGroup: {
      marginBottom: '20px',
      textAlign: 'left'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#555'
    },
    input: {
      width: '100%',
      padding: '12px',
      fontSize: '1rem',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '14px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: 'white',
      backgroundColor: '#007bff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginTop: '10px'
    },
    error: {
      color: 'red',
      marginTop: '15px',
      height: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>핸섬에게 선물 보내기</h1>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>참가자 이름</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            placeholder="이름을 입력하세요"
            maxLength="20"
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="phone" style={styles.label}>휴대폰 번호 끝 4자리</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
            placeholder="숫자 4자리"
            maxLength="4"
            pattern="\d{4}"
          />
        </div>
        <button type="submit" style={styles.button}>다음</button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
}

export default UserInfoForm;
