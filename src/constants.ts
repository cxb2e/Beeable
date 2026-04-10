import { TheoryItem, GameQuestion, SpeakingPrompt, WritingTopic } from './types';

// (1) Lexical knowledge (Kiến thức từ vựng)
export const LEXICAL_KNOWLEDGE: TheoryItem[] = [
  {
    id: 'lex-1',
    category: 'lexical',
    title: 'Core Terms (Từ vựng cốt lõi)',
    content: 'Innovation: Sự đổi mới, sáng tạo.\nEfficiency: Hiệu quả, năng suất cao.\nScalability: Khả năng mở rộng.\nRobustness: Tính mạnh mẽ, ổn định.\nReliability: Độ tin cậy.\nMaintainability: Khả năng bảo trì.'
  },
  {
    id: 'lex-2',
    category: 'lexical',
    title: 'Collocations (Cụm từ thường gặp)',
    content: 'Make a decision: Đưa ra quyết định.\nTake a risk: Chấp nhận rủi ro.\nSolve a problem: Giải quyết vấn đề.\nManage a project: Quản lý dự án.\nMeet a deadline: Kịp thời hạn.\nDeliver a solution: Cung cấp một giải pháp.'
  },
  {
    id: 'lex-3',
    category: 'lexical',
    title: 'Workplace Communication',
    content: 'Collaborate: Cộng tác.\nCoordinate: Phối hợp.\nFacilitate: Tạo điều kiện thuận lợi.\nImplement: Triển khai, thực hiện.'
  }
];

// (2) Technical terminologies (Thuật ngữ chuyên ngành)
export const TECHNICAL_TERMINOLOGIES: TheoryItem[] = [
  {
    id: 'tech-1',
    category: 'technical',
    title: 'Software Development (Phát triển phần mềm)',
    content: 'Algorithm: Thuật toán.\nDatabase: Cơ sở dữ liệu.\nFramework: Bộ khung phần mềm.\nAPI (Application Programming Interface): Giao diện lập trình ứng dụng.\nVersion Control: Kiểm soát phiên bản (Git).\nDeployment: Triển khai phần mềm.'
  },
  {
    id: 'tech-2',
    category: 'technical',
    title: 'Cloud & Infrastructure',
    content: 'Cloud Computing: Điện toán đám mây.\nVirtualization: Ảo hóa.\nContainerization: Đóng gói ứng dụng (Docker).\nMicroservices: Kiến trúc vi dịch vụ.\nLoad Balancing: Cân bằng tải.'
  },
  {
    id: 'tech-3',
    category: 'technical',
    title: 'Cybersecurity',
    content: 'Encryption: Mã hóa.\nFirewall: Tường lửa.\nAuthentication: Xác thực.\nAuthorization: Phân quyền.\nVulnerability: Lỗ hổng bảo mật.'
  }
];

// (3) Grammatical structures
export const GRAMMAR_STRUCTURES: TheoryItem[] = [
  {
    id: 'gram-1',
    category: 'grammar',
    title: 'Simple Present: To Be (Affirmative)',
    content: 'Cấu trúc: S + am/is/are + Complement.\nVí dụ: I am a software engineer. The system is robust. They are developers.'
  },
  {
    id: 'gram-2',
    category: 'grammar',
    title: 'Present Continuous (Thì hiện tại tiếp diễn)',
    content: 'Cấu trúc: S + am/is/are + V-ing.\nVí dụ: We are developing a new feature. The server is processing the request. They are testing the application.'
  },
  {
    id: 'gram-3',
    category: 'grammar',
    title: 'Passive Voice (Câu bị động)',
    content: 'Cấu trúc: S + be + V3/ed.\nVí dụ: The bug was fixed yesterday. The data is encrypted for security. The system is maintained regularly.'
  }
];

