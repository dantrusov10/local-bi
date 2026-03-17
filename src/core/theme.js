export const defaultTheme = {
  primary: '#4a7cff',
  accent: '#55c6ff',
  bgStart: '#07101d',
  bgEnd: '#0a1220',
  cardGlow: 'rgba(73, 167, 255, 0.18)'
}

export function applyTheme(theme = {}) {
  const root = document.documentElement
  const t = { ...defaultTheme, ...theme }
  root.style.setProperty('--accent', t.accent)
  root.style.setProperty('--primary', t.primary)
  root.style.setProperty('--bg-start', t.bgStart)
  root.style.setProperty('--bg-end', t.bgEnd)
  root.style.setProperty('--card-glow', t.cardGlow)
  return t
}
