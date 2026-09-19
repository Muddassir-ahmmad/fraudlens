export const mockDashboard = {
  summary: {
    totalTransactions: 1248,
    lowRisk: 842,
    mediumRisk: 263,
    highRisk: 143,
    newAlerts: 18,
    underInvestigation: 9,
  },
  recentAlerts: [
    { id: 'TXN-1048', customer: 'Rahul', amount: 500000, risk: 'HIGH', score: 91 },
    { id: 'TXN-982', customer: 'Arun', amount: 85000, risk: 'MEDIUM', score: 64 },
    { id: 'TXN-845', customer: 'Sara', amount: 12000, risk: 'LOW', score: 23 },
  ],
};

export const mockTransactions = [
  {
    id: 'TXN-1048',
    customer: 'Rahul',
    customerId: 'CUST-001',
    amount: 500000,
    dateTime: '2026-09-19T02:30:00',
    sender: 'Unfamiliar Sender',
    receiver: 'Rahul',
    risk: 'HIGH',
    riskScore: 91,
    status: 'New',
    location: 'Bengaluru',
    device: 'Android 13 / 8.4.2',
    merchant: 'Paytm',
    type: 'UPI',
    reasons: [
      'Unusual amount',
      'Unusual time',
      'Unknown sender',
      'Deviation from historical behavior',
    ],
    timeline: [
      { date: '2026-09-10', amount: 2500, risk: 'LOW' },
      { date: '2026-09-11', amount: 6000, risk: 'LOW' },
      { date: '2026-09-13', amount: 4500, risk: 'LOW' },
      { date: '2026-09-15', amount: 8000, risk: 'LOW' },
      { date: '2026-09-19 02:30 AM', amount: 500000, risk: 'HIGH', high: true },
    ],
    history: [2500, 6000, 4500, 8000, 500000],
  },
  {
    id: 'TXN-982',
    customer: 'Arun',
    customerId: 'CUST-002',
    amount: 85000,
    dateTime: '2026-09-18T18:45:00',
    sender: 'Airtel Payments Bank',
    receiver: 'Arun',
    risk: 'MEDIUM',
    riskScore: 64,
    status: 'Investigating',
    location: 'Hyderabad',
    device: 'iPhone 14',
    merchant: 'Paytm',
    type: 'Wallet',
    reasons: ['Unusual amount', 'New device'],
    timeline: [
      { date: '2026-09-09', amount: 1200, risk: 'LOW' },
      { date: '2026-09-12', amount: 2200, risk: 'LOW' },
      { date: '2026-09-18 06:45 PM', amount: 85000, risk: 'MEDIUM', high: true },
    ],
    history: [1200, 2200, 85000],
  },
  {
    id: 'TXN-845',
    customer: 'Sara',
    customerId: 'CUST-003',
    amount: 12000,
    dateTime: '2026-09-17T11:00:00',
    sender: 'State Bank of India',
    receiver: 'Sara',
    risk: 'LOW',
    riskScore: 23,
    status: 'Resolved',
    location: 'Pune',
    device: 'Samsung M52',
    merchant: 'Amazon Pay',
    type: 'Bank Transfer',
    reasons: ['Normal transfer'],
    timeline: [
      { date: '2026-09-11', amount: 4600, risk: 'LOW' },
      { date: '2026-09-13', amount: 5500, risk: 'LOW' },
      { date: '2026-09-17 11:00 AM', amount: 12000, risk: 'LOW', high: false },
    ],
    history: [4600, 5500, 12000],
  },
];

export const mockAlerts = [
  {
    id: 'ALRT-201',
    transactionId: 'TXN-1048',
    customer: 'Rahul',
    customerId: 'CUST-001',
    amount: 500000,
    riskScore: 91,
    riskLevel: 'HIGH',
    reasons: ['Unusual amount', 'Unknown sender', 'Unusual time', 'Historical deviation'],
    status: 'New',
    createdAt: '2026-09-19T02:32:00',
  },
  {
    id: 'ALRT-202',
    transactionId: 'TXN-982',
    customer: 'Arun',
    customerId: 'CUST-002',
    amount: 85000,
    riskScore: 64,
    riskLevel: 'MEDIUM',
    reasons: ['High value transfer', 'New device'],
    status: 'Investigating',
    createdAt: '2026-09-18T18:52:00',
  },
];

export const mockCustomerHistory = {
  'CUST-001': [
    { date: '2026-09-10', amount: 2500, label: 'Received', risk: 'LOW' },
    { date: '2026-09-11', amount: 6000, label: 'Received', risk: 'LOW' },
    { date: '2026-09-13', amount: 4500, label: 'Received', risk: 'LOW' },
    { date: '2026-09-15', amount: 8000, label: 'Received', risk: 'LOW' },
    { date: '2026-09-19', amount: 500000, label: 'Received', risk: 'HIGH' },
  ],
};

export const mockSummaryChart = [
  { name: 'Low', value: 842 },
  { name: 'Medium', value: 263 },
  { name: 'High', value: 143 },
];

export const mockActivity = [
  { name: 'Mon', amount: 150 },
  { name: 'Tue', amount: 320 },
  { name: 'Wed', amount: 260 },
  { name: 'Thu', amount: 420 },
  { name: 'Fri', amount: 370 },
  { name: 'Sat', amount: 560 },
  { name: 'Sun', amount: 430 },
];
