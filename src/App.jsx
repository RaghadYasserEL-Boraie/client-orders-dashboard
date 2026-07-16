import { useState } from 'react'
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
  const [orders, setOrders] = useState(initialOrders)
  const [isFormOpen, setIsFormOpen] = useState(false)

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

  const closeForm = () => {
    setIsFormOpen(false)
    setErrors({})
  }

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
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default App