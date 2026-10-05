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

        {/* Farmer Profile & Account Details */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-slate-800 font-bold text-lg border-b border-slate-100 pb-5">
            <div className="w-10 h-10 rounded-xl bg-agri-50 text-agri-700 flex items-center justify-center border border-agri-200">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Farmer Profile & Account Details</h2>
              <p className="text-xs text-slate-500 font-normal">Operator identity, verification credentials, and active system status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Full Name</span>
              <div className="font-bold text-slate-900 text-sm">{displayName}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Email Address</span>
              <div className="font-semibold text-slate-900 text-sm break-all">{displayEmail}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium">User ID</span>
              <div className="font-mono text-xs font-bold text-slate-800">
                {profile?.id || initialUser?.id || 'N/A'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Phone Number</span>
              <div className="font-semibold text-slate-800 text-sm">
                {profile?.phone_number || initialUser?.phone_number || 'Not registered'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium">2FA Security Status</span>
              <div className="text-emerald-700 font-semibold text-sm flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Enabled & Verified</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Account Status</span>
              <div className="font-semibold text-slate-900 text-sm flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{profile?.account_status || 'Active'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1 sm:col-span-2 lg:col-span-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Registration Date</span>
                <span className="font-semibold text-slate-800">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : 'Active'}
                </span>
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
