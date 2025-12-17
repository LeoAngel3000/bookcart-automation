import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración completa de Playwright para el proyecto BookCart
 * 
 * Esta configuración incluye:
 * - Soporte para tags (@ui, @api, @smoke, @regression, etc.)
 * - Configuración de ambientes (base URL configurable)
 * - Múltiples proyectos para diferentes navegadores
 * - Reportes HTML detallados
 * - Configuración específica para CI/CD
 */

export default defineConfig({
  // Directorio donde están ubicados los tests
  testDir: './tests',
  
  /**
   * Ejecutar tests en paralelo para mayor velocidad
   * En archivos diferentes se ejecutan en paralelo automáticamente
   * Dentro del mismo archivo se ejecutan secuencialmente por defecto
   */
  fullyParallel: true,
  
  /**
   * Fallar el build si hay test.only en el código
   * Esto previene que subas código con tests marcados como .only
   * que harían que solo ese test se ejecute ignorando todos los demás
   */
  forbidOnly: !!process.env.CI,
  
  /**
   * Reintentos en caso de fallo
   * En CI reintentamos 2 veces para manejar flakiness de la red
   * En local no reintentamos para ver los fallos inmediatamente
   */
  retries: process.env.CI ? 2 : 0,
  
  /**
   * Workers (procesos paralelos)
   * En CI usamos solo 1 worker para estabilidad y recursos limitados
   * En local usamos múltiples workers según los cores de tu CPU
   */
  workers: process.env.CI ? 1 : undefined,
  
  /**
   * Configuración de reportes
   * - html: Genera reporte visual navegable en carpeta playwright-report/
   * - list: Muestra progreso en consola durante ejecución
   * - json: Genera JSON con resultados para procesamiento posterior (solo en CI)
   */
  reporter: [
    ['html', { open: 'never' }],  // No abrir automáticamente, solo generar
    ['list'],  // Mostrar en consola
    ...(process.env.CI ? [['json', { outputFile: 'test-results.json' }]] : [])
  ],
  
  /**
   * Configuración global para todos los tests
   * Estos valores se pueden sobrescribir en proyectos específicos
   */
  use: {
    /**
     * Base URL para navegación
     * En lugar de page.goto('https://bookcart.azurewebsites.net')
     * puedes usar page.goto('/') y se agregará automáticamente la base URL
     * Esto facilita cambiar de ambiente (QA, staging, prod)
     */
    baseURL: process.env.BASE_URL || 'https://bookcart.azurewebsites.net',
    
    /**
     * Trace: Grabación detallada de la ejecución del test
     * 'on-first-retry': Solo graba cuando un test falla y se reintenta
     * Esto te da un archivo .zip con screenshots, DOM snapshots, network logs, etc
     * que puedes abrir en Playwright Trace Viewer para debugging
     */
    trace: 'on-first-retry',
    
    /**
     * Screenshot: Captura de pantalla en ciertos eventos
     * 'only-on-failure': Solo captura cuando un test falla
     * Útil para debugging visual rápido
     */
    screenshot: 'only-on-failure',
    
    /**
     * Video: Grabación de video de la ejecución
     * 'retain-on-failure': Solo guarda el video si el test falló
     * Los videos consumen espacio, solo los queremos cuando hay problemas
     */
    video: 'retain-on-failure',
    
    /**
     * Timeout de navegación
     * Cuánto tiempo esperar a que una página cargue antes de fallar
     * 30 segundos es razonable para BookCart que a veces es lento
     */
    navigationTimeout: 30000,
    
    /**
     * Timeout de acción
     * Cuánto tiempo esperar a que un elemento sea clickeable, visible, etc
     * 10 segundos cubre la mayoría de los casos
     */
    actionTimeout: 10000,
  },
  
  /**
   * Timeout global de test
   * Cuánto tiempo puede durar un test completo antes de marcarse como timeout
   * 60 segundos (1 minuto) es razonable para tests E2E complejos
   * Tests de API deberían ser mucho más rápidos (5-10 segundos)
   */
  timeout: 60000,
  
  /**
   * Expect timeout
   * Cuánto tiempo esperar en assertions (expect) antes de fallar
   * Por ejemplo, await expect(element).toBeVisible() esperará hasta 5 segundos
   */
  expect: {
    timeout: 5000
  },
  
  /**
   * Proyectos: Diferentes configuraciones para ejecutar tests
   * Cada proyecto puede tener su propia configuración y correr en diferentes navegadores
   * Los tags (@ui, @api, @smoke, etc) se configuran usando grep
   */
  projects: [
    /**
     * Proyecto: Chromium Setup
     * Este proyecto especial solo ejecuta tests marcados con @setup
     * Se usa para preparar datos antes de los tests principales
     * teardown: 'chromium-cleanup' significa que después de los tests principales
     * se ejecutará el proyecto de cleanup
     */
    {
      name: 'chromium-setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'chromium-cleanup',
    },
    
    /**
     * Proyecto: Chromium Cleanup
     * Ejecuta tests de limpieza después de que todos los tests principales terminan
     */
    {
      name: 'chromium-cleanup',
      testMatch: /.*\.teardown\.ts/,
    },
    
    /**
     * Proyecto: Tests UI en Chromium (Chrome)
     * Ejecuta tests marcados con @ui en el navegador Chromium
     */
    {
      name: 'chromium-ui',
      use: { 
        ...devices['Desktop Chrome'],
      },
      grep: /@ui/,  // Solo ejecuta tests que tengan @ui en el título
      dependencies: ['chromium-setup'],  // Espera a que setup termine primero
    },
    
    /**
     * Proyecto: Tests de API
     * Los tests de API no necesitan navegador, son solo HTTP requests
     * Por eso no especificamos un device, pero sí necesitamos un contexto de Playwright
     */
    {
      name: 'api-tests',
      use: {
        // Para tests de API no necesitamos abrir navegador
        // pero sí necesitamos el contexto de request de Playwright
      },
      grep: /@api/,  // Solo ejecuta tests con @api
    },
    
    /**
     * Proyecto: Tests de Integración
     * Estos tests combinan API y UI, necesitan navegador completo
     */
    {
      name: 'integration-tests',
      use: { 
        ...devices['Desktop Chrome'],
      },
      grep: /@integration/,
      dependencies: ['chromium-setup'],
    },
    
    /**
     * Proyecto: Smoke Tests
     * Tests críticos que se ejecutan rápidamente
     * Útil para ejecutar antes de cada deploy o PR
     */
    {
      name: 'smoke-tests',
      use: { 
        ...devices['Desktop Chrome'],
      },
      grep: /@smoke/,
      dependencies: ['chromium-setup'],
    },
    
    /**
     * Proyecto: Tests que documentan defectos conocidos
     * Estos tests van a fallar intencionalmente porque documentan bugs reales
     * Los separamos para que no hagan fallar el build completo
     */
    {
      name: 'defect-documentation',
      use: { 
        ...devices['Desktop Chrome'],
      },
      grep: /@defect/,
      dependencies: ['chromium-setup'],
    },
    
    /**
     * Proyecto opcional: Firefox
     * Descomenta si quieres ejecutar tests en Firefox también
     * Útil para cross-browser testing
     */
    // {
    //   name: 'firefox-ui',
    //   use: { 
    //     ...devices['Desktop Firefox'],
    //   },
    //   grep: /@ui/,
    //   dependencies: ['chromium-setup'],
    // },
    
    /**
     * Proyecto opcional: WebKit (Safari)
     * Descomenta si necesitas probar en Safari
     */
    // {
    //   name: 'webkit-ui',
    //   use: { 
    //     ...devices['Desktop Safari'],
    //   },
    //   grep: /@ui/,
    //   dependencies: ['chromium-setup'],
    // },
  ],
  
  /**
   * Configuración de carpetas de salida
   * Puedes personalizar dónde se guardan reportes, traces, videos, etc
   */
  outputDir: 'test-results/',
});

/**
 * Comandos útiles para ejecutar tests con esta configuración:
 * 
 * # Ejecutar todos los tests
 * npx playwright test
 * 
 * # Ejecutar solo tests de UI
 * npx playwright test --project=chromium-ui
 * 
 * # Ejecutar solo tests de API
 * npx playwright test --project=api-tests
 * 
 * # Ejecutar solo smoke tests
 * npx playwright test --project=smoke-tests
 * 
 * # Ejecutar tests que documentan defectos
 * npx playwright test --project=defect-documentation
 * 
 * # Ejecutar tests con grep (buscar por título)
 * npx playwright test --grep "login"
 * 
 * # Ejecutar un archivo específico
 * npx playwright test tests/ui/auth.spec.ts
 * 
 * # Ejecutar en modo debug (paso a paso)
 * npx playwright test --debug
 * 
 * # Ver el reporte HTML generado
 * npx playwright show-report
 * 
 * # Ejecutar con una base URL diferente (por ejemplo, localhost)
 * BASE_URL=http://localhost:3000 npx playwright test
 */