const blockedHosts = new Set(["localhost", "localhost.localdomain", "metadata.google.internal"]);
const privateIp = /^(127\.|10\.|192\.168\.|169\.254\.|0\.|::1$|fc|fd)/i;

export function validateAuditUrl(raw: string): { ok: true; url: string } | { ok: false; message: string } {
  try {
    const parsed = new URL(raw.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) return { ok: false, message: 'Only public HTTP and HTTPS URLs can be audited.' };
    if (parsed.username || parsed.password) return { ok: false, message: 'URLs with embedded credentials are not accepted.' };
    if (parsed.port && !['80', '443'].includes(parsed.port)) return { ok: false, message: 'Only standard web ports are accepted.' };
    const host = parsed.hostname.toLowerCase();
    if (blockedHosts.has(host) || privateIp.test(host)) return { ok: false, message: 'Private, local, and metadata addresses cannot be audited.' };
    return { ok: true, url: parsed.toString() };
  } catch { return { ok: false, message: 'Enter a complete public URL, for example https://example.com.' }; }
}
