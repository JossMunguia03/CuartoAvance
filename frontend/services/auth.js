/**
 * Servicio de Autenticación - Maneja JWT y sesión del usuario
 */

import { apiService } from './api.js';

class AuthService {
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
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('user_data', JSON.stringify(response.usuario));
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
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('user_data', JSON.stringify(response.usuario));
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
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.reload();
    }

    /**
     * Verifica si el usuario está autenticado
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!localStorage.getItem('auth_token');
    }

    /**
     * Obtiene los datos del usuario actual
     * @returns {object|null}
     */
    getCurrentUser() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * Obtiene el token de autenticación
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem('auth_token');
    }
}

// Exportar instancia única
export const authService = new AuthService();

