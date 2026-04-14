import { TheoryItem, GameQuestion, SpeakingPrompt, WritingTopic, VocabularyItem } from './types';

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

// (4) Logistics Vocabulary (Chi tiết từ vựng chuyên ngành)
export const LOGISTICS_VOCABULARY: VocabularyItem[] = [
  {
    id: 'vocab-1',
    term: 'Transshipment',
    pronunciation: '/trænz ʃɪpmәnt/',
    definitionEnglish: 'Loading goods from one means of carriage onto another.',
    meaningVietnamese: 'Chuyển tải',
    examplesInContext: [
      'The goods were transshipped at Singapore port.',
      'Due to the shallow water at the destination port, transshipment to smaller barges was necessary.'
    ],
    relatedWordForms: [{ form: 'Transship (v)', meaning: 'Chuyển tải' }],
    notes: 'Thường dùng khi địa lý hoặc phương tiện tài chính buộc phải chuyển đổi.'
  },
  {
    id: 'vocab-2',
    term: 'Break-bulk',
    pronunciation: '/bresk/, /balk/',
    definitionEnglish: 'Packing goods in small, separable units.',
    meaningVietnamese: 'Chia lẻ hàng / Hàng rời',
    examplesInContext: [
      'Most machinery is transported as break-bulk cargo.'
    ],
    relatedWordForms: [{ form: 'Break bulk (v)', meaning: 'Chia lẻ hàng' }],
    notes: 'Đối lập với hàng đóng nguyên container (FCLs)'
  },
  {
    id: 'vocab-3',
    term: 'Cross-docking',
    pronunciation: '/krɔs/, /dɑkɪŋ/',
    definitionEnglish: 'Direct flow of goods from receipt at warehouse to shipping, bypassing storage.',
    meaningVietnamese: 'Giải pháp kho bãi không lưu kho',
    examplesInContext: [
      'Cross-docking helps us deliver fresh food faster.'
    ],
    relatedWordForms: [{ form: 'Cross-dock (v)', meaning: 'Giao hàng trực tiếp' }],
    notes: 'Giúp giảm chi phí lưu kho và thời gian chợ.'
  },
  {
    id: 'vocab-4',
    term: 'Order picking',
    pronunciation: '/ˈɔrdәr/, /ˈpɪkɪŋ/',
    definitionEnglish: 'Selecting and assembling items from stock for shipment.',
    meaningVietnamese: 'Lấy hàng theo đơn',
    examplesInContext: [
      'We use robots to speed up the order picking process.'
    ],
    relatedWordForms: [
      { form: 'Pick (v)', meaning: 'Lấy' },
      { form: 'Picker (n)', meaning: 'Người lấy hàng' }
    ],
    notes: 'Là khâu tốn nhiều nhân lực trong toàn bộ xử lý.'
  },
  {
    id: 'vocab-5',
    term: 'Reverse logistics',
    pronunciation: '/rɪ vɜːs/, /lәˈdʒɪstɪks/',
    definitionEnglish: 'Collecting and handling of used or damaged goods.',
    meaningVietnamese: 'Logistics ngược',
    examplesInContext: [
      'Reverse logistics is essential for our warranty program.'
    ],
    relatedWordForms: [],
    notes: 'Bao gồm thu hồi, bảo hành và tái chế.'
  },
  {
    id: 'vocab-6',
    term: 'Tracking and tracing',
    pronunciation: '/ˈtrækɪŋ/, /ˈeɪnd/, /ˈtresɪŋ/',
    definitionEnglish: 'Locating items in transit.',
    meaningVietnamese: 'Theo dõi và truy xuất lô hàng',
    examplesInContext: [
      'We provide real-time tracking and tracing of all transport companies.'
    ],
    relatedWordForms: [
      { form: 'Track (v), Trace (v)', meaning: 'Theo dõi, Truy xuất' }
    ],
    notes: '"Track" là yếu tố lịch sử của hàng hóa.'
  },
  {
    id: 'vocab-7',
    term: 'Warehousing',
    pronunciation: '/ˈweәhaʊzɪŋ/',
    definitionEnglish: 'Receiving and storing goods.',
    meaningVietnamese: 'Hoạt động kho bãi',
    examplesInContext: [
      'Efficient warehousing is key to supply chain success.'
    ],
    relatedWordForms: [{ form: 'Warehouse (n/v)', meaning: 'Kho bãi' }],
    notes: 'Bao gồm quản lý tồn kho.'
  },
  {
    id: 'vocab-8',
    term: 'Collection',
    pronunciation: '/kәˈlekʃәn/',
    definitionEnglish: 'Picking up goods at a named place.',
    meaningVietnamese: 'Thu gom hàng / Lấy hàng',
    examplesInContext: [
      'The courier will arrive for the collection at 3 PM.'
    ],
    relatedWordForms: [
      { form: 'Collect (v), Collector (n)', meaning: 'Gom, Ngưòi gom' }
    ],
    notes: 'Thường dùng trong dịch vụ chuyển phát nhanh.'
  },
  {
    id: 'vocab-9',
    term: 'Outsourcing',
    pronunciation: '/ˈaʊtsɜ:rsɪŋ/',
    definitionEnglish: 'Contracting functions out to third-party providers.',
    meaningVietnamese: 'Thuê ngoài',
    examplesInContext: [
      'Many companies prefer outsourcing their warehousing to save costs.'
    ],
    relatedWordForms: [{ form: 'Outsource (v)', meaning: 'Giao một phần việc cho công ty bên ngoài' }],
    notes: 'Giao một phần việc cho công ty bên ngoài.'
  },
  {
    id: 'vocab-10',
    term: 'Consolidation',
    pronunciation: '/kәn,sɑlt deɪʃәn/',
    definitionEnglish: 'Grouping small shipments into one container.',
    meaningVietnamese: 'Gom hàng',
    examplesInContext: [
      'Consolidation helps small businesses reduce shipping expenses.'
    ],
    relatedWordForms: [{ form: 'Consolidate (v)', meaning: 'Gom hàng nhỏ thành một lô' }],
    notes: 'Ghép nhiều lô hàng nhỏ thành một lô lớn.'
  },
  {
    id: 'vocab-11',
    term: 'Value-added service (VAS)',
    pronunciation: '/ˈvæljuː /,æddɪd/ sɜːvɪs/',
    definitionEnglish: 'Extra services that complement basic logistics operations.',
    meaningVietnamese: 'Dịch vụ gia tăng',
    examplesInContext: [
      'We offer labeling and packaging as common value-added services.'
    ],
    relatedWordForms: [],
    notes: 'Các dịch vụ vượt quá nhu cầu cơ bản.'
  },
  {
    id: 'vocab-12',
    term: 'Inventory',
    pronunciation: '/ˈɪnvәntɔri/',
    definitionEnglish: 'A complete list of items such as property, goods in stock.',
    meaningVietnamese: 'Hàng tồn kho',
    examplesInContext: [
      'We use RFID tags to manage our inventory more accurately.'
    ],
    relatedWordForms: [],
    notes: 'Thường dùng với "inventory management".'
  },
  {
    id: 'vocab-13',
    term: 'Freight forwarding',
    pronunciation: '/freɪt/, /ˈfɔrwərdɪŋ/',
    definitionEnglish: 'Organizing the movement and storage of goods for others.',
    meaningVietnamese: 'Dịch vụ giao nhận vận tải quốc tế',
    examplesInContext: [
      'Our company specializes in international freight forwarding.'
    ],
    relatedWordForms: [{ form: 'Forwarder (n)', meaning: 'Công ty giao nhận' }],
    notes: 'Dịch vụ trung gian tổ chức vận chuyển.'
  },
  {
    id: 'vocab-14',
    term: 'Customs brokerage',
    pronunciation: '/ˈkæstәmz/, /ˈbrokərɪdʒ/',
    definitionEnglish: 'The process of clearing goods through customs for a client.',
    meaningVietnamese: 'Dịch vụ làm thủ tục thông quan',
    examplesInContext: [
      'We provide customs brokerage to ensure smooth international shipping.'
    ],
    relatedWordForms: [{ form: 'Broker (n)', meaning: 'Dịch vụ làm thủ tục thông quan' }],
    notes: 'Rất quan trọng cho việc nhập khẩu hàng hóa quốc tế.'
  },
  {
    id: 'vocab-15',
    term: 'Provider',
    pronunciation: '/prәˈvaɪdәr/',
    definitionEnglish: 'A business or person that supplies a particular service.',
    meaningVietnamese: 'Nhà cung cấp',
    examplesInContext: [
      'Cargo Express is Asia\'s leading freight service provider.'
    ],
    relatedWordForms: [{ form: 'provide (v), provision (n)', meaning: 'Cung cấp' }],
    notes: 'Thường dùng với "service provider" hoặc "logistics provider".'
  },
  {
    id: 'vocab-16',
    term: 'Shipping lines',
    pronunciation: '/ˈʃɪpɪŋ/ /laɪnz/',
    definitionEnglish: 'A business that transports cargo onboard ships.',
    meaningVietnamese: 'Chuyên vận tải đường thủy theo thỏa thuận tuyến cố định.',
    examplesInContext: [
      'We can offer our customers competitive rates with all major shipping lines.'
    ],
    relatedWordForms: [{ form: 'ship (v), shipment (n)', meaning: 'Chuyên vận tải' }],
    notes: 'Các công ty vận tải lớn như Maersk, MSC.'
  },
  {
    id: 'vocab-17',
    term: 'Fleet of vehicles',
    pronunciation: '/fliːt/, /әv/, /ˈvi:әklz/',
    definitionEnglish: 'A group of vehicles owned or leased by a company.',
    meaningVietnamese: 'Đội xe',
    examplesInContext: [
      'With a modern fleet of vehicles, we can ensure fast, safe delivery.'
    ],
    relatedWordForms: [{ form: 'fleet (n)', meaning: 'Đội xe hoặc tàu' }],
    notes: 'Có thể dùng cho xe hoặc tàu.'
  },
  {
    id: 'vocab-18',
    term: 'Air carriers',
    pronunciation: '/eәr/, /ˈkæriәr/',
    definitionEnglish: 'A company that provides air transportation for cargo.',
    meaningVietnamese: 'Các hãng hàng không',
    examplesInContext: [
      'We work closely with air carriers around the world.'
    ],
    relatedWordForms: [{ form: 'carry (v), carrier (n)', meaning: 'Vận chuyển, Công ty vận tải' }],
    notes: 'Tập trung vào độ cao cấp vận chuyển.'
  },
  {
    id: 'vocab-19',
    term: 'Transport companies',
    pronunciation: '/ˈtrænspɔrt/, /ˈkәmpәni/',
    definitionEnglish: 'Organizations that move goods from one location to another.',
    meaningVietnamese: 'Các công ty vận tải / Các công ty vận tải hàng hóa',
    examplesInContext: [
      'We are one of the world\'s leading transport companies.'
    ],
    relatedWordForms: [{ form: 'transport (v/n)', meaning: 'Vận chuyển' }],
    notes: 'Thuật ngữ chung cho các công ty vận tải.'
  },
  {
    id: 'vocab-20',
    term: 'Documentation',
    pronunciation: '/ˌdɑkjumәn ˈteɪʃәn/',
    definitionEnglish: 'Official papers used in the shipping process.',
    meaningVietnamese: 'Chứng từ / Tài liệu',
    examplesInContext: [
      'We are one of the world\'s leading transport companies with complete documentation for all services.'
    ],
    relatedWordForms: [{ form: 'document (n/v)', meaning: 'Tài liệu' }],
    notes: 'Rất quan trọng trong quản lý đơn hàng.'
  }
];

