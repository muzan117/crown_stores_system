const user = checkAuth();

if (user) {
  document.getElementById('userName').textContent = user.fullName;

  fetchAPI('/reports/summary').then(function(data) {
    document.getElementById('totalRevenue').textContent = '$' + data.totalRevenue;
    document.getElementById('totalSales').textContent = data.totalSales;
    document.getElementById('totalProducts').textContent = data.totalProducts;
    document.getElementById('lowStockCount').textContent = data.lowStockCount;
if (data.lowStockCount > 0) {
  document.getElementById('lowStockCount').style.color = 'red';
  document.getElementById('lowStockCount').parentElement.parentElement.style.border = '2px solid red';
  document.getElementById('lowStockCount').parentElement.parentElement.style.backgroundColor = '#fff5f5';
}
  }).catch(function() {
    document.getElementById('totalRevenue').textContent = 'Error';
    document.getElementById('totalSales').textContent = 'Error';
    document.getElementById('totalProducts').textContent = 'Error';
    document.getElementById('lowStockCount').textContent = 'Error';
  });
}
fetchAPI('/reports/inventory').then(function(data) {
  var labels = [];
  var stock = [];
  var colors = [];

  for (var i = 0; i < data.products.length; i++) {
    labels.push(data.products[i].product_name);
    stock.push(data.products[i].quantity_available);
    colors.push(data.products[i].quantity_available <= data.products[i].reorder_level ? '#e74c3c' : '#27ae60');
  }

  new Chart(document.getElementById('stockChart'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Stock Level',
        data: stock,
        backgroundColor: colors,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
});

fetchAPI('/reports/daily-sales').then(function(data) {
  var labels = [];
  var amounts = [];

  for (var i = 0; i < data.sales.length; i++) {
    labels.push(data.sales[i].product_name);
    amounts.push(data.sales[i].amount_paid);
  }

  new Chart(document.getElementById('salesChart'), {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: amounts,
        backgroundColor: ['#0f3460', '#16213e', '#27ae60', '#e74c3c', '#f39c12']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
});