import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  LogOut,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
  Wifi,
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

  useEffect(() => {
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
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-agri-700 text-xs font-bold uppercase tracking-wider">
              <UserIcon className="w-4 h-4" />
              <span>Agronomist Profile & Security</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Account & Diagnostics
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs transition-colors self-start sm:self-auto touch-target"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-agri-800 to-agri-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {profile?.user_name ? profile.user_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{profile?.user_name || 'Agronomist'}</h2>
              <p className="text-xs text-slate-500 font-mono">User ID #{profile?.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {profile?.email_address || '—'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone Number</span>
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {profile?.phone_number || 'Not configured'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Two-Factor Authentication</span>
              </div>
              <div className="text-sm font-bold text-emerald-700 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Active (OTP Guarded)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Status</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {profile?.account_status || 'ACTIVE'}
              </div>
            </div>
          </div>
        </div>

        {/* Field Station Operations */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Field Station & Agronomic Operations</h3>
            <p className="text-xs text-slate-600">
              Active terminal configuration, regional crop specialization, and phytosanitary protocol status
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-agri-800 font-bold text-xs">
                <MapPin className="w-4 h-4 text-agri-600" />
                <span>Regional Crop Specialization</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Groundnut (*Arachis hypogaea*) pathology suite with 6-class fungal and chlorotic lesion taxonomy.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-agri-800 font-bold text-xs">
                <Layers className="w-4 h-4 text-agri-600" />
                <span>Lesion Localization Pipeline</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Dual-layer HSV green-dominance foliage isolation with hue-distance lesion boundary detection.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-agri-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Confidence Floor Protocol</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Strict rejection floor (τ = 0.55) flags ambiguous or non-pathological leaves to prevent false chemical spraying.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-agri-800 font-bold text-xs">
                <HardDrive className="w-4 h-4 text-agri-600" />
                <span>Record Retention & Data Governance</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Farm diagnosis history is saved only upon intentional operator confirmation, with cloud media archival.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
