var API = 'http://localhost:5000/api';
function showAddCategory() { document.getElementById('addCategoryForm').style.display = 'grid'; }
function hideAddCategory() { document.getElementById('addCategoryForm').style.display = 'none'; }
function showAddProduct() { document.getElementById('addProductForm').style.display = 'grid'; loadCategoriesDropdown(); }
function hideAddProduct() { document.getElementById('addProductForm').style.display = 'none'; }
function showAddProcurement() { document.getElementById('addProcurementForm').style.display = 'grid'; loadProductsDropdown(); }
function hideAddProcurement() { document.getElementById('addProcurementForm').style.display = 'none'; }
var tok = localStorage.getItem('token');
var usr = JSON.parse(localStorage.getItem('user') || 'null');

if (!tok || !usr) { window.location.href = '../index.html'; }

function go(url, cb) {
  fetch(API + url, { headers: { 'Authorization': 'Bearer ' + tok } })
    .then(function(r) { return r.json(); }).then(cb);
}

function post(url, body, cb) {
  fetch(API + url, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(function(r) { return r.json(); }).then(cb);
}

function logout() {
  localStorage.clear();
  window.location.href = '../index.html';
}

function showTab(tabId) {
  var contents = document.querySelectorAll('.tab-content');
  contents.forEach(function(content) {
    content.classList.remove('active');
  });

  var buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(function(btn) {
    btn.classList.remove('active');
  });

  var targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  var clickedButton = Array.from(buttons).find(btn => btn.getAttribute('onclick').includes(tabId));
  if (clickedButton) {
    clickedButton.classList.add('active');
  }

  if (tabId === 'categories') { 
    if (typeof loadCategories === 'function') loadCategories(); 
  } else if (tabId === 'products') { 
    if (typeof loadProducts === 'function') loadProducts(); 
    if (typeof loadCategoriesDropdown === 'function') loadCategoriesDropdown(); 
  } else if (tabId === 'procurement') { 
    loadProcurement(); 
    loadProductsDropdown(); 
  } else if (tabId === 'inventory') { 
    loadInventory(); 
  } else if (tabId === 'sales') { 
    loadSales(); 
  }
}

function addProduct() {
  var cId = document.getElementById('productCategory') ? document.getElementById('productCategory').value : '';
  var name = document.getElementById('productName').value;
  var desc = document.getElementById('productDesc').value;
  var cost = document.getElementById('costPrice').value;
  var sell = document.getElementById('sellingPrice').value;
  var qty = document.getElementById('quantity').value;
  var re = document.getElementById('reorderLevel').value;
  
  if (!cId || !name || !cost || !sell) { 
    alert('Please fill required fields'); 
    return; 
  }
  
  post('/products', { categoryId: cId, productName: name, description: desc, costPrice: cost, sellingPrice: sell, quantityAvailable: qty, reorderLevel: re }, function(data) {
    if (data.productId) { 
      hideAddProduct(); 
      if (typeof loadProducts === 'function') loadProducts(); 
    } else { 
      alert(data.message); 
    }
  });
}

function loadProductsDropdown() {
  go('/products', function(data) {
    var o = '<option value="">Select Product</option>';
    for (var i = 0; i < data.length; i++) {
      o += '<option value="' + data[i].product_id + '">' + data[i].product_name + '</option>';
    }
    document.getElementById('procurementProduct').innerHTML = o;
  });
}

function loadProcurement() {
  go('/procurements', function(data) {
    var h = '<table><tr><th>Product</th><th>Supplier</th><th>Qty</th><th>Cost</th><th>Branch</th></tr>';
    for (var i = 0; i < data.length; i++) {
      h += '<tr><td>' + data[i].product_name + '</td><td>' + data[i].supplier_name + '</td><td>' + data[i].quantity_received + '</td><td>$' + data[i].cost_price + '</td><td>' + data[i].branch + '</td></tr>';
    }
    h += '</table>';
    document.getElementById('procurementList').innerHTML = h;
  });
}

function addProcurement() {
  var pId = document.getElementById('procurementProduct').value;
  var sup = document.getElementById('supplierName').value;
  var qty = document.getElementById('quantityReceived').value;
  var cost = document.getElementById('procurementCost').value;
  var br = document.getElementById('branch').value;
  
  if (!pId || !sup || !qty || !cost) { 
    alert('Please fill required fields'); 
    return; 
  }
  
  post('/procurements', { productId: pId, supplierName: sup, quantityReceived: qty, costPrice: cost, branch: br }, function(data) {
    if (data.procurementId) { 
      hideAddProcurement(); 
      loadProcurement(); 
    } else { 
      alert(data.message); 
    }
  });
}

function loadInventory() {
  go('/inventory', function(data) {
    var h = '<table><tr><th>Product</th><th>Category</th><th>Stock</th><th>Reorder</th><th>Status</th></tr>';
    for (var i = 0; i < data.length; i++) {
      var s = data[i].quantity_available <= data[i].reorder_level ? ' style="color:red"' : '';
      h += '<tr' + s + '><td>' + data[i].product_name + '</td><td>' + data[i].category_name + '</td><td>' + data[i].quantity_available + '</td><td>' + data[i].reorder_level + '</td><td>' + data[i].status + '</td></tr>';
    }
    h += '</table>';
    document.getElementById('inventoryList').innerHTML = h;
  });
}

function loadSales() {
  go('/sales', function(data) {
    var h = '<table><tr><th>Product</th><th>Qty</th><th>Price</th><th>Paid</th><th>Agent</th></tr>';
    for (var i = 0; i < data.length; i++) {
      h += '<tr><td>' + data[i].product_name + '</td><td>' + data[i].quantity + '</td><td>$' + data[i].unit_price + '</td><td>$' + data[i].amount_paid + '</td><td>' + data[i].agent_name + '</td></tr>';
    }
    h += '</table>';
    document.getElementById('salesList').innerHTML = h;
  });
}

if (typeof loadCategories === 'function') {
  loadCategories();
}