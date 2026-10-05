import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  MapPin,
  Layers,
  HardDrive,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User } from '../types';

export const ProfilePage: React.FC = () => {
  const { user: initialUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(initialUser);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get<User>('/api/auth/me');
        setProfile(res.data);
      } catch (err) {
        console.warn('Using local authenticated profile state', err);
      }
    };
    fetchMe();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const displayName = profile?.user_name || initialUser?.user_name || 'Farmer';
  const displayEmail = profile?.email_address || initialUser?.email_address || 'Registered Operator';

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Floating Card: Welcome & Session Status */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#edf6ee] border border-[#d2e8d3] text-[#2c6e3b] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#2c6e3b]" />
              <span>2FA Verified Session</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Welcome, {displayName}
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

        {/* Side-by-Side Floating Cards */}
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
                    {profile?.id || initialUser?.id || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500 font-medium">Full Name:</span>
                  <span className="font-semibold text-slate-800">{displayName}</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500 font-medium">Email Address:</span>
                  <span className="font-semibold text-slate-800">{displayEmail}</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500 font-medium">Phone Number:</span>
                  <span className="font-semibold text-slate-800">
                    {profile?.phone_number || initialUser?.phone_number || 'Not registered'}
                  </span>
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
                  <span className="font-semibold text-slate-800">
                    {profile?.account_status || 'Active'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500 font-medium">Member Since:</span>
                  <span className="font-semibold text-slate-800">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Security & Authentication Status */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-lg mb-6">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Security & Authentication</span>
              </div>

              <div className="space-y-4 text-sm divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500 font-medium">Authentication Mode:</span>
                  <span className="font-semibold text-slate-800">Email OTP 2-Factor</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500 font-medium">Session Protection:</span>
                  <span className="text-emerald-700 font-semibold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Active & Secured</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500 font-medium">Password Storage:</span>
                  <span className="font-semibold text-slate-800">Bcrypt Salted Hash</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500 font-medium">Data Transmission:</span>
                  <span className="font-semibold text-slate-800">End-to-End TLS / HTTPS</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-slate-500 font-medium">Access Token:</span>
                  <span className="text-slate-600 font-mono text-xs flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Protected & Hidden</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Session Window: <span className="font-semibold text-slate-700">Active</span>
              </div>
              <div className="flex items-center space-x-1 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Encrypted Connection</span>
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
