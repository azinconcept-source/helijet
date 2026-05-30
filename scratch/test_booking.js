const fs = require('fs');
const path = require('path');

// Mock a simple DOM environment
const dom = {
  elements: {},
  body: {
    appendChild: () => {}
  },
  head: {
    appendChild: () => {}
  }
};

class MockElement {
  constructor(tag) {
    this.tagName = tag ? tag.toUpperCase() : 'DIV';
    this.innerHTML = '';
    this.textContent = '';
    this.dataset = {};
    this.classList = {
      list: new Set(),
      add: function(c) { this.list.add(c); },
      remove: function(c) { this.list.delete(c); },
      contains: function(c) { return this.list.has(c); }
    };
    this.children = [];
    this.listeners = {};
  }

  appendChild(el) {
    this.children.push(el);
  }

  addEventListener(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  scrollIntoView() {}
}

const documentMock = {
  readyState: 'complete',
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => {
    if (!dom.elements[id]) {
      dom.elements[id] = new MockElement();
    }
    return dom.elements[id];
  },
  querySelectorAll: (selector) => {
    if (selector === '.date-tab') {
      return dom.elements['date-tabs'] ? dom.elements['date-tabs'].children : [];
    }
    if (selector === '.req') {
      return [];
    }
    if (selector === 'input[name="pay"]') {
      return [];
    }
    return [];
  },
  querySelector: (selector) => {
    if (selector === '.submit-btn') {
      if (!dom.elements['submit-btn']) dom.elements['submit-btn'] = new MockElement('button');
      return dom.elements['submit-btn'];
    }
    return new MockElement();
  },
  body: dom.body,
  head: dom.head,
  addEventListener: () => {}
};

global.window = {
  location: {
    search: '?from=Port+aux+Basques&to=Port+of+Montreal+(Quebec)&day=2026-05-24'
  }
};
global.document = documentMock;
global.navigator = {};
global.URLSearchParams = require('url').URLSearchParams;
global.MutationObserver = class {
  constructor(callback) {}
  observe(target, options) {}
  disconnect() {}
};

// Read booking/index.html
const htmlPath = path.resolve(__dirname, '../booking/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract script block content
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let match;
let scriptContent = '';
while ((match = scriptRegex.exec(html)) !== null) {
  scriptContent += match[1] + '\n';
}

console.log('--- RUNNING SCRIPTS ---');
try {
  eval(scriptContent);
  console.log('--- EXECUTION SUCCESSFUL ---');
  console.log('Route text content:', dom.elements['step1-route'] ? dom.elements['step1-route'].textContent : 'N/A');
  console.log('Flights body innerHTML length:', dom.elements['ft-body'] ? dom.elements['ft-body'].innerHTML.length : 'N/A');
  console.log('Flights body innerHTML:', dom.elements['ft-body'] ? dom.elements['ft-body'].innerHTML : 'N/A');
} catch (e) {
  console.error('--- ERROR DURING EXECUTION ---');
  console.error(e);
}
