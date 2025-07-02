// src/hooks/useScreenReaderSimulator.js
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * React 컴포넌트 내에서 스크린 리더 동작(탐색, 실행, 음성 안내)을 시뮬레이션하는 커스텀 훅.
 * ESLint exhaustive-deps 오류를 해결하고 함수를 안정화했습니다.
 * @param {React.RefObject<HTMLElement>} containerRef - 시뮬레이션을 적용할 DOM 요소의 ref.
 * @param {boolean} isActive - 훅의 활성화 여부를 제어합니다.
 */
export function useScreenReaderSimulator(containerRef, isActive) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const focusableElementsRef = useRef([]);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);
  const [koreanVoice, setKoreanVoice] = useState(null);
  const isIOS = useRef(false);

  // 컴포넌트 마운트 시 OS를 감지하고 음성 목록을 로드합니다.
  useEffect(() => {
    const platform = navigator.platform?.toLowerCase() || "";
    const userAgent = navigator.userAgent?.toLowerCase() || "";
    isIOS.current = /iphone|ipad|ipod/.test(userAgent) || (platform === 'macintel' && navigator.maxTouchPoints > 1);
    
    const loadVoices = () => {
      let voices = [];
      try {
        voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return; // 음성 목록이 아직 로드되지 않았을 수 있음
      } catch (error) {
        console.error("음성 목록을 가져오는 데 실패했습니다:", error);
        return;
      }

      let foundVoice = null;
      
      // --- OS별 최적화된 한국어 음성 검색 ---
      if (isIOS.current) {
        // iOS: '유나' 또는 'Yuna' 음성을 우선적으로 검색
        foundVoice = voices.find(v => v.lang === 'ko-KR' && v.name === '유나') ||
                     voices.find(v => v.lang === 'ko-KR' && v.name === 'Yuna');
      }
      
      // iOS에서 못 찾았거나 다른 OS일 경우, 일반적인 방법으로 검색
      if (!foundVoice) {
        foundVoice = voices.find(v => v.lang === 'ko-KR' && v.default) ||
                     voices.find(v => v.lang === 'ko-KR' && v.localService) ||
                     voices.find(v => v.lang === 'ko-KR');
      }

      if (foundVoice) {
        setKoreanVoice(foundVoice);
      } else {
        console.warn("사용 가능한 한국어 음성을 찾지 못했습니다.");
      }
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.2;
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }
    try {
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.error("음성 출력 중 오류 발생:", error);
    }
  }, [koreanVoice]); // koreanVoice가 변경될 때만 이 함수가 새로 생성됩니다.

  const getElementInfo = useCallback((element) => {
    if (!element) return { text: '', role: '', state: '' };
    const roleMap = { 'button': '버튼', 'radio': '라디오 버튼', 'a': '링크' };
    let text = element.getAttribute('aria-label') || element.textContent.trim();
    let role = '';
    let state = '';
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'button' || tagName === 'a') {
      role = roleMap[tagName];
    } else if (tagName === 'input' && element.type === 'radio') {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) text = label.textContent.trim();
      role = roleMap.radio;
      state = element.checked ? '선택됨' : '';
    }
    return { text, role, state };
  }, []); // 의존성이 없으므로 처음 한 번만 생성됩니다.
  
  const speakElementInfo = useCallback((element) => {
      if (!element) return;
      const { text, role, state } = getElementInfo(element);
      // 예: "선택됨, 모든 햄버거 평생 무제한 교환권, 라디오 버튼"
      const fullText = [state, text, role].filter(Boolean).join(', ');
      speak(fullText);
  }, [getElementInfo, speak]); // getElementInfo나 speak 함수가 변경될 때만 새로 생성됩니다.

  // 시뮬레이션 활성화/비활성화에 따른 이벤트 리스너 관리
  useEffect(() => {
    if (!isActive || !containerRef.current) {
      window.speechSynthesis.cancel();
      return;
    }

    const elements = Array.from(
      containerRef.current.querySelectorAll('a[href], button, input[type="radio"]')
    );
    focusableElementsRef.current = elements;
    setCurrentIndex(-1);

    const handleKeyDown = (e) => {
      if (elements.length === 0) return;
      let newIndex = currentIndex;
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        newIndex = (currentIndex + 1) % elements.length;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        newIndex = (currentIndex - 1 + elements.length) % elements.length;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentIndex >= 0) {
          elements[currentIndex]?.click();
        }
        return;
      }

      if (newIndex !== currentIndex && elements[newIndex]) {
        setCurrentIndex(newIndex);
        speakElementInfo(elements[newIndex]);
      }
    };

    const handleTouchStart = (e) => {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartRef.current.x;
      const deltaY = touchEndY - touchStartRef.current.y;

      // 스와이프 감지 (수평 움직임이 더 크고, 일정 거리 이상일 때)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
        if (deltaX < 0) { // 왼쪽으로 스와이프 (다음 요소)
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        } else { // 오른쪽으로 스와이프 (이전 요소)
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
        }
        return;
      }

      // 더블 탭 감지
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapRef.current;
      if (tapLength < 300 && tapLength > 0) {
        e.preventDefault();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      }
      lastTapRef.current = currentTime;
    };

    document.addEventListener('keydown', handleKeyDown);
    const currentRef = containerRef.current;
    currentRef.addEventListener('touchstart', handleTouchStart, { passive: false });
    currentRef.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (currentRef) {
        currentRef.removeEventListener('touchstart', handleTouchStart);
        currentRef.removeEventListener('touchend', handleTouchEnd);
      }
      window.speechSynthesis.cancel();
    };
  }, [isActive, containerRef, currentIndex, speakElementInfo]); // 의존성 배열에 speakElementInfo 추가
}
