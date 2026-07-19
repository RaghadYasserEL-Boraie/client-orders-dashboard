import { useEffect, useState } from 'react'
import './App.css'
import {
  filterAndSortOrders,
  formatDateInputValue,
  formatOrderDate,
  getNextOrderId,
  loadOrdersFromStorage,
  saveOrdersToStorage,
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
    return loadOrdersFromStorage(window.localStorage, initialOrders)
  })

  useEffect(() => {
    saveOrdersToStorage(orders)
  }, [orders])

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
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
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!selectedOrder) {
      return undefined
    }

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setSelectedOrder(null)
      }
    }

    window.addEventListener('keydown', handleEscapeKey)

    return () => {
      window.removeEventListener('keydown', handleEscapeKey)
    }
  }, [selectedOrder])

  const resetForm = () => {
    setFormData({
      client: '',
      service: '',
      date: '',
      amount: '',
      status: 'Pending',
    })
    setErrors({})
    setFormError('')
    setEditingOrderId(null)
  }

  const openOrderForm = (order = null) => {
    setIsFormOpen(true)
    setErrors({})
    setFormError('')
    setSuccessMessage('')

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
    setFormError('')
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
      setFormError('Please correct the highlighted fields and try again.')
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
      setSuccessMessage(`Order ${editingOrderId} updated successfully.`)
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

  const openOrderDetails = (order) => {
    setSelectedOrder(order)
  }

  const closeOrderDetails = () => {
    setSelectedOrder(null)
  }

  const editSelectedOrder = () => {
    const orderToEdit = selectedOrder

    if (!orderToEdit) {
      return
    }

    closeOrderDetails()
    openOrderForm(orderToEdit)
  }

  const isEditing = editingOrderId !== null
  const sortedOrders = filterAndSortOrders(
    orders,
    searchTerm,
    statusFilter,
    sortOption
  )

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

      {successMessage && (
        <div className="feedback-message success-message" role="status">
          {successMessage}
        </div>
      )}

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
              {formError && (
                <div className="feedback-message form-error-summary" role="alert">
                  {formError}
                </div>
              )}

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

              <div className="form-actions">
                <button className="primary-button form-submit" type="submit">
                  {isEditing ? 'Save Changes' : 'Add Order'}
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={closeForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedOrder && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={closeOrderDetails}
        >
          <section
            className="order-details-modal modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-heading order-details-header">
              <div>
                <p className="eyebrow">Order details</p>
                <h2 id="order-details-title">{selectedOrder.id}</h2>
              </div>

              <button
                className="close-button"
                type="button"
                aria-label="Close order details"
                onClick={closeOrderDetails}
              >
                ×
              </button>
            </div>

            <dl className="order-details-grid">
              <div className="order-detail-item">
                <dt>Order ID</dt>
                <dd>{selectedOrder.id}</dd>
              </div>

              <div className="order-detail-item">
                <dt>Client Name</dt>
                <dd>{selectedOrder.client}</dd>
              </div>

              <div className="order-detail-item order-detail-wide">
                <dt>Service / Order Description</dt>
                <dd>{selectedOrder.service}</dd>
              </div>

              <div className="order-detail-item">
                <dt>Date</dt>
                <dd>{selectedOrder.date}</dd>
              </div>

              <div className="order-detail-item">
                <dt>Amount</dt>
                <dd>{selectedOrder.amount}</dd>
              </div>

              <div className="order-detail-item order-detail-wide">
                <dt>Status</dt>
                <dd>
                  <span
                    className={`status-badge ${selectedOrder.status
                      .toLowerCase()
                      .replace(' ', '-')}`}
                  >
                    {selectedOrder.status}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="order-details-actions">
              <button
                className="primary-button"
                type="button"
                onClick={editSelectedOrder}
              >
                Edit Order
              </button>
            </div>
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
          <table className="orders-table desktop-table">
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
                          className="view-button"
                          type="button"
                          onClick={() => openOrderDetails(order)}
                        >
                          View
                        </button>
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

          <div className="mobile-order-list">
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
                <article className="mobile-order-card" key={order.id}>
                  <p>
                    <strong>Order ID:</strong> {order.id}
                  </p>
                  <p>
                    <strong>Client:</strong> {order.client}
                  </p>
                  <p>
                    <strong>Service:</strong> {order.service}
                  </p>
                  <p>
                    <strong>Date:</strong> {order.date}
                  </p>
                  <p>
                    <strong>Amount:</strong> {order.amount}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span
                      className={`status-badge ${order.status
                        .toLowerCase()
                        .replace(' ', '-')}`}
                    >
                      {order.status}
                    </span>
                  </p>
                  <div className="action-buttons">
                    <button
                      className="view-button"
                      type="button"
                      onClick={() => openOrderDetails(order)}
                    >
                      View
                    </button>
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
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h3>No matching orders</h3>
                <p>Try another search term or status filter.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