// (5) Collocations (Cụm từ thường gặp)
export const COLLOCATION_VOCABULARY: VocabularyItem[] = [
  {
    id: 'coll-1',
    term: 'Provide solutions',
    pronunciation: '/prəˈvaɪd/, /səˈluːʃnz/',
    definitionEnglish: 'To offer answers or services that solve a problem.',
    meaningVietnamese: 'Cung cấp giải pháp',
    examplesInContext: ['We provide customized logistics solutions for your needs.'],
    relatedWordForms: [],
    notes: 'Thường đi với: tailor-made, customized'
  },
  {
    id: 'coll-2',
    term: 'Ensure delivery',
    pronunciation: '/ɪnˈʃʊə(r)/, /dɪˈlɪvəri/',
    definitionEnglish: 'To make sure goods arrive safely and on time.',
    meaningVietnamese: 'Đảm bảo việc giao hàng',
    examplesInContext: ['A modern fleet of vehicles helps ensure fast delivery.'],
    relatedWordForms: [],
    notes: 'Thường đi kèm: safe, fast, on-time'
  },
  {
    id: 'coll-3',
    term: 'Specialise in',
    pronunciation: '/ˈspeʃəlaɪz ɪn/',
    definitionEnglish: 'To focus on one particular field or service.',
    meaningVietnamese: 'Chuyên về',
    examplesInContext: ['Our company specialises in full container loads (FCL).'],
    relatedWordForms: [],
    notes: 'Luôn đi với giới từ "in"'
  },
  {
    id: 'coll-4',
    term: 'Meet needs',
    pronunciation: '/miːt/, /niːdz/',
    definitionEnglish: 'To satisfy what a customer requires.',
    meaningVietnamese: 'Đáp ứng nhu cầu',
    examplesInContext: ['We offer services to meet our clients\' needs.'],
    relatedWordForms: [],
    notes: 'Có thể thay bằng: meet requirements'
  },
  {
    id: 'coll-5',
    term: 'Real-time information',
    pronunciation: '/ˌriː.əl ˈtaɪm/, /ˌɪnfəˈmeɪʃn/',
    definitionEnglish: 'Information available immediately as events happen.',
    meaningVietnamese: 'Thông tin thời gian thực',
    examplesInContext: ['Our system provides real-time shipment information.'],
    relatedWordForms: [],
    notes: 'Rất phổ biến khi nói về tracking/GPS'
  },
  {
    id: 'coll-6',
    term: 'Handle shipments',
    pronunciation: '/ˈhændl/, /ˈʃɪpmənts/',
    definitionEnglish: 'To manage and process shipments.',
    meaningVietnamese: 'Xử lý các lô hàng',
    examplesInContext: ['Our team will be happy to handle your shipments.'],
    relatedWordForms: [],
    notes: '"Handle" nghĩa là tiếp nhận và giải quyết'
  },
  {
    id: 'coll-7',
    term: 'A wide range of',
    pronunciation: '/ə/, /waɪd/, /reɪndʒ/, /əv/',
    definitionEnglish: 'A large variety of options or services.',
    meaningVietnamese: 'Đa dạng các',
    examplesInContext: ['We offer a wide range of flexible services.'],
    relatedWordForms: [],
    notes: 'Dùng để nhấn mạnh sự phong phú'
  },
  {
    id: 'coll-8',
    term: 'Price enquiry',
    pronunciation: '/praɪs/, /ɪnˈkwaɪəri/',
    definitionEnglish: 'A request for a price or quotation.',
    meaningVietnamese: 'Yêu cầu báo giá',
    examplesInContext: ['The online tool allows you to make price enquiries.'],
    relatedWordForms: [],
    notes: 'Thường dùng trong bối cảnh hỏi giá'
  }
];

