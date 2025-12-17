/**
 * Constants - Constantes globales del proyecto
 * 
 * Este archivo centraliza todos los valores constantes que se usan en múltiples
 * lugares del framework. Esto sigue el principio DRY (Don't Repeat Yourself).
 * 
 * Beneficios:
 * - Fácil mantenimiento: cambiar un valor en un solo lugar
 * - Previene typos: usar constantes reduce errores de escritura
 * - Documentación: los nombres descriptivos documentan el propósito de cada valor
 * - Type safety: TypeScript verifica que uses los valores correctos
 */

/**
 * URLs de la aplicación BookCart
 * Estas se pueden sobrescribir con variables de ambiente
 */
export const URLS = {
  BASE_URL: process.env.BASE_URL || 'https://bookcart.azurewebsites.net',
  API_URL: process.env.API_URL || 'https://bookcart.azurewebsites.net/api',
  SWAGGER_URL: 'https://bookcart.azurewebsites.net/swagger/index.html',
} as const;

/**
 * Rutas de la aplicación (relativas a BASE_URL)
 * Usamos estas rutas en lugar de hardcodear strings en los tests
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  BOOKS: '/books',
  CART: '/cart',
  CHECKOUT: '/checkout',
  MY_ORDERS: '/my-orders',
} as const;

/**
 * Endpoints de la API (relativos a API_URL)
 * Centralizamos los endpoints para fácil mantenimiento
 */
export const API_ENDPOINTS = {
  // User endpoints
  LOGIN: '/User/login',
  REGISTER: '/User',
  VALIDATE_USERNAME: '/User/validateUserName',
  
  // Book endpoints
  GET_BOOKS: '/Book',
  GET_BOOK_BY_ID: (id: number) => `/Book/${id}`,
  GET_SIMILAR_BOOKS: (id: number) => `/Book/GetSimilarBooks/${id}`,
  
  // Category endpoints
  GET_CATEGORIES: '/Category',
  
  // Cart endpoints
  ADD_TO_CART: '/ShoppingCart/AddToCart',
  GET_CART: '/ShoppingCart',
  CLEAR_CART: '/ShoppingCart/ClearCart',
  
  // Order endpoints
  CREATE_ORDER: '/Order',
  GET_ORDERS: '/Order',
} as const;

/**
 * Timeouts en milisegundos
 * Diferentes acciones requieren diferentes tiempos de espera
 */
export const TIMEOUTS = {
  // Timeouts cortos para elementos que deberían aparecer rápido
  SHORT: 3000,           // 3 segundos - para elementos simples
  MEDIUM: 10000,         // 10 segundos - para la mayoría de las acciones
  LONG: 30000,           // 30 segundos - para navegaciones lentas
  API_REQUEST: 15000,    // 15 segundos - para requests de API
  
  // Timeouts específicos para casos especiales
  ANIMATION: 1000,       // 1 segundo - esperar que animaciones terminen
  DEBOUNCE: 300,         // 300ms - esperar que búsquedas con debounce se activen
} as const;

/**
 * Mensajes de error esperados en la aplicación
 * Útil para verificar que los errores correctos aparecen
 */
export const ERROR_MESSAGES = {
  // Errores de autenticación
  INVALID_CREDENTIALS: 'Username or Password is incorrect',
  USERNAME_NOT_AVAILABLE: 'User Name is not available',
  
  // Errores de validación
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email',
  PASSWORD_MISMATCH: 'Passwords do not match',
  
  // Errores de API
  UNAUTHORIZED: 'Unauthorized',
  NOT_FOUND: 'Not Found',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
} as const;

/**
 * Mensajes de éxito esperados
 */
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful',
  LOGIN_SUCCESS: 'Login successful',
  BOOK_ADDED_TO_CART: 'Book added to cart',
  ORDER_PLACED: 'Order placed successfully',
} as const;

/**
 * Selectores CSS comunes que se usan en múltiples páginas
 * NOTA: En el Page Object Model ideal, los selectores viven en las clases de página
 * Estos son solo selectores que son verdaderamente globales (navbar, footer, etc)
 */
export const COMMON_SELECTORS = {
  // Navegación
  NAVBAR: 'mat-toolbar',
  LOGIN_BUTTON: 'button:has-text("Login")',
  LOGOUT_BUTTON: 'button:has-text("Logout")',
  CART_ICON: 'mat-icon:has-text("shopping_cart")',
  
  // Elementos de formulario comunes
  SUBMIT_BUTTON: 'button[type="submit"]',
  CANCEL_BUTTON: 'button:has-text("Cancel")',
  
  // Mensajes y notificaciones
  SNACKBAR: '.mat-snack-bar-container',
  ERROR_MESSAGE: '.mat-error',
  
  // Spinners y loading
  SPINNER: 'mat-spinner',
  PROGRESS_BAR: 'mat-progress-bar',
} as const;

/**
 * Datos de prueba conocidos
 * Algunos tests necesitan datos específicos que ya existen en el sistema
 */
export const TEST_DATA = {
  // Usuario de prueba que sabemos que existe en BookCart
  EXISTING_USER: {
    username: 'ortom',
    password: 'pass1234',
  },
  
  // Categorías conocidas de libros
  KNOWN_CATEGORIES: [
    'Biography',
    'Fantasy',
    'Mystery',
    'Romance',
    'Fiction',
  ],
  
  // Términos de búsqueda que deberían encontrar libros
  // NOTA: Actualmente BookCart tiene issues con esto, estos tests fallarán
  SEARCH_TERMS: {
    HARRY: 'Harry',
    POTTER: 'Potter',
    HP: 'HP',
  },
} as const;

/**
 * Configuración de reportes y logging
 */
export const REPORTING = {
  SCREENSHOT_ON_FAILURE: true,
  VIDEO_ON_FAILURE: true,
  TRACE_ON_RETRY: true,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
} as const;

/**
 * Configuración de Browser
 */
export const BROWSER_CONFIG = {
  HEADLESS: process.env.HEADLESS !== 'false',  // Ejecutar sin UI por defecto
  VIEWPORT: {
    WIDTH: 1920,
    HEIGHT: 1080,
  },
  USER_AGENT: 'BookCart Automation Tests',
} as const;

/**
 * Códigos de estado HTTP esperados
 * Útil para tests de API
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Tags para ejecución condicional de tests
 * Estos coinciden con los grep patterns en playwright.config.ts
 */
export const TEST_TAGS = {
  UI: '@ui',
  API: '@api',
  INTEGRATION: '@integration',
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  DEFECT: '@defect',
  BLOCKED: '@blocked',
} as const;

/**
 * Configuración de reintentos para acciones específicas
 * Algunas acciones son inherentemente más propensas a fallar y necesitan reintentos
 */
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,  // 1 segundo entre reintentos
} as const;

/**
 * Regex patterns útiles para validación
 */
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!]).{6,}$/,
  JWT_TOKEN: /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
} as const;