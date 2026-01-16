// api.js
const API_URL = "https://fakestoreapi.com/products";

let allProducts = [];

const productsContainer = document.getElementById("products");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const sortSelect = document.getElementById("sort");

async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al obtener productos");
    return await response.json();
  } catch (error) {
    console.error("Hubo un problema con la petición:", error);
    return [];
  }
}

function getProductById(productId) {
  return allProducts.find((p) => p.id === productId) || null;
}

function createProductCard(product) {
  const article = document.createElement("article");
  article.classList.add("product-card");
  article.dataset.id = String(product.id);

  article.innerHTML = `
    <div class="product-card__image-wrapper">
      <img src="${product.image}" alt="${product.title}" class="product-card__image" />
    </div>

    <div class="product-card__body">
      <h3 class="product-card__title">${product.title}</h3>

      <p class="product-card__category">
        Categoría: <span>${product.category}</span>
      </p>

      <div class="product-card__price-row">
        <span class="product-card__price">$${product.price.toFixed(2)}</span>
      </div>

      <button class="btn btn--primary product-card__btn" type="button">
        Agregar al carrito
      </button>
    </div>
  `;

  return article;
}

function renderProducts(products) {
  productsContainer.innerHTML = "";
  products.forEach((p) => productsContainer.appendChild(createProductCard(p)));
}

function populateCategories(products) {
  const categories = Array.from(new Set(products.map((p) => p.category))).sort();

  categorySelect.innerHTML = `<option value="all">Todas</option>`;
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

function normalizeText(text) {
  return String(text).toLowerCase().trim();
}

function filterBySearch(products, searchValue) {
  const q = normalizeText(searchValue);
  if (!q) return products;

  return products.filter((p) => {
    const title = normalizeText(p.title);
    const desc = normalizeText(p.description);
    return title.includes(q) || desc.includes(q);
  });
}

function filterByCategory(products, categoryValue) {
  if (!categoryValue || categoryValue === "all") return products;
  return products.filter((p) => p.category === categoryValue);
}

function sortProducts(products, sortValue) {
  const copy = [...products];

  if (sortValue === "price-asc") copy.sort((a, b) => a.price - b.price);
  else if (sortValue === "price-desc") copy.sort((a, b) => b.price - a.price);
  else if (sortValue === "name-asc") copy.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortValue === "name-desc") copy.sort((a, b) => b.title.localeCompare(a.title));

  return copy;
}

function applyFiltersAndRender() {
  const searchValue = searchInput.value;
  const categoryValue = categorySelect.value;
  const sortValue = sortSelect.value;

  let result = allProducts;
  result = filterBySearch(result, searchValue);
  result = filterByCategory(result, categoryValue);
  result = sortProducts(result, sortValue);

  renderProducts(result);
}
