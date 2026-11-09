const telegramHosts = new Set(['t.me', 'www.t.me', 'telegram.me', 'www.telegram.me']);
const discordHosts = new Set(['discord.com', 'www.discord.com', 'discordapp.com', 'www.discordapp.com']);
const inviteHosts = new Set([...discordHosts, 'discord.gg', 'www.discord.gg']);

const valueOf = (value) => typeof value === 'string' ? value.trim() : '';

function trustedUrl(value, hosts) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && hosts.has(url.hostname.toLowerCase()) && !url.username && !url.password
      ? url : null;
  } catch {
    return null;
  }
}

function telegramLink(value) {
  const raw = valueOf(value);
  if (!raw) return null;
  const handle = raw.replace(/^@/, '');
  if (/^[a-z][a-z0-9_]{4,31}$/i.test(handle)) {
    return { href: `https://t.me/${handle}`, detail: `@${handle}` };
  }
  const url = trustedUrl(raw, telegramHosts);
  if (!url || url.pathname === '/') return null;
  const shortName = url.pathname.match(/^\/([a-z][a-z0-9_]{4,31})\/?$/i);
  return { href: url.href, detail: shortName ? `@${shortName[1]}` : 'Открыть' };
}

export function getContacts(site = {}) {
  const contacts = [];
  const discord = valueOf(site.discord);
  if (discord) {
    const profile = trustedUrl(discord, discordHosts);
    if (profile && /^\/users\/\d+\/?$/.test(profile.pathname)) {
      contacts.push({ label: 'Discord', detail: 'Открыть профиль', href: profile.href });
    } else if (/^@?[a-z0-9_.-]{2,32}(?:#\d{4})?$/i.test(discord)) {
      const nickname = discord.replace(/^@/, '');
      contacts.push({ label: 'Discord', detail: `@${nickname}`, copy: nickname });
    }
  }

  const telegram = telegramLink(site.telegram);
  if (telegram) contacts.push({ label: 'Telegram', ...telegram });

  const server = trustedUrl(valueOf(site.discord_server), inviteHosts);
  if (server && (
    (/^(www\.)?discord\.gg$/i.test(server.hostname) && /^\/[\w-]+\/?$/.test(server.pathname)) ||
    (/^\/(invite)\/[\w-]+\/?$/.test(server.pathname) && /^((www\.)?discord(app)?\.com)$/i.test(server.hostname))
  )) {
    contacts.push({ label: 'Discord-сервер', detail: 'Присоединиться', href: server.href });
  }

  const channel = telegramLink(site.telegram_channel);
  if (channel) {
    contacts.push({ label: 'Telegram-канал', detail: channel.detail === 'Открыть' ? channel.detail : 'Открыть канал', href: channel.href });
  }
  return contacts;
}