// (4) Game zone (4 tasks to review Voc. and Gram.)
export const GAME_QUESTIONS: GameQuestion[] = [
  {
    id: 'q1',
    category: 'vocab',
    question: 'What is the ability of a system to handle a growing amount of work? (Khả năng hệ thống xử lý khối lượng công việc ngày càng tăng là gì?)',
    options: ['Innovation', 'Scalability', 'Efficiency', 'Robustness'],
    answer: 'Scalability'
  },
  {
    id: 'q2',
    category: 'vocab',
    question: 'A set of rules to be followed in calculations or other problem-solving operations is an... (Một tập hợp các quy tắc được tuân thủ trong tính toán là...)',
    options: ['Algorithm', 'Database', 'Framework', 'API'],
    answer: 'Algorithm'
  },
  {
    id: 'q3',
    category: 'grammar',
    question: 'Complete: The new software ____ very efficient. (Hoàn thành: Phần mềm mới ____ rất hiệu quả.)',
    options: ['am', 'is', 'are', 'be'],
    answer: 'is'
  },
  {
    id: 'q4',
    category: 'grammar',
    question: 'Complete: Our team ____ high-quality code every day. (Hoàn thành: Đội ngũ của chúng tôi ____ mã nguồn chất lượng cao mỗi ngày.)',
    options: ['write', 'writes', 'writing', 'wrote'],
    answer: 'writes'
  },
  {
    id: 'q5',
    category: 'vocab',
    question: 'Which term refers to the process of packaging an application with its dependencies? (Thuật ngữ nào chỉ quá trình đóng gói ứng dụng cùng với các phụ thuộc của nó?)',
    options: ['Virtualization', 'Containerization', 'Encryption', 'Deployment'],
    answer: 'Containerization'
  },
  {
    id: 'q6',
    category: 'vocab',
    question: 'What is a "Firewall" used for? (Tường lửa được sử dụng để làm gì?)',
    options: ['Data storage', 'Network security', 'UI design', 'Code testing'],
    answer: 'Network security'
  },
  {
    id: 'q7',
    category: 'grammar',
    question: 'Complete: The data ____ encrypted before being sent. (Hoàn thành: Dữ liệu ____ được mã hóa trước khi gửi đi.)',
    options: ['is', 'are', 'am', 'be'],
    answer: 'is'
  },
  {
    id: 'q8',
    category: 'grammar',
    question: 'Complete: We ____ currently testing the new API. (Hoàn thành: Chúng tôi ____ hiện đang kiểm thử API mới.)',
    options: ['is', 'are', 'am', 'be'],
    answer: 'are'
  }
];

// (5) Communicative competence
export const SPEAKING_PROMPTS: SpeakingPrompt[] = [
  { id: 'sp-1', text: 'I am a software engineer working on innovation.', translation: 'Tôi là một kỹ sư phần mềm đang làm việc về sự đổi mới.', category: 'professional' },
  { id: 'sp-2', text: 'The system architecture is highly scalable and robust.', translation: 'Kiến trúc hệ thống có khả năng mở rộng cao và mạnh mẽ.', category: 'technical' },
  { id: 'sp-3', text: 'We need to implement a more secure authentication method.', translation: 'Chúng ta cần triển khai một phương thức xác thực an toàn hơn.', category: 'technical' },
  { id: 'sp-4', text: 'Can you explain the benefits of using a microservices architecture?', translation: 'Bạn có thể giải thích lợi ích của việc sử dụng kiến trúc vi dịch vụ không?', category: 'professional' },
  { id: 'sp-5', text: 'The deployment process is fully automated using CI/CD pipelines.', translation: 'Quá trình triển khai được tự động hóa hoàn toàn bằng đường ống CI/CD.', category: 'technical' }
];

export const DICTATION_SENTENCES = [
  "The server is currently down for maintenance.",
  "Our team uses React for the frontend development.",
  "The database needs to be optimized for better performance.",
  "Innovation is the key to success in the IT industry.",
  "We are working on a highly scalable cloud architecture.",
  "Cybersecurity is a top priority for our organization.",
  "The API documentation provides clear instructions for integration.",
  "We use Git for version control and collaboration.",
  "The application is deployed on a Kubernetes cluster.",
  "User experience is crucial for the success of any software product."
];

export const WRITING_TOPICS: WritingTopic[] = [
  { id: 'wt-1', title: 'Professional Email', description: 'Write an email to your manager about the progress of the current project.', category: 'email', level: 5 },
  { id: 'wt-2', title: 'Bug Report', description: 'Write a bug report describing a technical issue you found in the application.', category: 'technical', level: 5 },
  { id: 'wt-3', title: 'Feature Proposal', description: 'Write a short proposal for a new feature that could improve the system.', category: 'professional', level: 6 },
  { id: 'wt-4', title: 'Daily Standup', description: 'Describe what you did yesterday and what you will do today.', category: 'professional', level: 2 },
  { id: 'wt-5', title: 'Code Review', description: 'Explain why a certain piece of code needs improvement.', category: 'technical', level: 3 },
  { id: 'wt-6', title: 'Meeting Minutes', description: 'Summarize the key points discussed in a technical meeting.', category: 'professional', level: 4 }
];
