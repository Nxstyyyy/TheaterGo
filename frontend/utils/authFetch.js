import AsyncStorage from "@react-native-async-storage/async-storage";

let _logoutHandler = null;

export function setLogoutHandler(fn) {
  _logoutHandler = fn;
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp && Date.now() / 1000 > payload.exp;
  } catch {
    return true;
  }
}

async function doLogout() {
  await AsyncStorage.removeItem("token");
  _logoutHandler?.();
}

export async function authFetch(url, options = {}) {
  const token = await AsyncStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    await doLogout();
    return null;
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    await doLogout();
    return null;
  }

  return res;
}
