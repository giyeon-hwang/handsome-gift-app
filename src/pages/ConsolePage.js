// src/pages/ConsolePage.js
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/config';
import { collection, query, onSnapshot, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { TOP_GIFTS } from '../constants/gifts';
import SubmissionList from '../components/console/SubmissionList';

/**
 * 관리자가 미션 제출 현황을 실시간으로 확인하는 콘솔 페이지.
 */
function ConsolePage() {
  // 제출된 데이터 목록을 관리하는 상태
  const [submissions, setSubmissions] = useState([]);
  // 로딩 및 오류 상태를 관리
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 스크린 리더에게 실시간으로 전달할 메시지
  const [liveMessage, setLiveMessage] = useState('');
  // 이전 제출 목록의 ID를 저장하여 새로운 제출을 감지하는 데 사용
  const prevSubmissionIds = useRef(new Set());

  // 컴포넌트가 마운트될 때 Firestore 리스너를 설정
  useEffect(() => {
    // 'submissions' 컬렉션을 'createdAt' 필드 기준으로 오름차순 정렬하여 쿼리
    const q = query(collection(db, 'submissions'), orderBy('createdAt', 'asc'));

    // onSnapshot을 사용하여 실시간으로 데이터 변경을 감지
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newSubmissions = [];
      querySnapshot.forEach((doc) => {
        newSubmissions.push({ id: doc.id, ...doc.data() });
      });

      // 새로 들어온 제출 건이 있는지 확인
      if (newSubmissions.length > prevSubmissionIds.current.size) {
        const latestSubmission = newSubmissions[newSubmissions.length - 1];
        // 이전에 없던 제출 건일 경우
        if (latestSubmission && !prevSubmissionIds.current.has(latestSubmission.id)) {
          const { userName, selectedGift } = latestSubmission;
          const rank = TOP_GIFTS.indexOf(selectedGift) + 1;
          
          let message;
          if (rank > 0) {
            // 핸섬이 원하는 선물일 경우
            message = `축하합니다! ${userName}님이 ${rank}순위 선물, ${selectedGift}을(를) 보냈습니다.`;
          } else {
            // 그 외 선물일 경우
            message = `${userName}님이 ${selectedGift}을(를) 보냈습니다.`;
          }
          setLiveMessage(message);
        }
      }

      setSubmissions(newSubmissions);
      // 현재 제출 목록의 ID를 저장
      prevSubmissionIds.current = new Set(newSubmissions.map(s => s.id));
      setLoading(false);
    }, (err) => {
      // 오류 처리
      console.error("데이터를 불러오는 중 오류 발생:", err);
      setError("데이터를 불러오는 데 실패했습니다.");
      setLoading(false);
    });

    // 컴포넌트가 언마운트될 때 리스너를 정리(unsubscribe)
    return () => unsubscribe();
  }, []); // 이 useEffect는 처음 마운트될 때 한 번만 실행

  /**
   * 모든 제출 데이터를 삭제하는 함수
   */
  const handleReset = async () => {
    if (!window.confirm("정말로 모든 제출 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      const submissionsRef = collection(db, 'submissions');
      const querySnapshot = await getDocs(submissionsRef);
      
      if (querySnapshot.empty) {
        alert("삭제할 데이터가 없습니다.");
        return;
      }
      
      // Batch 쓰기를 사용하여 여러 문서를 한 번에 삭제
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      setLiveMessage("모든 데이터가 초기화되었습니다.");
      alert("모든 데이터가 성공적으로 초기화되었습니다.");

    } catch (err) {
      console.error("데이터 초기화 중 오류 발생:", err);
      alert("데이터 초기화에 실패했습니다. 콘솔을 확인해주세요.");
      setLiveMessage("데이터 초기화에 실패했습니다.");
    }
  };
  
  // 스크린 리더만 읽을 수 있는 스타일
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
    <div>
      <SubmissionList
        submissions={submissions}
        onReset={handleReset}
        loading={loading}
        error={error}
      />
      {/* 스크린 리더를 위한 실시간 알림 영역 */}
      <div aria-live="assertive" style={visuallyHiddenStyle}>
        {liveMessage}
      </div>
    </div>
  );
}

export default ConsolePage;
