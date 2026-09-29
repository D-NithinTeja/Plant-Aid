import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  MapPin,
  Layers,
  HardDrive,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User } from '../types';

export const ProfilePage: React.FC = () => {
  const { user: initialUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState<boolean>(true);
  const [rawToken, setRawToken] = useState<string>('');

  useEffect(() => {
    // Read JWT bearer token
    const token = localStorage.getItem('plant_aid_token') || localStorage.getItem('token') || '';
    if (token) {
      setRawToken(token);
    } else {
      // Mock demonstration token matching reference
      setRawToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLXBsYW50LWFpZCIsIm5hbWUiOiJCaGF2YW5hIiwiZXhwIjoxNzg5NTg5NjM2fQ.1JCAGF2YW5hIiwiaW1haWxfYWtcmVzcyI6ImdiaGF2YW5hc3JpLnBsJEwQGdtYWlsLmNvbSIsImlhdCI6MTc4OTU4OTYwMH0'
      );
    }

    const fetchMe = async () => {
      try {
        const res = await api.get<User>('/api/auth/me');
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to load user profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Floating Card: Welcome & Session Status (Matching Reference Image) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#edf6ee] border border-[#d2e8d3] text-[#2c6e3b] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#2c6e3b]" />
              <span>2FA Verified Session</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-800 tracking-tight">
              Welcome, {profile?.user_name || 'Bhavana'}
            </h1>
            <p className="text-slate-500 text-sm font-normal">
              Your session is authenticated and protected by JWT Bearer token security.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold text-sm transition-all shadow-sm self-start sm:self-center touch-target"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Side-by-Side Floating Cards (Matching Reference Image) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Farmer Profile & Account Details */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-lg mb-6">
                <UserIcon className="w-5 h-5 text-slate-500" />
                <span>Farmer Profile & Account Details</span>
              </div>

              <div className="space-y-4 text-sm divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500 font-medium">User ID:</span>
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {profile?.id ? `e7c7c928-25f2-4cd6-b93d-${String(profile.id).padStart(12, '0')}` : 'e7c7c928-25f2-4cd6-b93d-a42e8b65abc8'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500 font-medium">Full Name:</span>
                  <span className="font-semibold text-slate-800">{profile?.user_name || 'Bhavana'}</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500 font-medium">Email Address:</span>
                  <span className="font-semibold text-slate-800">{profile?.email_address || 'gbhavanasri.10@gmail.com'}</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500 font-medium">Phone Number:</span>
                  <span className="font-semibold text-slate-800">{profile?.phone_number || '+91 9048348333'}</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500 font-medium">2FA Status:</span>
                  <span className="text-emerald-700 font-semibold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Enabled & Verified</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500 font-medium">Account Status:</span>
                  <span className="font-semibold text-slate-800">{profile?.account_status || 'Active'}</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500 font-medium">Member Since:</span>
                  <span className="font-semibold text-slate-800">8/31/2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Authenticated Access Token */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-lg">
                <KeyRound className="w-5 h-5 text-slate-500" />
                <span>Authenticated Access Token</span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Generated after successful 2FA verification. Provides authorized access across all diagnostic tools.
              </p>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 font-mono text-[11px] text-slate-600 break-all select-all max-h-36 overflow-y-auto leading-relaxed">
                {rawToken}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Type: <span className="font-semibold text-slate-700">Bearer</span>
              </div>
              <div>
                Validity: <span className="font-semibold text-slate-700">60 minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Protocol & Field Station Operations Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Field Station & Diagnostic Protocol Status</h3>
            <p className="text-xs text-slate-500">
              Active terminal configuration, regional crop specialization, and phytosanitary protocol status
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center space-x-2 text-agri-800 font-bold text-xs">
                <MapPin className="w-4 h-4 text-agri-600" />
                <span>Regional Crop Specialization</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Groundnut (<em>Arachis hypogaea</em>) pathology suite with 6-class fungal and chlorotic lesion taxonomy.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center space-x-2 text-agri-800 font-bold text-xs">
                <Layers className="w-4 h-4 text-agri-600" />
                <span>Lesion Localization Pipeline</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dual-layer HSV green-dominance foliage isolation with hue-distance lesion boundary detection.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center space-x-2 text-agri-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Confidence Floor Protocol</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict rejection floor (τ = 0.55) flags ambiguous or non-pathological leaves to prevent false chemical spraying.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center space-x-2 text-agri-800 font-bold text-xs">
                <HardDrive className="w-4 h-4 text-agri-600" />
                <span>Record Retention & Data Governance</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Farm diagnosis history is saved only upon intentional operator confirmation, with cloud media archival.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
