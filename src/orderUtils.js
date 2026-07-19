const STORAGE_KEY = 'client-orders-dashboard-orders'

export const removeOrderById = (orders, orderId) => {
  return orders.filter((order) => order.id !== orderId)
}

export const filterAndSortOrders = (
  orders,
  searchTerm = '',
  statusFilter = 'All',
  sortOption = 'newest-first'
) => {
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [order.id, order.client, order.service]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    const matchesStatus =
      statusFilter === 'All' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return [...filteredOrders].sort((firstOrder, secondOrder) => {
    if (sortOption === 'oldest-first') {
      return new Date(firstOrder.date) - new Date(secondOrder.date)
    }

    if (sortOption === 'amount-low-to-high') {
      return (
        Number(firstOrder.amount.replace('$', '')) -
        Number(secondOrder.amount.replace('$', ''))
      )
    }

    if (sortOption === 'amount-high-to-low') {
      return (
        Number(secondOrder.amount.replace('$', '')) -
        Number(firstOrder.amount.replace('$', ''))
      )
    }

    if (sortOption === 'client-name-az') {
      return firstOrder.client.localeCompare(secondOrder.client)
    }

    return new Date(secondOrder.date) - new Date(firstOrder.date)
  })
}

export const validateOrderForm = (formData) => {
  const newErrors = {}
  const namePattern = /^[A-Za-z\u0600-\u06FF\s]+$/
  const minimumDate = new Date('2000-01-01T00:00:00Z')

  if (!formData.client.trim()) {
    newErrors.client = 'Client name is required.'
  } else if (formData.client.trim().length < 3) {
    newErrors.client = 'Client name must be at least 3 characters.'
  } else if (!namePattern.test(formData.client.trim())) {
    newErrors.client = 'Client name can only contain letters and spaces.'
  }

  if (!formData.service.trim()) {
    newErrors.service = 'Service is required.'
  } else if (formData.service.trim().length < 3) {
    newErrors.service = 'Service must be at least 3 characters.'
  }

  if (!formData.date) {
    newErrors.date = 'Date is required.'
  } else {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    const parsedDate = new Date(`${formData.date}T00:00:00Z`)
    const isValidDate =
      datePattern.test(formData.date) &&
      !Number.isNaN(parsedDate.getTime()) &&
      parsedDate.getUTCFullYear() === Number(formData.date.slice(0, 4)) &&
      parsedDate.getUTCMonth() + 1 === Number(formData.date.slice(5, 7)) &&
      parsedDate.getUTCDate() === Number(formData.date.slice(8, 10)) &&
      parsedDate >= minimumDate

    if (!isValidDate) {
      newErrors.date =
        'Date must be a valid date with a 4-digit year and not earlier than 2000.'
    }
  }

  if (!formData.amount) {
    newErrors.amount = 'Amount is required.'
  } else {
    const amountValue = Number(formData.amount)

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      newErrors.amount = 'Amount must be greater than zero.'
    }
  }

  return newErrors
}

export const getNextOrderId = (orders) => {
  const numericIds = orders
    .map((order) => Number(order.id.replace('#ORD-', '')))
    .filter((value) => Number.isFinite(value))

  const highestId = numericIds.length > 0 ? Math.max(...numericIds) : 1000

  return `#ORD-${highestId + 1}`
}

export const saveOrdersToStorage = (orders, storage = window.localStorage) => {
  if (!storage) {
    return
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch {
    // Ignore storage write failures and keep the in-memory orders intact.
  }
}

export const loadOrdersFromStorage = (
  storage = window.localStorage,
  fallbackOrders = []
) => {
  if (!storage) {
    return fallbackOrders
  }

  try {
    const storedValue = storage.getItem(STORAGE_KEY)

    if (storedValue === null || storedValue === '') {
      return fallbackOrders
    }

    const parsedValue = JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      return fallbackOrders
    }

    return parsedValue
  } catch {
    return fallbackOrders
  }
}

export const formatOrderDate = (value) => {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatDateInputValue = (value) => {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return ''
  }

  const year = parsedDate.getFullYear()
  const month = `${parsedDate.getMonth() + 1}`.padStart(2, '0')
  const day = `${parsedDate.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}
