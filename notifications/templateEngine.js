const fs = require('fs');
const path = require('path');

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function escapeAll(data) {
  const out = {};
  for (const [key, value] of Object.entries(data)) {
    out[key] = escapeHtml(value);
  }
  return out;
}

class TemplateEngine {
  constructor(templateDir) {
    this.templateDir = templateDir || path.join(__dirname, 'templates');
    this.cache = new Map();
  }

  loadTemplate(templateName) {
    if (this.cache.has(templateName)) {
      return this.cache.get(templateName);
    }

    const resolved = path.resolve(this.templateDir, templateName);
    if (!resolved.startsWith(path.resolve(this.templateDir) + path.sep)) {
      throw new Error(`Invalid template name: ${templateName}`);
    }

    if (!fs.existsSync(resolved)) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const content = fs.readFileSync(resolved, 'utf8');
    this.cache.set(templateName, content);
    return content;
  }

  render(templateName, data) {
    const template = this.loadTemplate(templateName);
    const safe = escapeAll(data);
    let rendered = template;

    for (const [key, value] of Object.entries(safe)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value);
    }

    return rendered;
  }

  renderRaw(templateName, data) {
    const template = this.loadTemplate(templateName);
    let rendered = template;

    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value === null || value === undefined ? '' : value);
    }

    return rendered;
  }

  clearCache(templateName) {
    if (templateName) {
      this.cache.delete(templateName);
    } else {
      this.cache.clear();
    }
  }
}

module.exports = TemplateEngine;
module.exports.escapeHtml = escapeHtml;
