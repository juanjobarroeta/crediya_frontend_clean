const axios = require('axios');

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5001';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

const testCustomer = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '1234567890',
  address: '123 Test St'
};

const testLoan = {
  customer_id: 1,
  total_amount: 1000,
  term_weeks: 12,
  interest_rate: 0.05
};

// Routes to test
const routes = [
  // Auth routes
  { method: 'POST', path: '/register', data: testUser, description: 'User registration' },
  { method: 'POST', path: '/login', data: { email: testUser.email, password: testUser.password }, description: 'User login' },
  
  // Customer routes
  { method: 'GET', path: '/customers', description: 'Get all customers' },
  { method: 'POST', path: '/customers', data: testCustomer, description: 'Create customer' },
  { method: 'GET', path: '/customers/1/profile', description: 'Get customer profile' },
  { method: 'GET', path: '/customers/1/loans', description: 'Get customer loans' },
  { method: 'GET', path: '/customers/1/notes', description: 'Get customer notes' },
  { method: 'POST', path: '/customers/1/notes', data: { note: 'Test note' }, description: 'Create customer note' },
  { method: 'GET', path: '/customers/1/avals', description: 'Get customer avals' },
  { method: 'POST', path: '/customers/1/avals', data: { name: 'Test Aval', phone: '1234567890', relationship: 'Friend' }, description: 'Create customer aval' },
  { method: 'GET', path: '/customers/1/references', description: 'Get customer references' },
  { method: 'POST', path: '/customers/1/references', data: { name: 'Test Reference', phone: '1234567890', relationship: 'Colleague' }, description: 'Create customer reference' },
  
  // Loan routes
  { method: 'GET', path: '/loans/pending', description: 'Get pending loans' },
  { method: 'GET', path: '/loans/1/details', description: 'Get loan details' },
  { method: 'GET', path: '/loans/1/statement', description: 'Get loan statement' },
  { method: 'GET', path: '/loans/1/financial-movements', description: 'Get loan financial movements' },
  { method: 'POST', path: '/apply-loan', data: testLoan, description: 'Apply for loan' },
  
  // Payment routes
  { method: 'GET', path: '/admin/payments', description: 'Get all payments' },
  { method: 'GET', path: '/admin/payments/1/breakdown', description: 'Get payment breakdown' },
  { method: 'GET', path: '/admin/payments/1/loan-id', description: 'Get payment loan ID' },
  { method: 'POST', path: '/admin/payments/1/reclassify', data: { newLoanId: 2, amount: 100 }, description: 'Reclassify payment' },
  { method: 'POST', path: '/make-payment', data: { loan_id: 1, amount: 100 }, description: 'Make payment' },
  
  // Dashboard routes
  { method: 'GET', path: '/dashboard-metrics', description: 'Get dashboard metrics' },
  { method: 'GET', path: '/dashboard/loans', description: 'Get dashboard loans' },
  { method: 'GET', path: '/dashboard/overdue-trends', description: 'Get overdue trends' },
  { method: 'GET', path: '/dashboard/cashflow-summary', description: 'Get cashflow summary' },
  { method: 'GET', path: '/dashboard/collections', description: 'Get collections dashboard' },
  
  // Admin routes
  { method: 'GET', path: '/admin/users', description: 'Get all users' },
  { method: 'GET', path: '/admin/stores', description: 'Get all stores' },
  { method: 'POST', path: '/admin/create-user', data: { name: 'Admin User', email: 'admin@test.com', password: 'password123', role: 'admin' }, description: 'Create admin user' },
  { method: 'PATCH', path: '/admin/users/1', data: { is_active: false }, description: 'Update user' },
  { method: 'GET', path: '/admin/loan-applications/1/details', description: 'Get loan application details' },
  { method: 'PATCH', path: '/admin/loan-applications/1/status', data: { status: 'approved' }, description: 'Update loan application status' },
  { method: 'GET', path: '/admin/inventory-requests', description: 'Get inventory requests' },
  
  // Inventory routes
  { method: 'GET', path: '/inventory-items', description: 'Get inventory items' },
  { method: 'POST', path: '/inventory-items/manual', data: { name: 'Test Item', price: 100, category: 'Electronics' }, description: 'Create inventory item' },
  { method: 'POST', path: '/inventory-items/upload', data: {}, description: 'Upload inventory items' },
  { method: 'PATCH', path: '/inventory-items/1/imei', data: { imei: '123456789012345' }, description: 'Update item IMEI' },
  { method: 'POST', path: '/inventory-items/1/repossess', data: {}, description: 'Repossess item' },
  
  // Financial routes
  { method: 'GET', path: '/financial-products', description: 'Get financial products' },
  { method: 'POST', path: '/financial-products', data: { name: 'Test Product', interest_rate: 0.05, term_weeks: 12 }, description: 'Create financial product' },
  { method: 'GET', path: '/public/financial-products', description: 'Get public financial products' },
  
  // Accounting routes
  { method: 'GET', path: '/accounting', description: 'Get accounting entries' },
  { method: 'POST', path: '/accounting', data: { description: 'Test entry', amount: 100, type: 'debit' }, description: 'Create accounting entry' },
  { method: 'GET', path: '/accounting/closures', description: 'Get accounting closures' },
  { method: 'GET', path: '/accounting/closures/1/entries', description: 'Get closure entries' },
  { method: 'GET', path: '/account-balances', description: 'Get account balances' },
  { method: 'POST', path: '/balance-entry', data: { account: 'Cash', amount: 100, type: 'debit' }, description: 'Create balance entry' },
  { method: 'GET', path: '/income-statement', description: 'Get income statement' },
  { method: 'POST', path: '/income-statement/close-period', data: { month: 12, year: 2024 }, description: 'Close income statement period' },
  { method: 'GET', path: '/balance-sheet', description: 'Get balance sheet' },
  
  // Treasury routes
  { method: 'GET', path: '/treasury/payment-orders', description: 'Get payment orders' },
  { method: 'GET', path: '/treasury/payment-orders/history', description: 'Get payment orders history' },
  { method: 'POST', path: '/treasury/mark-paid', data: {}, description: 'Mark payment as paid' },
  
  // Warehouse routes
  { method: 'GET', path: '/warehouse/pending-inventory', description: 'Get pending inventory' },
  { method: 'GET', path: '/warehouse/pending-customer-deliveries', description: 'Get pending customer deliveries' },
  { method: 'PUT', path: '/inventory-requests/1/receive', data: {}, description: 'Receive inventory request' },
  { method: 'POST', path: '/loans/1/deliver', data: {}, description: 'Deliver loan' },
  
  // Other routes
  { method: 'GET', path: '/overdue-loans', description: 'Get overdue loans' },
  { method: 'GET', path: '/promotions', description: 'Get promotions' },
  { method: 'GET', path: '/promotions/active', description: 'Get active promotions' },
  { method: 'POST', path: '/public/apply', data: { name: 'Test Applicant', email: 'applicant@test.com', phone: '1234567890' }, description: 'Public application' },
  { method: 'GET', path: '/collections/1/notes', description: 'Get collection notes' },
  { method: 'GET', path: '/expenses', description: 'Get expenses' },
  { method: 'POST', path: '/expenses', data: { description: 'Test expense', amount: 100, category: 'Office' }, description: 'Create expense' },
  { method: 'GET', path: '/products', description: 'Get products' },
  { method: 'POST', path: '/products', data: { name: 'Test Product', price: 100 }, description: 'Create product' },
  { method: 'POST', path: '/inventory-requests', data: { description: 'Test request', items: [] }, description: 'Create inventory request' },
  { method: 'POST', path: '/manual-entry', data: { description: 'Test manual entry', amount: 100, type: 'debit' }, description: 'Create manual entry' },
  { method: 'POST', path: '/investigations', data: { customer_name: 'Test Customer', phone: '1234567890' }, description: 'Create investigation' },
  { method: 'GET', path: '/investigations', description: 'Get investigations' },
  { method: 'GET', path: '/loan-requests', description: 'Get loan requests' },
  { method: 'GET', path: '/entregas', description: 'Get deliveries' },
  { method: 'GET', path: '/garantias', description: 'Get guarantees' },
  { method: 'POST', path: '/make-installment-payment', data: { loan_id: 1, amount: 100 }, description: 'Make installment payment' },
  { method: 'POST', path: '/loans/1/deliver', data: {}, description: 'Deliver loan' },
  { method: 'POST', path: '/sync-manual-capital', data: { amount: 1000 }, description: 'Sync manual capital' },
  { method: 'POST', path: '/inventory-requests', data: { description: 'Test request' }, description: 'Create inventory request' },
  { method: 'POST', path: '/inventory-items/upload', data: {}, description: 'Upload inventory items' },
  { method: 'PUT', path: '/inventory-requests/1/receive', data: {}, description: 'Receive inventory request' },
  { method: 'GET', path: '/', description: 'Root endpoint' }
];

let authToken = null;

async function testRoute(route) {
  try {
    const config = {
      method: route.method,
      url: `${API_BASE_URL}${route.path}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (route.data) {
      config.data = route.data;
    }

    const response = await axios(config);
    console.log(`✅ ${route.description}: ${response.status}`);
    return { success: true, status: response.status };
  } catch (error) {
    console.log(`❌ ${route.description}: ${error.response?.status || 'Network Error'} - ${error.response?.data?.message || error.message}`);
    return { success: false, status: error.response?.status, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting API route tests...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    total: routes.length
  };

  for (const route of routes) {
    const result = await testRoute(route);
    
    if (result.success) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
}

// Run the tests
runTests().catch(console.error); 