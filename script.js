document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('category');
    const searchInput = document.getElementById('search');
    const sortSelect = document.getElementById('sort');
    const productList = document.getElementById('product-list');
    const startButton = document.createElement('button');

    startButton.innerText = 'Start';
    startButton.id = 'start-button';
    document.body.appendChild(startButton);

    function renderProducts(products) {
        productList.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>Ціна: ${product.price} грн</p>
                <p>Дата додавання: ${new Date(product.date).toLocaleDateString()}</p>
            `;
            productList.appendChild(productCard);
        });
    }

    function filterByCategory(products, category) {
        return new Promise((resolve) => {
            let filteredProducts = category ? products.filter(product => product.category === category) : products;
            resolve(filteredProducts);
        });
    }

    function searchProducts(products, searchTerm) {
        return new Promise((resolve) => {
            let filteredProducts = searchTerm ?
                products.filter(product =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.description.toLowerCase().includes(searchTerm.toLowerCase())
                ) : products;
            resolve(filteredProducts);
        });
    }

    function sortProducts(products, sortMethod) {
        return new Promise((resolve) => {
            let sortedProducts = [...products];
            switch (sortMethod) {
                case 'price-asc':
                    sortedProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    sortedProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'date-asc':
                    sortedProducts.sort((a, b) => new Date(a.date) - new Date(b.date));
                    break;
                case 'date-desc':
                    sortedProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
                    break;
            }
            resolve(sortedProducts);
        });
    }

    function filterProducts() {
        const category = categorySelect.value;
        const searchTerm = searchInput.value;
        const sortMethod = sortSelect.value;
        const products = JSON.parse(localStorage.getItem('products')) || [];
        //Фільтрація та сортування: Функції filterByCategory, searchProducts та sortProducts 
        //обробляють масив товарів відповідно до вибраної категорії, пошукового запиту та методу сортування
        filterByCategory(products, category)
            .then(filteredProducts => searchProducts(filteredProducts, searchTerm))
            .then(filteredProducts => sortProducts(filteredProducts, sortMethod))
            .then(filteredProducts => renderProducts(filteredProducts));
    }
    // Перевірка localStorage: Функція checkLocalStorage перевіряє наявність масиву товарів у localStorage. 
    // Якщо він є, кнопка "start" прихована, і товари рендеряться. Якщо ні, кнопка відображається.
    function checkLocalStorage() {
        const products = localStorage.getItem('products');
        if (products) {
            startButton.style.display = 'none';
            renderProducts(JSON.parse(products));
        } else {
            startButton.style.display = 'block';
        }
    }
    //Запит на API: Функція fetchProducts виконує асинхронний запит до ендпойнту,
    // обробляє отримані дані та зберігає їх у localStorage. Після цього товари рендеряться і кнопка приховується.
    async function fetchProducts() {
        try {
            const response = await fetch('https://dummyjson.com/products?limit=100&skip=0');
            const data = await response.json();
            const products = data.products.map(product => ({
                id: product.id,
                name: product.title,
                category: product.category,
                description: product.description,
                price: product.price,
                date: new Date().toISOString().split('T')[0]
            }));
            localStorage.setItem('products', JSON.stringify(products));
            renderProducts(products);
            startButton.style.display = 'none';
        } catch (error) {
            console.error('Помилка при отриманні даних:', error);
        }
    }

    startButton.addEventListener('click', fetchProducts);

    categorySelect.addEventListener('change', filterProducts);
    searchInput.addEventListener('input', filterProducts);
    sortSelect.addEventListener('change', filterProducts);

    checkLocalStorage();
});

//Події: Додані обробники подій для фільтрації та сортування товарів, а також для натискання на кнопку "start".