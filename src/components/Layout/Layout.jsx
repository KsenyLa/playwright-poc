import Navigation from './Navigation'
import './Layout.css'

function Layout({ children }) {
  return (
    <div className="layout">
      <Navigation />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout
