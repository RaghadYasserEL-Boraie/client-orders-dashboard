import './App.css'

const orders = [
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

        <button className="primary-button">+ New Order</button>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <p>Total Clients</p>
          <h2>24</h2>
        </article>

        <article className="stat-card">
          <p>Total Orders</p>
          <h2>48</h2>
        </article>

        <article className="stat-card">
          <p>Pending Orders</p>
          <h2>12</h2>
        </article>

        <article className="stat-card">
          <p>Completed Orders</p>
          <h2>36</h2>
        </article>
      </section>

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