const user = checkAuth();

if (user) {
  document.getElementById('userName').textContent = user.fullName;

  fetchAPI('/reports/summary').then(function(data) {
    document.getElementById('totalRevenue').textContent = '$' + data.totalRevenue;
    document.getElementById('totalSales').textContent = data.totalSales;
    document.getElementById('totalProducts').textContent = data.totalProducts;
    document.getElementById('lowStockCount').textContent = data.lowStockCount;
  }).catch(function() {
    document.getElementById('totalRevenue').textContent = 'Error';
    document.getElementById('totalSales').textContent = 'Error';
    document.getElementById('totalProducts').textContent = 'Error';
    document.getElementById('lowStockCount').textContent = 'Error';
  });
}