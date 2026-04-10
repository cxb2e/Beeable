import { 
  Baby, 
  GraduationCap, 
  Award, 
  Users, 
  MessageSquare, 
  Trophy,
  PenTool,
  BookOpen,
  CheckCircle2,
  FileText,
  Rocket
} from 'lucide-react';

export const RANKS = [
  { level: 1, label: 'Mầm non', icon: '🌱', minXp: 0 },
  { level: 2, label: 'Học sinh', icon: '🌿', minXp: 500 },
  { level: 3, label: 'Học sinh giỏi', icon: '🍃', minXp: 1500 },
  { level: 4, label: 'Thiếu niên', icon: '🌸', minXp: 3500 },
  { level: 5, label: 'Chuyên gia', icon: '🌟', minXp: 7000 },
  { level: 6, label: 'Bậc thầy', icon: '🏆', minXp: 12000 },
];

export const SPEAKING_LEVEL_CONFIG = [
  {
    level: 1,
    title: 'Mầm non',
    icon: '🌱',
    description: 'Nghe âm, chọn đáp án đúng',
    requirement: 5,
    type: 'multiple-choice'
  },
  {
    level: 2,
    title: 'Học sinh',
    icon: '🌿',
    description: 'Nghe rồi lặp lại',
    requirement: 10,
    type: 'repeat'
  },
  {
    level: 3,
    title: 'Học sinh giỏi',
    icon: '🍃',
    description: 'Đọc từ đơn (IPA)',
    requirement: 15,
    type: 'word'
  },
  {
    level: 4,
    title: 'Thiếu niên',
    icon: '🌸',
    description: 'Đọc câu, nối âm & ngữ điệu',
    requirement: 10,
    type: 'sentence'
  },
  {
    level: 5,
    title: 'Chuyên gia',
    icon: '🌟',
    description: 'Hội thoại ngắn với AI',
    requirement: 5,
    type: 'conversation'
  },
  {
    level: 6,
    title: 'Bậc thầy',
    icon: '🏆',
    description: 'Đóng vai thực tế',
    requirement: 3,
    type: 'roleplay'
  }
];

export const WRITING_LEVEL_CONFIG = [
  {
    level: 1,
    title: 'Mầm non',
    icon: '🌱',
    description: 'Chép chính tả, sửa lỗi',
    requirement: 5,
    type: 'dictation'
  },
  {
    level: 2,
    title: 'Học sinh',
    icon: '🌿',
    description: 'Điền từ vào chỗ trống',
    requirement: 10,
    type: 'fill-blank'
  },
  {
    level: 3,
    title: 'Học sinh giỏi',
    icon: '🍃',
    description: 'Viết câu từ từ khóa',
    requirement: 15,
    type: 'keywords'
  },
  {
    level: 4,
    title: 'Thiếu niên',
    icon: '🌸',
    description: 'Viết lại câu (Paraphrase)',
    requirement: 10,
    type: 'paraphrase'
  },
  {
    level: 5,
    title: 'Chuyên gia',
    icon: '🌟',
    description: 'Viết đoạn văn (3-5 câu)',
    requirement: 5,
    type: 'paragraph'
  },
  {
    level: 6,
    title: 'Bậc thầy',
    icon: '🏆',
    description: 'Viết bài hoàn chỉnh',
    requirement: 3,
    type: 'essay'
  }
];

export const getRank = (xp: number) => {
  return [...RANKS].reverse().find(r => xp >= r.minXp) || RANKS[0];
};
