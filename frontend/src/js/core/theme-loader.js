// Theme loading and caching utility
class ThemeLoader {
  static #themeCache = new Map();
  static #loadingPromises = new Map();

  static async loadTheme(credentialType, themeId) {
    const cacheKey = `${credentialType}:${themeId}`;

    // Check if theme is already loaded
    if (this.#themeCache.has(cacheKey)) {
      return this.#themeCache.get(cacheKey);
    }

    // Check if theme is currently loading
    if (this.#loadingPromises.has(cacheKey)) {
      return this.#loadingPromises.get(cacheKey);
    }

    // Start loading the theme
    const loadingPromise = this.#loadThemeFiles(credentialType, themeId);
    this.#loadingPromises.set(cacheKey, loadingPromise);

    try {
      const theme = await loadingPromise;
      this.#themeCache.set(cacheKey, theme);
      this.#loadingPromises.delete(cacheKey);
      return theme;
    } catch (error) {
      this.#loadingPromises.delete(cacheKey);
      throw error;
    }
  }

  static async #loadThemeFiles(credentialType, themeId) {
    const basePath = `/frontend/src/themes/${credentialType}/${themeId}`;
    
    try {
      // Load CSS first
      await this.#loadCSS(`${basePath}/${themeId}.css`);
      
      // Then load and initialize the theme class
      const module = await import(`${basePath}/${themeId}Theme.js`);
      return module.default;
    } catch (error) {
      console.error(`Failed to load theme: ${credentialType}/${themeId}`, error);
      throw new Error(`Theme loading failed: ${error.message}`);
    }
  }

  static async #loadCSS(path) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = path;
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS: ${path}`));
      
      document.head.appendChild(link);
    });
  }

  static clearCache() {
    this.#themeCache.clear();
    this.#loadingPromises.clear();
  }
}

// Export for use in other files
export default ThemeLoader; 