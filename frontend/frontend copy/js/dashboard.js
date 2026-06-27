const API_URL = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../index.html';
}

function checkAuth() {
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    window.location.href = '../index.html';
    return null;
  }
  return user;
}

async function fetchAPI(endpoint) {
  const response = await fetch(API_URL + endpoint, {
    headers: {
      'Authorization': 'Bearer ' + getToken(),
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

async function viewReport(type) {
  const reportData = document.getElementById('reportData');
  reportData.innerHTML = '<p>Loading...</p>';

  try {
    const data = await fetchAPI('/reports/' + type);

    if (type === 'daily-sales') {
      let rows = '';
      data.sales.forEach(function(s) {
        rows += '<tr><td>' + s.product_name + '</td><td>' + s.quantity + '</td><td>$' + s.unit_price + '</td><td>$' + s.amount_paid + '</td><td>' + s.agent_name + '</td></tr>';
      });
      reportData.innerHTML = '<h4>Daily Sales - ' + data.date + '</h4><p>Total Transactions: <strong>' + data.totalTransactions + '</strong> | Total Revenue: <strong>$' + data.totalRevenue + '</strong></p><table><tr><th>Product</th><th>Quantity</th><th>Unit Price</th><th>Amount Paid</th><th>Agent</th></tr>' + rows + '</table>';

    } else if (type === 'inventory') {
      let rows = '';
      data.products.forEach(function(p) {
        rows += '<tr><td>' + p.product_name + '</td><td>' + p.category_name + '</td><td>' + p.quantity_available + '</td><td>' + p.reorder_level + '</td><td>' + p.status + '</td></tr>';
      });
      reportData.innerHTML = '<h4>Inventory Report</h4><p>Total Products: <strong>' + data.totalProducts + '</strong> | Low Stock: <strong>' + data.lowStockCount + '</strong></p><table><tr><th>Product</th><th>Category</th><th>Available</th><th>Reorder Level</th><th>Status</th></tr>' + rows + '</table>';

    } else if (type === 'procurement') {
      let rows = '';
      data.procurements.forEach(function(p) {
        rows += '<tr><td>' + p.product_name + '</td><td>' + p.supplier_name + '</td><td>' + p.quantity_received + '</td><td>$' + p.cost_price + '</td><td>' + p.branch + '</td></tr>';
      });
      reportData.innerHTML = '<h4>Procurement Report</h4><p>Total Orders: <strong>' + data.totalOrders + '</strong> | Total Cost: <strong>$' + data.totalCost + '</strong></p><table><tr><th>Product</th><th>Supplier</th><th>Quantity</th><th>Cost Price</th><th>Branch</th></tr>' + rows + '</table>';
    }
  } catch (error) {
    reportData.innerHTML = '<p style="color:red">Error loading report.</p>';
  }
}