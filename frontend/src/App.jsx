import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import LandingPage from './components/landing/LandingPage';
import DashboardHome from './components/dashboard/DashboardHome';
import ScanPlant from './components/scan/ScanPlant';
import AnalysisResult from './components/analysis/AnalysisResult';
import TreatmentPlan from './components/treatment/TreatmentPlan';
import HistoryDashboard from './components/history/HistoryDashboard';
import ProfileSettings from './components/profile/ProfileSettings';
import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';
import OTPEntryModal from './components/auth/OTPEntryModal';
import { authService } from './services/auth';

export default function App() {
  const [user, setUser] = useState(authService.getStoredUser());
  const [currentTab, setCurrentTab] = useState(user ? 'home' : 'landing');
  const [scanDefaultMode, setScanDefaultMode] = useState('camera');
  const [activeDiagnosis, setActiveDiagnosis] = useState(null);

  // Auth Modals State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [twoFASessionId, setTwoFASessionId] = useState('');
  const [twoFAIdentifier, setTwoFAIdentifier] = useState('');

  // Sync auth state across tabs and windows
  useEffect(() => {
    const handleAuthChange = () => {
      const stored = authService.getStoredUser();
      setUser(stored);
      if (!stored && currentTab !== 'landing') {
        setCurrentTab('landing');
      }
    };

    window.addEventListener('plant_aid_auth_changed', handleAuthChange);
    return () => window.removeEventListener('plant_aid_auth_changed', handleAuthChange);
  }, [currentTab]);

  // Auth handlers
  const handleOpenLogin = () => {
    setIsRegisterOpen(false);
    setIs2FAOpen(false);
    setIsLoginOpen(true);
  };

  const handleOpenRegister = () => {
    setIsLoginOpen(false);
    setIs2FAOpen(false);
    setIsRegisterOpen(true);
  };

  const handleChallenge2FA = (sessionId, identifier) => {
    setIsLoginOpen(false);
    setTwoFASessionId(sessionId);
    setTwoFAIdentifier(identifier);
    setIs2FAOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    setIs2FAOpen(false);
    const updatedUser = authService.getStoredUser();
    setUser(updatedUser);
    setCurrentTab('home');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentTab('landing');
  };

  // Diagnosis navigation handlers
  const handleOpenScanWithCamera = () => {
    setScanDefaultMode('camera');
    setCurrentTab('scan');
  };

  const handleOpenScanWithUpload = () => {
    setScanDefaultMode('upload');
    setCurrentTab('scan');
  };

  const handleDiagnosisComplete = (result) => {
    setActiveDiagnosis(result);
    setCurrentTab('analysis');
  };

  const handleSelectDiagnosisFromHistory = (item) => {
    setActiveDiagnosis(item);
    setCurrentTab('analysis');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row">
      {/* If Landing Page mode, render standalone landing */}
      {currentTab === 'landing' ? (
        <div className="w-full">
          <LandingPage
            onGetStarted={() => {
              if (user) {
                setCurrentTab('home');
              } else {
                handleOpenLogin();
              }
            }}
            onLogin={handleOpenLogin}
          />
        </div>
      ) : (
        <>
          {/* Desktop Left Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              if (tab === 'login') {
                handleOpenLogin();
              } else {
                setCurrentTab(tab);
              }
            }}
            user={user}
            onLogout={handleLogout}
          />

          {/* Main App Container */}
          <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-8">
            {/* Mobile Header */}
            <Header
              user={user}
              onOpenProfile={() => setCurrentTab('profile')}
              onOpenNotifications={() => alert('No new notifications')}
            />

            {/* Dynamic Tab Views */}
            <main className="flex-1 flex flex-col">
              {currentTab === 'home' && (
                <DashboardHome
                  user={user}
                  onOpenScanCamera={handleOpenScanWithCamera}
                  onOpenScanUpload={handleOpenScanWithUpload}
                  onViewAllHistory={() => setCurrentTab('history')}
                  onSelectDiagnosis={handleSelectDiagnosisFromHistory}
                />
              )}

              {currentTab === 'scan' && (
                <ScanPlant
                  defaultMode={scanDefaultMode}
                  onDiagnosisComplete={handleDiagnosisComplete}
                />
              )}

              {currentTab === 'analysis' && (
                <AnalysisResult
                  diagnosis={activeDiagnosis}
                  onViewTreatment={() => setCurrentTab('treatment')}
                  onScanAnother={() => setCurrentTab('scan')}
                  onBack={() => setCurrentTab('home')}
                />
              )}

              {currentTab === 'treatment' && (
                <TreatmentPlan
                  diagnosis={activeDiagnosis}
                  onBack={() => setCurrentTab('analysis')}
                />
              )}

              {currentTab === 'history' && (
                <HistoryDashboard
                  onBack={() => setCurrentTab('home')}
                  onSelectDiagnosis={handleSelectDiagnosisFromHistory}
                />
              )}

              {(currentTab === 'profile' || currentTab === 'settings') && (
                <ProfileSettings
                  user={user}
                  onBack={() => setCurrentTab('home')}
                  onLogout={handleLogout}
                />
              )}

              {currentTab === 'notifications' && (
                <div className="max-w-xl mx-auto w-full px-4 py-8 text-center space-y-3">
                  <h2 className="text-xl font-bold">Notifications</h2>
                  <p className="text-xs text-slate-500">You are all caught up! No active crop disease alerts in your area.</p>
                  <button onClick={() => setCurrentTab('home')} className="text-xs font-bold text-brand-700">Back to Dashboard</button>
                </div>
              )}
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav
              currentTab={currentTab}
              onSelectTab={(tab) => setCurrentTab(tab)}
            />
          </div>
        </>
      )}

      {/* Authentication Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={handleOpenRegister}
        onChallenge2FA={handleChallenge2FA}
        onLoginSuccess={handleAuthSuccess}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={handleOpenLogin}
        onChallenge2FA={handleChallenge2FA}
        onRegisterSuccess={handleAuthSuccess}
      />

      <OTPEntryModal
        isOpen={is2FAOpen}
        sessionId={twoFASessionId}
        identifier={twoFAIdentifier}
        onClose={() => setIs2FAOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
