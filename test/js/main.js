// main.js completo funcional

// Elementos DOM (asegurar que existan)
const productsContainer = document.getElementById("products");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const sortSelect = document.getElementById("sort");
const cartItemsContainer = document.getElementById("cart-items");
const checkoutForm = document.getElementById("checkout-form");
let allProducts = [];

// Eventos productos
productsContainer.addEventListener("click", (event) => {
  const btn = event.target.closest(".product-card__btn");
  if (!btn) return;
  const card = btn.closest(".product-card");
  if (!card) return;
  const productId = Number(card.dataset.id);
  if (Number.isNaN(productId)) return;
  addToCartById(productId);
});

// Eventos carrito
cartItemsContainer.addEventListener("click", (event) => {
  const row = event.target.closest(".cart-item");
  if (!row) return;
  const productId = Number(row.dataset.id);
  if (Number.isNaN(productId)) return;
  if (event.target.closest(".js-plus")) {
    addToCartById(productId);
  } else if (event.target.closest(".js-minus")) {
    decrementItem(productId);
  } else if (event.target.closest(".js-remove")) {
    deleteItem(productId);
  }
});

// Filtros y búsqueda
if (searchInput) searchInput.addEventListener("input", applyFiltersAndRender);
if (categorySelect) categorySelect.addEventListener("change", applyFiltersAndRender);
if (sortSelect) sortSelect.addEventListener("change", applyFiltersAndRender);

// Inicialización principal
async function init() {
  allProducts = await fetchProducts();
  if (allProducts.length > 0) {
    populateCategories(allProducts);
    applyFiltersAndRender();
  }
  cart = loadCartFromStorage();
  hydrateCartFromProducts();
  renderCart();
}

// Enlazar checkout y cupón
document.addEventListener('DOMContentLoaded', () => {
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }
  const couponBtn = document.querySelector('.cart__coupon-btn');
  const couponInput = document.querySelector('.cart__coupon-input');
  if (couponBtn && couponInput) {
    couponBtn.addEventListener('click', () => {
      if (applyCoupon(couponInput.value)) {
        couponInput.value = '';
      }
    });
  }
});

init();
