declare module '@cloudcmd/clipboard' {
  const e: Pick<typeof navigator.clipboard, 'writeText'>
  export default e
}
