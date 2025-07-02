// src/pages/MissionPage.js
import React, { useState } from 'react';
import UserInfoForm from '../components/mission/UserInfoForm';
import MissionScreen from '../components/mission/MissionScreen';

/**
 * '핸섬에게 선물 보내기' 미션의 전체 흐름을 관리하는 페이지 컴포넌트.
 * 사용자의 정보 입력 단계와 실제 미션 수행 단계를 전환합니다.
 */
function MissionPage() {
  // 현재 진행 단계를 관리하는 상태 ('form': 정보 입력, 'mission': 미션 수행)
  const [step, setStep] = useState('form');
  // 사용자가 입력한 정보를 저장하는 상태
  const [userInfo, setUserInfo] = useState({ name: '', phone: '' });

  /**
   * 사용자 정보 폼(UserInfoForm)에서 '다음' 버튼을 눌렀을 때 호출되는 핸들러.
   * @param {object} data - { name: string, phone: string } 형태의 사용자 정보 객체.
   */
  const handleFormSubmit = (data) => {
    setUserInfo(data);
    setStep('mission');
  };

  /**
   * 미션 수행 화면(MissionScreen)에서 '뒤로가기' 버튼을 눌렀을 때 호출되는 핸들러.
   * 이전 단계인 정보 입력 폼으로 돌아갑니다.
   */
  const handleGoBack = () => {
    setStep('form');
  };

  return (
    <div>
      {step === 'form' ? (
        // 'form' 단계일 경우, 사용자 정보 입력 폼을 렌더링합니다.
        <UserInfoForm onSubmit={handleFormSubmit} />
      ) : (
        // 'mission' 단계일 경우, 실제 미션 수행 화면을 렌더링합니다.
        <MissionScreen userInfo={userInfo} onGoBack={handleGoBack} />
      )}
    </div>
  );
}

export default MissionPage;
