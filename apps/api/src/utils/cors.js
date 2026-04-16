export const getCorsOrigins = () => {
  const envValue = process.env.CORS_ORIGIN

  if (!envValue) {
    return ['http://localhost:5173', 'http://127.0.0.1:5173']
  }

  return envValue.split(',').map((item) => item.trim()).filter(Boolean)
}
