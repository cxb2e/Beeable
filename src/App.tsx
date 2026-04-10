import React, { useState, useEffect, useRef } from 'react';
import { auth, signInWithGoogle, logout, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  writeBatch,
  where,
  limit,
  increment
} from 'firebase/firestore';
import {
  UserProfile,
  GameResult,
  SpeakingAttempt,
  WritingCheck,
  TheoryItem,
  GameQuestion,
  SpeakingPrompt,
  WritingTopic,
  UserTask
} from './types';
import {
  LEXICAL_KNOWLEDGE,
  TECHNICAL_TERMINOLOGIES,
  GRAMMAR_STRUCTURES,
  GAME_QUESTIONS,
  SPEAKING_PROMPTS,
  WRITING_TOPICS,
  DICTATION_SENTENCES
} from './constants';
import {
  RANKS,
  SPEAKING_LEVEL_CONFIG,
  WRITING_LEVEL_CONFIG,
  getRank
} from './levels';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  FileText,
  Crown,
  CheckSquare,
  Trophy,
  Settings,
  Flame,
  Rocket,
  Search,
  Music,
  Plus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LogIn,
  BookOpen,
  Gamepad2,
  Mic,
  PenTool,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  Trash2,
  Edit2,
  Save,
  X,
  Menu,
  Search as SearchIcon,
  ChevronDown,
  ChevronUp,
  Award,
  ShieldCheck,
  Clock,
  History,
  Heart,
  Volume2,
  BarChart3,
  Check,
  FileUp,
  Download,
  Truck,
  Brain
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { GoogleGenAI, Type } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';

// --- Error Boundary ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error && parsed.error.includes('permission-denied')) {
          errorMessage = 'Bạn không có quyền thực hiện thao tác này. Vui lòng kiểm tra lại tài khoản.';
        }
      } catch (e) {
        // Not a JSON error
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100 dark:border-red-900/30">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Oops! Có lỗi xảy ra</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-8">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-brand-indigo text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Header Navigation ---
const HeaderMenu = ({ activeTab, setActiveTab, isAdmin, isOpen, setIsOpen }: {
  activeTab: string,
  setActiveTab: (tab: string) => void,
  isAdmin: boolean,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void
}) => {
  const menuItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'leaderboard', label: 'Xếp hạng', icon: Crown },
    { id: 'tasks', label: 'Nhiệm vụ', icon: CheckSquare },
  ];

  const aboutItem = { id: 'about', label: 'Về chúng tôi', icon: Heart };

  const exploreItems = [
    { id: 'expeditions', label: 'Thám hiểm', icon: Rocket },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'speaking', label: 'Phát âm', icon: Mic },
    { id: 'writing', label: 'Luyện viết', icon: PenTool },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Giáo viên', icon: ShieldCheck });
  }

  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const isExploreActive = exploreItems.some(item => item.id === activeTab);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
    setIsExploreOpen(false);
  };

  return (
    <>
      <nav className="hidden lg:flex items-center gap-2 overflow-visible py-2 relative z-50">
        {menuItems.slice(0, 1).map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelectTab(item.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold whitespace-nowrap',
              activeTab === item.id
                ? 'bg-brand-indigo text-black shadow-lg shadow-orange-500/20'
                : 'text-orange-100/80 hover:text-orange-100 hover:bg-orange-500/15'
            )}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}

        <div
          className="relative inline-flex z-50"
          onMouseEnter={() => setIsExploreOpen(true)}
          onMouseLeave={() => setIsExploreOpen(false)}
        >
          <button
            onClick={() => setIsExploreOpen(prev => !prev)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold whitespace-nowrap',
              isExploreActive
                ? 'bg-brand-indigo text-black shadow-lg shadow-orange-500/20'
                : 'text-orange-100/80 hover:text-orange-100 hover:bg-orange-500/15'
            )}
          >
            <Rocket size={16} />
            <span>Khám phá</span>
            <ChevronDown size={14} className={cn('transition-transform', isExploreOpen ? 'rotate-180' : '')} />
          </button>

          <div className={cn(
            'absolute left-0 top-[calc(100%+10px)] w-56 rounded-2xl border border-orange-500/30 bg-[#121212] shadow-2xl overflow-hidden z-[120] transition-all duration-150',
            isExploreOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'
          )}>
            {exploreItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-bold transition-all',
                  activeTab === item.id
                    ? 'bg-orange-500/20 text-orange-100'
                    : 'text-orange-100/80 hover:bg-orange-500/15 hover:text-orange-100'
                )}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {menuItems.slice(1).map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelectTab(item.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold whitespace-nowrap',
              activeTab === item.id
                ? 'bg-brand-indigo text-black shadow-lg shadow-orange-500/20'
                : 'text-orange-100/80 hover:text-orange-100 hover:bg-orange-500/15'
            )}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}

        <button
          onClick={() => handleSelectTab(aboutItem.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold whitespace-nowrap',
            activeTab === aboutItem.id
              ? 'bg-brand-indigo text-black shadow-lg shadow-orange-500/20'
              : 'text-orange-100/80 hover:text-orange-100 hover:bg-orange-500/15'
          )}
        >
          <aboutItem.icon size={16} />
          <span>{aboutItem.label}</span>
        </button>
      </nav>

      {isOpen && (
        <div className="lg:hidden border-t border-orange-500/20 mt-2 pt-3 pb-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-3 rounded-xl transition-all text-sm font-bold',
                  activeTab === item.id
                    ? 'bg-brand-indigo text-black'
                    : 'bg-[#1a1a1a] text-orange-100/80 hover:bg-orange-500/15'
                )}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}

            <div className="col-span-2 rounded-xl border border-orange-500/20 bg-[#121212] p-2">
              <button
                onClick={() => setIsExploreOpen(prev => !prev)}
                className={cn(
                  'w-full flex items-center justify-between gap-2 px-3 py-3 rounded-lg transition-all text-sm font-bold',
                  isExploreActive ? 'bg-orange-500/20 text-orange-100' : 'text-orange-100/80 hover:bg-orange-500/15'
                )}
              >
                <span className="flex items-center gap-2">
                  <Rocket size={16} />
                  Khám phá
                </span>
                <ChevronDown size={14} className={cn('transition-transform', isExploreOpen ? 'rotate-180' : '')} />
              </button>

              {isExploreOpen && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {exploreItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-3 rounded-lg transition-all text-sm font-bold',
                        activeTab === item.id
                          ? 'bg-brand-indigo text-black'
                          : 'bg-[#1a1a1a] text-orange-100/80 hover:bg-orange-500/15'
                      )}
                    >
                      <item.icon size={14} />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleSelectTab(aboutItem.id)}
              className={cn(
                'col-span-2 flex items-center justify-center gap-2 px-3 py-3 rounded-xl transition-all text-sm font-bold',
                activeTab === aboutItem.id
                  ? 'bg-brand-indigo text-black'
                  : 'bg-[#1a1a1a] text-orange-100/80 hover:bg-orange-500/15'
              )}
            >
              <aboutItem.icon size={16} />
              {aboutItem.label}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
/*
              {menuItems.map((item) => (
  XCircle,
  RefreshCw,
  AlertCircle,
  Trash2,
  Edit2,
  Save,
  X,
  Menu,
  Search as SearchIcon,
  ChevronDown,
  ChevronUp,
  Award,
  ShieldCheck,
  Clock,
  History,
  Heart,
  Volume2,
  BarChart3,
  Check,
  FileUp,
  Download,
  Truck,
  Brain
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { GoogleGenAI, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';

// --- Error Boundary ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error && parsed.error.includes("permission-denied")) {
          errorMessage = "Bạn không có quyền thực hiện thao tác này. Vui lòng kiểm tra lại tài khoản.";
        }
      } catch (e) {
        // Not a JSON error
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100 dark:border-red-900/30">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Oops! Có lỗi xảy ra</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-8">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-brand-indigo text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Header Navigation ---
const HeaderMenu = ({ activeTab, setActiveTab, isAdmin, isOpen, setIsOpen }: { 
  activeTab: string, 
  setActiveTab: (tab: string) => void,
  isAdmin: boolean,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void
}) => {
  const menuItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'about', label: 'Về chúng tôi', icon: Heart },
    { id: 'expeditions', label: 'Thám hiểm', icon: Rocket },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'speaking', label: 'Phát âm', icon: Mic },
    { id: 'writing', label: 'Luyện viết', icon: PenTool },
    { id: 'leaderboard', label: 'Xếp hạng', icon: Crown },
    { id: 'tasks', label: 'Nhiệm vụ', icon: CheckSquare },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Giáo viên', icon: ShieldCheck });
  }

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      <nav className="hidden lg:flex items-center gap-2 overflow-x-auto py-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelectTab(item.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold whitespace-nowrap",
              activeTab === item.id 
                ? "bg-brand-indigo text-black shadow-lg shadow-orange-500/20" 
                : "text-orange-100/80 hover:text-orange-100 hover:bg-orange-500/15"
            )}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {isOpen && (
        <div className="lg:hidden border-t border-orange-500/20 mt-2 pt-3 pb-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-3 rounded-xl transition-all text-sm font-bold",
                  activeTab === item.id
                    ? "bg-brand-indigo text-black"
                    : "bg-[#1a1a1a] text-orange-100/80 hover:bg-orange-500/15"
                )}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}

            <div className="col-span-2 rounded-xl border border-orange-500/20 bg-[#121212] p-2">
              <button
                onClick={() => setIsExploreOpen(prev => !prev)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-3 rounded-lg transition-all text-sm font-bold",
                  isExploreActive ? "bg-orange-500/20 text-orange-100" : "text-orange-100/80 hover:bg-orange-500/15"
                )}
              >
                <span className="flex items-center gap-2">
                  <Rocket size={16} />
                  Khám phá
                </span>
                <ChevronDown size={14} className={cn("transition-transform", isExploreOpen ? "rotate-180" : "")} />
              </button>

              {isExploreOpen && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {exploreItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-3 rounded-lg transition-all text-sm font-bold",
                        activeTab === item.id
                          ? "bg-brand-indigo text-black"
                          : "bg-[#1a1a1a] text-orange-100/80 hover:bg-orange-500/15"
                      )}
                    >
                      <item.icon size={14} />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </>
  );
};
*/

// --- Level Up Modal ---
const LevelUpModal = ({ level, type, onClose }: { level: number, type: 'speaking' | 'writing', onClose: () => void }) => {
  const config = type === 'speaking' ? SPEAKING_LEVEL_CONFIG[level - 1] : WRITING_LEVEL_CONFIG[level - 1];
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-yellow via-brand-pink to-brand-indigo" />
        <div className="text-8xl mb-6 animate-bounce">{config.icon}</div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">LEVEL UP!</h2>
        <p className="text-xl font-bold text-brand-indigo mb-6">Bạn đã đạt cấp độ {level}: {config.title}</p>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl mb-8 border-2 border-slate-100 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-2">Thử thách mới:</p>
          <p className="text-lg font-black text-slate-800 dark:text-white">{config.description}</p>
        </div>

        <button 
          onClick={onClose}
          className="cute-button-primary w-full py-4 text-xl"
        >
          Tiếp tục hành trình
        </button>
      </motion.div>
    </motion.div>
  );
};

