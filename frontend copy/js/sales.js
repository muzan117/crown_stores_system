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
  window.lastReceipt = result;
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
function printReceipt() {
  var receipt = window.lastReceipt;
  if (!receipt) {
    alert("Please complete a sale first.");
    return;
  }
  var doc = new window.jspdf.jsPDF();

  doc.setFillColor(15, 52, 96);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CROWN STORES', 105, 18, { align: 'center' });


  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('Date: ' + new Date().toLocaleString(), 20, 52);
  doc.setFillColor(240, 242, 245);
  doc.rect(15, 58, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt No: ' + receipt.receiptNumber, 20, 64);

  doc.line(15, 70, 195, 70);

  doc.setFont('helvetica', 'normal');
  doc.text('Product:', 20, 80);
  doc.setFont('helvetica', 'bold');
  doc.text(String(receipt.productName), 80, 80);

  doc.setFont('helvetica', 'normal');
  doc.text('Quantity:', 20, 90);
  doc.text(String(receipt.quantity), 80, 90);

  doc.text('Unit Price:', 20, 100);
  doc.text('$' + receipt.unitPrice, 80, 100);

  doc.line(15, 108, 195, 108);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 20, 118);
  doc.text('$' + receipt.totalPrice, 80, 118);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Amount Paid:', 20, 128);
  doc.text('$' + receipt.amountPaid, 80, 128);

  doc.setTextColor(39, 174, 96);
  doc.setFont('helvetica', 'bold');
  doc.text('Change:', 20, 138);
  doc.text('$' + receipt.change, 80, 138);

  doc.setTextColor(0, 0, 0);
  doc.line(15, 145, 195, 145);

  doc.setFillColor(15, 52, 96);
  doc.rect(0, 270, 210, 27, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for shopping with Crown Stores!', 105, 282, { align: 'center' });
  doc.setFontSize(9);
  doc.text('Please keep this receipt for your records.', 105, 290, { align: 'center' });

  doc.save('crown_stores_receipt_' + receipt.receiptNumber + '.pdf');
}
function startScanner() {
  document.getElementById('scanner-container').style.display = 'block';
  document.getElementById('stopBtn').style.display = 'inline-block';
  document.getElementById('scanResult').textContent = 'Scanning...';

  Quagga.init({
    inputStream: {
      name: 'Live',
      type: 'LiveStream',
      target: document.getElementById('interactive'),
      constraints: {
        facingMode: 'environment'
      }
    },
    decoder: {
      readers: [
        'ean_reader',
        'ean_8_reader',
        'code_128_reader',
        'code_39_reader',
        'upc_reader'
      ]
    }
  }, function(err) {
    if (err) {
      document.getElementById('scanResult').textContent = 'Camera error: ' + err;
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected(function(result) {
    var code = result.codeResult.code;
    document.getElementById('scanResult').textContent = 'Scanned: ' + code;
    stopScanner();
    searchProductByBarcode(code);
  });
}

function stopScanner() {
  Quagga.stop();
  document.getElementById('scanner-container').style.display = 'none';
  document.getElementById('stopBtn').style.display = 'none';
}

function searchProductByBarcode(code) {
  for (var i = 0; i < products.length; i++) {
    if (products[i].product_id == code || products[i].product_name.toLowerCase().includes(code.toLowerCase())) {
      document.getElementById('productSelect').value = products[i].product_id;
      document.getElementById('availableStock').value = products[i].quantity_available;
      document.getElementById('unitPrice').value = '$' + products[i].selling_price;
      document.getElementById('scanResult').textContent = 'Product found: ' + products[i].product_name;
      updateTotal();
      return;
    }
  }
  document.getElementById('scanResult').textContent = 'Product not found for barcode: ' + code;
}