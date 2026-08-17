/**
 * Smart Expense Tracker - Realistic Demo Data & Standard Categories
 */

const DEFAULT_CATEGORIES = {
  expense: [
    { id: 'food', name: 'อาหารและเครื่องดื่ม', icon: '🍲', color: '#f59e0b', ruleType: 'needs' },
    { id: 'transport', name: 'การเดินทาง & น้ำมัน', icon: '🚗', color: '#3b82f6', ruleType: 'needs' },
    { id: 'shopping', name: 'ช้อปปิ้ง & ของใช้', icon: '🛍️', color: '#ec4899', ruleType: 'wants' },
    { id: 'housing', name: 'ที่อยู่อาศัย & ค่าน้ำไฟ', icon: '🏠', color: '#8b5cf6', ruleType: 'needs' },
    { id: 'entertainment', name: 'บันเทิง & ท่องเที่ยว', icon: '🎬', color: '#06b6d4', ruleType: 'wants' },
    { id: 'health', name: 'สุขภาพ & ยารักษาโรค', icon: '💊', color: '#10b981', ruleType: 'needs' },
    { id: 'cafe', name: 'คาเฟ่ & ของหวาน', icon: '☕', color: '#d97706', ruleType: 'wants' },
    { id: 'education', name: 'การศึกษา & หนังสือ', icon: '📚', color: '#6366f1', ruleType: 'needs' },
    { id: 'other_exp', name: 'ค่าใช้จ่ายอื่นๆ', icon: '📦', color: '#64748b', ruleType: 'wants' }
  ],
  income: [
    { id: 'salary', name: 'เงินเดือนประจำ', icon: '💼', color: '#16a34a' },
    { id: 'bonus', name: 'โบนัส & ค่าคอมมิชชัน', icon: '🎁', color: '#059669' },
    { id: 'freelance', name: 'งานเสริม & ฟรีแลนซ์', icon: '💻', color: '#0284c7' },
    { id: 'investment', name: 'เงินปันผล & ดอกเบี้ย', icon: '📈', color: '#9333ea' },
    { id: 'other_inc', name: 'รายรับอื่นๆ', icon: '✨', color: '#14b8a6' }
  ]
};

const INITIAL_WALLETS = [
  { id: 'w1', name: 'กสิกรไทย (K-Bank)', type: 'bank', balance: 28450.00, color: '#16a34a', icon: 'landmark' },
  { id: 'w2', name: 'เงินสดในกระเป๋า', type: 'cash', balance: 3500.00, color: '#f59e0b', icon: 'banknote' },
  { id: 'w3', name: 'ไทยพาณิชย์ (SCB)', type: 'bank', balance: 11250.00, color: '#7e22ce', icon: 'landmark' },
  { id: 'w4', name: 'TrueMoney Wallet', type: 'ewallet', balance: 2080.00, color: '#ea580c', icon: 'smartphone' }
];

