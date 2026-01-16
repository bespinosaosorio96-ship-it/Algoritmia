
const toastEl = document.getElementById("toast");
const checkoutForm = document.getElementById("checkout-form");
let toastTimeoutId = null;

function animateCartBadge() {
  cartCountBadge.classList.remove("cart-badge-pop");
  void cartCountBadge.offsetWidth;
  cartCountBadge.classList.add("cart-badge-pop");
}

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("toast--show");
  clearTimeout(toastTimeoutId);
  toastTimeoutId = setTimeout(() => {
    toastEl.classList.remove("toast--show");
  }, 3000);
}

function validateCardNumber(num) {
  num = num.replace(/\s/g, '');
  if (num.length < 13 || num.length > 19) return false;
  let sum = 0;
  for (let i = num.length - 1, j = 0; i >= 0; i--, j++) {
    let digit = parseInt(num[i]);
    if (j % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

function handleCheckoutSubmit(event) {
  event.preventDefault();
  console.log('Checkout iniciado'); // Debug

  if (getCartQuantity() === 0) {
    showToast("Carrito vacío. Agrega productos.");
    return;
  }

  const name = document.getElementById('checkout-name')?.value.trim();
  const card = document.getElementById('checkout-card')?.value.replace(/\s/g, '');
  const exp = document.getElementById('checkout-exp')?.value;
  const cvv = document.getElementById('checkout-cvv')?.value;
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'tarjeta';

  if (!name || !card || !validateCardNumber(card) || !exp || !cvv || cvv.length < 3) {
    showToast("Datos inválidos. Verifica tarjeta, fecha MM/AA, CVV.");
    return;
  }

  const items = Object.values(cart).map(item => ({
    productId: item.id,
    quantity: item.quantity,
    unitPrice: item.price,
    title: item.title
  }));
  const subtotal = getCartSubtotal();
  const total = getCartTotal();

  // Guardar en historial
  const historyEntry = {
    id: Date.now(),
    date: new Date().toLocaleString('es-CO'),
    items,
    subtotal,
    total,
    discount: couponDiscountRate,
    paymentMethod
  };
  savePurchaseHistory(historyEntry);
  console.log('Compra guardada:', historyEntry); // Debug

  showToast(`¡Pago ${paymentMethod} exitoso! $${total.toFixed(2)}`);
  
  // Vaciar carrito
  clearCart();
  if (checkoutForm) checkoutForm.reset();
  
  // Reset cupón
  currentCoupon = null;
  couponDiscountRate = 0;
  commitCart();
}
