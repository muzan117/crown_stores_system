var API = 'http://localhost:5000/api';
var tok = localStorage.getItem('token');
var usr = JSON.parse(localStorage.getItem('user') || 'null');

if (!tok || !usr) { window.location.href = '../index.html'; }
else { document.getElementById('userName').textContent = usr.fullName; }

function logout() {
  localStorage.clear();
  window.location.href = '../index.html';
}

var products = [];

fetch(API + '/products', {
  headers: { 'Authorization': 'Bearer ' + tok }
}).then(function(r) { return r.json(); }).then(function(data) {
  products = data;
  var select = document.getElementById('productSelect');
  for (var i = 0; i < data.length; i++) {
    var opt = document.createElement('option');
    opt.value = data[i].product_id;
    opt.textContent = data[i].product_name;
    select.appendChild(opt);
  }
});

document.getElementById('productSelect').addEventListener('change', function() {
  var id = this.value;
  var product = null;
  for (var i = 0; i < products.length; i++) {
    if (products[i].product_id == id) { product = products[i]; break; }
  }
  if (product) {
    document.getElementById('availableStock').value = product.quantity_available;
    document.getElementById('unitPrice').value = '$' + product.selling_price;
    updateTotal();
  } else {
    document.getElementById('availableStock').value = '';
    document.getElementById('unitPrice').value = '';
    document.getElementById('totalAmount').value = '';
  }
});

document.getElementById('quantity').addEventListener('input', updateTotal);
document.getElementById('amountPaid').addEventListener('input', function() {
  var total = parseFloat(document.getElementById('totalAmount').value.replace('$','')) || 0;
  var paid = parseFloat(this.value) || 0;
  if (paid >= total && total > 0) {
    document.getElementById('changeAmount').textContent = (paid - total).toFixed(2);
    document.getElementById('changeDisplay').style.display = 'block';
  } else {
    document.getElementById('changeDisplay').style.display = 'none';
  }
});

function updateTotal() {
  var id = document.getElementById('productSelect').value;
  var qty = parseFloat(document.getElementById('quantity').value) || 0;
  var product = null;
  for (var i = 0; i < products.length; i++) {
    if (products[i].product_id == id) { product = products[i]; break; }
  }
  if (product && qty > 0) {
    var total = product.selling_price * qty;
    document.getElementById('totalAmount').value = '$' + total.toFixed(2);
  }
}

function processSale() {
  var productId = document.getElementById('productSelect').value;
  var quantity = document.getElementById('quantity').value;
  var amountPaid = document.getElementById('amountPaid').value;
  var msgEl = document.getElementById('saleMsg');

  if (!productId || !quantity || !amountPaid) {
    msgEl.style.color = 'red';
    msgEl.textContent = 'Please fill all fields';
    return;
  }

  msgEl.style.color = '#666';
  msgEl.textContent = 'Processing...';

  fetch(API + '/sales', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: productId, quantity: quantity, amountPaid: amountPaid })
  }).then(function(r) { return r.json(); }).then(function(data) {
    console.log('data:', data);
    console.log('SALE RESULT:', data); // 
    var result = Array.isArray(data) ? data[0] : data;
if (result.saleId || result.receiptNumber) {
  msgEl.style.color = 'green';
  msgEl.textContent = 'Sale completed successfully!';
  showReceipt(result);
      document.getElementById('quantity').value = '';
      document.getElementById('amountPaid').value = '';
      document.getElementById('totalAmount').value = '';
      document.getElementById('changeDisplay').style.display = 'none';
    } else {
      msgEl.style.color = 'red';
      msgEl.textContent = data.message || 'Sale failed';
    }
  });
}

function showReceipt(data) {

    var receipt = '';

    receipt += '<strong>CROWN STORES</strong><br>';
    receipt += 'Receipt No: ' + data.receiptNumber + '<br>';
    receipt += 'Date: ' + new Date().toLocaleString() + '<br>';
    receipt += '--------------------------------<br>';
    receipt += 'Product: ' + data.productName + '<br>';
    receipt += 'Quantity: ' + data.quantity + '<br>';
    receipt += 'Unit Price: $' + data.unitPrice + '<br>';
    receipt += 'Total: $' + data.totalPrice + '<br>';
    receipt += 'Amount Paid: $' + data.amountPaid + '<br>';
    receipt += 'Change: $' + data.change + '<br>';
    receipt += '--------------------------------<br>';
    receipt += 'Thank you for shopping with us!';

    document.getElementById('receiptContent').innerHTML = receipt;
    document.getElementById('receiptSection').style.display = 'block';
}