import { ArrowLeft, Construction, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

function PlaceholderPage({ eyebrow, title }) {
  return (
    <section className="placeholder-section">
      <div className="glass-panel placeholder-card">
        <div className="placeholder-icon">
          <Construction size={27} />
        </div>
        <p className="placeholder-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>This area is ready for its planned build phase.</p>
        <Link to="/" className="button button-secondary back-link">
          <ArrowLeft size={16} />
          Back to home
          <Zap size={15} className="text-yellow-300" />
        </Link>
      </div>
    </section>
  )
}

export default PlaceholderPage