// (6) Technical terms (Thuật ngữ chuyên ngành)
export const TECHNICAL_VOCABULARY: VocabularyItem[] = [
  {
    id: 'tech-vocab-1',
    term: 'FCL',
    pronunciation: 'Full Container Load',
    definitionEnglish: 'A shipment that uses a full container.',
    meaningVietnamese: 'Hàng nguyên container',
    examplesInContext: ['We specialize in solutions for full container loads (FCL).'],
    relatedWordForms: [],
    notes: 'Người gửi hàng đủ để xếp đầy một container'
  },
  {
    id: 'tech-vocab-2',
    term: 'LCL',
    pronunciation: 'Less than Container Load',
    definitionEnglish: 'A shipment that does not fill a full container.',
    meaningVietnamese: 'Hàng lẻ / Hàng không đủ container',
    examplesInContext: ['We provide solutions for less than container consolidated loads (LCL).'],
    relatedWordForms: [],
    notes: 'Các lô hàng nhỏ được gom lại'
  },
  {
    id: 'tech-vocab-3',
    term: '3PL',
    pronunciation: 'Third-party logistics',
    definitionEnglish: 'Logistics services outsourced to a third party.',
    meaningVietnamese: 'Hậu cần bên thứ ba',
    examplesInContext: ['In the past, companies used to outsource only parts of their logistics to 3PL.'],
    relatedWordForms: [],
    notes: 'Xu hướng hiện nay là Super-3PLs'
  },
  {
    id: 'tech-vocab-4',
    term: 'EDI',
    pronunciation: 'Electronic Data Interchange',
    definitionEnglish: 'The electronic exchange of business documents and data.',
    meaningVietnamese: 'Trao đổi dữ liệu điện tử',
    examplesInContext: ['EDI is one of the essential acronyms in modern logistics.'],
    relatedWordForms: [],
    notes: 'Thay thế chứng từ giấy bằng dữ liệu số'
  },
  {
    id: 'tech-vocab-5',
    term: 'RFID',
    pronunciation: 'Radio Frequency Identification',
    definitionEnglish: 'Technology that uses radio waves to identify and track items.',
    meaningVietnamese: 'Nhận dạng qua tần số vô tuyến',
    examplesInContext: ['We use RFID tags to manage our inventory more accurately.'],
    relatedWordForms: [],
    notes: 'Xác định vị trí hàng hóa nhanh chóng'
  },
  {
    id: 'tech-vocab-6',
    term: 'AWB',
    pronunciation: 'Air Waybill',
    definitionEnglish: 'A document used for air shipment tracking.',
    meaningVietnamese: 'Vận đơn hàng không',
    examplesInContext: ['I just have to enter my air waybill number to track the shipment.'],
    relatedWordForms: [],
    notes: 'Mã số dùng để tracking'
  },
  {
    id: 'tech-vocab-7',
    term: 'NVOCC',
    pronunciation: 'Non-Vessel Operating Common Carrier',
    definitionEnglish: 'A common carrier that does not operate its own vessels.',
    meaningVietnamese: 'Người vận chuyển công cộng không tàu',
    examplesInContext: ['As a major non-vessel operating common carrier, ...'],
    relatedWordForms: [],
    notes: 'Mua chỗ từ hãng tàu và bán lại'
  },
  {
    id: 'tech-vocab-8',
    term: 'DC',
    pronunciation: 'Distribution Center',
    definitionEnglish: 'A facility used for sorting and distributing goods.',
    meaningVietnamese: 'Trung tâm phân phối',
    examplesInContext: ['Implementing new systems has reduced errors in our DC.'],
    relatedWordForms: [],
    notes: 'Nơi tập kết hàng để phân loại'
  },
  {
    id: 'tech-vocab-9',
    term: 'Kitting',
    pronunciation: 'The process of grouping items as one unit',
    definitionEnglish: 'The process of grouping, packaging, or assembling items as one unit.',
    meaningVietnamese: 'Đóng bộ / Gom bộ',
    examplesInContext: ['Our value-added services include kitting and packaging.'],
    relatedWordForms: [],
    notes: 'Một loại VAS phổ biến'
  },
  {
    id: 'tech-vocab-10',
    term: 'Customs clearance',
    pronunciation: 'The act of passing goods through customs',
    definitionEnglish: 'The process of getting goods through customs.',
    meaningVietnamese: 'Thông quan hải quan',
    examplesInContext: ['We provide import/export cargo customs clearance.'],
    relatedWordForms: [],
    notes: 'Liên quan đến customs brokerage'
  },
  {
    id: 'tech-vocab-11',
    term: 'Pick and pack',
    pronunciation: 'A service that involves taking specific items from stock and packing them',
    definitionEnglish: 'A warehouse service that selects items from stock and packs them for shipment.',
    meaningVietnamese: 'Lấy hàng và đóng gói',
    examplesInContext: ['Maxwell Express Logistics offers pick and pack services.'],
    relatedWordForms: [],
    notes: 'Thường cho thương mại điện tử'
  },
  {
    id: 'tech-vocab-12',
    term: 'End-to-end solutions',
    pronunciation: 'A process that takes a system from beginning to end',
    definitionEnglish: 'A complete solution covering the full process from start to finish.',
    meaningVietnamese: 'Giải pháp trọn gói',
    examplesInContext: ['Super-3PLs provide their customers with end-to-end solutions.'],
    relatedWordForms: [],
    notes: 'Bao gồm tất cả các khâu'
  },
  {
    id: 'tech-vocab-13',
    term: 'HGV',
    pronunciation: 'Heavy Goods Vehicle',
    definitionEnglish: 'A large vehicle used for transporting heavy goods.',
    meaningVietnamese: 'Xe tải hạng nặng',
    examplesInContext: ['Most of our inland transport is handled by HGVs.'],
    relatedWordForms: [],
    notes: 'Xe tải có tổng trọng tải lớn'
  },
  {
    id: 'tech-vocab-14',
    term: 'GPS',
    pronunciation: 'Global Positioning System',
    definitionEnglish: 'A satellite-based system used for navigation and location tracking.',
    meaningVietnamese: 'Hệ thống định vị toàn cầu',
    examplesInContext: ['All our trucks are equipped with a GPS to support tracking.'],
    relatedWordForms: [],
    notes: 'Dùng để theo dõi vị trí và tối ưu lộ trình'
  }
];

// (7) Game zone (4 tasks to review Voc. and Gram.)
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
