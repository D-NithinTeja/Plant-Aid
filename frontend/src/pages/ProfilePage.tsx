import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  MapPin,
  Layers,
  HardDrive,
  Calendar,
  Phone,
  Mail,
  Fingerprint,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Surface } from '../components/ui/Surface';

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
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Unified Operator Header Console */}
        <Surface className="p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-emerald-950/10">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-agri-700 to-agri-900 text-white flex items-center justify-center font-extrabold text-2xl shadow-md select-none">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {displayName}
                  </h1>
                  <Badge variant="optimal">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>2FA Verified</span>
                  </Badge>
                </div>
                <p className="text-slate-600 text-sm font-medium">
                  {displayEmail}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="self-start sm:self-center"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Sign Out</span>
            </Button>
          </div>

          {/* Operator Profile Details Matrix */}
          <div className="pt-8 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-agri-900/70">
              Operator Credentials & Station Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-white/60 border border-emerald-950/5 flex items-start space-x-3">
                <Fingerprint className="w-5 h-5 text-agri-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Operator ID
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-800 truncate">
                    {profile?.id || initialUser?.id || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/60 border border-emerald-950/5 flex items-start space-x-3">
                <Mail className="w-5 h-5 text-agri-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Contact Email
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {displayEmail}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/60 border border-emerald-950/5 flex items-start space-x-3">
                <Phone className="w-5 h-5 text-agri-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Registered Phone
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    {profile?.phone_number || initialUser?.phone_number || 'Not registered'}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/60 border border-emerald-950/5 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Security Layer
                  </div>
                  <div className="text-xs font-semibold text-emerald-800 flex items-center space-x-1">
                    <span>Email OTP 2FA Active</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/60 border border-emerald-950/5 flex items-start space-x-3">
                <Activity className="w-5 h-5 text-agri-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Account Status
                  </div>
                  <div className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{profile?.account_status || 'Active'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/60 border border-emerald-950/5 flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-agri-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Member Since
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : 'Active'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Surface>

        {/* Diagnostic Station & Phytosanitary Protocol */}
        <Surface className="p-8 sm:p-10 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Diagnostic Protocol & Field Station Configuration
            </h2>
            <p className="text-xs text-slate-600">
              Active terminal parameters, edge classifier calibration, and record archival governance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/60 border border-emerald-950/5 space-y-1.5">
              <div className="flex items-center space-x-2 text-agri-800 font-bold text-xs">
                <MapPin className="w-4 h-4 text-agri-600" />
                <span>Regional Crop Specialization</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Groundnut (<em>Arachis hypogaea</em>) pathology suite with 6-class fungal and chlorotic lesion taxonomy.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/60 border border-emerald-950/5 space-y-1.5">
              <div className="flex items-center space-x-2 text-agri-800 font-bold text-xs">
                <Layers className="w-4 h-4 text-agri-600" />
                <span>Lesion Localization Pipeline</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dual-layer HSV green-dominance foliage isolation with hue-distance lesion boundary detection.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/60 border border-emerald-950/5 space-y-1.5">
              <div className="flex items-center space-x-2 text-agri-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Confidence Floor Protocol</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rejection threshold (τ = 0.55) flags ambiguous or non-pathological leaves to prevent false chemical spraying.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/60 border border-emerald-950/5 space-y-1.5">
              <div className="flex items-center space-x-2 text-agri-800 font-bold text-xs">
                <HardDrive className="w-4 h-4 text-agri-600" />
                <span>Record Retention & Data Governance</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Farm diagnosis history is saved only upon intentional operator confirmation, with local storage fallback.
              </p>
            </div>
          </div>
        </Surface>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
