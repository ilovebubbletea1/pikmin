import { useState, useMemo } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { t } from '../i18n';

export default function PostcardFeed({ postcards, onMarkCompleted }) {
  const [filterCountry, setFilterCountry] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  // Derive unique countries for dropdown
  const uniqueCountries = useMemo(() => {
    const list = new Set(postcards.map(p => p.country));
    return [t('filter_all'), ...Array.from(list).sort()];
  }, [postcards]);

  // Sort and filter logic
  const displayCards = useMemo(() => {
    let filtered = postcards;
    
    // Filter by Country
    if (filterCountry !== t('filter_all') && filterCountry !== 'All') {
      filtered = filtered.filter(p => p.country === filterCountry);
    }
    
    // Sort:
    // 1. uncompleted before completed
    // 2. newest created_at before oldest
    return filtered.sort((a, b) => {
      if (a.is_completed === b.is_completed) {
        return b.created_at - a.created_at; // newest first
      }
      return a.is_completed ? 1 : -1; // uncompleted first
    });
  }, [postcards, filterCountry]);

  // Handle Copy
  const handleCopy = async (card) => {
    try {
      await navigator.clipboard.writeText(card.coordinate);
      setCopiedId(card.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (postcards.length === 0) return null;

  return (
    <div className="postcard-feed-container">
      <div className="filters-bar">
        <h2>{t('feed_title')}</h2>
        <select 
          className="filter-select"
          value={filterCountry} 
          onChange={(e) => setFilterCountry(e.target.value)}
        >
          {uniqueCountries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="feed-grid">
        {displayCards.map(card => (
          <div key={card.id} className={clsx('postcard-card glass-panel', card.is_completed && 'completed')}>
            <div className="postcard-img-container">
              <img src={card.cropped_image} alt={card.country} className="postcard-img" />
            </div>
            
            <div className="postcard-details">
              <div className="country-tag">{card.country}</div>
              
              <div className="postcard-loc">
                <span>{card.coordinate}</span>
              </div>
              
              <div className="postcard-actions">
                <button 
                  className={clsx('icon-btn', copiedId === card.id && 'success')} 
                  onClick={() => handleCopy(card)}
                >
                  <Copy size={16} />
                  {copiedId === card.id ? t('btn_copied') : t('btn_copy')}
                </button>
                
                {!card.is_completed && (
                  <button 
                    className="icon-btn"
                    onClick={() => onMarkCompleted(card.id)}
                  >
                    <CheckCircle size={16} />
                    {t('btn_mark_completed')}
                  </button>
                )}
                {card.is_completed && (
                  <span className="icon-btn success" style={{ cursor: 'default' }}>
                    <CheckCircle size={16} />
                    {t('btn_completed')}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
