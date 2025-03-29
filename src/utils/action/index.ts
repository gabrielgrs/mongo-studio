export type ServerActionResponse<T extends (...args: any) => any> = NonNullable<Awaited<ReturnType<T>>[0]>

export function parseData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T
}
