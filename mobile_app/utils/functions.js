export function formatCurrency(value) {
    // Convertir el valor a número flotante y asegurar que sea un valor válido
    const number = parseFloat(String(value || 0).replace(",", ""));

    // Usar toFixed(2) para asegurar que siempre muestre dos decimales
    return number.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    }).replace("$", "");
}