const BeeableBanner = () => {
  const hexStyle = {
    clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)'
  } as React.CSSProperties;

  return (
    <section className="relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] border border-orange-500/20 bg-[#070707] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14 shadow-[0_20px_80px_rgba(255,138,0,0.18)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,153,31,0.28),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(255,190,92,0.22),transparent_22%),radial-gradient(circle_at_70%_80%,rgba(255,138,0,0.16),transparent_25%),linear-gradient(135deg,rgba(255,138,0,0.08),transparent_40%)]" />
      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-[-1.5rem] top-8 h-24 w-24 border border-orange-400/30" style={hexStyle} />
        <div className="absolute left-12 top-2 h-16 w-16 border border-orange-300/25" style={hexStyle} />
        <div className="absolute left-24 top-24 h-20 w-20 border border-orange-400/25" style={hexStyle} />
        <div className="absolute right-8 top-6 h-28 w-28 border border-orange-300/20" style={hexStyle} />
        <div className="absolute right-24 bottom-8 h-20 w-20 border border-orange-400/20" style={hexStyle} />
      </div>

      <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 text-center lg:text-left">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.45em] text-orange-300/80">Beeable</p>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[0.95] text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500">Beeable</span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base lg:text-lg font-medium leading-relaxed text-orange-100/75 lg:mx-0">
            Nền tảng ESP tích hợp AI cho học tập chuyên ngành, được thiết kế để biến nhu cầu học thực tế thành kết quả rõ ràng và đo được.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative h-48 w-full max-w-md sm:h-56 lg:h-64">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-orange-500/20 via-transparent to-amber-300/10 blur-2xl" />
            <div className="absolute left-4 top-6 grid grid-cols-4 gap-3 opacity-80">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 w-10 border-2 border-orange-400/70 bg-black/30"
                  style={hexStyle}
                />
              ))}
            </div>
            <div className="absolute right-6 top-10 flex flex-col items-center gap-2">
              <div className="h-5 w-16 rounded-full bg-orange-400/90 shadow-[0_0_24px_rgba(255,153,31,0.7)]" />
              <div className="h-4 w-14 rounded-full bg-orange-400/80" />
              <div className="h-3 w-12 rounded-full bg-orange-400/70" />
              <div className="h-2 w-10 rounded-full bg-orange-400/60" />
            </div>
            <div className="absolute bottom-4 right-2 text-right">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-300/80">AI Powered</p>
              <p className="text-2xl sm:text-3xl font-black text-white">Logistics</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AboutUsView = ({ user, onGoHome }: { user: User | null, onGoHome: () => void }) => {
  const teamMembers = [
    'Nguyễn Đình Huỳnh',
    'Trần Thị Thùy Dương',
    'Nguyễn Hoàng Bảo'
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="cute-card p-8 lg:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/15 text-orange-200 border border-orange-500/20 text-sm font-bold uppercase tracking-widest">
            Về chúng tôi
          </div>

          <div className="space-y-3 max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Beeable - nền tảng ESP tích hợp AI cho học tập chuyên ngành
            </h1>
            <p className="text-lg lg:text-xl text-slate-300 leading-relaxed max-w-3xl">
              Chúng tôi đang tham gia nghiên cứu khoa học và cuộc thi ResFes 2026 với đề tài:
              <span className="text-orange-300 font-bold"> From Needs to Outcomes: Evaluating "Beeable" - an AI-integrated ESP Learing Platform.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-orange-500/20 bg-black/40 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-orange-300 mb-2">Nhóm</p>
              <p className="text-2xl font-black text-white">Beeable</p>
            </div>
            <div className="rounded-2xl border border-orange-500/20 bg-black/40 p-5 md:col-span-2">
              <p className="text-xs font-black uppercase tracking-widest text-orange-300 mb-2">Đề tài</p>
              <p className="text-lg font-bold text-white leading-relaxed">
                From Needs to Outcomes: Evaluating "Beeable" - an AI-integrated ESP Learing Platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="cute-card p-8 space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white">Thành viên nhóm</h2>
            <p className="text-sm text-slate-400 mt-1">Ba gương mặt chính của Beeable</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {teamMembers.map((member, index) => {
            const initials = member
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map(part => part[0])
              .join('')
              .toUpperCase();

            // const titles = [
             
            // ];

            return (
              <div
                key={member}
                className="rounded-[2.5rem] border border-white/10 bg-white/5 p-6 lg:p-8 text-center shadow-xl shadow-black/10 hover:-translate-y-1 transition-transform"
              >
                <div className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-orange-300 via-orange-500 to-amber-600 p-[4px] shadow-2xl shadow-orange-500/20">
                  <div className="w-full h-full rounded-full bg-[#111111] flex items-center justify-center text-white font-black text-2xl tracking-wide overflow-hidden">
                    <span>{initials}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <p className="font-black text-white text-xl leading-tight">{member}</p>
                  {/* <p className="text-xs uppercase tracking-[0.25em] text-orange-300 font-bold">{titles[index]}</p> */}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cute-card p-8 space-y-6">
          <h2 className="text-2xl font-black text-white">Mục tiêu nghiên cứu</h2>
          <p className="text-slate-300 leading-relaxed">
            Beeable được xây dựng để hỗ trợ người học ESP bằng trải nghiệm học tập tương tác,
            cá nhân hóa và có phản hồi AI, hướng đến việc biến nhu cầu học thực tế thành kết quả học tập đo được.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-xs font-black uppercase tracking-widest text-orange-300 mb-1">Định hướng</p>
              <p className="font-bold text-white">Nghiên cứu khoa học ứng dụng</p>
            </div>
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-xs font-black uppercase tracking-widest text-orange-300 mb-1">Sự kiện</p>
              <p className="font-bold text-white">ResFes 2026</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={onGoHome} className="cute-button-primary">
              Quay về trang chủ
            </button>
            {!user && (
              <button onClick={signInWithGoogle} className="px-5 py-3 rounded-2xl font-bold border border-orange-500/30 text-orange-100 hover:bg-orange-500/10 transition-all">
                Đăng nhập để trải nghiệm
              </button>
            )}
          </div>
        </div>
    </div>
  );
};

// --- Logistics Challenge View ---
const LogisticsChallenge = ({ userId, userProfile }: { userId: string, userProfile: UserProfile | null }) => {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string, feedback?: string, score?: number }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [turnCount, setTurnCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [mode, setMode] = useState<'chat' | 'call'>('chat');
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [isNoSpeechDetected, setIsNoSpeechDetected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const MAX_TURNS = 5;

  useEffect(() => {
    if (messages.length === 0) {
      startChallenge();
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-play AI voice in call mode
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (mode === 'call' && isCallStarted && lastMessage?.role === 'ai' && !isAnalyzing && !isCompleted) {
      playAudio(lastMessage.text, true);
    }
  }, [messages, mode, isCallStarted]);

  const startChallenge = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "You are an expert in Logistics. Start a short conversation with a student. Begin with a friendly greeting and a simple introductory question (like asking for their name or their background). Do not jump into logistics topics immediately. Use simple English suitable for high school or college students. Avoid complex jargon. Keep it short and professional. Language: English.",
      });
      const text = response.text || "Hello! I'm your logistics mentor. Before we dive in, could you tell me your name and what brings you to the world of logistics today?";
      setMessages([{ role: 'ai', text }]);
    } catch (error) {
      console.error("Error starting logistics challenge:", error);
      setMessages([{ role: 'ai', text: "Hello! I'm your logistics mentor. Let's start by getting to know each other. What is your name?" }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRecording = (autoSubmit = false) => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome hoặc Edge.");
        return;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.continuous = false;
      
      recognition.onstart = () => {
        setIsRecording(true);
        setIsNoSpeechDetected(false);
      };
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (event: any) => {
        const error = event.error;
        console.error("Speech recognition error:", error);
        setIsRecording(false);
        
        if (error === 'no-speech') {
          setIsNoSpeechDetected(true);
          // If in call mode, try listening again automatically after a short delay
          if (autoSubmit && mode === 'call' && !isCompleted) {
            console.log("No speech detected in call mode, restarting listener...");
            setTimeout(() => {
              if (mode === 'call' && !isCompleted && !isAnalyzing) {
                startRecording(true);
              }
            }, 1500);
          }
        }
      };
      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        if (autoSubmit) {
          submitAnswer(result);
        } else {
          setTranscript(result);
        }
      };

      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setIsRecording(false);
    }
  };

  const submitAnswer = async (textOverride?: string) => {
    const userMessage = textOverride || transcript;
    if (!userMessage || isAnalyzing) return;
    
    setTranscript('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsAnalyzing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const history = messages.map(m => `${m.role === 'ai' ? 'AI' : 'User'}: ${m.text}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an expert in Logistics having a conversation with a student.
Context of conversation:
${history}

User's latest answer: "${userMessage}"

Task:
1. Evaluate the user's answer (accuracy, vocabulary, grammar).
2. Provide a score (0-100).
3. Provide short feedback in Vietnamese.
4. If this is the beginning of the conversation, continue with friendly small talk or ask about their interest in logistics.
5. Gradually transition into logistics topics as the conversation progresses.
6. Use simple English suitable for high school or college students. Avoid overly advanced vocabulary or complex technical concepts.
7. Keep your responses short and conversational (1-2 sentences).
8. If turn count < ${MAX_TURNS}, ask a follow-up question.
9. If turn count >= ${MAX_TURNS}, provide a concluding summary and end the conversation.

Return the result in JSON format: 
{ 
  "feedback": "Feedback in Vietnamese", 
  "score": number, 
  "nextQuestion": "The AI's response or question in English",
  "isEnd": boolean
}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              feedback: { type: Type.STRING },
              score: { type: Type.NUMBER },
              nextQuestion: { type: Type.STRING },
              isEnd: { type: Type.BOOLEAN }
            },
            required: ["feedback", "score", "nextQuestion", "isEnd"]
          }
        }
      });

      if (!response.text) throw new Error("Empty AI response");
      const result = JSON.parse(response.text);
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].feedback = result.feedback;
        newMessages[newMessages.length - 1].score = result.score;
        newMessages.push({ role: 'ai', text: result.nextQuestion });
        return newMessages;
      });

      setTurnCount(prev => prev + 1);
      
      // Give XP per turn for immediate feedback
      if (userId) {
        try {
          await updateDoc(doc(db, 'users', userId), {
            xp: increment(20),
            coins: increment(5)
          });
          console.log("XP and Coins updated successfully");
        } catch (e) {
          console.error("Failed to update XP:", e);
        }
      }

      if (result.isEnd || turnCount + 1 >= MAX_TURNS) {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Error in logistics challenge:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I encountered an error. Could you please repeat that or try again?" }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playAudio = (text: string, autoListen = false) => {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.onend = () => {
        if (autoListen && mode === 'call' && !isCompleted) {
          startRecording(true);
        }
      };
      utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e);
        if (autoListen && mode === 'call' && !isCompleted) {
          startRecording(true);
        }
      };
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Failed to play audio:", e);
      if (autoListen && mode === 'call' && !isCompleted) {
        startRecording(true);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-brand-indigo rounded-[2rem] flex items-center justify-center text-white shadow-xl">
            <Truck size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-brand-indigo">Logistics 1:1</h2>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Đối thoại trực tiếp với chuyên gia AI</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm">
          <button 
            onClick={() => setMode('chat')}
            className={cn(
              "px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
              mode === 'chat' ? "bg-brand-indigo text-white shadow-md" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Chat
          </button>
          <button 
            onClick={() => setMode('call')}
            className={cn(
              "px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
              mode === 'call' ? "bg-brand-indigo text-white shadow-md" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Call 1:1
          </button>
        </div>
      </div>

      {mode === 'call' && !isCompleted ? (
        <div className="cute-card p-12 text-center space-y-12 bg-gradient-to-b from-brand-indigo to-indigo-900 text-white border-none min-h-[500px] flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-pink rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
          </div>

          {!isCallStarted ? (
            <div className="relative z-10 space-y-8">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto border-4 border-white/30">
                <Brain size={48} />
              </div>
              <h3 className="text-3xl font-black">Sẵn sàng gọi cho chuyên gia?</h3>
              <p className="text-white/70 font-bold max-w-md mx-auto">
                Trong chế độ này, bạn sẽ đối thoại trực tiếp bằng giọng nói. Hãy đảm bảo bạn đang ở nơi yên tĩnh.
              </p>
              <button 
                onClick={() => {
                  setIsCallStarted(true);
                  if (messages.length > 0) {
                    playAudio(messages[0].text, true);
                  }
                }}
                className="cute-button-primary bg-white text-brand-indigo hover:bg-slate-100 px-12 py-5 text-xl"
              >
                Bắt đầu cuộc gọi
              </button>
            </div>
          ) : (
            <div className="relative z-10 space-y-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/30 animate-pulse">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-brand-indigo shadow-2xl">
                    <Brain size={48} />
                  </div>
                </div>
                <h3 className="text-2xl font-black">Logistics Expert</h3>
                <div className="flex items-center gap-2 px-4 py-1 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  Đang trực tuyến
                </div>
              </div>

              <div className="max-w-xl mx-auto">
                <p className="text-2xl font-bold leading-relaxed italic opacity-90">
                  "{messages[messages.length - 1]?.text}"
                </p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
                  isRecording ? "bg-red-500 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.5)]" : "bg-white/20"
                )}>
                  {isAnalyzing ? (
                    <RefreshCw size={40} className="animate-spin" />
                  ) : isRecording ? (
                    <Mic size={40} className="animate-bounce" />
                  ) : (
                    <div className="w-4 h-4 bg-white rounded-full" />
                  )}
                </div>
                <p className="font-black uppercase text-sm tracking-widest opacity-70">
                  {isAnalyzing ? "AI đang lắng nghe..." : isNoSpeechDetected ? "Tôi chưa nghe thấy bạn nói gì..." : isRecording ? "Hãy nói đi, tôi đang nghe..." : "Chờ AI phản hồi..."}
                </p>
                {isNoSpeechDetected && (
                  <button 
                    onClick={() => startRecording(true)}
                    className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full text-xs font-black uppercase tracking-widest animate-bounce"
                  >
                    Thử nói lại
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-10">
            <button 
              onClick={() => {
                setIsCallStarted(false);
                setMode('chat');
              }}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl font-black transition-all"
            >
              Chuyển sang Chat
            </button>
          </div>
        </div>
      ) : (
        <div className="cute-card p-0 overflow-hidden flex flex-col h-[600px]">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-slate-50/50 dark:bg-slate-900/20"
          >
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: msg.role === 'ai' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  msg.role === 'ai' ? "self-start" : "self-end items-end"
                )}
              >
                <div className={cn(
                  "p-6 rounded-3xl font-bold text-lg shadow-sm relative",
                  msg.role === 'ai' 
                    ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700" 
                    : "bg-brand-indigo text-white rounded-tr-none"
                )}>
                  {msg.text}
                  {msg.role === 'user' && msg.score !== undefined && (
                    <div className="absolute -top-3 -right-3 bg-brand-pink text-white text-[10px] px-2 py-1 rounded-full shadow-lg animate-bounce">
                      +20 XP
                    </div>
                  )}
                  {msg.role === 'ai' && (
                    <button 
                      onClick={() => playAudio(msg.text)}
                      className="ml-3 text-brand-indigo hover:scale-110 transition-all"
                    >
                      <Volume2 size={18} />
                    </button>
                  )}
                </div>
                
                {msg.feedback && (
                  <div className="mt-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-emerald-700 dark:text-emerald-400 uppercase text-[10px] tracking-widest">Phản hồi AI</span>
                      <span className="font-black text-emerald-600">Điểm: {msg.score}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 font-medium">{msg.feedback}</p>
                  </div>
                )}
              </motion.div>
            ))}
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-brand-indigo font-bold animate-pulse">
                <RefreshCw size={16} className="animate-spin" />
                AI đang suy nghĩ...
              </div>
            )}
          </div>

          {!isCompleted ? (
            <div className="p-8 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Nói hoặc nhập câu trả lời của bạn..."
                    className="w-full p-5 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-brand-indigo outline-none font-bold pr-16"
                    onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                  />
                  <button 
                    onClick={() => startRecording()}
                    className={cn(
                      "absolute right-3 top-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      isRecording ? "bg-red-500 text-white animate-pulse" : "bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-brand-indigo"
                    )}
                  >
                    <Mic size={20} />
                  </button>
                </div>
                <button 
                  onClick={() => submitAnswer()}
                  disabled={!transcript || isAnalyzing}
                  className="px-8 bg-brand-indigo text-white rounded-2xl font-black shadow-lg shadow-indigo-100 dark:shadow-none hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  Gửi
                </button>
              </div>
              <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Gợi ý: Hãy sử dụng các thuật ngữ như Supply Chain, Inventory, Warehouse, Transportation...
              </p>
            </div>
          ) : (
            <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Trophy size={32} />
              </div>
              <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">Thử thách hoàn tất!</h4>
              <p className="text-emerald-600 dark:text-emerald-500 font-bold">Bạn đã nhận được +100 XP và +25 Coins.</p>
              <button 
                onClick={() => window.location.reload()}
                className="cute-button-primary px-8 py-3"
              >
                Làm lại thử thách
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Home View ---
const HomeView = ({ user, userProfile, tasks, setActiveTab }: { 
  user: User | null, 
  userProfile: UserProfile | null, 
  tasks: UserTask[],
  setActiveTab: (tab: string) => void
}) => {
  const priorityTask = tasks.find(t => !t.completed);
  const rank = userProfile ? getRank(userProfile.xp) : RANKS[0];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <BeeableBanner />

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-pink rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-100">
            <Rocket size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none">Beeable</h1>
            <p className="text-[10px] font-bold text-brand-pink uppercase tracking-widest">AI-integrated ESP Platform</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <Trophy size={18} className="text-brand-indigo" />
            <span className="font-black text-slate-700 dark:text-slate-200">{userProfile?.xp || 0} XP</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <Flame size={18} className="fill-orange-500 text-orange-500" />
            <span className="font-black text-slate-700 dark:text-slate-200">{userProfile?.streak || 0}</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <Award size={18} className="text-brand-yellow" />
            <span className="font-black text-slate-700 dark:text-slate-200">{userProfile?.coins || 0}</span>
          </div>
          {userProfile?.photoURL && (
            <img src={userProfile.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-brand-pink" referrerPolicy="no-referrer" />
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cute-card p-6 bg-gradient-to-br from-brand-indigo to-indigo-600 text-white border-none shadow-indigo-200 dark:shadow-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Trophy size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Cấp bậc hiện tại</p>
            <h3 className="text-2xl font-black flex items-center gap-2">
              {rank.icon} {rank.label}
            </h3>
            <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-1000" 
                style={{ width: `${Math.min(100, (userProfile?.xp || 0) / (RANKS[rank.level]?.minXp || (userProfile?.xp || 1) * 2) * 100)}%` }} 
              />
            </div>
            <p className="text-[10px] mt-2 font-bold opacity-80">{userProfile?.xp || 0} XP / {RANKS[rank.level]?.minXp || 'MAX'} XP</p>
          </div>
        </div>

        <div className="cute-card p-6 bg-white dark:bg-slate-800 border-2 border-brand-soft-pink dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phát âm</p>
            <span className="text-xl">{SPEAKING_LEVEL_CONFIG[(userProfile?.speakingLevel || 1) - 1].icon}</span>
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white">Level {userProfile?.speakingLevel || 1}</h3>
          <div className="mt-4 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-brand-indigo h-full transition-all duration-1000" 
              style={{ width: `${((userProfile?.speakingProgress || 0) / SPEAKING_LEVEL_CONFIG[(userProfile?.speakingLevel || 1) - 1].requirement) * 100}%` }} 
            />
          </div>
          <p className="text-[10px] mt-2 font-bold text-brand-indigo uppercase">
            {userProfile?.speakingProgress || 0} / {SPEAKING_LEVEL_CONFIG[(userProfile?.speakingLevel || 1) - 1].requirement} câu hoàn thành
          </p>
        </div>

        <div className="cute-card p-6 bg-white dark:bg-slate-800 border-2 border-brand-soft-pink dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Luyện viết</p>
            <span className="text-xl">{WRITING_LEVEL_CONFIG[(userProfile?.writingLevel || 1) - 1].icon}</span>
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white">Level {userProfile?.writingLevel || 1}</h3>
          <div className="mt-4 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-brand-pink h-full transition-all duration-1000" 
              style={{ width: `${((userProfile?.writingProgress || 0) / WRITING_LEVEL_CONFIG[(userProfile?.writingLevel || 1) - 1].requirement) * 100}%` }} 
            />
          </div>
          <p className="text-[10px] mt-2 font-bold text-brand-pink uppercase">
            {userProfile?.writingProgress || 0} / {WRITING_LEVEL_CONFIG[(userProfile?.writingLevel || 1) - 1].requirement} bài hoàn thành
          </p>
        </div>
      </div>

      {/* Priority Task Card */}
      <div className="bg-gradient-to-br from-[#6366F1] to-[#818CF8] p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden shadow-xl shadow-indigo-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10">
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Rocket size={14} /> Mission Control
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4 break-words">
            {priorityTask ? priorityTask.title : "System Optimized. All clear."}
          </h2>
          <p className="text-white/90 font-medium mb-6">
            {priorityTask ? "Tiếp tục hành trình chinh phục thuật ngữ IT hôm nay!" : "Bạn đã hoàn thành tất cả nhiệm vụ chuyên ngành."}
          </p>
          <button 
            onClick={() => setActiveTab(priorityTask ? 'tasks' : 'expeditions')}
            className="bg-white text-brand-indigo px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-50 transition-all"
          >
            {priorityTask ? "Execute" : "Explore More"}
          </button>
        </div>
        <Rocket className="absolute right-3 sm:right-8 bottom-3 sm:bottom-8 text-white/20 w-20 h-20 sm:w-32 sm:h-32 -rotate-12 animate-float" />
      </div>

      {/* Activity Ticker */}
      <div className="bg-[#E9F7F2] p-3 rounded-2xl border border-[#D1F0E4] flex items-center gap-3 overflow-hidden">
        <div className="bg-white p-1.5 rounded-lg shadow-sm">
          <RefreshCw size={16} className="text-[#34D399]" />
        </div>
        <div className="flex-1 whitespace-nowrap overflow-hidden">
          <div className="flex gap-8 animate-marquee">
            <p className="text-sm font-medium text-[#065F46]">
              🔥 <span className="font-bold">Quỳnh Trang</span> vừa hoàn thành: Ôn tập câu sai Ngữ pháp
            </p>
            <p className="text-sm font-medium text-[#065F46]">
              🔥 <span className="font-bold">Minh Anh</span> vừa đạt: 950/990 Tech Master Test 1
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Nhập từ vựng cần tra cứu..." 
          className="w-full pl-14 pr-24 py-5 bg-[#FFF9E5] text-slate-900 dark:text-white placeholder-slate-400 rounded-3xl border-2 border-[#FFF0B3] focus:border-brand-yellow focus:ring-0 transition-all font-medium"
        />
        <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-brand-pink px-6 py-2 rounded-xl font-bold shadow-sm border border-brand-soft-pink">
          Tìm
        </button>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button onClick={() => setActiveTab('expeditions')} className="cute-card p-8 flex flex-col items-center text-center gap-4 group">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <BookOpen size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Từ vựng IT</h3>
            <p className="text-xs text-brand-indigo dark:text-indigo-400 font-bold">Mở khóa thuật toán</p>
          </div>
        </button>

        <button onClick={() => setActiveTab('expeditions')} className="cute-card p-8 flex flex-col items-center text-center gap-4 group">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <PenTool size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Kỹ thuật</h3>
            <p className="text-xs text-brand-indigo dark:text-indigo-400 font-bold">Tài liệu chuyên sâu</p>
          </div>
        </button>

        <button className="cute-card p-8 flex flex-col items-center text-center gap-4 group">
          <div className="w-16 h-16 bg-pink-50 dark:bg-pink-900/20 rounded-2xl flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
            <Heart size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Đã lưu</h3>
            <p className="text-xs text-brand-indigo dark:text-indigo-400 font-bold">0 từ, 0 câu, 0 note</p>
          </div>
        </button>

        <button onClick={() => setActiveTab('profile')} className="cute-card p-8 flex flex-col items-center text-center gap-4 group">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
            <Trophy size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Hồ Sơ</h3>
            <p className="text-xs text-brand-indigo dark:text-indigo-400 font-bold">Thành tích & Lịch sử</p>
          </div>
        </button>
      </div>

      {/* Large Exam CTA */}
      <button onClick={() => setActiveTab('expeditions')} className="cute-card p-6 lg:p-12 w-full flex flex-col items-center gap-6 group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <div className="bg-brand-yellow text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">NEW MISSION</div>
        </div>
        <div className="w-16 h-16 lg:w-24 lg:h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
          <Rocket size={40} className="lg:w-12 lg:h-12" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl lg:text-3xl font-black mb-2 dark:text-white">Thám Hiểm Chuyên Ngành</h2>
          <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400">Chinh phục kho tàng thuật ngữ IT, Y khoa, Kỹ thuật...</p>
        </div>
      </button>

      {/* Music Player Mock */}
      <div className="bg-[#FFF9E5] dark:bg-yellow-900/20 p-6 rounded-3xl border border-[#FFF0B3] dark:border-yellow-900/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
            <Music size={24} className="text-brand-yellow" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-brand-pink flex flex-wrap items-center gap-2">
              Vi Vu - MASON NGUYỄN ft CONGB, WOKEUP
              <span className="bg-brand-yellow/20 text-brand-yellow text-[10px] px-2 py-0.5 rounded-full">User Rcm</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">"V"</p>
          </div>
        </div>
        <button className="self-end sm:self-auto w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-brand-yellow shadow-sm hover:scale-110 transition-transform">
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

// --- Tasks View ---
const TasksView = ({ userId, tasks }: { userId: string, tasks: UserTask[] }) => {
  const [newTask, setNewTask] = useState('');
  const [newTime, setNewTime] = useState('');

  const addTask = async () => {
    if (!newTask.trim()) return;
    const taskData: any = {
      title: newTask,
      completed: false,
      date: new Date().toISOString()
    };
    if (newTime.trim()) {
      taskData.time = newTime;
    }
    await addDoc(collection(db, `users/${userId}/tasks`), taskData);
    setNewTask('');
    setNewTime('');
  };

  const toggleTask = async (task: UserTask) => {
    await updateDoc(doc(db, `users/${userId}/tasks`, task.id), {
      completed: !task.completed
    });
  };

  const deleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, `users/${userId}/tasks`, taskId));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="cute-card p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 bg-[#34D399] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 dark:shadow-none">
              <CheckSquare size={28} />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-[#059669] dark:text-[#34D399]">Nhiệm Vụ</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">Kỷ luật là cầu nối giữa mục tiêu và thành tựu</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-full text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-600 transition-all">
            <History size={16} />
            Lịch sử
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <input 
            type="text" 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Nghe 1 Part 3..." 
            className="w-full sm:flex-1 px-6 py-4 bg-[#FFF9E5] dark:bg-yellow-900/20 text-slate-900 dark:text-white placeholder-slate-400 rounded-2xl border-2 border-[#FFF0B3] dark:border-yellow-900/30 focus:border-brand-yellow focus:ring-0 transition-all font-medium"
          />
          <div className="relative w-28 sm:w-24">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input 
              type="text" 
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="--:--" 
              className="w-full pl-10 pr-4 py-4 bg-[#FFF9E5] dark:bg-yellow-900/20 text-slate-900 dark:text-white placeholder-slate-400 rounded-2xl border-2 border-[#FFF0B3] dark:border-yellow-900/30 focus:border-brand-yellow focus:ring-0 transition-all font-medium text-center"
            />
          </div>
          <button 
            onClick={addTask}
            className="w-full sm:w-auto bg-[#34D399] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-[#059669] transition-all"
          >
            Thêm
          </button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["Luyện 1 đề Full", "Học 50 từ", "Ôn câu sai", "Nghe Part 3"].map(tag => (
            <button 
              key={tag}
              onClick={() => setNewTask(tag)}
              className="whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-700 border-2 border-brand-soft-pink dark:border-slate-600 rounded-full text-xs font-bold text-slate-500 dark:text-slate-300 hover:border-brand-pink hover:text-brand-pink transition-all"
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl group">
              <button 
                onClick={() => toggleTask(task)}
                className={cn(
                  "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all",
                  task.completed ? "bg-[#34D399] border-[#34D399] text-white" : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                )}
              >
                {task.completed && <Check size={20} />}
              </button>
              <div className="flex-1">
                <p className={cn("font-bold", task.completed ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-100")}>
                  {task.title}
                </p>
                {task.time && <p className="text-xs text-brand-indigo dark:text-indigo-400 font-black">{task.time}</p>}
              </div>
              <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <Rocket className="mx-auto text-slate-200 w-16 h-16" />
              <p className="text-slate-400 font-bold">Hôm nay bạn chưa có mục tiêu nào.<br/>Hãy viết gì đó vào ô trống phía trên nhé!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Theory View ---
const TheoryView = () => {
  const [activeCategory, setActiveCategory] = useState<'lexical' | 'technical' | 'grammar'>('lexical');
  
  const getContent = () => {
    switch(activeCategory) {
      case 'lexical': return LEXICAL_KNOWLEDGE;
      case 'technical': return TECHNICAL_TERMINOLOGIES;
      case 'grammar': return GRAMMAR_STRUCTURES;
      default: return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'lexical', label: 'Từ vựng cốt lõi', icon: BookOpen },
          { id: 'technical', label: 'Thuật ngữ chuyên ngành', icon: Rocket },
          { id: 'grammar', label: 'Cấu trúc ngữ pháp', icon: PenTool },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap",
              activeCategory === cat.id ? "bg-brand-indigo text-white shadow-lg shadow-indigo-100 dark:shadow-none" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
            )}
          >
            <cat.icon size={18} />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {getContent().map(item => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="cute-card p-8 border-l-8 border-l-brand-indigo"
          >
            <h3 className="text-xl font-black mb-4 text-brand-indigo">{item.title}</h3>
            <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-100 leading-relaxed font-bold">
              {item.content}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Game Zone View ---
const GameZoneView = ({ userId, userProfile, questions }: { userId: string, userProfile: UserProfile | null, questions: GameQuestion[] }) => {
  const [gameQuestions, setGameQuestions] = useState<GameQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    if (questions.length > 0) {
      const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 10);
      setGameQuestions(shuffled);
    }
  }, [questions]);

  if (questions.length === 0) {
    return (
      <div className="cute-card p-8 lg:p-12 text-center space-y-4">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mx-auto">
          <Gamepad2 size={32} className="lg:w-10 lg:h-10" />
        </div>
        <h3 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-white">Chưa có câu hỏi nào</h3>
        <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400 font-bold">Vui lòng thêm câu hỏi trong Bảng điều khiển Giáo viên để bắt đầu thám hiểm.</p>
      </div>
    );
  }

  if (gameQuestions.length === 0) return null;

  const currentQuestion = gameQuestions[currentQuestionIndex % gameQuestions.length];

  const handleAnswer = async (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    const correct = option === currentQuestion.answer;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);

    setTimeout(async () => {
      if (currentQuestionIndex < gameQuestions.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
        const finalScore = score + (correct ? 1 : 0);
        const xpEarned = finalScore * 10;
        const coinsEarned = finalScore * 2;
        
        if (userProfile) {
          await updateDoc(doc(db, 'users', userId), {
            xp: increment(xpEarned),
            coins: increment(coinsEarned)
          });
        }
        
        // Save result to Firestore
        const result: GameResult = {
          gameType: 'General Tech English',
          score: finalScore,
          totalQuestions: gameQuestions.length,
          date: new Date().toISOString()
        };
        await addDoc(collection(db, `users/${userId}/gameResults`), result);
      }
    }, 3000);
  };

  const resetGame = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 10);
    setGameQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  if (showResult) {
    return (
      <div className="cute-card p-8 lg:p-12 text-center space-y-8">
        <div className="w-20 h-20 lg:w-24 lg:h-24 bg-brand-yellow rounded-full flex items-center justify-center text-white mx-auto animate-bounce">
          <Trophy size={40} className="lg:w-12 lg:h-12" />
        </div>
        <div>
          <h2 className="text-3xl lg:text-4xl font-black mb-2 text-slate-900 dark:text-white">Hoàn thành!</h2>
          <p className="text-lg lg:text-xl text-brand-indigo dark:text-indigo-400 font-black">Bạn đạt được {score}/{gameQuestions.length} điểm</p>
        </div>
        <button 
          onClick={resetGame}
          className="cute-button-primary px-12"
        >
          Chơi lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex justify-between items-center px-4">
        <span className="font-black text-brand-indigo text-sm lg:text-base">Câu hỏi {currentQuestionIndex + 1}/{gameQuestions.length}</span>
        <div className="flex gap-1">
          {gameQuestions.map((_, i) => (
            <div key={i} className={cn(
              "w-4 lg:w-8 h-2 rounded-full transition-all",
              i === currentQuestionIndex ? "bg-brand-indigo" : i < currentQuestionIndex ? "bg-emerald-400" : "bg-slate-200"
            )} />
          ))}
        </div>
      </div>

      <div className="cute-card p-6 lg:p-10 space-y-8">
        <h3 className="text-xl lg:text-3xl font-black text-center leading-tight text-slate-900 dark:text-white">
          {currentQuestion.question}
        </h3>

        {selectedOption && currentQuestion.explanation && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 lg:p-6 bg-brand-indigo/5 dark:bg-brand-indigo/10 rounded-2xl border-2 border-brand-indigo/20"
          >
            <p className="text-[10px] lg:text-xs font-black text-brand-indigo uppercase tracking-widest mb-2 flex items-center gap-2">
              <BookOpen size={14} /> Giải thích:
            </p>
            <p className="text-sm lg:text-base text-slate-900 dark:text-white font-black leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </motion.div>
        )}

        <div className="grid gap-3 lg:gap-4">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={!!selectedOption}
              className={cn(
                "w-full p-4 lg:p-6 rounded-2xl font-black text-left transition-all border-2 disabled:opacity-100 text-sm lg:text-base",
                selectedOption === option 
                  ? (isCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-red-50 border-red-500 text-red-900")
                  : (selectedOption && option === currentQuestion.answer ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white hover:border-brand-indigo hover:bg-indigo-50 dark:hover:bg-indigo-900/20")
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Speaking View ---
const SpeakingView = ({ userId, userProfile, isAdmin, prompts }: { userId: string, userProfile: UserProfile | null, isAdmin?: boolean, prompts: SpeakingPrompt[] }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<SpeakingAttempt | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ name: string, score: number }[]>([]);
  const [playCount, setPlayCount] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpType, setLevelUpType] = useState<'speaking' | 'writing'>('speaking');

  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const failAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const success = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    const fail = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
    
    success.crossOrigin = "anonymous";
    fail.crossOrigin = "anonymous";
    
    success.preload = "auto";
    fail.preload = "auto";
    
    successAudioRef.current = success;
    failAudioRef.current = fail;
  }, []);

  const currentLevel = userProfile?.speakingLevel || 1;
  const levelConfig = SPEAKING_LEVEL_CONFIG[currentLevel - 1];
  const filteredPrompts = prompts.filter(p => (p.level || 1) === currentLevel);
  const currentPrompt = filteredPrompts.length > 0 
    ? filteredPrompts[currentPromptIndex % filteredPrompts.length] 
    : (prompts.length > 0 ? prompts[0] : { text: "Chưa có mẫu phát âm", translation: "Vui lòng thêm mẫu phát âm trong Bảng điều khiển Giáo viên.", level: 1 });

  const skipLevel = async () => {
    if (!userProfile || !userId) return;
    const nextLevel = Math.min(currentLevel + 1, 6);
    await updateDoc(doc(db, 'users', userId), {
      speakingLevel: nextLevel,
      speakingProgress: 0
    });
    if (nextLevel > currentLevel) {
      setLevelUpType('speaking');
      setShowLevelUp(true);
    }
  };

  const updateProgress = async (isCorrect: boolean, score: number) => {
    if (!userProfile || !userId) return;
    
    const xpEarned = isCorrect ? 50 : 10;
    const coinsEarned = isCorrect ? 10 : 2;
    
    let newProgress = userProfile.speakingProgress + (isCorrect ? 1 : 0);
    let newLevel = userProfile.speakingLevel;
    
    if (newProgress >= levelConfig.requirement && newLevel < 6) {
      newLevel += 1;
      newProgress = 0;
      setLevelUpType('speaking');
      setShowLevelUp(true);
    }

    await updateDoc(doc(db, 'users', userId), {
      xp: increment(xpEarned),
      coins: increment(coinsEarned),
      speakingProgress: newProgress,
      speakingLevel: newLevel
    });
  };

  useEffect(() => {
    setTranscript('');
    setLastAttempt(null);
    setPlayCount(0);
  }, [currentPromptIndex, currentLevel]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const scores: { name: string, score: number }[] = [];
        
        for (const userDoc of usersSnap.docs) {
          const attemptsSnap = await getDocs(query(
            collection(db, `users/${userDoc.id}/speakingAttempts`),
            orderBy('score', 'desc'),
            limit(1)
          ));
          
          if (!attemptsSnap.empty) {
            scores.push({
              name: userDoc.data().displayName || 'Ẩn danh',
              score: attemptsSnap.docs[0].data().score
            });
          }
        }
        
        setLeaderboard(scores.sort((a, b) => b.score - a.score).slice(0, 5));
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };
    fetchLeaderboard();
  }, []);

  const playAudio = (text?: string) => {
    const utterance = new SpeechSynthesisUtterance(text || currentPrompt.text);
    utterance.lang = 'en-US';
    utterance.rate = playCount % 2 === 0 ? 1.0 : 0.6;
    window.speechSynthesis.speak(utterance);
    setPlayCount(prev => prev + 1);
  };

  const playSound = (type: 'success' | 'fail') => {
    const audio = type === 'success' ? successAudioRef.current : failAudioRef.current;
    if (audio) {
      try {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== 'AbortError') {
              console.error("Error playing sound:", e);
            }
          });
        }
      } catch (e) {
        console.error("Audio play exception:", e);
      }
    }
  };

  const startRecording = () => {
    // "Unlock" audio on user interaction - more robustly
    const unlockAudio = (audio: HTMLAudioElement | null) => {
      if (audio) {
        const p = audio.play();
        if (p !== undefined) {
          p.then(() => {
            audio.pause();
            audio.currentTime = 0;
          }).catch(() => {
            // Silently fail unlock, will try again on playSound
          });
        }
      }
    };
    
    unlockAudio(successAudioRef.current);
    unlockAudio(failAudioRef.current);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Trình duyệt không hỗ trợ nhận diện giọng nói.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = async (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setIsAnalyzing(true);
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Analyze the pronunciation of the following text.
Target: "${currentPrompt.text}"
Recognized: "${result}"
Level: ${currentLevel} (${levelConfig.title})

${currentLevel === 2 ? "Đây là cấp độ dành cho người mới bắt đầu (Nghe & Lặp lại). Hãy đánh giá nhẹ nhàng và khuyến khích. Nếu văn bản nhận diện được gần đúng và dễ hiểu, hãy cho điểm cao (trên 70)." : ""}

Provide a score from 0 to 100 based on accuracy.
Also provide detailed feedback in Vietnamese about which words or sounds were mispronounced.
Return the result in JSON format: { "score": number, "feedback": string }`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                feedback: { type: Type.STRING }
              },
              required: ["score", "feedback"]
            }
          }
        });

        if (!response.text) {
          throw new Error("Empty AI response for speaking analysis");
        }
        const analysis = JSON.parse(response.text);
        
        const passThreshold = currentLevel === 2 ? 65 : 80;
        const isCorrect = analysis.score >= passThreshold;

        // Play sounds based on user request (threshold 50)
        if (analysis.score >= 50) {
          playSound('success');
        } else {
          playSound('fail');
        }

        const attempt: SpeakingAttempt = {
          targetText: currentPrompt.text,
          recognizedText: result,
          isCorrect: isCorrect,
          score: analysis.score,
          feedback: analysis.feedback,
          date: new Date().toISOString(),
          level: currentLevel,
          xpEarned: isCorrect ? 50 : 10
        };
        
        await addDoc(collection(db, `users/${userId}/speakingAttempts`), attempt);
        setLastAttempt(attempt);
        await updateProgress(isCorrect, analysis.score);
      } catch (error) {
        console.error("AI Analysis error:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    recognition.start();
  };

  const handleLevel1Choice = async (choice: string) => {
    const isCorrect = choice === currentPrompt.text;
    setIsAnalyzing(true);
    
    const attempt: SpeakingAttempt = {
      targetText: currentPrompt.text,
      recognizedText: choice,
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect ? "Tuyệt vời! Bạn đã nghe chính xác." : "Chưa đúng rồi, hãy nghe lại kỹ hơn nhé.",
      date: new Date().toISOString(),
      level: 1,
      xpEarned: isCorrect ? 50 : 0
    };

    await addDoc(collection(db, `users/${userId}/speakingAttempts`), attempt);
    setLastAttempt(attempt);
    await updateProgress(isCorrect, isCorrect ? 100 : 0);
    setIsAnalyzing(false);
    
    if (isCorrect) {
      setTimeout(() => setCurrentPromptIndex(i => i + 1), 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in duration-500">
      <AnimatePresence>
        {showLevelUp && (
          <LevelUpModal 
            level={userProfile?.speakingLevel || 1} 
            type={levelUpType} 
            onClose={() => setShowLevelUp(false)} 
          />
        )}
      </AnimatePresence>

      <div className="lg:col-span-2 space-y-8">
        <div className="cute-card p-10 text-center space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{levelConfig.icon}</span>
              <div className="text-left">
                <p className="text-[10px] font-black text-brand-indigo uppercase tracking-widest">Cấp độ {currentLevel}</p>
                <h4 className="font-black text-slate-800 dark:text-white leading-none">{levelConfig.title}</h4>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến độ</p>
              <p className="font-black text-brand-indigo">{userProfile?.speakingProgress || 0} / {levelConfig.requirement}</p>
              {isAdmin && (
                <button 
                  onClick={skipLevel}
                  className="text-[10px] font-black text-brand-pink uppercase hover:underline mt-1"
                >
                  Vượt cấp (Admin)
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar moved to top */}
          <div className="flex justify-center gap-2 mb-6">
            {filteredPrompts.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === currentPromptIndex ? "w-8 bg-brand-indigo" : "w-2 bg-slate-200 dark:bg-slate-700"
                )} 
              />
            ))}
          </div>

          {currentLevel === 1 ? (
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-brand-indigo dark:text-indigo-400 font-bold uppercase text-xs tracking-widest">Nghe và chọn đáp án đúng:</p>
                <button 
                  onClick={() => playAudio()}
                  className="w-20 h-20 bg-brand-indigo text-white rounded-full flex items-center justify-center mx-auto shadow-lg hover:scale-110 transition-all"
                >
                  <Volume2 size={32} />
                </button>
              </div>
              <div className="grid gap-4">
                {[currentPrompt.text, "Something else", "Another option"].sort().map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleLevel1Choice(choice)}
                    className={cn(
                      "p-6 rounded-2xl border-2 font-black text-lg transition-all",
                      lastAttempt?.recognizedText === choice 
                        ? (lastAttempt.isCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-900" : "bg-red-50 border-red-500 text-red-900")
                        : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white hover:border-brand-indigo"
                    )}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-brand-indigo dark:text-indigo-400 font-bold uppercase text-xs tracking-widest">
                  {currentLevel === 3 ? "Đọc từ đơn (IPA):" : "Đọc câu sau:"}
                </p>
                <h3 className="text-2xl lg:text-3xl font-black text-brand-indigo leading-tight">{currentPrompt.text}</h3>
                <p className="text-slate-800 dark:text-slate-200 italic font-black text-base lg:text-lg">{currentPrompt.translation}</p>
              </div>

              <div className="flex justify-center gap-6">
                <button 
                  onClick={() => playAudio()}
                  className="w-16 h-16 bg-white dark:bg-slate-800 text-brand-indigo rounded-2xl flex items-center justify-center shadow-md border border-brand-soft-pink dark:border-slate-700 hover:scale-105 transition-all"
                >
                  <Volume2 size={24} />
                </button>
                <button 
                  onClick={startRecording}
                  disabled={isRecording || isAnalyzing}
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all",
                    isRecording ? "bg-red-500 text-white animate-pulse" : "bg-brand-indigo text-white hover:scale-105"
                  )}
                >
                  {isAnalyzing ? <RefreshCw size={24} className="animate-spin" /> : <Mic size={24} />}
                </button>
              </div>
            </div>
          )}

          {lastAttempt && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-8 rounded-3xl border-2 text-left space-y-4",
                lastAttempt.isCorrect ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20" : "bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {lastAttempt.isCorrect ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-amber-500" />}
                  <span className={cn("text-xl font-black", lastAttempt.isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400")}>
                    {lastAttempt.score}/100
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-orange-500 fill-orange-500" />
                  <span className="text-sm font-black text-orange-600">+{lastAttempt.xpEarned} XP</span>
                </div>
              </div>
              <div className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                {lastAttempt.score < 50 && currentLevel === 2 && (
                  <p className="text-red-500 font-black mb-2">Hãy thử lại nhé! Bạn cần phát âm rõ ràng hơn.</p>
                )}
                <ReactMarkdown>{lastAttempt.feedback || ''}</ReactMarkdown>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
            <button 
              onClick={() => {
                setCurrentPromptIndex(i => (i > 0 ? i - 1 : filteredPrompts.length - 1));
              }}
              className="w-full sm:w-auto justify-center flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black hover:bg-slate-200 transition-all"
            >
              <ChevronLeft size={20} /> Quay lại
            </button>
            <button 
              onClick={() => {
                setCurrentPromptIndex(i => (i + 1) % filteredPrompts.length);
              }}
              className="w-full sm:w-auto justify-center flex items-center gap-2 px-6 py-3 bg-brand-indigo text-white rounded-2xl font-black shadow-lg shadow-indigo-100 dark:shadow-none hover:scale-105 transition-all"
            >
              Tiếp theo <ChevronRight size={20} />
            </button>
          </div>
        </div>

          <div className="cute-card p-6 border-2 border-dashed border-slate-200 bg-transparent">
          <div className="flex items-center gap-3 mb-4 text-slate-400">
            <History size={20} />
            <h4 className="font-bold uppercase text-xs tracking-widest">Mẹo phát âm</h4>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            Hãy nhấn nút <strong>Nghe mẫu</strong> trước khi bắt đầu để làm quen với ngữ điệu và trọng âm của câu.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="cute-card p-6">
          <h4 className="font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Crown className="text-brand-yellow" size={20} /> Bảng xếp hạng
          </h4>
          <div className="space-y-4">
            {leaderboard.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black",
                    i === 0 ? "bg-brand-yellow text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  )}>
                    {i + 1}
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{entry.name}</span>
                </div>
                <span className="font-black text-brand-indigo">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Writing View ---
const WritingView = ({ userId, userProfile, isAdmin, topics, dictationSentences }: { userId: string, userProfile: UserProfile | null, isAdmin?: boolean, topics: WritingTopic[], dictationSentences: any[] }) => {
  const [writingText, setWritingText] = useState('');
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpType, setLevelUpType] = useState<'speaking' | 'writing'>('writing');
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isPassed, setIsPassed] = useState<boolean | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentLevel = userProfile?.writingLevel || 1;
  const levelConfig = WRITING_LEVEL_CONFIG[currentLevel - 1];
  const filteredTopics = topics.filter(t => (t.level || 1) === currentLevel);
  const targetSentence = dictationSentences.length > 0 ? (dictationSentences[currentSentenceIndex % dictationSentences.length]?.text || "") : "Chưa có câu mẫu nào trong hệ thống.";
  const currentTopic = filteredTopics.length > 0 
    ? filteredTopics[currentSentenceIndex % filteredTopics.length] 
    : (topics.length > 0 ? topics[0] : { title: "Chưa có chủ đề", description: "Vui lòng thêm chủ đề trong Bảng điều khiển Giáo viên." });

  const skipLevel = async () => {
    if (!userProfile || !userId) return;
    const nextLevel = Math.min(currentLevel + 1, 6);
    await updateDoc(doc(db, 'users', userId), {
      writingLevel: nextLevel,
      writingProgress: 0
    });
    if (nextLevel > currentLevel) {
      setLevelUpType('writing');
      setShowLevelUp(true);
    }
  };

  const updateProgress = async (passed: boolean, score: number) => {
    if (!userProfile || !userId) return;
    
    const xpEarned = passed ? 100 : 20;
    const coinsEarned = passed ? 20 : 5;
    
    let newProgress = userProfile.writingProgress + (passed ? 1 : 0);
    let newLevel = userProfile.writingLevel;
    
    if (newProgress >= levelConfig.requirement && newLevel < 6) {
      newLevel += 1;
      newProgress = 0;
      setLevelUpType('writing');
      setShowLevelUp(true);
    }

    await updateDoc(doc(db, 'users', userId), {
      xp: increment(xpEarned),
      coins: increment(coinsEarned),
      writingProgress: newProgress,
      writingLevel: newLevel
    });
  };

  const checkWriting = async () => {
    if (!writingText.trim()) return;
    setIsChecking(true);
    setIsPassed(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = currentLevel === 1 
        ? `Bạn là một giáo viên tiếng Anh. Học sinh đang làm bài chép chính tả (Dictation).
Câu mẫu: "${targetSentence}"
Học sinh viết: "${writingText}"

Yêu cầu:
1. So sánh chính xác từng ký tự (không phân biệt hoa thường quá khắt khe nhưng phải đúng chính tả).
2. Chấm điểm trên thang 100.
3. Nếu đúng hoàn toàn hoặc chỉ sai 1 lỗi nhỏ, set isPassed = true.
4. Giải thích lỗi sai bằng tiếng Việt.

Trả về kết quả JSON: { "score": number, "correctedText": string, "feedback": string, "isPassed": boolean }`
        : `Bạn là một giáo viên tiếng Anh chuyên ngành. 
Cấp độ hiện tại của học sinh: Level ${currentLevel} (${levelConfig.title}) - ${levelConfig.description}

Hãy kiểm tra bài viết sau: "${writingText}"

Yêu cầu:
1. Chấm điểm trên thang 100 dựa trên tiêu chuẩn của Level ${currentLevel}.
2. Sửa lỗi chính tả, ngữ pháp và cách dùng từ.
3. Đưa ra lời khuyên cải thiện bằng tiếng Việt.
4. Nếu là Level 6 (Essay), hãy nhận xét về cấu trúc và tính logic.

Trả về kết quả JSON: { "score": number, "correctedText": string, "feedback": string, "isPassed": boolean }`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              correctedText: { type: Type.STRING },
              feedback: { type: Type.STRING },
              isPassed: { type: Type.BOOLEAN }
            },
            required: ["score", "correctedText", "feedback", "isPassed"]
          }
        }
      });
      
      if (!result.text) {
        throw new Error("Empty AI response for writing check");
      }
      const analysis = JSON.parse(result.text);
      setAiFeedback(analysis.feedback);
      setIsPassed(analysis.isPassed);

      const check: WritingCheck = {
        originalText: writingText,
        correctedText: analysis.correctedText,
        feedback: analysis.feedback,
        date: new Date().toISOString(),
        level: currentLevel,
        xpEarned: analysis.isPassed ? 100 : 20
      };
      await addDoc(collection(db, `users/${userId}/writingChecks`), check);
      await updateProgress(analysis.isPassed, analysis.score);

      // Auto-advance if passed
      if (analysis.isPassed) {
        if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
        autoAdvanceTimeoutRef.current = setTimeout(() => {
          handleNextSentence();
        }, 4000); // 4 seconds delay to read feedback
      }
    } catch (error) {
      console.error("AI Check Error:", error);
      setAiFeedback("Đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleRewrite = () => {
    setWritingText(''); // Clear text to force rewriting from scratch
    setAiFeedback(null);
    setIsPassed(null);
  };

  const handleNextSentence = () => {
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    setCurrentSentenceIndex(prev => prev + 1);
    setWritingText('');
    setAiFeedback(null);
    setIsPassed(null);
  };

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnimatePresence>
        {showLevelUp && (
          <LevelUpModal 
            level={userProfile?.writingLevel || 1} 
            type={levelUpType} 
            onClose={() => setShowLevelUp(false)} 
          />
        )}
      </AnimatePresence>

      <div className="cute-card p-6 lg:p-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl lg:text-3xl">{levelConfig.icon}</span>
            <div>
              <p className="text-[10px] font-black text-brand-indigo uppercase tracking-widest">Cấp độ {currentLevel}</p>
              <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-none">{levelConfig.title}</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tiến độ</p>
            <p className="font-black text-brand-indigo">{userProfile?.writingProgress || 0} / {levelConfig.requirement}</p>
            {isAdmin && (
              <button 
                onClick={skipLevel}
                className="text-[10px] font-black text-brand-pink uppercase hover:underline mt-1"
              >
                Vượt cấp (Admin)
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-100 dark:bg-slate-900 p-6 lg:p-8 rounded-[2.5rem] border-2 border-slate-200 dark:border-slate-700 shadow-inner">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Thử thách hiện tại:</p>
              <p className="text-lg lg:text-xl font-black text-slate-900 dark:text-white leading-tight">
                {currentLevel === 1 ? levelConfig.description : currentTopic.title}
              </p>
              {currentLevel > 1 && (
                <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400 font-medium">{currentTopic.description}</p>
              )}
            </div>
          </div>
          
          {currentLevel === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 lg:p-8 bg-white dark:bg-slate-800 rounded-[2rem] border-4 border-brand-indigo shadow-lg select-none"
              onContextMenu={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
            >
              <p className="text-xs font-black text-brand-indigo uppercase tracking-widest mb-3">Câu mẫu cần chép:</p>
              <p className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {targetSentence}
              </p>
            </motion.div>
          )}
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea 
              value={writingText}
              onChange={(e) => setWritingText(e.target.value)}
              onPaste={(e) => {
                if (currentLevel === 1) {
                  e.preventDefault();
                }
              }}
              placeholder={currentLevel === 1 ? "Nhập lại chính xác câu mẫu phía trên..." : "Bắt đầu viết tại đây..."}
              className={cn(
                "w-full h-48 lg:h-64 p-6 lg:p-10 bg-white dark:bg-slate-900 placeholder-slate-400 rounded-[2.5rem] lg:rounded-[3rem] border-4 transition-all font-black text-xl lg:text-3xl resize-none shadow-inner leading-relaxed",
                isPassed === true ? "border-emerald-500 text-emerald-700 dark:text-emerald-400" : 
                isPassed === false ? "border-amber-500 text-slate-900 dark:text-white" :
                "border-slate-300 dark:border-slate-700 focus:border-brand-indigo focus:ring-0 text-slate-900 dark:text-white"
              )}
              disabled={isPassed === true && currentLevel === 1}
            />
            {isPassed === false && (
              <button 
                onClick={() => setWritingText('')}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Xóa hết"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          <div className="flex gap-4">
            {isPassed === true ? (
              <button 
                onClick={handleNextSentence}
                className="cute-button-primary flex-1 flex items-center justify-center gap-3 py-6 text-2xl shadow-lg"
              >
                <ChevronRight size={32} /> Câu tiếp theo
              </button>
            ) : (
              <button 
                onClick={isPassed === false ? handleRewrite : checkWriting}
                disabled={isChecking || (!writingText.trim() && isPassed !== false)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 py-6 text-2xl transition-all shadow-lg",
                  isPassed === false ? "cute-button-secondary" : "cute-button-primary"
                )}
              >
                {isChecking ? <RefreshCw size={32} className="animate-spin" /> : isPassed === false ? <RefreshCw size={32} /> : <Rocket size={32} />}
                {isChecking ? "AI đang chấm điểm..." : isPassed === false ? "Tôi đã hiểu, viết lại từ đầu" : "Nộp bài & Chấm điểm"}
              </button>
            )}
          </div>
        </div>

        {aiFeedback && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-10 rounded-[3rem] border-4 shadow-2xl",
              isPassed ? "bg-emerald-50 border-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-amber-50 border-amber-400 dark:bg-amber-900/20 dark:border-amber-800"
            )}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className={cn(
                "w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-xl",
                isPassed ? "bg-emerald-500" : "bg-amber-500"
              )}>
                {isPassed ? <CheckCircle2 size={36} /> : <AlertCircle size={36} />}
              </div>
              <div>
                <h4 className={cn(
                  "text-3xl font-black",
                  isPassed ? "text-emerald-900 dark:text-emerald-100" : "text-amber-900 dark:text-amber-100"
                )}>
                  {isPassed ? "Chính xác!" : "Cần sửa lỗi"}
                </h4>
                <p className="text-sm font-black opacity-60 uppercase tracking-widest">Nhận xét từ AI</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="text-slate-900 dark:text-slate-100 font-black text-xl leading-relaxed prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown>{aiFeedback}</ReactMarkdown>
              </div>

              {!isPassed && (
                <div 
                  className="p-8 bg-white dark:bg-slate-800 rounded-[2rem] border-4 border-amber-200 dark:border-amber-900/50 shadow-inner select-none"
                  onContextMenu={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                >
                  <p className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-3">Bản sửa lỗi gợi ý:</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white italic">
                    {targetSentence}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// --- Expeditions View ---
const ExpeditionsView = ({ userId, userProfile, gameQuestions, isAdmin, speakingPrompts, writingTopics, dictationSentences, onStartLogistics }: { userId: string, userProfile: UserProfile | null, gameQuestions: GameQuestion[], isAdmin?: boolean, speakingPrompts: SpeakingPrompt[], writingTopics: WritingTopic[], dictationSentences: any[], onStartLogistics: () => void }) => {
  const [activeSubTab, setActiveSubTab] = useState<'theory' | 'game' | 'speaking' | 'writing' | 'logistics'>('theory');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="cute-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-brand-indigo">
              <Rocket size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-brand-indigo">Thám Hiểm Tri Thức</h2>
              <p className="text-brand-indigo dark:text-indigo-400 font-black uppercase text-xs tracking-widest">Lộ trình học tập chuyên ngành bài bản</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 border-b border-brand-soft-pink dark:border-slate-700 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'theory', label: 'Lý thuyết (1,2,3)', icon: BookOpen },
            { id: 'game', label: 'Game Zone (4)', icon: Gamepad2 },
            { id: 'speaking', label: 'Phát âm (5)', icon: Mic },
            { id: 'writing', label: 'Luyện viết (5)', icon: PenTool },
            { id: 'logistics', label: 'Logistics (Mới)', icon: Truck },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "px-6 py-4 font-bold transition-all border-b-4 flex items-center gap-2 whitespace-nowrap",
                activeSubTab === tab.id ? "border-brand-indigo text-brand-indigo" : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeSubTab === 'theory' && <TheoryView />}
          {activeSubTab === 'game' && <GameZoneView userId={userId} userProfile={userProfile} questions={gameQuestions} />}
          {activeSubTab === 'speaking' && <SpeakingView userId={userId} userProfile={userProfile} isAdmin={isAdmin} prompts={speakingPrompts} />}
          {activeSubTab === 'writing' && <WritingView userId={userId} userProfile={userProfile} isAdmin={isAdmin} topics={writingTopics} dictationSentences={dictationSentences} />}
          {activeSubTab === 'logistics' && <LogisticsChallenge userId={userId} userProfile={userProfile} />}
        </div>
      </div>
    </div>
  );
};

// --- Leaderboard View ---
const LeaderboardView = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="cute-card p-8 min-h-[600px] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 dark:text-white">
          <Crown size={200} />
        </div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-3xl font-black text-brand-indigo flex items-center gap-3">
            <Crown className="text-brand-yellow fill-brand-yellow" size={32} /> BẢNG PHONG THẦN
          </h2>
          <button className="p-2 text-slate-300 hover:text-slate-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-6 border-b border-brand-soft-pink dark:border-slate-700 mb-12 overflow-x-auto pb-2 relative z-10">
          {[
            { id: 'xp', label: 'Tech Titan (XP)', icon: Flame },
            { id: 'vocab', label: 'Lexicon Master', icon: BookOpen },
            { id: 'grammar', label: 'Syntax Wizard', icon: PenTool },
            { id: 'exam', label: 'Steady Explorer', icon: Clock },
            { id: 'toeic', label: 'Field Expert', icon: Trophy },
          ].map(tab => (
            <button 
              key={tab.id}
              className="whitespace-nowrap flex items-center gap-2 px-4 py-4 font-bold text-slate-400 dark:text-slate-500 hover:text-brand-indigo transition-all border-b-4 border-transparent hover:border-brand-indigo"
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center py-20 space-y-6 relative z-10">
          <div className="w-16 h-16 border-4 border-brand-indigo border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-300 font-bold text-lg animate-pulse">Đang đồng bộ hóa dữ liệu thám hiểm...</p>
        </div>
      </div>
    </div>
  );
};

// --- UI Components ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={cn(
        "fixed bottom-8 right-8 p-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 font-black",
        type === 'success' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
      )}
    >
      {type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
      {message}
    </motion.div>
  );
};

const ConfirmModal = ({ 
  title, 
  message, 
  onConfirm, 
  onCancel 
}: { 
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel: () => void 
}) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 font-bold">{message}</p>
      </div>
      <div className="flex gap-4">
        <button 
          onClick={onCancel}
          className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black hover:bg-slate-200 transition-all"
        >
          Hủy
        </button>
        <button 
          onClick={onConfirm}
          className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Xóa
        </button>
      </div>
    </motion.div>
  </div>
);

// --- Admin Panel ---
const AdminPanel = ({ 
  students, 
  gameQuestions, 
  speakingPrompts, 
  writingTopics, 
  dictationSentences 
}: { 
  students: any[], 
  gameQuestions: GameQuestion[], 
  speakingPrompts: SpeakingPrompt[], 
  writingTopics: WritingTopic[], 
  dictationSentences: any[] 
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'content'>('students');
  const [contentType, setContentType] = useState<'game' | 'speaking' | 'writing' | 'dictation'>('game');

  // Form states
  const [newQuestion, setNewQuestion] = useState({ question: '', options: ['', '', '', ''], answer: '', category: 'vocab', order: 0, explanation: '' });
  const [newPrompt, setNewPrompt] = useState({ text: '', translation: '', category: 'professional', order: 0, level: 1 });
  const [newTopic, setNewTopic] = useState({ title: '', description: '', category: 'email', order: 0, level: 1 });
  const [newSentence, setNewSentence] = useState({ text: '', order: 0 });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ collection: string, id: string } | null>(null);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let count = 0;
        const batch = writeBatch(db);

        for (const row of data as any[]) {
          let collectionName = '';
          let itemData: any = {};

          if (contentType === 'game') {
            collectionName = 'gameQuestions';
            itemData = {
              question: row.question || row.Question || '',
              options: [
                row.option1 || row.Option1 || '',
                row.option2 || row.Option2 || '',
                row.option3 || row.Option3 || '',
                row.option4 || row.Option4 || ''
              ],
              answer: row.answer || row.Answer || '',
              category: row.category || row.Category || 'vocab',
              order: Number(row.order || row.Order || 0),
              explanation: row.explanation || row.Explanation || ''
            };
          } else if (contentType === 'speaking') {
            collectionName = 'speakingPrompts';
            itemData = {
              text: row.text || row.Text || '',
              translation: row.translation || row.Translation || '',
              category: row.category || row.Category || 'professional',
              level: Number(row.level || row.Level || 1),
              order: Number(row.order || row.Order || 0)
            };
          } else if (contentType === 'writing') {
            collectionName = 'writingTopics';
            itemData = {
              title: row.title || row.Title || '',
              description: row.description || row.Description || '',
              category: row.category || row.Category || 'email',
              level: Number(row.level || row.Level || 1),
              order: Number(row.order || row.Order || 0)
            };
          } else if (contentType === 'dictation') {
            collectionName = 'dictationSentences';
            itemData = {
              text: row.text || row.Text || '',
              order: Number(row.order || row.Order || 0)
            };
          }

          if (collectionName && (itemData.question || itemData.text || itemData.title)) {
            const newDocRef = doc(collection(db, collectionName));
            batch.set(newDocRef, itemData);
            count++;
          }
        }

        if (count > 0) {
          await batch.commit();
          setToast({ message: `Đã tải lên thành công ${count} mục!`, type: 'success' });
        } else {
          setToast({ message: 'Không tìm thấy dữ liệu hợp lệ trong file.', type: 'error' });
        }
      } catch (err) {
        console.error("Excel upload error:", err);
        setToast({ message: 'Lỗi khi xử lý file Excel.', type: 'error' });
      }
      // Reset input
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    let data: any[] = [];
    let fileName = '';

    if (contentType === 'game') {
      data = [{ question: 'What is React?', option1: 'Library', option2: 'Framework', option3: 'Language', option4: 'Database', answer: 'Library', category: 'vocab', order: 1, explanation: 'React is a JavaScript library for building user interfaces.' }];
      fileName = 'game_questions_template.xlsx';
    } else if (contentType === 'speaking') {
      data = [{ text: 'Hello world', translation: 'Chào thế giới', category: 'professional', level: 1, order: 1 }];
      fileName = 'speaking_prompts_template.xlsx';
    } else if (contentType === 'writing') {
      data = [{ title: 'Intro', description: 'Write about yourself', category: 'email', level: 1, order: 1 }];
      fileName = 'writing_topics_template.xlsx';
    } else if (contentType === 'dictation') {
      data = [{ text: 'The cat is on the mat.', order: 1 }];
      fileName = 'dictation_sentences_template.xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, fileName);
  };

  const handleEditQuestion = (q: GameQuestion) => {
    setEditingId(q.id);
    setNewQuestion({ 
      question: q.question, 
      options: [...q.options], 
      answer: q.answer, 
      category: q.category as any, 
      order: q.order || 0,
      explanation: q.explanation || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditPrompt = (p: SpeakingPrompt) => {
    setEditingId(p.id);
    setNewPrompt({ text: p.text, translation: p.translation, category: p.category as any, order: p.order || 0, level: p.level || 1 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditTopic = (t: WritingTopic) => {
    setEditingId(t.id);
    setNewTopic({ title: t.title, description: t.description, category: t.category as any, order: t.order || 0, level: t.level || 1 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditSentence = (s: any) => {
    setEditingId(s.id);
    setNewSentence({ text: s.text, order: s.order || 0 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewQuestion({ question: '', options: ['', '', '', ''], answer: '', category: 'vocab', order: 0, explanation: '' });
    setNewPrompt({ text: '', translation: '', category: 'professional', order: 0, level: 1 });
    setNewTopic({ title: '', description: '', category: 'email', order: 0, level: 1 });
    setNewSentence({ text: '', order: 0 });
  };

  const viewStudentDetails = async (student: any) => {
    setSelectedStudentId(student.id);
    // Fetch their data
    const gameSnap = await getDocs(collection(db, `users/${student.id}/gameResults`));
    const speakingSnap = await getDocs(collection(db, `users/${student.id}/speakingAttempts`));
    const writingSnap = await getDocs(collection(db, `users/${student.id}/writingChecks`));
    const tasksSnap = await getDocs(collection(db, `users/${student.id}/tasks`));
    
    setStudentData({
      games: gameSnap.docs.map(d => d.data()),
      speaking: speakingSnap.docs.map(d => d.data()),
      writing: writingSnap.docs.map(d => d.data()),
      tasks: tasksSnap.docs.map(d => d.data())
    });
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'gameQuestions', editingId), newQuestion);
        setToast({ message: 'Đã cập nhật câu hỏi thành công!', type: 'success' });
      } else {
        await addDoc(collection(db, 'gameQuestions'), newQuestion);
        setToast({ message: 'Đã thêm câu hỏi thành công!', type: 'success' });
      }
      setNewQuestion({ question: '', options: ['', '', '', ''], answer: '', category: 'vocab', order: 0, explanation: '' });
      setEditingId(null);
    } catch (e) {
      handleFirestoreError(e, editingId ? OperationType.UPDATE : OperationType.CREATE, 'gameQuestions');
    }
  };

  const handleAddPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'speakingPrompts', editingId), newPrompt);
        setToast({ message: 'Đã cập nhật mẫu phát âm thành công!', type: 'success' });
      } else {
        await addDoc(collection(db, 'speakingPrompts'), newPrompt);
        setToast({ message: 'Đã thêm mẫu phát âm thành công!', type: 'success' });
      }
      setNewPrompt({ text: '', translation: '', category: 'professional', order: 0, level: 1 });
      setEditingId(null);
    } catch (e) {
      handleFirestoreError(e, editingId ? OperationType.UPDATE : OperationType.CREATE, 'speakingPrompts');
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'writingTopics', editingId), newTopic);
        setToast({ message: 'Đã cập nhật chủ đề viết thành công!', type: 'success' });
      } else {
        await addDoc(collection(db, 'writingTopics'), newTopic);
        setToast({ message: 'Đã thêm chủ đề viết thành công!', type: 'success' });
      }
      setNewTopic({ title: '', description: '', category: 'email', order: 0, level: 1 });
      setEditingId(null);
    } catch (e) {
      handleFirestoreError(e, editingId ? OperationType.UPDATE : OperationType.CREATE, 'writingTopics');
    }
  };

  const handleAddSentence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'dictationSentences', editingId), newSentence);
        setToast({ message: 'Đã cập nhật câu chính tả thành công!', type: 'success' });
      } else {
        await addDoc(collection(db, 'dictationSentences'), newSentence);
        setToast({ message: 'Đã thêm câu chính tả thành công!', type: 'success' });
      }
      setNewSentence({ text: '', order: 0 });
      setEditingId(null);
    } catch (e) {
      handleFirestoreError(e, editingId ? OperationType.UPDATE : OperationType.CREATE, 'dictationSentences');
    }
  };

  const handleDeleteContent = async (collectionName: string, id: string) => {
    setConfirmDelete({ collection: collectionName, id });
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, confirmDelete.collection, confirmDelete.id));
      setToast({ message: 'Đã xóa thành công!', type: 'success' });
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, confirmDelete.collection);
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="cute-card p-6 lg:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <h2 className="text-2xl lg:text-3xl font-black text-brand-indigo flex items-center gap-3">
          <ShieldCheck size={32} /> Bảng điều khiển Giáo viên
        </h2>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setActiveTab('students')}
            className={cn(
              "px-4 lg:px-6 py-2 lg:py-3 rounded-2xl font-black transition-all text-sm lg:text-base flex-1 lg:flex-none",
              activeTab === 'students' ? "bg-brand-indigo text-white shadow-lg" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            )}
          >
            Sinh viên
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className={cn(
              "px-4 lg:px-6 py-2 lg:py-3 rounded-2xl font-black transition-all text-sm lg:text-base flex-1 lg:flex-none",
              activeTab === 'content' ? "bg-brand-indigo text-white shadow-lg" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
            )}
          >
            Quản lý nội dung
          </button>
        </div>
        {selectedStudent && activeTab === 'students' && (
          <button onClick={() => setSelectedStudentId(null)} className="text-slate-400 hover:text-brand-indigo font-bold text-sm">
            Quay lại danh sách
          </button>
        )}
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {confirmDelete && (
        <ConfirmModal 
          title="Xác nhận xóa" 
          message="Bạn có chắc chắn muốn xóa nội dung này? Hành động này không thể hoàn tác."
          onConfirm={executeDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {activeTab === 'students' ? (
        <>
          {!selectedStudent ? (
            <div className="grid gap-4">
              <p className="text-brand-indigo dark:text-indigo-400 font-black uppercase text-xs tracking-widest">Danh sách sinh viên ({students.length})</p>
              {students.map(student => (
                <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-brand-indigo transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <img src={student.photoURL} alt="" className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
                    <div className="min-w-0">
                      <p className="font-bold text-lg text-slate-800 dark:text-white truncate">{student.displayName}</p>
                      <p className="text-sm text-brand-indigo dark:text-indigo-400 font-bold truncate">{student.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => viewStudentDetails(student)}
                    className="w-full sm:w-auto px-6 py-2 bg-white dark:bg-slate-800 text-brand-indigo rounded-xl font-bold shadow-sm border border-brand-soft-pink dark:border-slate-700 hover:bg-brand-indigo hover:text-white transition-all"
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))}
              {students.length === 0 && <p className="text-center py-10 text-slate-500 dark:text-slate-400 font-bold italic">Chưa có sinh viên nào tham gia thám hiểm.</p>}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 p-6 lg:p-8 bg-brand-indigo text-white rounded-[2rem]">
                <img src={selectedStudent.photoURL} alt="" className="w-24 h-24 rounded-full border-4 border-white/20" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl lg:text-3xl font-black break-words">{selectedStudent.displayName}</h3>
                  <p className="text-white/80 font-medium break-all">{selectedStudent.email}</p>
                </div>
                <div className="w-full lg:w-auto grid sm:grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Speaking Level</p>
                    <div className="flex flex-wrap gap-1">
                      {[1, 2, 3, 4, 5, 6].map(l => (
                        <button 
                          key={l}
                          onClick={() => updateDoc(doc(db, 'users', selectedStudent.id), { speakingLevel: l })}
                          className={cn(
                            "w-8 h-8 rounded-lg font-black text-xs transition-all",
                            selectedStudent.speakingLevel === l ? "bg-white text-brand-indigo" : "bg-white/10 text-white/60 hover:bg-white/20"
                          )}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Writing Level</p>
                    <div className="flex flex-wrap gap-1">
                      {[1, 2, 3, 4, 5, 6].map(l => (
                        <button 
                          key={l}
                          onClick={() => updateDoc(doc(db, 'users', selectedStudent.id), { writingLevel: l })}
                          className={cn(
                            "w-8 h-8 rounded-lg font-black text-xs transition-all",
                            selectedStudent.writingLevel === l ? "bg-white text-brand-indigo" : "bg-white/10 text-white/60 hover:bg-white/20"
                          )}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="cute-card p-6 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30">
                  <h4 className="font-black text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2"><Gamepad2 size={18} /> Game Zone</h4>
                  <div className="space-y-2">
                    {studentData?.games.map((g: any, i: number) => (
                      <div key={i} className="text-sm bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm flex justify-between">
                        <span className="font-bold text-slate-600 dark:text-slate-300">{new Date(g.date).toLocaleDateString()}</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">{g.score}/{g.totalQuestions}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="cute-card p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30">
                  <h4 className="font-black text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2"><Mic size={18} /> Speaking</h4>
                  <div className="space-y-2">
                    {studentData?.speaking.map((s: any, i: number) => (
                      <div key={i} className="text-sm bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm">
                        <p className="font-bold text-slate-600 dark:text-slate-300 mb-1">{new Date(s.date).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-400 truncate">"{s.recognizedText}"</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="cute-card p-6 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900/30">
                  <h4 className="font-black text-purple-700 dark:text-purple-400 mb-4 flex items-center gap-2"><PenTool size={18} /> Writing</h4>
                  <div className="space-y-2">
                    {studentData?.writing.map((w: any, i: number) => (
                      <div key={i} className="text-sm bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm">
                        <p className="font-bold text-slate-600 dark:text-slate-300 mb-1">{new Date(w.date).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-400 truncate">Check completed</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="cute-card p-6 bg-slate-50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800 md:col-span-3">
                  <h4 className="font-black text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><CheckSquare size={18} /> Nhiệm vụ tự đặt</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {studentData?.tasks.map((t: any, i: number) => (
                      <div key={i} className="text-sm bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-3">
                        {t.completed ? <CheckCircle2 className="text-emerald-500" size={18} /> : <Clock className="text-slate-300 dark:text-slate-600" size={18} />}
                        <span className={cn("font-bold", t.completed ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200")}>{t.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-8">
          <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800">
            {[
              { id: 'game', label: 'Câu hỏi Game', icon: Gamepad2 },
              { id: 'speaking', label: 'Mẫu Phát âm', icon: Mic },
              { id: 'writing', label: 'Chủ đề Viết', icon: PenTool },
              { id: 'dictation', label: 'Chính tả', icon: CheckSquare },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setContentType(tab.id as any)}
                className={cn(
                  "px-6 py-4 font-bold transition-all border-b-4 flex items-center gap-2",
                  contentType === tab.id ? "border-brand-indigo text-brand-indigo" : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
            {contentType === 'game' && (
              <div className="space-y-8">
                <form onSubmit={handleAddQuestion} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black text-brand-indigo">
                      {editingId ? 'Sửa câu hỏi Game Zone' : 'Thêm câu hỏi Game Zone'}
                    </h4>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={downloadTemplate}
                        className="p-2 text-slate-400 hover:text-brand-indigo transition-all"
                        title="Tải file mẫu"
                      >
                        <Download size={20} />
                      </button>
                      <label className="p-2 text-slate-400 hover:text-brand-indigo transition-all cursor-pointer" title="Tải lên từ Excel">
                        <FileUp size={20} />
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelUpload} />
                      </label>
                      {editingId && (
                        <button type="button" onClick={cancelEdit} className="text-slate-400 hover:text-red-500 font-bold flex items-center gap-1">
                          <X size={16} /> Hủy sửa
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">Câu hỏi</label>
                      <input 
                        type="text" 
                        value={newQuestion.question} 
                        onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                        className="w-full p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-brand-indigo outline-none font-bold"
                        placeholder="Nhập câu hỏi..."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {newQuestion.options.map((opt, i) => (
                        <div key={i}>
                          <label className="block text-xs font-black text-slate-400 uppercase mb-2">Lựa chọn {i + 1}</label>
                          <input 
                            type="text" 
                            value={opt} 
                            onChange={e => {
                              const newOpts = [...newQuestion.options];
                              newOpts[i] = e.target.value;
                              setNewQuestion({...newQuestion, options: newOpts});
                            }}
                            className="w-full p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-brand-indigo outline-none font-bold"
                            placeholder={`Lựa chọn ${i + 1}`}
                            required
                          />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Đáp án đúng</label>
                        <select 
                          value={newQuestion.answer}
                          onChange={e => setNewQuestion({...newQuestion, answer: e.target.value})}
                          className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-brand-indigo outline-none font-bold"
                          required
                        >
                          <option value="">Chọn đáp án...</option>
                          {newQuestion.options.map((opt, i) => (
                            <option key={i} value={opt}>{opt || `Lựa chọn ${i + 1}`}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Phân loại</label>
                        <select 
                          value={newQuestion.category}
                          onChange={e => setNewQuestion({...newQuestion, category: e.target.value})}
                          className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-brand-indigo outline-none font-bold"
                        >
                          <option value="vocab">Từ vựng</option>
                          <option value="grammar">Ngữ pháp</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">Giải thích (Hiển thị sau khi trả lời)</label>
                      <textarea 
                        value={newQuestion.explanation} 
                        onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}
                        className="w-full p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-brand-indigo outline-none font-bold h-24 resize-none"
                        placeholder="Nhập giải thích cho đáp án đúng..."
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-brand-indigo text-white rounded-2xl font-black shadow-lg shadow-brand-indigo/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    {editingId ? 'Cập nhật câu hỏi' : 'Lưu câu hỏi'}
                  </button>
                </form>

                <div className="space-y-4">
                  <h5 className="font-black text-slate-400 uppercase text-xs tracking-widest">Dữ liệu hiện có (Firestore)</h5>
                  <div className="grid gap-3">
                    {gameQuestions.map(q => (
                      <div key={q.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 dark:text-white">{q.question}</p>
                          <p className="text-xs text-brand-indigo font-bold uppercase">{q.category}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditQuestion(q)} className="p-2 text-brand-indigo hover:bg-brand-soft-pink rounded-lg transition-all">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteContent('gameQuestions', q.id)} className="p-2 text-red-400 hover:text-red-600 transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {contentType === 'speaking' && (
              <div className="space-y-8">
                <form onSubmit={handleAddPrompt} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black text-brand-indigo">
                      {editingId ? 'Sửa mẫu Phát âm' : 'Thêm mẫu Phát âm'}
                    </h4>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={downloadTemplate}
                        className="p-2 text-slate-400 hover:text-brand-indigo transition-all"
                        title="Tải file mẫu"
                      >
                        <Download size={20} />
                      </button>
                      <label className="p-2 text-slate-400 hover:text-brand-indigo transition-all cursor-pointer" title="Tải lên từ Excel">
                        <FileUp size={20} />
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelUpload} />
                      </label>
                      {editingId && (
                        <button type="button" onClick={cancelEdit} className="text-slate-400 hover:text-red-500 font-bold flex items-center gap-1">
                          <X size={16} /> Hủy sửa
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase mb-2">Câu tiếng Anh</label>
                      <input 
                        type="text" 
                        value={newPrompt.text} 
                        onChange={e => setNewPrompt({...newPrompt, text: e.target.value})}
                        className="w-full p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-brand-indigo outline-none font-bold"
                        placeholder="The server is currently down..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase mb-2">Bản dịch tiếng Việt</label>
                      <input 
                        type="text" 
                        value={newPrompt.translation} 
                        onChange={e => setNewPrompt({...newPrompt, translation: e.target.value})}
                        className="w-full p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-brand-indigo outline-none font-bold"
                        placeholder="Máy chủ hiện đang tắt..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase mb-2">Cấp độ (Level)</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6].map(l => (
                          <button 
                            key={l}
                            type="button"
                            onClick={() => setNewPrompt({...newPrompt, level: l})}
                            className={cn(
                              "w-10 h-10 rounded-xl font-black transition-all",
                              newPrompt.level === l ? "bg-brand-indigo text-white shadow-lg" : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                            )}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-brand-indigo text-white rounded-2xl font-black shadow-lg shadow-brand-indigo/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    {editingId ? 'Cập nhật mẫu phát âm' : 'Lưu mẫu phát âm'}
                  </button>
                </form>

                <div className="space-y-4">
                  <h5 className="font-black text-slate-500 dark:text-slate-400 uppercase text-xs tracking-widest">Dữ liệu hiện có (Firestore)</h5>
                  <div className="grid gap-3">
                    {speakingPrompts.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-brand-indigo/10 text-brand-indigo text-[10px] font-black rounded-md uppercase">Level {p.level || 1}</span>
                            <p className="font-black text-slate-900 dark:text-white text-lg">{p.text}</p>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 font-bold italic">{p.translation}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditPrompt(p)} className="p-2 text-brand-indigo hover:bg-brand-soft-pink rounded-lg transition-all">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteContent('speakingPrompts', p.id)} className="p-2 text-red-400 hover:text-red-600 transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {contentType === 'writing' && (
              <div className="space-y-8">
                <form onSubmit={handleAddTopic} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black text-brand-indigo">
                      {editingId ? 'Sửa chủ đề Viết' : 'Thêm chủ đề Viết'}
                    </h4>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={downloadTemplate}
                        className="p-2 text-slate-400 hover:text-brand-indigo transition-all"
                        title="Tải file mẫu"
                      >
                        <Download size={20} />
                      </button>
                      <label className="p-2 text-slate-400 hover:text-brand-indigo transition-all cursor-pointer" title="Tải lên từ Excel">
                        <FileUp size={20} />
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelUpload} />
                      </label>
                      {editingId && (
                        <button type="button" onClick={cancelEdit} className="text-slate-400 hover:text-red-500 font-bold flex items-center gap-1">
                          <X size={16} /> Hủy sửa
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tiêu đề</label>
                      <input 
                        type="text" 
                        value={newTopic.title} 
                        onChange={e => setNewTopic({...newTopic, title: e.target.value})}
                        className="w-full p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-brand-indigo outline-none font-bold"
                        placeholder="Professional Email"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">Mô tả nhiệm vụ</label>
                      <textarea 
                        value={newTopic.description} 
                        onChange={e => setNewTopic({...newTopic, description: e.target.value})}
                        className="w-full p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-brand-indigo outline-none font-bold min-h-[120px]"
                        placeholder="Write an email to your manager..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">Cấp độ (Level)</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5, 6].map(l => (
                          <button 
                            key={l}
                            type="button"
                            onClick={() => setNewTopic({...newTopic, level: l})}
                            className={cn(
                              "w-10 h-10 rounded-xl font-black transition-all",
                              newTopic.level === l ? "bg-brand-indigo text-white shadow-lg" : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                            )}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-brand-indigo text-white rounded-2xl font-black shadow-lg shadow-brand-indigo/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    {editingId ? 'Cập nhật chủ đề viết' : 'Lưu chủ đề viết'}
                  </button>
                </form>

                <div className="space-y-4">
                  <h5 className="font-black text-slate-400 uppercase text-xs tracking-widest">Dữ liệu hiện có (Firestore)</h5>
                  <div className="grid gap-3">
                    {writingTopics.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-brand-indigo/10 text-brand-indigo text-[10px] font-black rounded-md uppercase">Level {t.level || 1}</span>
                            <p className="font-bold text-slate-800 dark:text-white">{t.title}</p>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1">{t.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditTopic(t)} className="p-2 text-brand-indigo hover:bg-brand-soft-pink rounded-lg transition-all">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteContent('writingTopics', t.id)} className="p-2 text-red-400 hover:text-red-600 transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {contentType === 'dictation' && (
              <div className="space-y-8">
                <form onSubmit={handleAddSentence} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black text-brand-indigo">
                      {editingId ? 'Sửa câu Chính tả' : 'Thêm câu Chính tả (Level 1 Writing)'}
                    </h4>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={downloadTemplate}
                        className="p-2 text-slate-400 hover:text-brand-indigo transition-all"
                        title="Tải file mẫu"
                      >
                        <Download size={20} />
                      </button>
                      <label className="p-2 text-slate-400 hover:text-brand-indigo transition-all cursor-pointer" title="Tải lên từ Excel">
                        <FileUp size={20} />
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleExcelUpload} />
                      </label>
                      {editingId && (
                        <button type="button" onClick={cancelEdit} className="text-slate-400 hover:text-red-500 font-bold flex items-center gap-1">
                          <X size={16} /> Hủy sửa
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">Câu tiếng Anh</label>
                      <input 
                        type="text" 
                        value={newSentence.text} 
                        onChange={e => setNewSentence({...newSentence, text: e.target.value})}
                        className="w-full p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-brand-indigo outline-none font-bold"
                        placeholder="The database needs to be optimized..."
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-brand-indigo text-white rounded-2xl font-black shadow-lg shadow-brand-indigo/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    {editingId ? 'Cập nhật câu chính tả' : 'Lưu câu chính tả'}
                  </button>
                </form>

                <div className="space-y-4">
                  <h5 className="font-black text-slate-400 uppercase text-xs tracking-widest">Dữ liệu hiện có (Firestore)</h5>
                  <div className="grid gap-3">
                    {dictationSentences.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p className="font-bold text-slate-800 dark:text-white flex-1">{s.text}</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditSentence(s)} className="p-2 text-brand-indigo hover:bg-brand-soft-pink rounded-lg transition-all">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteContent('dictationSentences', s.id)} className="p-2 text-red-400 hover:text-red-600 transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [gameQuestions, setGameQuestions] = useState<GameQuestion[]>([]);
  const [speakingPrompts, setSpeakingPrompts] = useState<SpeakingPrompt[]>([]);
  const [writingTopics, setWritingTopics] = useState<WritingTopic[]>([]);
  const [dictationSentences, setDictationSentences] = useState<any[]>([]);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [speakingAttempts, setSpeakingAttempts] = useState<SpeakingAttempt[]>([]);
  const [writingChecks, setWritingChecks] = useState<WritingCheck[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const isAdmin = user?.email === 'nguyenthanhtam.it2013@gmail.com' || userProfile?.role === 'teacher';

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setUserProfile(data);
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}`));
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            // Migrate old profiles to new gamification fields if missing
            if (data.xp === undefined) {
              const updatedProfile = {
                ...data,
                xp: 0,
                coins: 0,
                streak: 1,
                lastActiveDate: new Date().toISOString(),
                speakingLevel: 1,
                writingLevel: 1,
                speakingProgress: 0,
                writingProgress: 0
              };
              await updateDoc(userRef, updatedProfile);
            } else {
              // Check streak
              const lastActive = new Date(data.lastActiveDate);
              const today = new Date();
              const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
              
              if (diffDays === 1) {
                // Increment streak
                await updateDoc(userRef, { 
                  streak: data.streak + 1,
                  lastActiveDate: today.toISOString()
                });
              } else if (diffDays > 1) {
                // Reset streak
                await updateDoc(userRef, { 
                  streak: 1,
                  lastActiveDate: today.toISOString()
                });
              }
            }
          } else {
            const newProfile: UserProfile = {
              uid: u.uid,
              email: u.email || '',
              displayName: u.displayName,
              photoURL: u.photoURL,
              role: 'student',
              xp: 0,
              coins: 0,
              streak: 1,
              lastActiveDate: new Date().toISOString(),
              speakingLevel: 1,
              writingLevel: 1,
              speakingProgress: 0,
              writingProgress: 0
            };
            await setDoc(userRef, newProfile);
          }
        } catch (error) {
          console.error("Error fetching/creating user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/tasks`), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserTask)));
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}/tasks`));
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const qGame = query(collection(db, `users/${user.uid}/gameResults`), orderBy('date', 'desc'));
    const unsubscribeGame = onSnapshot(qGame, (snap) => {
      setGameResults(snap.docs.map(d => d.data() as GameResult));
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}/gameResults`));

    const qSpeaking = query(collection(db, `users/${user.uid}/speakingAttempts`), orderBy('date', 'desc'));
    const unsubscribeSpeaking = onSnapshot(qSpeaking, (snap) => {
      setSpeakingAttempts(snap.docs.map(d => d.data() as SpeakingAttempt));
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}/speakingAttempts`));

    const qWriting = query(collection(db, `users/${user.uid}/writingChecks`), orderBy('date', 'desc'));
    const unsubscribeWriting = onSnapshot(qWriting, (snap) => {
      setWritingChecks(snap.docs.map(d => d.data() as WritingCheck));
    }, (e) => handleFirestoreError(e, OperationType.GET, `users/${user.uid}/writingChecks`));

    return () => {
      unsubscribeGame();
      unsubscribeSpeaking();
      unsubscribeWriting();
    };
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setAllStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (e) => handleFirestoreError(e, OperationType.GET, 'users'));
    return unsubscribe;
  }, [isAdmin]);

  useEffect(() => {
    const q = query(collection(db, 'gameQuestions'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const dbQuestions = snap.docs.map(d => ({ id: d.id, ...d.data() } as GameQuestion));
      setGameQuestions(dbQuestions);
    }, (e) => handleFirestoreError(e, OperationType.GET, 'gameQuestions'));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'speakingPrompts'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const dbPrompts = snap.docs.map(d => ({ id: d.id, ...d.data() } as SpeakingPrompt));
      setSpeakingPrompts(dbPrompts);
    }, (e) => handleFirestoreError(e, OperationType.GET, 'speakingPrompts'));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'writingTopics'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const dbTopics = snap.docs.map(d => ({ id: d.id, ...d.data() } as WritingTopic));
      setWritingTopics(dbTopics);
    }, (e) => handleFirestoreError(e, OperationType.GET, 'writingTopics'));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'dictationSentences'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const dbSentences = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDictationSentences(dbSentences);
    }, (e) => handleFirestoreError(e, OperationType.GET, 'dictationSentences'));
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-brand-indigo border-t-transparent rounded-full animate-spin shadow-xl" />
          <p className="text-brand-indigo font-black text-xl animate-pulse">Beeable...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black font-sans transition-colors duration-300 flex flex-col overflow-x-hidden">
        <header className="sticky top-0 z-[70] border-b border-orange-400/30 bg-gradient-to-r from-[#ff8a00] via-[#ff9a1f] to-[#ffb347] backdrop-blur-md text-black shadow-lg shadow-orange-500/20">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 lg:flex-none">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-brand-indigo rounded-xl flex items-center justify-center text-black font-black shrink-0">
                  <BookOpen size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-black leading-none tracking-wide text-sm sm:text-base truncate">Beeable</p>
                  <p className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-orange-300/80 truncate">Logistics Learning Hub</p>
                </div>
              </div>

              <div className="hidden lg:flex flex-1 justify-center">
                <HeaderMenu
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isAdmin={isAdmin}
                  isOpen={isMenuOpen}
                  setIsOpen={setIsMenuOpen}
                />
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {user && (
                  <div
                    className="relative"
                    onMouseEnter={() => setIsProfileDropdownOpen(true)}
                    onMouseLeave={() => setIsProfileDropdownOpen(false)}
                  >
                    <button
                      onClick={() => setIsProfileDropdownOpen(prev => !prev)}
                      className="w-10 h-10 rounded-full border-2 border-orange-400/50 bg-[#1a1a1a] overflow-hidden flex items-center justify-center text-orange-100 font-black"
                      aria-label="User menu"
                    >
                      {userProfile?.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{(userProfile?.displayName || user.email || 'U').charAt(0).toUpperCase()}</span>
                      )}
                    </button>

                    <div className={cn(
                      "absolute right-0 mt-2 w-48 rounded-xl border border-orange-500/30 bg-[#121212] shadow-2xl overflow-hidden transition-all duration-150 z-[80]",
                      isProfileDropdownOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"
                    )}>
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setIsProfileDropdownOpen(false);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-orange-100 hover:bg-orange-500/15 transition-all"
                      >
                        Xem hồ sơ
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setIsProfileDropdownOpen(false);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-orange-100 hover:bg-orange-500/15 transition-all"
                      >
                        Cài đặt
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20 transition-all"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden p-2 text-orange-100 hover:bg-orange-500/20 rounded-lg transition-all shrink-0"
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            <div className="lg:hidden">
              <HeaderMenu
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isAdmin={isAdmin}
                isOpen={isMenuOpen}
                setIsOpen={setIsMenuOpen}
              />
            </div>
          </div>
        </header>

        <div className="flex flex-1">
            <main className={cn(
              "flex-1 p-3 sm:p-6 lg:p-12 transition-all duration-300 min-w-0"
            )}>
          {activeTab === 'about' ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto"
              >
                <AboutUsView user={user} onGoHome={() => setActiveTab('home')} />
              </motion.div>
            </AnimatePresence>
          ) : !user ? (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8">
              <div className="w-32 h-32 bg-brand-indigo rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 dark:shadow-none animate-float">
                <Rocket size={64} />
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  Làm chủ Tiếng Anh Chuyên Ngành với <span className="text-brand-indigo">Beeable</span>
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Hành trình thám hiểm tri thức dành riêng cho sinh viên kỹ thuật và công nghệ.
                </p>
              </div>
              <button 
                onClick={signInWithGoogle}
                className="cute-button-primary flex items-center gap-3 text-lg px-12 py-5"
              >
                <Rocket size={24} />
                Bắt đầu thám hiểm!
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto"
              >
                {activeTab === 'home' && <HomeView user={user} userProfile={userProfile} tasks={tasks} setActiveTab={setActiveTab} />}
                {activeTab === 'expeditions' && (
                  <ExpeditionsView 
                    userId={user.uid} 
                    userProfile={userProfile} 
                    gameQuestions={gameQuestions.length > 0 ? gameQuestions : GAME_QUESTIONS} 
                    isAdmin={isAdmin} 
                    speakingPrompts={speakingPrompts.length > 0 ? speakingPrompts : SPEAKING_PROMPTS}
                    writingTopics={writingTopics.length > 0 ? writingTopics : WRITING_TOPICS}
                    dictationSentences={dictationSentences.length > 0 ? dictationSentences : DICTATION_SENTENCES.map((s, i) => ({ id: `ds-${i}`, text: s, order: i }))}
                    onStartLogistics={() => setActiveTab('logistics')}
                  />
                )}
                {activeTab === 'logistics' && <LogisticsChallenge userId={user.uid} userProfile={userProfile} />}
                {activeTab === 'speaking' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="cute-card p-8">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-pink-50 dark:bg-pink-900/20 rounded-2xl flex items-center justify-center text-brand-pink">
                          <Mic size={32} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-brand-indigo">Luyện Phát Âm</h2>
                          <p className="text-slate-400 dark:text-slate-500 font-bold">Cải thiện khả năng nói tiếng Anh chuyên ngành</p>
                        </div>
                      </div>
                      <SpeakingView 
                        userId={user.uid} 
                        userProfile={userProfile} 
                        isAdmin={isAdmin} 
                        prompts={speakingPrompts.length > 0 ? speakingPrompts : SPEAKING_PROMPTS} 
                      />
                    </div>
                  </div>
                )}
                {activeTab === 'writing' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="cute-card p-8">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-brand-indigo">
                          <PenTool size={32} />
                        </div>
                        <div>
                          <h2 className="text-3xl font-black text-brand-indigo">Luyện Viết AI</h2>
                          <p className="text-slate-400 dark:text-slate-500 font-bold">Kiểm tra ngữ pháp và từ vựng chuyên ngành</p>
                        </div>
                      </div>
                      <WritingView 
                        userId={user.uid} 
                        userProfile={userProfile} 
                        isAdmin={isAdmin} 
                        topics={writingTopics.length > 0 ? writingTopics : WRITING_TOPICS} 
                        dictationSentences={dictationSentences.length > 0 ? dictationSentences : DICTATION_SENTENCES.map((s, i) => ({ id: `ds-${i}`, text: s, order: i }))} 
                      />
                    </div>
                  </div>
                )}
                {activeTab === 'leaderboard' && <LeaderboardView />}
                {activeTab === 'tasks' && <TasksView userId={user.uid} tasks={tasks} />}
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <div className="cute-card p-12 text-center space-y-6">
                      <img src={userProfile?.photoURL} alt="Avatar" className="w-32 h-32 rounded-full mx-auto border-4 border-brand-pink" referrerPolicy="no-referrer" />
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white">{userProfile?.displayName}</h2>
                      <p className="text-slate-500 dark:text-slate-400 font-bold">{userProfile?.email}</p>
                      <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
                        <div className="space-y-1">
                          <p className="text-3xl font-black text-brand-pink">1</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Ngày Streak</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-3xl font-black text-brand-indigo">{tasks.filter(t => t.completed).length}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Nhiệm vụ xong</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-3xl font-black text-brand-yellow">{gameResults.reduce((acc, curr) => acc + curr.score * 10, 0)}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Điểm XP</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="cute-card p-8 space-y-6">
                        <h3 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white"><Gamepad2 className="text-brand-indigo" /> Lịch sử Game Zone</h3>
                        <div className="space-y-4">
                          {gameResults.slice(0, 5).map((res, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                              <div>
                                <p className="font-bold text-slate-700 dark:text-slate-200">{res.gameType}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(res.date).toLocaleDateString()}</p>
                              </div>
                              <span className="font-black text-brand-indigo">{res.score}/{res.totalQuestions}</span>
                            </div>
                          ))}
                          {gameResults.length === 0 && <p className="text-slate-400 dark:text-slate-500 italic">Chưa có kết quả game nào.</p>}
                        </div>
                      </div>

                      <div className="cute-card p-8 space-y-6">
                        <h3 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white"><Mic className="text-brand-pink" /> Luyện phát âm</h3>
                        <div className="space-y-4">
                          {speakingAttempts.slice(0, 5).map((att, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-700 dark:text-slate-200 truncate">"{att.recognizedText}"</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(att.date).toLocaleDateString()}</p>
                              </div>
                              {att.isCorrect ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-red-400" size={20} />}
                            </div>
                          ))}
                          {speakingAttempts.length === 0 && <p className="text-slate-400 dark:text-slate-500 italic">Chưa có lượt luyện nói nào.</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'settings' && (
                  <div className="cute-card p-12 space-y-8">
                    <h2 className="text-3xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                      <Settings className="text-slate-400 dark:text-slate-500" /> Cài đặt
                    </h2>
                    <div className="space-y-4">
                      {isAdmin && (
                        <div className="p-8 bg-brand-indigo/10 dark:bg-indigo-900/20 rounded-[2rem] border-2 border-brand-indigo/20 space-y-6">
                          <h3 className="text-xl font-black text-brand-indigo flex items-center gap-2">
                            <ShieldCheck size={24} /> Quyền Giáo viên (Test Mode)
                          </h3>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Speaking Level</p>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6].map(l => (
                                  <button 
                                    key={l}
                                    onClick={() => updateDoc(doc(db, 'users', user.uid), { speakingLevel: l })}
                                    className={cn(
                                      "w-10 h-10 rounded-xl font-black transition-all",
                                      userProfile?.speakingLevel === l ? "bg-brand-indigo text-white shadow-lg" : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                                    )}
                                  >
                                    {l}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Writing Level</p>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6].map(l => (
                                  <button 
                                    key={l}
                                    onClick={() => updateDoc(doc(db, 'users', user.uid), { writingLevel: l })}
                                    className={cn(
                                      "w-10 h-10 rounded-xl font-black transition-all",
                                      userProfile?.writingLevel === l ? "bg-brand-indigo text-white shadow-lg" : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                                    )}
                                  >
                                    {l}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-200">Thông báo</p>
                          <p className="text-sm text-brand-indigo dark:text-indigo-400 font-bold">Nhận lời nhắc học tập mỗi ngày</p>
                        </div>
                        <div className="w-12 h-6 bg-brand-pink rounded-full relative">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-200">Chế độ tối</p>
                          <p className="text-sm text-brand-indigo dark:text-indigo-400 font-bold">Giao diện ban đêm</p>
                        </div>
                        <button 
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-all duration-300",
                            isDarkMode ? "bg-brand-indigo" : "bg-slate-200 dark:bg-slate-700"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                            isDarkMode ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-4">Dành cho Giáo viên</p>
                        <button 
                          onClick={() => setActiveTab('admin')}
                          className="cute-button-primary w-full"
                        >
                          Vào trang Quản trị
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'admin' && (
                <AdminPanel 
                  students={allStudents} 
                  gameQuestions={gameQuestions}
                  speakingPrompts={speakingPrompts}
                  writingTopics={writingTopics}
                  dictationSentences={dictationSentences}
                />
              )}
              </motion.div>
            </AnimatePresence>
          )}
            </main>
        </div>

        <footer className="border-t border-orange-400/30 bg-gradient-to-r from-[#ff8a00] via-[#ff9a1f] to-[#ffb347] text-black shadow-[0_-10px_30px_rgba(255,138,0,0.18)]">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
            <p className="font-bold tracking-wide">Beeable Platform</p>
            <p className="text-orange-300/80">© 2026. Built for practical English in tech and logistics.</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
