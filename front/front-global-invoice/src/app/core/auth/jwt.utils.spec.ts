import { decodeToken, isTokenExpired } from './jwt.utils';

function buildToken(payload: object): string {
    const encoded = btoa(JSON.stringify(payload));
    return `header.${encoded}.signature`;
}

describe('decodeToken', () => {
    it('decodifica el payload de un token con formato válido', () => {
        expect(decodeToken(buildToken({ exp: 123456 }))).toEqual({ exp: 123456 });
    });

    it('devuelve null si el token no tiene el formato header.payload.signature', () => {
        expect(decodeToken('token-sin-puntos')).toBeNull();
    });

    it('devuelve null si el payload no es JSON válido', () => {
        const token = `header.${btoa('esto no es json')}.signature`;
        expect(decodeToken(token)).toBeNull();
    });
});

describe('isTokenExpired', () => {
    it('devuelve false si el token todavía no vence', () => {
        const futureExp = Math.floor(Date.now() / 1000) + 3600;
        expect(isTokenExpired(buildToken({ exp: futureExp }))).toBe(false);
    });

    it('devuelve true si el token ya venció', () => {
        const pastExp = Math.floor(Date.now() / 1000) - 3600;
        expect(isTokenExpired(buildToken({ exp: pastExp }))).toBe(true);
    });

    it('devuelve true si el token no trae claim de expiración', () => {
        expect(isTokenExpired(buildToken({}))).toBe(true);
    });

    it('devuelve true si el token está corrupto (ante la duda, se cierra la sesión)', () => {
        expect(isTokenExpired('esto-no-es-un-token')).toBe(true);
    });
});
