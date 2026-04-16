import { ApiError } from '../errors.js'

export const mapDbError = (error, fallbackMessage = 'Database operation failed') => {
  if (error instanceof ApiError) {
    return error
  }

  if (['ECONNREFUSED', 'ENOTFOUND'].includes(error?.code)) {
    return new ApiError(503, 'DB_UNAVAILABLE', 'Database is unreachable. Check API DATABASE_URL and DB status.')
  }

  if (['3D000', '28P01'].includes(error?.code)) {
    return new ApiError(503, 'DB_CONFIGURATION_ERROR', 'Database configuration is invalid. Check DATABASE_URL.')
  }

  if (error?.code === '23503') {
    return new ApiError(409, 'RESOURCE_IN_USE', 'Resource is referenced by positions and cannot be deleted')
  }

  return new ApiError(500, 'INTERNAL_ERROR', fallbackMessage)
}
