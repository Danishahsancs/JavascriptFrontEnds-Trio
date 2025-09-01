import React from 'react';

function CarItem({ cars, onEditCar, onViewCarDetails, onDeleteCar }) {
  return (
    <div>
      {cars.map(car => (
        <div key={car.id} className="car-item">
          <div className="car-info">
            <div className="car-title">{car.year} {car.make} {car.model}</div>
          </div>
          <div className="car-actions">
            <button className="btn-small" onClick={() => onViewCarDetails(car)}>
              details
            </button>
            <button className="btn-small" onClick={() => onEditCar(car)}>
              ✏️
            </button>
            <button 
              className="btn-small delete-btn" 
              onClick={() => onDeleteCar(car.id)}
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CarItem;