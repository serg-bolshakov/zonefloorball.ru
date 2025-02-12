document.getElementById('generatePdf').addEventListener('click', function () {
    const username = document.getElementById('username').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    
    const products = [];
    const rows = document.querySelectorAll('#productsTable tr');

    rows.forEach((row, index) => {
        if (index === 0) return; // Пропустить заголовок
        const name = row.querySelector('.productName').value;
        const unit = row.querySelector('.productUnit').value;
        const quantity = parseFloat(row.querySelector('.productQuantity').value);
        const price = parseFloat(row.querySelector('.productPrice').value);
        const cost = quantity * price;
        row.querySelector('.productCost').textContent = cost.toFixed(2);
        
        products.push({ name, unit, quantity, price, cost });
    });

    // Отправка данных на сервер
    fetch('generate_pdf.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, address, phone, email, products })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(error => console.error('Ошибка:', error));
});