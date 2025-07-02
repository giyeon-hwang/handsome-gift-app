// src/components/mission/MissionScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { useScreenReaderSimulator } from '../../hooks/useScreenReaderSimulator';
import { GIFT_LIST } from '../../constants/gifts';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * 실제 미션을 수행하는 화면. 모든 UI 요소는 시각적으로 보이지 않습니다.
 * 스크린 리더 시뮬레이션이 활성화되어 음성과 제스처로만 상호작용합니다.
 * @param {{
 * userInfo: {name: string, phone: string},
 * onGoBack: () => void
 * }} props
 */
function MissionScreen({ userInfo, onGoBack }) {
  // 시뮬레이터를 적용할 컨테이너의 ref
  const missionContainerRef = useRef(null);
  // 이 컴포넌트가 활성화될 때 스크린 리더 시뮬레이터 훅을 실행합니다.
  useScreenReaderSimulator(missionContainerRef, true);

  // 사용자가 선택한 선물을 관리하는 상태
  const [selectedGift, setSelectedGift] = useState('');
  // 데이터 제출 상태를 관리 ('idle', 'submitting', 'success', 'error')
  const [status, setStatus] = useState('idle');
  // aria-live 영역에 표시될 메시지를 관리
  const [liveMessage, setLiveMessage] = useState('');

  /**
   * '선물 보내기' 버튼이 (시뮬레이션을 통해) 클릭되었을 때 호출되는 핸들러.
   * @param {React.FormEvent<HTMLFormElement>} e - 폼 이벤트 객체
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedGift) {
      // 선물을 선택하지 않았을 경우, 사용자에게 알림
      setLiveMessage('선물을 먼저 선택해주세요.');
      // 잠시 후 메시지 초기화
      setTimeout(() => setLiveMessage(''), 2000);
      return;
    }

    setStatus('submitting');
    setLiveMessage('선물을 전송하고 있습니다.');

    try {
      // Firestore 'submissions' 컬렉션에 새로운 문서를 추가합니다.
      await addDoc(collection(db, 'submissions'), {
        userName: userInfo.name,
        userPhone: userInfo.phone,
        selectedGift: selectedGift,
        createdAt: serverTimestamp() // 서버의 시간을 기준으로 타임스탬프 기록
      });
      setStatus('success');
      setLiveMessage('선물 보내기가 완료되었습니다. 뒤로가기 버튼을 이용해 이전 화면으로 돌아갈 수 있습니다.');
    } catch (error) {
      console.error("Firestore 데이터 추가 중 오류 발생: ", error);
      setStatus('error');
      setLiveMessage('선물 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 컴포넌트가 처음 렌더링될 때 시작 안내 메시지를 설정합니다.
  useEffect(() => {
    setLiveMessage('미션 화면입니다. 좌우로 탐색하여 선물을 선택하고, 선물 보내기 버튼을 활성화하세요.');
    // 안내 메시지가 충분히 읽힐 시간을 준 뒤 초기화
    const timer = setTimeout(() => setLiveMessage(''), 4000);
    return () => clearTimeout(timer);
  }, []);

  // 모든 요소를 시각적으로 숨기는 스타일
  const invisibleStyle = {
    opacity: 0,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden' // 스크롤바 등도 보이지 않도록 처리
  };
  
  // 스크린 리더는 읽을 수 있지만, 시각적으로는 보이지 않는 스타일
  const visuallyHiddenStyle = {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px',
  };

  return (
    <div ref={missionContainerRef} style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 이 div 안의 모든 요소는 시각적으로 보이지 않게 됩니다. */}
      <div style={invisibleStyle}>
        {/* 성공 후에는 뒤로가기만 가능하도록 설정 */}
        {status !== 'success' ? (
          <form onSubmit={handleSubmit}>
            <button type="button" onClick={onGoBack} aria-label="뒤로가기">뒤로가기</button>
            <fieldset>
              <legend>선물 목록</legend>
              {GIFT_LIST.map((gift, index) => (
                <div key={index}>
                  <input
                    type="radio"
                    id={`gift-${index}`}
                    name="gift"
                    value={gift}
                    checked={selectedGift === gift}
                    onChange={(e) => setSelectedGift(e.target.value)}
                  />
                  <label htmlFor={`gift-${index}`}>{gift}</label>
                </div>
              ))}
            </fieldset>
            <button type="submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? '전송 중' : '선물 보내기'}
            </button>
          </form>
        ) : (
           <button type="button" onClick={onGoBack} aria-label="뒤로가기">뒤로가기</button>
        )}
      </div>
      
      {/* 스크린 리더를 위한 실시간 알림 영역 */}
      <div aria-live="assertive" style={visuallyHiddenStyle}>
        {liveMessage}
      </div>
    </div>
  );
}

export default MissionScreen;
