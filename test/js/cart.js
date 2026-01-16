
const CART_STORAGE_KEY = "fakeStoreCart";
const PURCHASE_HISTORY_KEY = "fakeStoreHistory";
let cart = {};
let currentCoupon = null;
let couponDiscountRate = 0;

const cartItemsContainer = document.getElementById("cart-items");
const cartTotalElement = document.getElementById("cart-total");
const cartSubtotalElement = document.getElementById("cart-subtotal");
const cartCountLabel = document.getElementById("cart-count-label");
const cartCountBadge = document.querySelector(".header__cart-count");

function saveCartToStorage() {
  const cartData = { ...cart, currentCoupon, couponDiscountRate };
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
}

function loadCartFromStorage() {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    cart = parsed.cart || {};
    currentCoupon = parsed.currentCoupon || null;
    couponDiscountRate = parsed.couponDiscountRate || 0;
    return cart;
  } catch (error) {
    console.error("Error al parsear carrito:", error);
    return {};
  }
}

function hydrateCartFromProducts() {
  Object.keys(cart).forEach((key) => {
    const id = Number(key);
    if (!cart[id]) return;
    if (!cart[id].image) {
      const product = getProductById(id);
      if (product) cart[id].image = product.image;
    }
  });
}

function getCartQuantity() {
  return Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
}

function getCartSubtotal() {
  return Object.values(cart).reduce((acc, item) => acc + (item.price * item.quantity), 0);
}

function getCartTotal() {
  const subtotal = getCartSubtotal();
  return subtotal * (1 - couponDiscountRate);
}

function createCartItemRow(item) {
  const div = document.createElement("div");
  div.classList.add("cart-item");
  div.dataset.id = String(item.id);
  div.innerHTML = `
    <img class="cart-item__img" src="${item.image}" alt="${item.title}">
    <div class="cart-item__main">
      <div class="cart-item__title">${item.title}</div>
      <div class="cart-item__meta">Precio unitario: $${item.price.toFixed(2)}</div>
      <div class="cart-item__actions">
        <div class="qty">
          <button class="qty__btn js-minus" type="button" aria-label="Disminuir">-</button>
          <span class="qty__value">${item.quantity}</span>
          <button class="qty__btn js-plus" type="button" aria-label="Aumentar">+</button>
        </div>
        <button class="cart-item__remove js-remove" type="button">Eliminar</button>
      </div>
    </div>
    <div class="cart-item__price">$${(item.price * item.quantity).toFixed(2)}</div>
  `;
  return div;
}

function renderCart() {
  cartItemsContainer.innerHTML = "";
  const items = Object.values(cart);
  if (items.length === 0) {
    cartItemsContainer.innerHTML = "<p>Tu carrito está vacío.</p>";
  } else {
    items.forEach((item) => cartItemsContainer.appendChild(createCartItemRow(item)));
  }
  const totalQuantity = getCartQuantity();
  const subtotal = getCartSubtotal();
  const total = getCartTotal();
  cartCountBadge.textContent = String(totalQuantity);
  cartCountLabel.textContent = `${totalQuantity} artículo${totalQuantity === 1 ? '' : 's'}`;
  cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  cartTotalElement.textContent = `$${total.toFixed(2)}`;
}

function commitCart() {
  renderCart();
  saveCartToStorage();
}

function addToCartById(productId) {
  const product = getProductById(productId);
  if (!product) return;
  if (cart[productId]) {
    cart[productId].quantity += 1;
  } else {
    cart[productId] = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    };
  }
  commitCart();
  animateCartBadge();
  showToast("Producto agregado al carrito");
}

function decrementItem(productId) {
  if (!cart[productId]) return;
  if (cart[productId].quantity > 1) {
    cart[productId].quantity -= 1;
  } else {
    delete cart[productId];
  }
  commitCart();
}

function deleteItem(productId) {
  if (!cart[productId]) return;
  delete cart[productId];
  commitCart();
}

function clearCart() {
  cart = {};
  currentCoupon = null;
  couponDiscountRate = 0;
  commitCart();
  showToast("Carrito vaciado");
}

function getCartPayload() {
  const items = Object.values(cart).map((item) => ({
    productId: item.id,
    quantity: item.quantity,
    unitPrice: item.price,
    title: item.title
  }));
  return { items, subtotal: getCartSubtotal(), total: getCartTotal() };
}

function applyCoupon(code) {
  const normalized = code.trim().toUpperCase();
  let discountRate = 0;
  if (normalized === "PROMO10") discountRate = 0.10;
  else if (normalized === "PROMO20") discountRate = 0.20;
  else {
    showToast("Código inválido");
    return false;
  }
  currentCoupon = normalized;
  couponDiscountRate = discountRate;
  commitCart();
  showToast(`Cupón ${normalized} aplicado: ${discountRate*100}% OFF`);
  return true;
}

function savePurchaseHistory(purchaseData) {
  const history = loadPurchaseHistory();
  history.unshift(purchaseData);
  localStorage.setItem(PURCHASE_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  console.log('Compra guardada en historial');
}

function loadPurchaseHistory() {
  const raw = localStorage.getItem(PURCHASE_HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error historial:", error);
    return [];
  }
}

function clearPurchaseHistory() {
  localStorage.removeItem(PURCHASE_HISTORY_KEY);
  showToast("Historial limpiado");
}

// Informes
function getSalesReport() {
  const history = loadPurchaseHistory();
  const total = history.reduce((acc, h) => acc + h.total, 0);
  console.table({ TotalVentas: total.toFixed(2), Compras: history.length });
}

// Usar funciones de users.js
function saveCartToStorage() {
  const cartData = { cart, currentCoupon, couponDiscountRate };
  window.saveCartToStorage(cartData); // Llamada global
}

function loadCartFromStorage() {
  const loaded = window.loadCartFromStorage();
  cart = loaded.cart || {};
  currentCoupon = loaded.currentCoupon || null;
  couponDiscountRate = loaded.couponDiscountRate || 0;
  return cart;
}

function savePurchaseHistory(purchaseData) {
  window.savePurchaseHistory(purchaseData);
}

function loadPurchaseHistory() {
  return window.loadPurchaseHistory();
}
