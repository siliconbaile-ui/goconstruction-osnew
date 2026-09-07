const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

const sanitizeBaseUrl = (url) => {
	if (!url || typeof url !== 'string') return 'https://base44.app';
	if (url.includes('/editor/preview') || url.includes('/apps/')) {
		return 'https://base44.app';
	}
	return url.replace(/\/$/, '');
};

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	}
	const rawAppId = getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID || "6a8536b631a67708e1537e3c" });
	const cleanAppId = (!rawAppId || rawAppId === 'null' || rawAppId === 'undefined') ? '6a8536b631a67708e1537e3c' : rawAppId;

	const rawBaseUrl = getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL || "https://base44.app" });
	const cleanBaseUrl = sanitizeBaseUrl(rawBaseUrl);
	if (!isNode && cleanBaseUrl !== rawBaseUrl) {
		storage.setItem('base44_app_base_url', cleanBaseUrl);
	}

	return {
		appId: cleanAppId,
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
		appBaseUrl: cleanBaseUrl,
	}
}


export const appParams = {
	...getAppParams()
}
