import { TheoryItem, GameQuestion, SpeakingPrompt, WritingTopic } from './types';

// (1) Lexical knowledge (Kiến thức từ vựng)
export const LEXICAL_KNOWLEDGE: TheoryItem[] = [
  {
    id: 'lex-1',
    category: 'lexical',
    title: 'Core Terms (Từ vựng cốt lõi)',
    content: 'Transshipment: Chuyển tải tại cảng trung chuyển.\nBreak-bulk: Chia lẻ hàng, không đi nguyên container.\nCross-docking: Kho bãi không lưu kho, chuyển thẳng sang giao nhận.\nOrder picking: Lấy hàng theo đơn.\nReverse logistics: Logistics ngược (thu hồi, bảo hành, tái chế).\nTracking and tracing: Theo dõi và truy xuất lô hàng.\nWarehousing: Hoạt động kho bãi và quản lý tồn kho.\nConsolidation: Gom nhiều lô hàng nhỏ thành một lô lớn.\nInventory: Hàng tồn kho.\nFreight forwarding: Dịch vụ giao nhận vận tải quốc tế.'
  },
  {
    id: 'lex-2',
    category: 'lexical',
    title: 'Collocations (Cụm từ thường gặp)',
    content: 'Provide solutions: Cung cấp giải pháp.\nEnsure delivery: Đảm bảo việc giao hàng.\nSpecialize in: Chuyên về.\nMeet needs: Đáp ứng nhu cầu.\nReal-time information: Thông tin thời gian thực.\nHandle shipments: Xử lý các lô hàng.\nA wide range of: Đa dạng các.\nPrice enquiry: Yêu cầu báo giá.'
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
    title: 'Freight & Container Terms (Thuật ngữ vận tải hàng)',
    content: 'FCL (Full Container Load): Hàng nguyên container.\nLCL (Less than Container Load): Hàng lẻ, không đủ container.\n3PL (Third-party logistics): Hậu cần bên thứ ba.\nAWB (Air Waybill): Vận đơn hàng không.\nNVOCC (Non-Vessel Operating Common Carrier): Đơn vị vận chuyển công cộng không tàu.\nEnd-to-end solutions: Giải pháp trọn gói từ đầu đến cuối.'
  },
  {
    id: 'tech-2',
    category: 'technical',
    title: 'Warehouse & Fulfillment (Kho vận và hoàn tất đơn)',
    content: 'DC (Distribution Center): Trung tâm phân phối.\nKitting: Đóng bộ, gom bộ thành một đơn vị.\nPick and pack: Lấy hàng và đóng gói.\nRFID (Radio Frequency Identification): Nhận dạng bằng tần số vô tuyến.\nCustoms clearance: Thông quan hải quan.'
  },
  {
    id: 'tech-3',
    category: 'technical',
    title: 'Transport & Tracking (Vận chuyển và theo dõi)',
    content: 'EDI (Electronic Data Interchange): Trao đổi dữ liệu điện tử.\nHGV (Heavy Goods Vehicle): Xe tải hạng nặng.\nGPS (Global Positioning System): Hệ thống định vị toàn cầu.\nRoute optimization: Tối ưu lộ trình giao nhận.\nInventory accuracy: Độ chính xác tồn kho.'
  }
];

// (3) Grammatical structures
export const GRAMMAR_STRUCTURES: TheoryItem[] = [
  {
    id: 'gram-1',
    category: 'grammar',
    title: 'Simple Present: To Be (Affirmative)',
    content: 'Cấu trúc: S + am/is/are + Complement.\nVí dụ: I am a logistics coordinator. The warehouse is busy in the morning. They are delivery drivers.'
  },
  {
    id: 'gram-2',
    category: 'grammar',
    title: 'Present Continuous (Thì hiện tại tiếp diễn)',
    content: 'Cấu trúc: S + am/is/are + V-ing.\nVí dụ: We are loading the container now. The team is checking the shipping documents. They are tracking the truck in real time.'
  },
  {
    id: 'gram-3',
    category: 'grammar',
    title: 'Passive Voice (Câu bị động)',
    content: 'Cấu trúc: S + be + V3/ed.\nVí dụ: The goods are packed before dispatch. The shipment was delayed by bad weather. The cargo is inspected at the distribution center.'
  }
];

