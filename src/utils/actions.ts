export function parseData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T
}

export function extractConnectionString(uri: string) {
  return uri.replace(/\/[^/]*$/, '')
}
