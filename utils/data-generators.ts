/**
 * Data Generator - Generador de datos de prueba únicos y realistas
 * 
 * Este módulo proporciona funciones para generar datos de prueba que necesitamos
 * en nuestros tests, como usernames únicos, emails, passwords, etc.
 * 
 * La unicidad es crucial en testing porque:
 * - No queremos que tests fallen porque intentamos crear un usuario que ya existe
 * - Queremos poder ejecutar los mismos tests múltiples veces sin colisiones
 * - En ambientes compartidos, múltiples testers pueden estar ejecutando simultáneamente
 */

/**
 * Genera un username único usando timestamp y random
 * 
 * Formato: prefix_timestamp_random
 * Ejemplo: "testuser_1703012345678_a3f"
 * 
 * @param prefix - Prefijo para identificar el tipo de test (default: 'autotest')
 * @returns Username único garantizado
 */
export function generateUniqueUsername(prefix: string = 'autotest'): string {
  const timestamp = Date.now(); // Milisegundos desde 1970 - siempre único
  const random = Math.random().toString(36).substring(2, 5); // 3 caracteres aleatorios
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Genera un email único basado en username
 * 
 * @param username - Username base para el email
 * @param domain - Dominio del email (default: 'test.com')
 * @returns Email único
 */
export function generateUniqueEmail(username?: string, domain: string = 'test.com'): string {
  const user = username || generateUniqueUsername();
  return `${user}@${domain}`;
}

/**
 * Genera un password válido según reglas de BookCart
 * 
 * BookCart requiere:
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 * - Al menos un carácter especial
 * - Mínimo 6 caracteres
 * 
 * @param length - Longitud del password (default: 10)
 * @returns Password que cumple todas las validaciones
 */
export function generateValidPassword(length: number = 10): string {
  // Definimos los conjuntos de caracteres que necesitamos
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@#$%&*!';
  
  // Empezamos con al menos un carácter de cada tipo requerido
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Llenamos el resto con caracteres aleatorios de todos los conjuntos
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Mezclamos los caracteres para que no siempre empiecen en el mismo orden
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Genera datos completos de un usuario de prueba
 * 
 * @param prefix - Prefijo para el username
 * @returns Objeto con todos los datos del usuario
 */
export interface TestUser {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  gender: 'Male' | 'Female';
}

export function generateTestUser(prefix: string = 'test'): TestUser {
  const username = generateUniqueUsername(prefix);
  
  return {
    firstName: 'Test',
    lastName: 'User',
    username: username,
    email: generateUniqueEmail(username),
    password: generateValidPassword(),
    gender: Math.random() > 0.5 ? 'Male' : 'Female'
  };
}

/**
 * Genera un string aleatorio de longitud específica
 * Útil para testing de límites de campos de texto
 * 
 * @param length - Longitud deseada
 * @param charset - Conjunto de caracteres a usar (default: alfanumérico)
 * @returns String aleatorio
 */
export function generateRandomString(
  length: number, 
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
}

/**
 * Genera un número aleatorio entre min y max (inclusive)
 * 
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns Número aleatorio en el rango
 */
export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Genera un precio aleatorio para pruebas
 * 
 * @param min - Precio mínimo (default: 10)
 * @param max - Precio máximo (default: 500)
 * @returns Precio con 2 decimales
 */
export function generateRandomPrice(min: number = 10, max: number = 500): number {
  const price = Math.random() * (max - min) + min;
  return Math.round(price * 100) / 100; // Redondear a 2 decimales
}

/**
 * Espera un tiempo específico (útil para debugging o esperas explícitas)
 * 
 * NOTA: En general, en Playwright deberías usar las esperas automáticas
 * en lugar de sleep(). Usa esto solo cuando absolutamente necesites
 * una espera fija, como cuando esperas que una animación termine.
 * 
 * @param ms - Milisegundos a esperar
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formatea una fecha para logging
 * 
 * @param date - Fecha a formatear (default: ahora)
 * @returns String con formato legible
 */
export function formatDateForLog(date: Date = new Date()): string {
  return date.toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Sanitiza un string para usar en nombres de archivo
 * Remueve caracteres que no son seguros para nombres de archivo
 * 
 * @param str - String a sanitizar
 * @returns String seguro para usar en nombres de archivo
 */
export function sanitizeForFilename(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9-_]/g, '_') // Reemplazar caracteres especiales con _
    .replace(/_+/g, '_') // Reemplazar múltiples _ consecutivos con uno solo
    .replace(/^_|_$/g, ''); // Remover _ del inicio y final
}