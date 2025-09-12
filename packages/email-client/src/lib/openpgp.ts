// OpenPGP.js integration stubs. Install `openpgp` and wire real crypto flows.
export async function encryptIfNeeded(html: string, opts: { encrypt?: boolean; recipients?: string[] }) {
  if (!opts.encrypt) return { html };
  // TODO: lookup recipients' public keys and encrypt the payload.
  return { html: `/* ENCRYPTED */\n` + html };
}
