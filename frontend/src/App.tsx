import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import SelfieAdvisorPage from './pages/SelfieAdvisorPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--dark-800)',
            color: 'var(--text-primary)',
            border: '1px solid var(--dark-600)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        {/* Selfie Advisor demoted to /labs — not in main nav (Module 9) */}
        <Route path="/selfie" element={<SelfieAdvisorPage />} />
        <Route path="/labs" element={<SelfieAdvisorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
