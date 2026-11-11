/**
 * BasePage: comportamiento común a todas las páginas (Page Object Model).
 * Centraliza las esperas explícitas para que ninguna prueba use sleeps fijos.
 */
const { By, until, Key } = require('selenium-webdriver');
const config = require('../support/config');

class BasePage {
    /** @param {import('selenium-webdriver').WebDriver} driver */
    constructor(driver) {
        this.driver = driver;
        this.timeout = config.timeout;
    }

    /** Navega a una ruta relativa del frontend (ej. "/login"). */
    async visitar(ruta = '/') {
        await this.driver.get(new URL(ruta, config.baseUrl).href);
    }

    /** Borra la sesión guardada por la app (token JWT en localStorage). */
    async limpiarSesion() {
        await this.visitar('/login');
        await this.driver.executeScript('window.localStorage.clear();');
    }

    /** Espera a que el elemento exista y sea visible, y lo devuelve. */
    async encontrar(locator) {
        const elemento = await this.driver.wait(
            until.elementLocated(locator),
            this.timeout,
            `No apareció el elemento ${locator}`
        );
        await this.driver.wait(until.elementIsVisible(elemento), this.timeout);
        return elemento;
    }

    /** Escribe en un campo reemplazando cualquier valor previo. */
    async escribir(locator, texto) {
        const campo = await this.encontrar(locator);
        await campo.click();
        // clear() no dispara los eventos que escucha Angular; seleccionar y borrar sí.
        await campo.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.DELETE);
        if (texto !== undefined && texto !== null && texto !== '') {
            await campo.sendKeys(String(texto));
        }
    }

    /** Hace clic cuando el elemento está habilitado. */
    async clic(locator) {
        const elemento = await this.encontrar(locator);
        await this.driver.wait(until.elementIsEnabled(elemento), this.timeout);
        await elemento.click();
    }

    /** Devuelve el texto visible de un elemento. */
    async texto(locator) {
        return (await (await this.encontrar(locator)).getText()).trim();
    }

    /** Devuelve los textos de todos los elementos visibles que coinciden. */
    async textos(locator) {
        const elementos = await this.driver.findElements(locator);
        const visibles = [];
        for (const elemento of elementos) {
            if (await elemento.isDisplayed()) visibles.push((await elemento.getText()).trim());
        }
        return visibles;
    }

    /** true si el elemento está presente y visible en este momento (sin esperar). */
    async estaVisible(locator) {
        const elementos = await this.driver.findElements(locator);
        return elementos.length > 0 && elementos[0].isDisplayed();
    }

    /** Espera hasta que la URL contenga el fragmento indicado. */
    async esperarUrl(fragmento) {
        await this.driver.wait(until.urlContains(fragmento), this.timeout,
            `La URL no llegó a contener "${fragmento}"`);
        return this.driver.getCurrentUrl();
    }

    /** Espera hasta que desaparezca el elemento (por ejemplo una barra de progreso). */
    async esperarQueDesaparezca(locator) {
        await this.driver.wait(async () => (await this.driver.findElements(locator)).length === 0,
            this.timeout, `El elemento ${locator} no desapareció`);
    }
}

module.exports = { BasePage, By };
