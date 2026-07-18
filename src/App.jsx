import { useEffect, useState } from 'react'
import './App.css'
import {
  formatDateInputValue,
  formatOrderDate,
  getNextOrderId,
  validateOrderForm,
} from './orderUtils'

const initialOrders = [
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

function App() {
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('client-orders')

    return savedOrders ? JSON.parse(savedOrders) : initialOrders
  })

  useEffect(() => {
    localStorage.setItem('client-orders', JSON.stringify(orders))
  }, [orders])

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortOption, setSortOption] = useState('newest-first')

  const [formData, setFormData] = useState({
    client: '',
    service: '',
    date: '',
    amount: '',
    status: 'Pending',
  })

  const [errors, setErrors] = useState({})

  const resetForm = () => {
    setFormData({
      client: '',
      service: '',
      date: '',
      amount: '',
      status: 'Pending',
    })
    setErrors({})
    setEditingOrderId(null)
  }

  const openOrderForm = (order = null) => {
    setIsFormOpen(true)
    setErrors({})

    if (order) {
      setEditingOrderId(order.id)
      setFormData({
        client: order.client,
        service: order.service,
        date: formatDateInputValue(order.date),
        amount: order.amount.replace('$', ''),
        status: order.status,
      })
      return
    }

    resetForm()
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))
  }

  const validateForm = () => {
    const newErrors = validateOrderForm(formData)

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const isValid = validateForm()

    if (!isValid) {
      return
    }

    if (editingOrderId) {
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === editingOrderId
            ? {
                ...order,
                client: formData.client.trim(),
                service: formData.service.trim(),
                date: formatOrderDate(formData.date),
                amount: `$${formData.amount}`,
                status: formData.status,
              }
            : order
        )
      )
    } else {
      const newOrder = {
        id: getNextOrderId(orders),
        client: formData.client.trim(),
        service: formData.service.trim(),
        date: formatOrderDate(formData.date),
        amount: `$${formData.amount}`,
        status: formData.status,
      }

      setOrders((currentOrders) => [newOrder, ...currentOrders])
    }

    resetForm()
    setIsFormOpen(false)
  }

  const handleDeleteOrder = (orderId) => {
    const shouldDelete = window.confirm(
      'Are you sure you want to delete this order?'
    )

    if (!shouldDelete) {
      return
    }

    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderId)
    )
  }
  const closeForm = () => {
    setIsFormOpen(false)
    resetForm()
  }

  const isEditing = editingOrderId !== null
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

  const sortedOrders = [...filteredOrders].sort((firstOrder, secondOrder) => {
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

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Client Orders</h1>
          <p className="subtitle">
            Manage your clients and track their orders.
          </p>
        </div>

      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <p>Total Clients</p>
          <h2>24</h2>
        </article>

        <article className="stat-card">
          <p>Total Orders</p>
          <h2>{orders.length}</h2>
        </article>

        <article className="stat-card">
          <p>Pending Orders</p>
          <h2>{orders.filter((order) => order.status === 'Pending').length}</h2>
        </article>

        <article className="stat-card">
          <p>Completed Orders</p>
          <h2>
            {orders.filter((order) => order.status === 'Completed').length}
          </h2>
        </article>
      </section>

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeForm}>
          <section
            className="order-form-section modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-form-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-heading">
              <h2 id="order-form-title">
                {isEditing ? 'Edit Order' : 'Add New Order'}
              </h2>

              <button
                className="close-button"
                type="button"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <form className="order-form" onSubmit={handleSubmit} noValidate>
              <label>
                Client Name

                <input
                  className={errors.client ? 'input-error' : ''}
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  placeholder="Enter client name"
                />

                {errors.client && (
                  <span className="error-message">{errors.client}</span>
                )}
              </label>

              <label>
                Service

                <input
                  className={errors.service ? 'input-error' : ''}
                  type="text"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  placeholder="Enter service"
                />

                {errors.service && (
                  <span className="error-message">{errors.service}</span>
                )}
              </label>

              <label>
                Date

                <input
                  className={errors.date ? 'input-error' : ''}
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />

                {errors.date && (
                  <span className="error-message">{errors.date}</span>
                )}
              </label>

              <label>
                Amount

                <input
                  className={errors.amount ? 'input-error' : ''}
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  min="1"
                />

                {errors.amount && (
                  <span className="error-message">{errors.amount}</span>
                )}
              </label>

              <label>
                Status

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </label>

              <button className="primary-button form-submit" type="submit">
                {isEditing ? 'Save Changes' : 'Add Order'}
              </button>
            </form>
          </section>
        </div>
      )}

      <section className="orders-section">
        <div className="section-heading">
          <h2>Recent Orders</h2>

          <div className="section-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => openOrderForm()}
            >
              Add Order
            </button>
            <button className="secondary-button" type="button">
              View All
            </button>
          </div>
        </div>

        <div className="orders-toolbar">
          <label className="search-field">
            <span className="sr-only">Search orders</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by client, service or order ID"
            />
          </label>

          <label className="sort-field">
            <span>Sort by</span>
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="newest-first">Newest first</option>
              <option value="oldest-first">Oldest first</option>
              <option value="amount-low-to-high">Amount: low to high</option>
              <option value="amount-high-to-low">Amount: high to low</option>
              <option value="client-name-az">Client name: A to Z</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
        </div>

        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Client</th>
                <th>Service</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {sortedOrders.length > 0 ? (
                sortedOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.client}</td>
                    <td>{order.service}</td>
                    <td>{order.date}</td>
                    <td>{order.amount}</td>
                    <td>
                      <span
                        className={`status-badge ${order.status
                          .toLowerCase()
                          .replace(' ', '-')}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          type="button"
                          onClick={() => openOrderForm(order)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          type="button"
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <h3>No matching orders</h3>
                      <p>Try another search term or status filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default App