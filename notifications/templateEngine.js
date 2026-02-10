const fs = require('fs');
const path = require('path');

class TemplateEngine {
  constructor(templateDir) {
    this.templateDir = templateDir || path.join(__dirname, 'templates');
    this.cache = new Map();
  }

  loadTemplate(templateName) {
    if (this.cache.has(templateName)) {
      return this.cache.get(templateName);
    }

    const templatePath = path.join(this.templateDir, templateName);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const content = fs.readFileSync(templatePath, 'utf8');
    this.cache.set(templateName, content);
    return content;
  }

  render(templateName, data) {
    const template = this.loadTemplate(templateName);
    let rendered = template;
    
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, value);
    }
    
    return rendered;
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = TemplateEngine;
