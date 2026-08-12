const GUEST_TOKEN_KEY = 'parkingGuestToken';
const GUEST_PROFILE_KEY = 'parkingGuestProfile';

export function getGuestToken() {
    let token = localStorage.getItem(GUEST_TOKEN_KEY);
    if (!token) {
        token = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(GUEST_TOKEN_KEY, token);
    }
    return token;
}

export function getGuestProfile() {
    try {
        return JSON.parse(localStorage.getItem(GUEST_PROFILE_KEY) || '{}');
    } catch {
        return {};
    }
}

export function saveGuestProfile(profile) {
    const current = getGuestProfile();
    const next = { ...current, ...profile };
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(next));
    return next;
}