function getDemoInitialState() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  // Helper for generating dates relative to today
  const getDateOffset = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayStr}`;
  };

  return {
    profile: {
      name: 'Name',
      handle: '',
      avatar: '',
      currency: 'THB',
      currencySymbol: '฿',
      monthlyIncome: 65000,
      activeGoal: 'rule_50_30_20',
      pin: '1234',
      pinEnabled: false,
      onboardingCompleted: true
    },
    wallets: INITIAL_WALLETS,
    categories: DEFAULT_CATEGORIES,
    transactions: [
      {
        id: 'tx-1',
        type: 'income',
        amount: 65000,
        categoryId: 'salary',
        walletId: 'w1',
        date: getDateOffset(15),
        time: '09:00',
        note: 'เงินเดือนประจำเดือนนี้ 💼',
        receipt: null
      },
      {
        id: 'tx-2',
        type: 'expense',
        amount: 8500,
        categoryId: 'housing',
        walletId: 'w1',
        date: getDateOffset(14),
        time: '10:30',
        note: 'ค่าเช่าคอนโดมิเนียม & ส่วนกลาง',
        receipt: null
      },
      {
        id: 'tx-3',
        type: 'expense',
        amount: 1450,
        categoryId: 'housing',
        walletId: 'w1',
        date: getDateOffset(12),
        time: '14:20',
        note: 'ค่าน้ำ-ค่าไฟประจำเดือน',
        receipt: null
      },
      {
        id: 'tx-4',
        type: 'expense',
        amount: 1200,
        categoryId: 'transport',
        walletId: 'w1',
        date: getDateOffset(10),
        time: '18:45',
        note: 'เติมน้ำมันรถยนต์ PTT',
        receipt: null
      },
      {
        id: 'tx-5',
        type: 'expense',
        amount: 2850,
        categoryId: 'shopping',
        walletId: 'w1',
        date: getDateOffset(8),
        time: '15:10',
        note: 'ซื้อของใช้เข้าบ้าน Tops Supermarket',
        receipt: null
      },
      {
        id: 'tx-6',
        type: 'expense',
        amount: 160,
        categoryId: 'cafe',
        walletId: 'w4',
        date: getDateOffset(3),
        time: '08:15',
        note: 'Starbucks Caramel Macchiato ☕',
        receipt: null
      },
      {
        id: 'tx-7',
        type: 'expense',
        amount: 350,
        categoryId: 'food',
        walletId: 'w2',
        date: getDateOffset(2),
        time: '12:30',
        note: 'มื้อเที่ยง ข้าวหมูกรอบ & ชาเย็น',
        receipt: null
      },
      {
        id: 'tx-8',
        type: 'expense',
        amount: 1200,
        categoryId: 'entertainment',
        walletId: 'w3',
        date: getDateOffset(1),
        time: '19:30',
        note: 'ทานสุกี้ชาบูกับเพื่อน 🍲',
        receipt: null
      },
      {
        id: 'tx-9',
        type: 'expense',
        amount: 240,
        categoryId: 'food',
        walletId: 'w4',
        date: dateStr,
        time: '12:15',
        note: 'ข้าวหน้าปลาแซลมอน GrabFood',
        receipt: null
      },
      {
        id: 'tx-10',
        type: 'expense',
        amount: 65,
        categoryId: 'cafe',
        walletId: 'w2',
        date: dateStr,
        time: '14:00',
        note: 'ชาเขียวมัทฉะยามบ่าย',
        receipt: null
      }
    ],
    budgets: [
      { categoryId: 'food', limit: 8000 },
      { categoryId: 'transport', limit: 4000 },
      { categoryId: 'shopping', limit: 6000 },
      { categoryId: 'housing', limit: 12000 },
      { categoryId: 'entertainment', limit: 4000 }
    ],
    savingGoals: [
      { id: 'sg-1', name: 'กองทุนสำรองฉุกเฉิน 6 เดือน', target: 100000, current: 65000, targetDate: '2026-12-31', icon: 'shield-check' },
      { id: 'sg-2', name: 'สมาร์ทโฟน iPhone 16 Pro', target: 45000, current: 28000, targetDate: '2026-10-31', icon: 'smartphone' },
      { id: 'sg-3', name: 'ทริปเที่ยวญี่ปุ่น ปลายปี', target: 35000, current: 15000, targetDate: '2026-11-20', icon: 'plane' }
    ],
    recurringBills: [
      { id: 'rc-1', name: 'Netflix Premium Family', type: 'expense', amount: 419, frequency: 'monthly', nextDate: getDateOffset(-10), icon: 'film' },
      { id: 'rc-2', name: 'ค่าเช่าคอนโด', type: 'expense', amount: 8500, frequency: 'monthly', nextDate: getDateOffset(-12), icon: 'home' },
      { id: 'rc-3', name: 'AIS Fibre อินเทอร์เน็ตบ้าน', type: 'expense', amount: 599, frequency: 'monthly', nextDate: getDateOffset(-5), icon: 'wifi' },
      { id: 'rc-4', name: 'เงินเดือนประจำ', type: 'income', amount: 65000, frequency: 'monthly', nextDate: getDateOffset(-15), icon: 'wallet' }
    ],
    debts: [
      { id: 'db-1', type: 'lend', person: 'สมชาย (ค่าแชร์ข้าว)', amount: 650, dueDate: getDateOffset(-3), status: 'pending' },
      { id: 'db-2', type: 'borrow', person: 'คุณวิชัย (ค่าฝากซื้อของ)', amount: 350, dueDate: getDateOffset(-1), status: 'pending' }
    ]
  };
}
