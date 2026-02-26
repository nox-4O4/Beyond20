const api = (() => {
    const API_ENDPOINTS = {
        AUTH_URL: "https://auth-service.dndbeyond.com/v1/cobalt-token",
        DICE_CONFIG: "https://dice-service.dndbeyond.com/diceuserconfig/v1/get",
        CHARACTER_LIST: "https://character-service.dndbeyond.com/character/v5/characters/list?userId="
    };

    let cachedToken = null,
        cachedConfig = null;

    async function listCharacters(userId) {
        const req = await fetch(API_ENDPOINTS.CHARACTER_LIST + userId, { headers: { Authorization: "Bearer " + await getAuthToken() } });
        const resp = await req.json();
        return resp.data.characters;
    }

    async function getAuthToken() {
        if (cachedToken && cachedToken.exp <= Date.now() + 10_000) // refresh 10 seconds prior to expiry
            return cachedToken.token

        const req = await fetch(API_ENDPOINTS.AUTH_URL, { credentials: "include" })
        const resp = await req.json()
        cachedToken = { ...resp, exp: Date.now() + resp.ttl * 1000 }

        return cachedToken.token
    }

    async function fetchInfo() {
        if (!cachedConfig) {
            const diceReq = await fetch(API_ENDPOINTS.DICE_CONFIG, { headers: { Authorization: "Bearer " + await getAuthToken() } });
            const diceConfig = (await diceReq.json()).data;

            cachedConfig = {
                userId: diceConfig.id,
                diceSetId: diceConfig.setId,
                characters: await listCharacters(diceConfig.id),
            };
        }

        return cachedConfig;
    }

    return { getAuthToken, fetchInfo }
})()