// Хелперы для админки: JWT, автообновление токена, fetch с авторизацией.

const ACCESS_KEY = "einstein_admin_access"
const REFRESH_KEY = "einstein_admin_refresh"

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function isAuthed() {
  return Boolean(getAccessToken())
}

function setTokens(access: string, refresh?: string) {
  localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function logout() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export async function login(username: string, password: string) {
  const res = await fetch("/api/auth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  }).catch(() => {
    throw new Error("Нет связи с сервером.")
  })
  if (res.status === 401) throw new Error("Неверный логин или пароль.")
  if (!res.ok) throw new Error("Не удалось войти. Попробуйте ещё раз.")
  const data = await res.json()
  setTokens(data.access, data.refresh)
}

async function refreshAccess(): Promise<string | null> {
  const refresh = localStorage.getItem(REFRESH_KEY)
  if (!refresh) return null
  const res = await fetch("/api/auth/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })
  if (!res.ok) {
    logout()
    return null
  }
  const data = await res.json()
  setTokens(data.access)
  return data.access
}

// fetch к админским эндпоинтам с автоматическим Bearer-токеном
// и одной попыткой refresh при 401.
export async function adminFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const doFetch = (token: string | null) =>
    fetch(path, {
      ...init,
      headers: {
        ...init.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

  let res = await doFetch(getAccessToken())
  if (res.status === 401) {
    const fresh = await refreshAccess()
    if (!fresh) throw new Error("SESSION_EXPIRED")
    res = await doFetch(fresh)
  }
  return res
}