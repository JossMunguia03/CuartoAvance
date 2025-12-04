/**
 * Servicio de API - Maneja todas las peticiones HTTP a la API REST
 */

const API_BASE_URL = 'http://localhost:3000/api/v1';

class ApiService {
    constructor() {
        /**
         * Token JWT actual en memoria (no se guarda en localStorage por seguridad)
         * @type {string|null}
         * @private
         */
        this._token = null;
    }

    /**
     * Establece el token JWT en memoria
     * @param {string|null} token
     */
    setToken(token) {
        this._token = token || null;
    }

    /**
     * Limpia el token JWT en memoria
     */
    clearToken() {
        this._token = null;
    }

    /**
     * Realiza una petición HTTP genérica
     * @param {string} endpoint - Endpoint de la API
     * @param {object} options - Opciones de fetch (method, body, headers, etc.)
     * @returns {Promise<Response>}
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = this._token;

        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        // Agregar token si existe
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('Error en API request:', error);
            throw error;
        }
    }

    // ========== AUTENTICACIÓN ==========
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ correo_electronico: email, password }),
        });
    }

    async register(nombre, email, password, rol = 'user') {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ nombre, correo_electronico: email, password, rol }),
        });
    }

    // ========== USUARIOS ==========
    async getUsuarios(limit = 50, offset = 0) {
        return this.request(`/usuarios?limit=${limit}&offset=${offset}`);
    }

    async getUsuario(id) {
        return this.request(`/usuarios/${id}`);
    }

    async createUsuario(usuario) {
        return this.request('/usuarios', {
            method: 'POST',
            body: JSON.stringify(usuario),
        });
    }

    async updateUsuario(id, usuario) {
        return this.request(`/usuarios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(usuario),
        });
    }

    async patchUsuario(id, usuario) {
        return this.request(`/usuarios/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(usuario),
        });
    }

    async deleteUsuario(id) {
        return this.request(`/usuarios/${id}`, {
            method: 'DELETE',
        });
    }

    // ========== CATEGORÍAS ==========
    async getCategorias(limit = 50, offset = 0) {
        return this.request(`/categorias?limit=${limit}&offset=${offset}`);
    }

    async getCategoria(id) {
        return this.request(`/categorias/${id}`);
    }

    async searchCategorias(term) {
        return this.request(`/categorias/search?q=${encodeURIComponent(term)}`);
    }

    async createCategoria(categoria) {
        return this.request('/categorias', {
            method: 'POST',
            body: JSON.stringify(categoria),
        });
    }

    async updateCategoria(id, categoria) {
        return this.request(`/categorias/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoria),
        });
    }

    async patchCategoria(id, categoria) {
        return this.request(`/categorias/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(categoria),
        });
    }

    async deleteCategoria(id) {
        return this.request(`/categorias/${id}`, {
            method: 'DELETE',
        });
    }

    // ========== FRASES ==========
    async getFrases(filters = {}, limit = 50, offset = 0) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.categoria_id) params.append('categoria_id', filters.categoria_id);
        if (filters.search) params.append('search', filters.search);
        params.append('limit', limit);
        params.append('offset', offset);

        return this.request(`/frases?${params.toString()}`);
    }

    async getFrasesPublicadas(limit = 50, offset = 0) {
        return this.request(`/frases/publicadas?limit=${limit}&offset=${offset}`);
    }

    async getFrasesAleatorias(count = 5) {
        return this.request(`/frases/aleatorias?count=${count}`);
    }

    async getFrase(id) {
        return this.request(`/frases/${id}`);
    }

    async createFrase(frase) {
        return this.request('/frases', {
            method: 'POST',
            body: JSON.stringify(frase),
        });
    }

    async updateFrase(id, frase) {
        return this.request(`/frases/${id}`, {
            method: 'PUT',
            body: JSON.stringify(frase),
        });
    }

    async patchFrase(id, frase) {
        return this.request(`/frases/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(frase),
        });
    }

    async publishFrase(id) {
        return this.request(`/frases/${id}/publicar`, {
            method: 'PATCH',
        });
    }

    async scheduleFrase(id, scheduled_at) {
        return this.request(`/frases/${id}/programar`, {
            method: 'PATCH',
            body: JSON.stringify({ scheduled_at }),
        });
    }

    async draftFrase(id) {
        return this.request(`/frases/${id}/borrador`, {
            method: 'PATCH',
        });
    }

    async deleteFrase(id) {
        return this.request(`/frases/${id}`, {
            method: 'DELETE',
        });
    }
}

// Exportar instancia única
export const apiService = new ApiService();

