import test from 'node:test'
import assert from 'node:assert/strict'
import { getNextOrderId, validateOrderForm } from './orderUtils.js'

test('generates the next sequential order ID', () => {
  const orders = [{ id: '#ORD-1001' }, { id: '#ORD-1002' }, { id: '#ORD-1003' }]

  assert.equal(getNextOrderId(orders), '#ORD-1004')
})

test('rejects empty or invalid form values', () => {
  const errors = validateOrderForm({
    client: '  ',
    service: 'AB',
    date: '',
    amount: '0',
    status: 'Pending',
  })

  assert.deepEqual(errors, {
    client: 'Client name is required.',
    service: 'Service must be at least 3 characters.',
    date: 'Date is required.',
    amount: 'Amount must be greater than zero.',
  })
})

test('rejects dates with invalid year formats or dates before 2000', () => {
  assert.equal(
    validateOrderForm({
      client: 'Jane Doe',
      service: 'Website Design',
      date: '94-07-01',
      amount: '100',
      status: 'Pending',
    }).date,
    'Date must be a valid date with a 4-digit year and not earlier than 2000.'
  )

  assert.equal(
    validateOrderForm({
      client: 'Jane Doe',
      service: 'Website Design',
      date: '1999-12-31',
      amount: '100',
      status: 'Pending',
    }).date,
    'Date must be a valid date with a 4-digit year and not earlier than 2000.'
  )
})
