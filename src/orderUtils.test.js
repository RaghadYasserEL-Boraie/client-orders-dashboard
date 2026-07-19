import test from 'node:test'
import assert from 'node:assert/strict'
import {
  filterAndSortOrders,
  getNextOrderId,
  loadOrdersFromStorage,
  removeOrderById,
  saveOrdersToStorage,
  validateOrderForm,
} from './orderUtils.js'

const sampleOrders = [
  {
    id: '#ORD-1001',
    client: 'Lina Ahmad',
    service: 'Website Design',
    date: 'Jul 14, 2026',
    amount: '$450',
    status: 'Pending',
  },
  {
    id: '#ORD-1002',
    client: 'Omar Khaled',
    service: 'Landing Page',
    date: 'Jul 13, 2026',
    amount: '$280',
    status: 'Completed',
  },
  {
    id: '#ORD-1003',
    client: 'Sara Ali',
    service: 'Dashboard UI',
    date: 'Jul 12, 2026',
    amount: '$620',
    status: 'In Progress',
  },
]

test('removes only the order with the matching ID', () => {
  const remainingOrders = removeOrderById(sampleOrders, '#ORD-1002')

  assert.deepEqual(
    remainingOrders.map((order) => order.id),
    ['#ORD-1001', '#ORD-1003']
  )
})

test('leaves orders unchanged when the deletion ID is unknown', () => {
  const remainingOrders = removeOrderById(sampleOrders, '#ORD-9999')

  assert.deepEqual(remainingOrders, sampleOrders)
})

test('does not mutate the original orders array when deleting', () => {
  const originalOrders = structuredClone(sampleOrders)
  const remainingOrders = removeOrderById(sampleOrders, '#ORD-1001')

  assert.notStrictEqual(remainingOrders, sampleOrders)
  assert.deepEqual(sampleOrders, originalOrders)
})

test('sorts orders from newest to oldest', () => {
  const sortedOrderIds = filterAndSortOrders(
    sampleOrders,
    '',
    'All',
    'newest-first'
  ).map((order) => order.id)

  assert.deepEqual(sortedOrderIds, [
    '#ORD-1001',
    '#ORD-1002',
    '#ORD-1003',
  ])
})

test('sorts orders from oldest to newest', () => {
  const sortedOrderIds = filterAndSortOrders(
    sampleOrders,
    '',
    'All',
    'oldest-first'
  ).map((order) => order.id)

  assert.deepEqual(sortedOrderIds, [
    '#ORD-1003',
    '#ORD-1002',
    '#ORD-1001',
  ])
})

test('sorts orders by amount from highest to lowest', () => {
  const sortedAmounts = filterAndSortOrders(
    sampleOrders,
    '',
    'All',
    'amount-high-to-low'
  ).map((order) => order.amount)

  assert.deepEqual(sortedAmounts, ['$620', '$450', '$280'])
})

test('sorts orders by amount from lowest to highest', () => {
  const sortedAmounts = filterAndSortOrders(
    sampleOrders,
    '',
    'All',
    'amount-low-to-high'
  ).map((order) => order.amount)

  assert.deepEqual(sortedAmounts, ['$280', '$450', '$620'])
})

test('does not mutate the original orders array while sorting', () => {
  const originalOrders = structuredClone(sampleOrders)
  const sortedOrders = filterAndSortOrders(
    sampleOrders,
    '',
    'All',
    'oldest-first'
  )

  assert.notStrictEqual(sortedOrders, sampleOrders)
  assert.deepEqual(sampleOrders, originalOrders)
})

test('filters orders by each status and supports All', () => {
  assert.equal(filterAndSortOrders(sampleOrders, '', 'All').length, 3)
  assert.deepEqual(
    filterAndSortOrders(sampleOrders, '', 'Pending').map((order) => order.id),
    ['#ORD-1001']
  )
  assert.deepEqual(
    filterAndSortOrders(sampleOrders, '', 'In Progress').map(
      (order) => order.id
    ),
    ['#ORD-1003']
  )
  assert.deepEqual(
    filterAndSortOrders(sampleOrders, '', 'Completed').map((order) => order.id),
    ['#ORD-1002']
  )
})

test('combines status filtering with search and sorting', () => {
  const orders = [
    ...sampleOrders,
    {
      id: '#ORD-1004',
      client: 'Maya Noor',
      service: 'Website Audit',
      date: 'Jul 15, 2026',
      amount: '$200',
      status: 'Pending',
    },
  ]

  assert.deepEqual(
    filterAndSortOrders(
      orders,
      'website',
      'Pending',
      'amount-low-to-high'
    ).map((order) => order.id),
    ['#ORD-1004', '#ORD-1001']
  )
})

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

test('loads valid saved orders from storage', () => {
  const storage = {
    getItem: () => JSON.stringify([{ id: '#ORD-2001', client: 'Ava', service: 'SEO', date: 'Jan 4, 2025', amount: '$300', status: 'Pending' }]),
    setItem: () => {},
  }

  const orders = loadOrdersFromStorage(storage)

  assert.equal(orders.length, 1)
  assert.equal(orders[0].id, '#ORD-2001')
})

test('falls back to the default orders when storage data is invalid', () => {
  const storage = {
    getItem: () => '{bad json',
    setItem: () => {},
  }

  const defaultOrders = [{ id: '#ORD-1001' }, { id: '#ORD-1002' }]
  const orders = loadOrdersFromStorage(storage, defaultOrders)

  assert.equal(orders.length, 2)
  assert.equal(orders[0].id, '#ORD-1001')
})

test('saves orders to the dashboard storage key', () => {
  const writes = []
  const storage = {
    getItem: () => null,
    setItem: (key, value) => {
      writes.push([key, value])
    },
  }

  const orders = [{ id: '#ORD-2002', client: 'Noah', service: 'Audit', date: 'Jan 5, 2025', amount: '$150', status: 'Completed' }]

  saveOrdersToStorage(orders, storage)

  assert.equal(writes[0][0], 'client-orders-dashboard-orders')
  assert.equal(writes[0][1], JSON.stringify(orders))
})
