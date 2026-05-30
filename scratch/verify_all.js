const fs = require('fs');
const path = require('path');

// Extract the script block content from booking/index.html
const htmlPath = path.resolve(__dirname, '../booking/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let match;
let scriptContent = '';
while ((match = scriptRegex.exec(html)) !== null) {
  scriptContent += match[1] + '\n';
}

// Robust mock setup
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

const dom = { elements: {} };
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
    return [];
  },
  querySelector: () => new MockElement(),
  addEventListener: () => {}
};

global.window = {
  location: { search: '?from=Port+aux+Basques&to=Port+of+Montreal+(Quebec)' }
};
global.document = documentMock;
global.URLSearchParams = require('url').URLSearchParams;
global.MutationObserver = class { observe() {} };

// Run the script
eval(scriptContent);

console.log('Testing ALL dates for Port aux Basques -> Port of Montreal (Quebec)');
console.log('------------------------------------------------------------------');

let allPassed = true;
let datePrices = [];
const allowedDates = ['5/31', '6/2', '6/11', '6/15', '6/19'];

ALL_DATES.forEach((info) => {
  const key = info.key;
  const dateObj = info.dateObj;
  const dateStrPart = key.split(', ')[1]; // e.g. "5/31"
  
  // Set window.bookingParams
  window.bookingParams = {
    from: 'Port aux Basques',
    to: 'Port of Montreal (Quebec)',
    day: ''
  };

  const flights = getSchedule(key);
  const isAllowed = allowedDates.indexOf(dateStrPart) !== -1;

  if (!isAllowed) {
    if (flights && flights.length > 0) {
      console.error(`[FAIL] Date ${key} is NOT allowed but returned ${flights.length} flights!`);
      allPassed = false;
    } else {
      console.log(`[OK] Date ${key} correctly has NO flights`);
    }
    return;
  }

  if (!flights || flights.length === 0) {
    console.error(`[FAIL] Date ${key} IS allowed but returned NO flights!`);
    allPassed = false;
    return;
  }

  console.log(`\n[OK] Allowed Date: ${key}`);
  let minForDate = Infinity;
  let maxForDate = -Infinity;

  // Determine expected price boundaries based on date
  let expectedMin, expectedMax;
  if (dateStrPart === '5/31') {
    expectedMin = 4255;
    expectedMax = 4350;
  } else if (dateStrPart === '6/2') {
    expectedMin = 3624;
    expectedMax = 3699;
  } else {
    // 6/11, 6/15, 6/19
    expectedMin = 2992;
    expectedMax = 3050;
  }

  flights.forEach((f) => {
    // Parse departure and arrival times
    const [depH, depM] = f.dep.split(' ')[0].split(':').map(Number);
    const [arrH, arrM] = f.arr.split(' ')[0].split(':').map(Number);
    const arrMinutes = arrH * 60 + arrM;
    const latestArrivalLimit = 18 * 60; // 18:00 in minutes

    console.log(`  Flight ${f.num}: Departure ${f.dep.split(' ')[0]}, Arrival ${f.arr.split(' ')[0]}`);

    // Check time constraint
    if (arrMinutes > latestArrivalLimit) {
      console.error(`  [FAIL] Flight completes after 18:00! Arrival time is ${f.arr.split(' ')[0]}`);
      allPassed = false;
    } else {
      console.log(`  [OK] Flight completes before 18:00 (Arrival: ${f.arr.split(' ')[0]})`);
    }

    f.tiers.forEach((t) => {
      const priceNum = parseInt(t.price.replace(/[^\d]/g, ''), 10);
      if (priceNum < minForDate) minForDate = priceNum;
      if (priceNum > maxForDate) maxForDate = priceNum;

      // Check price constraint
      if (priceNum < expectedMin || priceNum > expectedMax) {
        console.error(`  [FAIL] Fare tier ${t.name} price ${t.price} is outside expected range CAD ${expectedMin} - ${expectedMax}!`);
        allPassed = false;
      } else {
        console.log(`    Fare Tier ${t.name}: ${t.price} - OK`);
      }
    });
  });

  if (minForDate !== Infinity) {
    datePrices.push({
      date: dateObj,
      dateStr: key,
      min: minForDate,
      max: maxForDate
    });
  }
});

console.log('\n------------------------------------------------------------------');
console.log('Checking earlier vs later price ordering...');
let orderPassed = true;
for (let i = 0; i < datePrices.length - 1; i++) {
  const current = datePrices[i];
  const next = datePrices[i+1];
  
  if (current.date < next.date) {
    console.log(`  Comparing ${current.dateStr} (min: ${current.min}) with ${next.dateStr} (min: ${next.min})`);
    if (current.min < next.min) {
      console.error(`  [FAIL] Earlier date ${current.dateStr} starting price (${current.min}) is lower than ${next.dateStr} (${next.min})!`);
      allPassed = false;
      orderPassed = false;
    } else {
      console.log(`  [OK] Earlier date ${current.dateStr} starting price (${current.min}) is >= ${next.dateStr} (${next.min})`);
    }
  }
}

console.log('------------------------------------------------------------------');
if (allPassed) {
  console.log('ALL TIME AND PRICE BOUNDARY VALIDATIONS PASSED!');
} else {
  console.error('VALIDATION FAILED!');
}
process.exit(allPassed ? 0 : 1);
