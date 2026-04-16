const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const parseResponse = async (response) => {
  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.error?.message || 'Request failed'
    const error = new Error(message)
    error.status = response.status
    error.code = data?.error?.code
    error.details = data?.error?.details
    throw error
  }

  return data
}

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })

  return parseResponse(response)
}
