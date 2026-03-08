export const t = (translations: Record<string, any>) => (key: string) => {
  return translations?.[key] ?? key
}
