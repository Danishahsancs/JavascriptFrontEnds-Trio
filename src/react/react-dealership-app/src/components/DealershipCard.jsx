import React from 'react';
import CarItem from './CarItem';

function DealershipCard({ 
  dealerships, 
  cars, 
  expandedDealerships,
  onToggleExpand,
  onOpenDealershipModal,
  onOpenCarModal,
  onOpenDetailModal,
  onDeleteDealership,
  onDeleteCar
}) {
  // Filter cars for a given dealership
  const carsByDealership = (dealership) => {
    if (!cars || !dealership) return [];
    return cars.filter((car) => car.dealership && car.dealership.id === dealership.id);
  };

  return (
    <div>
      {dealerships.map((d) => (
        <div 
          key={d.id} 
          className={`dealership-card ${expandedDealerships.has(d.id) ? 'expanded' : ''}`}
          data-id={d.id}
        >
          <div className="dealership-header" onClick={() => onToggleExpand(d.id)}>
            <div className="dealership-info">
              <div className="dealership-name">{d.name}</div>
              <div className="dealership-details">📍 {d.location}</div>
            </div>

            <div className="dealership-actions" onClick={(e) => e.stopPropagation()}>
              <span className="car-count">{carsByDealership(d).length} cars</span>
              <button 
                className="btn-small" 
                onClick={() => {
                  console.log('Details clicked', d);
                  onOpenDetailModal(d);
                }}
              >
                details
              </button>
              <button 
                className="btn-small" 
                onClick={() => {
                  console.log('Edit clicked', d);
                  onOpenDealershipModal(d);
                }}
              >
                ✏️
              </button>
              <button 
                className="btn-small delete-btn" 
                onClick={() => onDeleteDealership(d.id)}
              >
                🗑️
              </button>
              <span 
                className="expand-icon" 
                onClick={() => onToggleExpand(d.id)}
              >
                ▼
              </span>
            </div>
          </div>

          {expandedDealerships.has(d.id) && (
            <div className="dealership-content">
              <div className="cars-section">
                <div 
                  className="cars-header"
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '15px' 
                  }}
                >
                  <h3 style={{ color: '#00b894ff', margin: '0' }}>
                    🚗 Cars ({carsByDealership(d).length})
                  </h3>
                  <button 
                    className="create-btn btn-small" 
                    onClick={() => onOpenCarModal(d.id)}
                  >
                    ➕ Add Car
                  </button>
                </div>

                {carsByDealership(d).length === 0 ? (
                  <div className="no-cars">
                    No cars in this dealership
                  </div>
                ) : (
                  <CarItem 
                    cars={carsByDealership(d)}
                    onEditCar={(car) => onOpenCarModal(d.id, car)}
                    onViewCarDetails={(car) => onOpenDetailModal(null, car)}
                    onDeleteCar={(carId) => onDeleteCar(carId)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default DealershipCard;