const crypto = require('crypto');

function getGravatarUrl(email) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!normalizedEmail) return null;
  const hash = crypto.createHash('md5').update(normalizedEmail).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
}

module.exports = getGravatarUrl;