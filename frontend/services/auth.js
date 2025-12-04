/**
 * Servicio de Autenticación - Maneja JWT y sesión del usuario
 */

import { apiService } from './api.js';

class AuthService {
    constructor() {
        /**
         * Token JWT actual (solo en memoria, no persistente)
         * @type {string|null}
         * @private
         */
        this._token = null;

        /**
         * Datos del usuario autenticado (solo en memoria)
         * @type {object|null}
         * @private
         */
        this._currentUser = null;
    }

    /**
     * Inicia sesión y guarda el token
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña
     * @returns {Promise<object>} - Datos del usuario y token
     */
    async login(email, password) {
        try {
            const response = await apiService.login(email, password);
            
            if (response.token) {
                // Guardar solo en memoria por seguridad
                this._token = response.token;
                this._currentUser = response.usuario || null;
                apiService.setToken(response.token);
                return response;
            }
            
            throw new Error('No se recibió token en la respuesta');
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    /**
     * Registra un nuevo usuario
     * @param {string} nombre - Nombre del usuario
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña
     * @param {string} rol - Rol del usuario (default: 'user')
     * @returns {Promise<object>} - Datos del usuario y token
     */
    async register(nombre, email, password, rol = 'user') {
        try {
            const response = await apiService.register(nombre, email, password, rol);
            
            if (response.token) {
                // Guardar solo en memoria por seguridad
                this._token = response.token;
                this._currentUser = response.usuario || null;
                apiService.setToken(response.token);
                return response;
            }
            
            throw new Error('No se recibió token en la respuesta');
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    /**
     * Cierra la sesión del usuario
     */
    logout() {
        this._token = null;
        this._currentUser = null;
        apiService.clearToken();
        window.location.reload();
    }

    /**
     * Verifica si el usuario está autenticado
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this._token;
    }

    /**
     * Obtiene los datos del usuario actual
     * @returns {object|null}
     */
    getCurrentUser() {
        return this._currentUser;
    }

    /**
     * Obtiene el token de autenticación
     * @returns {string|null}
     */
    getToken() {
        return this._token;
    }

    /**
     * Obtiene el rol del usuario actual
     * @returns {string|null} - 'admin' o 'user' o null si no está autenticado
     */
    getUserRole() {
        const user = this.getCurrentUser();
        return user ? user.rol : null;
    }

    /**
     * Verifica si el usuario actual es administrador
     * @returns {boolean}
     */
    isAdmin() {
        return this.getUserRole() === 'admin';
    }
}

// Exportar instancia única
export const authService = new AuthService();

