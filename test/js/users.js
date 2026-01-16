// users.js - Sistema completo de autenticación
const USERS_KEY = "fakeStoreUsers";
const CURRENT_USER_KEY = "currentUser";
let currentUser = null;
let users = {};

function initUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  users = raw ? JSON.parse(raw) : {};
  const savedUser = localStorage.getItem(CURRENT_USER_KEY);
  if (savedUser && users[savedUser]) {
    currentUser = savedUser;
  }
}

function registerUser(email, password) {
  if (users[email]) {
    showToast("Usuario ya existe");
    return false;
  }
  users[email] = { password, carts: {}, history: [] };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  showToast("¡Registro exitoso!");
  return true;
}

function loginUser(email, password) {
  if (!users[email] || users[email].password !== password) {
    showToast("Email o contraseña incorrectos");
    return false;
  }
  currentUser = email;
  localStorage.setItem(CURRENT_USER_KEY, email);
  showToast(`¡Bienvenido ${email}!`);
  return true;
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem(CURRENT_USER_KEY);
  clearCart();
  showToast("Sesión cerrada");
}

function getUserCartKey() {
  return currentUser ? `${currentUser}_cart` : "guest_cart";
}

function getUserHistoryKey() {
  return currentUser ? `${currentUser}_history` : "guest_history";
}

// Reemplazar funciones storage de cart.js
function saveCartToStorage(cartData) {
  const key = getUserCartKey();
  localStorage.setItem(key, JSON.stringify(cartData));
}

function loadCartFromStorage() {
  initUsers();
  const key = getUserCartKey();
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw).cart || {} : {};
}

function savePurchaseHistory(purchaseData) {
  initUsers();
  const historyKey = getUserHistoryKey();
  let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
  history.unshift(purchaseData);
  localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 10)));
}

function loadPurchaseHistory() {
  initUsers();
  const historyKey = getUserHistoryKey();
  const raw = localStorage.getItem(historyKey);
  return raw ? JSON.parse(raw) : [];
}

initUsers();