// (4) Game zone (4 tasks to review Voc. and Gram.)
export const GAME_QUESTIONS: GameQuestion[] = [
  {
    id: 'q1',
    category: 'vocab',
    question: 'Our company works hard to ______ solutions for all your transport problems. (Công ty chúng tôi nỗ lực để ______ giải pháp cho mọi vấn đề vận chuyển.)',
    options: ['make', 'provide', 'do', 'give'],
    answer: 'provide'
  },
  {
    id: 'q2',
    category: 'vocab',
    question: 'We use a GPS system to ______ safe delivery of your goods. (Chúng tôi dùng GPS để ______ giao hàng an toàn.)',
    options: ['sure', 'ensure', 'check', 'follow'],
    answer: 'ensure'
  },
  {
    id: 'q3',
    category: 'vocab',
    question: 'GET Global Carrier ______ in sea freight and large containers. (GET Global Carrier ______ vận tải biển và container lớn.)',
    options: ['specializes', 'special', 'specialist', 'specializing'],
    answer: 'specializes'
  },
  {
    id: 'q4',
    category: 'vocab',
    question: 'We offer different services to ______ the needs of every customer. (Chúng tôi cung cấp nhiều dịch vụ để ______ nhu cầu của từng khách hàng.)',
    options: ['see', 'meet', 'find', 'welcome'],
    answer: 'meet'
  },
  {
    id: 'q5',
    category: 'vocab',
    question: 'With our app, you can get ______ information about where your package is. (Với ứng dụng của chúng tôi, bạn có thể nhận thông tin ______ về vị trí kiện hàng.)',
    options: ['real-time', 'real-day', 'quick-time', 'now-info'],
    answer: 'real-time'
  },
  {
    id: 'q6',
    category: 'vocab',
    question: 'Our staff will ______ your shipments very carefully. (Nhân viên chúng tôi sẽ ______ các lô hàng của bạn rất cẩn thận.)',
    options: ['hand', 'handle', 'touch', 'carry'],
    answer: 'handle'
  },
  {
    id: 'q7',
    category: 'vocab',
    question: 'Sichuan Logistics offers ______ range of value-added services. (Sichuan Logistics cung cấp ______ các dịch vụ giá trị gia tăng.)',
    options: ['a wide', 'a broad', 'a deep', 'a high'],
    answer: 'a wide'
  },
  {
    id: 'q8',
    category: 'vocab',
    question: 'You can make a ______ enquiry online to get a quote for your shipping. (Bạn có thể tạo yêu cầu ______ trực tuyến để nhận báo giá vận chuyển.)',
    options: ['rate', 'price', 'bill', 'cash'],
    answer: 'price'
  }
];

// (5) Communicative competence
export const SPEAKING_PROMPTS: SpeakingPrompt[] = [
  { id: 'sp-1', text: 'Our company provides customized logistics solutions for your shipping needs.', translation: 'Công ty chúng tôi cung cấp các giải pháp logistics tùy chỉnh cho nhu cầu vận chuyển của bạn.', category: 'professional' },
  { id: 'sp-2', text: 'We specialize in full container load and international freight forwarding services.', translation: 'Chúng tôi chuyên về hàng nguyên container và dịch vụ giao nhận vận tải quốc tế.', category: 'technical' },
  { id: 'sp-3', text: 'Our team handles shipments carefully and ensures on-time delivery.', translation: 'Đội ngũ của chúng tôi xử lý lô hàng cẩn thận và đảm bảo giao hàng đúng hạn.', category: 'professional' },
  { id: 'sp-4', text: 'You can track your cargo in real time with our GPS-based system.', translation: 'Bạn có thể theo dõi lô hàng theo thời gian thực bằng hệ thống dựa trên GPS của chúng tôi.', category: 'technical' },
  { id: 'sp-5', text: 'We offer a wide range of value-added services, including pick and pack.', translation: 'Chúng tôi cung cấp đa dạng dịch vụ giá trị gia tăng, bao gồm lấy hàng và đóng gói.', category: 'professional' }
];

export const DICTATION_SENTENCES = [
  "The shipment is delayed due to heavy rain at the port.",
  "Please confirm the pickup time with the trucking partner.",
  "All cartons must be labeled before loading the container.",
  "We need to update the estimated arrival time for this order.",
  "The warehouse team completed inbound inspection this morning.",
  "Customs clearance requires the commercial invoice and packing list.",
  "Our dispatcher optimized the route to reduce fuel costs.",
  "The driver reported a traffic jam near the distribution center.",
  "Inventory accuracy improved after the weekly cycle count.",
  "Customer satisfaction depends on on-time and damage-free delivery."
];

export const WRITING_TOPICS: WritingTopic[] = [
  { id: 'wt-1', title: 'Professional Email to Shipper', description: 'Write an email to a shipper to confirm cargo details, pickup date, and required documents.', category: 'email', level: 5 },
  { id: 'wt-2', title: 'Delay Notice', description: 'Write a short notice to inform a customer about a shipment delay and propose a revised ETA.', category: 'professional', level: 3 },
  { id: 'wt-3', title: 'Incident Report', description: 'Describe a logistics incident at the warehouse and explain immediate corrective actions.', category: 'technical', level: 5 },
  { id: 'wt-4', title: 'Daily Operations Update', description: 'Summarize today\'s loading, dispatch, and delivery status for your supervisor.', category: 'professional', level: 2 },
  { id: 'wt-5', title: 'Route Optimization Suggestion', description: 'Propose improvements to reduce delivery time and fuel cost on a regular route.', category: 'technical', level: 4 },
  { id: 'wt-6', title: 'Warehouse Improvement Proposal', description: 'Write a structured proposal to improve warehouse workflow, safety, and inventory accuracy.', category: 'professional', level: 6 }
];
