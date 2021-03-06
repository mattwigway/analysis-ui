import {IUser} from '../user'

import {fetchData, SafeResponse} from './safe-fetch'

/**
 * Fetch wrapper that includes authentication. Defaults headers to JSON.
 */
export default function authFetch<T>(
  url: string,
  user?: IUser,
  options?: RequestInit
): Promise<SafeResponse<T>> {
  const headers = {
    Authorization: `bearer ${user?.idToken}`
  }
  if (user?.adminTempAccessGroup)
    headers['X-Conveyal-Access-Group'] = user.adminTempAccessGroup

  return fetchData(url, {
    mode: 'cors',
    ...options,
    headers: {
      ...headers,
      ...options?.headers
    }
  })
}
