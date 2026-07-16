import './App.css'

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

        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Your recent client orders will appear here.</p>
        </div>
      </section>
    </main>
  )
}

export default App