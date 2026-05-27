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
    if (!templateName || typeof templateName !== 'string') {
      throw new Error('Template name must be a non-empty string');
    }

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
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Template data must be a plain object');
    }
    const template = this.loadTemplate(templateName);
    let rendered = this._resolveBlocks(template, data);
    const safe = escapeAll(data);

    for (const [key, value] of Object.entries(safe)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value);
    }

    return rendered;
  }

  renderRaw(templateName, data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Template data must be a plain object');
    }
    const template = this.loadTemplate(templateName);
    let rendered = this._resolveBlocks(template, data);

    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value === null || value === undefined ? '' : value);
    }

    return rendered;
  }

  _resolveBlocks(template, data) {
    let out = template.replace(
      /\{\{#if\s+(\w+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
      (_, key, ifBlock, elseBlock = '') => (data[key] ? ifBlock : elseBlock)
    );

    out = out.replace(
      /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (_, key, inner) => {
        const items = data[key];
        if (!Array.isArray(items)) return '';
        return items.map(item => inner.replace(/\{\{this\}\}/g, escapeHtml(item))).join('');
      }
    );

    return out;
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
