import { Link } from 'react-router-dom';
import './HeroCard.css';

function HeroCard({ hero }) {
    const elementColors = {
        '金': '#FFD700',
        '木': '#90EE90',
        '水': '#87CEEB',
        '火': '#FF6347',
        '土': '#CD853F'
    };

    return (
        <Link to={`/heroes/${hero.id}`} className="hero-card">
            <div className="hero-card-header">
                <div 
                    className="element-badge" 
                    style={{ backgroundColor: elementColors[hero.hero.element] || '#999' }}
                >
                    {hero.hero.element}
                </div>
                <div className="star-badge">{'★'.repeat(hero.hero.star)}</div>
            </div>
            <div className="hero-card-body">
                <h3>{hero.hero.name}</h3>
                {hero.hero.dynasty && <p className="dynasty">{hero.hero.dynasty}</p>}
                <div className="hero-level">Lv.{hero.level}</div>
            </div>
            <div className="hero-card-stats">
                <div className="stat">
                    <span>HP</span>
                    <span>{hero.stats.hp}</span>
                </div>
                <div className="stat">
                    <span>ATK</span>
                    <span>{hero.stats.atk}</span>
                </div>
                <div className="stat">
                    <span>DEF</span>
                    <span>{hero.stats.def}</span>
                </div>
                <div className="stat">
                    <span>SPD</span>
                    <span>{hero.stats.spd}</span>
                </div>
            </div>
        </Link>
    );
}

export default HeroCard;
