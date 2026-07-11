const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeTemplatePayload } = require('../utils/expenseTemplatePayload');

test('normalizeTemplatePayload uses the provided title and metadata', () => {
  const payload = normalizeTemplatePayload({
    name: 'Groceries',
    title: 'Weekly Groceries',
    amount: '42.5',
    category: 'Food',
    merchant: 'Walmart',
    note: 'Weekly restock',
    paymentMethod: 'Card',
  });

  assert.equal(payload.name, 'Groceries');
  assert.equal(payload.title, 'Weekly Groceries');
  assert.equal(payload.amount, 42.5);
  assert.equal(payload.category, 'Food');
  assert.equal(payload.merchant, 'Walmart');
  assert.equal(payload.note, 'Weekly restock');
  assert.equal(payload.paymentMethod, 'Card');
});

test('normalizeTemplatePayload falls back to sensible defaults', () => {
  const payload = normalizeTemplatePayload({});

  assert.equal(payload.name, 'Untitled template');
  assert.equal(payload.title, 'Untitled template');
  assert.equal(payload.amount, 0);
  assert.equal(payload.category, 'Other');
  assert.equal(payload.merchant, null);
  assert.equal(payload.note, null);
  assert.equal(payload.paymentMethod, null);
});
