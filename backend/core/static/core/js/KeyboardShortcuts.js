window.KeyboardShortcuts = class {
  constructor() {
    this.shortcuts = new Map();
    this._listener = this._handleKeydown.bind(this);
  }

  /**
   * Inicia el escucha global de atajos
   */
  start() {
    document.addEventListener("keydown", this._listener);
  }

  /**
   * Detiene el escucha
   */
  stop() {
    document.removeEventListener("keydown", this._listener);
  }

  /**
   * Agrega un nuevo atajo
   * @param {string} combo - Ej: "ctrl+k" o "shift+alt+s"
   * @param {Function} callback - Función que se ejecuta cuando se activa el atajo
   */
  register(combo, callback) {
    const normalized = this._normalizeCombo(combo);
    this.shortcuts.set(normalized, callback);
  }

  /**
   * Normaliza el atajo a minúsculas y orden fijo de modificadores
   */
  _normalizeCombo(combo) {
    return combo
      .toLowerCase()
      .split('+')
      .map(part => part.trim())
      .sort()
      .join('+');
  }

  /**
   * Detecta y ejecuta el atajo
   */
  _handleKeydown(e) {
    const keys = [];
    if (e.ctrlKey) keys.push('ctrl');
    if (e.metaKey) keys.push('meta');
    if (e.altKey) keys.push('alt');
    if (e.shiftKey) keys.push('shift');

    const key = e.key.toLowerCase();
    // evitar que mod+mod se registre como solo modificadores
    if (!['control', 'meta', 'alt', 'shift'].includes(key)) {
      keys.push(key);
    }

    const combo = keys.sort().join('+');

    if (this.shortcuts.has(combo)) {
      e.preventDefault();
      this.shortcuts.get(combo)(e);
    }
  }
}
