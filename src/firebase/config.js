// src/firebase/config.js

// Firebase에서 필요한 함수들을 가져옵니다.
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// --- Firebase 프로젝트 설정 ---
// 이 부분에 자신의 Firebase 프로젝트의 웹 앱 구성 객체를 붙여넣으세요.
// Firebase 콘솔 > 프로젝트 설정 > 일반 > 내 앱 에서 확인할 수 있습니다.
const firebaseConfig = {
  apiKey: "AIzaSyBGXV5wrmX31NN7Bb7VEjniIcB3oEdYdKo",
  authDomain: "handsome-gift-app.firebaseapp.com",
  projectId: "handsome-gift-app",
  storageBucket: "handsome-gift-app.firebasestorage.app",
  messagingSenderId: "85433205763",
  appId: "1:85433205763:web:58f209c8732f48cae97a36",
  measurementId: "G-DMPCVQGQCL"
};

// Firebase 앱을 초기화합니다.
// 이 작업은 애플리케이션 전체에서 한 번만 수행하면 됩니다.
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 인스턴스를 가져옵니다.
// 이 'db' 객체를 통해 데이터를 읽고 쓸 수 있습니다.
const db = getFirestore(app);

// 다른 파일에서 Firestore 인스턴스를 사용할 수 있도록 export 합니다.
export { db };
