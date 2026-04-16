export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export const sendError = (res, error) => {
  const status = error.status || 500
  const code = error.code || 'INTERNAL_ERROR'
  const message = error.message || 'Unexpected server error'

  const body = {
    error: {
      code,
      message
    }
  }

  if (error.details !== undefined) {
    body.error.details = error.details
  }

  return res.status(status).json(body)
}
