import { useEffect, useState } from 'react'
import './App.css'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [formData, setFormData] = useState({
    client: '',
    service: '',
    amount: '',
    status: 'Pending',
  })

  const [errors, setErrors] = useState({})

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
    const newErrors = {}
    const namePattern = /^[A-Za-z\u0600-\u06FF\s]+$/

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

    if (!formData.amount) {
      newErrors.amount = 'Amount is required.'
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than zero.'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const isValid = validateForm()

    if (!isValid) {
      return
    }

    const newOrder = {
      id: `#ORD-${1001 + orders.length}`,
      client: formData.client.trim(),
      service: formData.service.trim(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      amount: `$${formData.amount}`,
      status: formData.status,
    }

    setOrders((currentOrders) => [newOrder, ...currentOrders])

    setFormData({
      client: '',
      service: '',
      amount: '',
      status: 'Pending',
    })

    setErrors({})
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
    setErrors({})
  }

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

        <button
          className="primary-button"
          onClick={() => setIsFormOpen(true)}
        >
          + New Order
        </button>
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
        <section className="order-form-section">
          <div className="section-heading">
            <h2>Add New Order</h2>

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
              Add Order
            </button>
          </form>
        </section>
      )}

      <section className="orders-section">
        <div className="section-heading">
          <h2>Recent Orders</h2>
          <button className="secondary-button">View All</button>
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
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
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
                      <button
                        className="delete-button"
                        type="button"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        Delete
                      </button>
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