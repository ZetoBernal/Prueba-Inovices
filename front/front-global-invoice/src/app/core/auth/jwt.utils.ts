interface JwtPayload {
  exp?: number;
}

export function decodeToken(token: string): JwtPayload | null {
    try {
        const payload = token.split('.')[1];
        if (!payload) return null;

        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(normalized)) as JwtPayload;
    } catch {
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    const payload = decodeToken(token);
    if (!payload?.exp) return true;

    return payload.exp * 1000 <= Date.now();
}