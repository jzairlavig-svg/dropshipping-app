// reglas.js
// Reglas de negocio del sistema de gestión de pedidos (importación/dropshipping)

// Tiempos estimados de entrega por proveedor, en días
const TIEMPOS_ESTIMADOS = {
  "AliExpress": 25,
  "1688.com": 20,
  "DHgate": 30,
  "Temu": 15,
  "Shenzhen Dropship Ltd.": 35,
};

const ESTADOS_SIN_DEMORA = ["Listo para entrega", "Entregado"];

/**
 * REGLA 1 — Saldo pendiente
 * saldo = precioTotal - montoAdelantado
 * - Nunca negativo (si adelantó de más, saldo = 0)
 * - Si ya está pagado, saldo = 0 sin importar el cálculo
 * - Si faltan datos, devuelve null (el llamador debe mostrar "Datos incompletos")
 */
function calcularSaldoPendiente(precioTotal, montoAdelantado, pagado) {
  if (pagado) {
    return 0;
  }
  const precio = parseFloat(precioTotal);
  const adelanto = parseFloat(montoAdelantado);

  if (isNaN(precio) || isNaN(adelanto)) {
    return null; // Datos incompletos
  }

  const saldo = precio - adelanto;
  return saldo < 0 ? 0 : saldo;
}

/**
 * REGLA 2 — Pedido demorado
 * Compara días transcurridos desde fechaPedido contra el tiempo estimado
 * del proveedor. Devuelve uno de:
 *   "Demorado" | "En tiempo" | "Sin estimar" | "Fecha no registrada" | "Fecha inválida"
 */
function calcularEstadoDemora(fechaPedido, proveedor, estadoActual, fechaHoy = new Date()) {
  if (ESTADOS_SIN_DEMORA.includes(estadoActual)) {
    return "En tiempo"; // ya llegó, nunca es demorado
  }

  if (!fechaPedido) {
    return "Fecha no registrada";
  }

  const fechaPed = new Date(fechaPedido);
  if (isNaN(fechaPed.getTime())) {
    return "Fecha inválida";
  }
  if (fechaPed > fechaHoy) {
    return "Fecha inválida"; // fecha en el futuro
  }

  const tiempoEstimado = TIEMPOS_ESTIMADOS[proveedor];
  if (tiempoEstimado === undefined) {
    return "Sin estimar";
  }

  const msPorDia = 1000 * 60 * 60 * 24;
  const diasTranscurridos = Math.floor((fechaHoy - fechaPed) / msPorDia);

  return diasTranscurridos > tiempoEstimado ? "Demorado" : "En tiempo";
}

// --- Comprobación de los dos ejemplos (revisar en la consola del navegador) ---
console.log(
  "Ejemplo Regla 1 (esperado $170):",
  calcularSaldoPendiente(250.0, 80.0, false)
);
console.log(
  "Ejemplo Regla 2 (esperado 'Demorado'):",
  calcularEstadoDemora("2026-08-18", "1688.com", "En tránsito", new Date("2026-09-12"))
);
