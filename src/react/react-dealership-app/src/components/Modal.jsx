import React, { useState, useEffect } from 'react';

function Modal({ 
  isOpen, 
  type, 
  data, 
  allDealerships, 
  onClose, 
  onSave 
}) {
  const [formData, setFormData] = useState({});

  // Update form data when modal data changes
  useEffect(() => {
    setFormData({ ...data });
  }, [data]);

  const handleSave = () => {
    // Basic validation
    if (type === 'dealership') {
      if (!formData.name || !formData.location || !formData.phonenumber) {
        alert('Please fill all fields');
        return;
      }
    } else if (type === 'car') {
      if (!formData.car?.make || !formData.car?.model || !formData.car?.year || !formData.car?.vin) {
        alert('Please fill all fields');
        return;
      }
    }
    
    onSave(type, formData);
  };

  const updateFormData = (field, value) => {
    if (type === 'car' && ['make', 'model', 'year', 'vin'].includes(field)) {
      setFormData(prev => ({
        ...prev,
        car: {
          ...prev.car,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>

        {/* Dealership Modal */}
        {type === 'dealership' && (
          <>
            <h2>{formData.id ? "Edit Dealership" : "Add New Dealership"}</h2>
            <div className="form-row">
              <input 
                value={formData.name || ''} 
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Dealership Name"
                type="text"
              />
              <input 
                value={formData.location || ''} 
                onChange={(e) => updateFormData('location', e.target.value)}
                placeholder="Location"
                type="text"
              />
              <input 
                value={formData.phonenumber || ''} 
                onChange={(e) => updateFormData('phonenumber', e.target.value)}
                placeholder="Phone Number"
                type="text"
              />
            </div>
            <div className="form-row">
              <button className="create-btn" onClick={handleSave}>💾 Save</button>
              <button className="delete-btn" onClick={onClose}>❌ Cancel</button>
            </div>
          </>
        )}

        {/* Car Modal */}
        {type === 'car' && (
          <>
            <h2>{formData.car?.id ? "Edit Car" : "Add New Car"}</h2>
            <div className="form-row">
              <input 
                value={formData.car?.make || ''} 
                onChange={(e) => updateFormData('make', e.target.value)}
                placeholder="Make"
                type="text"
              />
              <input 
                value={formData.car?.model || ''} 
                onChange={(e) => updateFormData('model', e.target.value)}
                placeholder="Model"
                type="text"
              />
              <input 
                value={formData.car?.year || ''} 
                onChange={(e) => updateFormData('year', e.target.value)}
                placeholder="Year"
                type="number"
              />
              <input 
                value={formData.car?.vin || ''} 
                onChange={(e) => updateFormData('vin', e.target.value)}
                placeholder="VIN Number"
                type="text"
              />
              <select 
                value={formData.dealershipId || ''}
                onChange={(e) => updateFormData('dealershipId', e.target.value)}
              >
                <option value="">Select Dealership</option>
                {allDealerships.map(dealership => (
                  <option key={dealership.id} value={dealership.id}>
                    {dealership.name} ({dealership.location})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <button className="create-btn" onClick={handleSave}>💾 Save</button>
              <button className="delete-btn" onClick={onClose}>❌ Cancel</button>
            </div>
          </>
        )}

        {/* Details Modal */}
        {type === 'details' && (
          <>
            <h2 
              style={{ 
                color: formData.make ? '#00b894' : '#74b9ff', 
                borderBottom: formData.make ? '2px solid #00b894' : '2px solid #74b9ff' 
              }}
            >
              {formData.make ? 'Car Details' : 'Dealership Details'}
            </h2>
            
            <div className="detail-content">
              {/* Dealership Details */}
              {formData.name && (
                <>
                  <div className="detail-item">
                    <div className="detail-label">Dealership Name</div>
                    <div className="detail-value">{formData.name}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Location</div>
                    <div className="detail-value">{formData.location}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Phone Number</div>
                    <div className="detail-value">{formData.phonenumber}</div>
                  </div>
                </>
              )}

              {/* Car Details */}
              {formData.make && (
                <>
                  <div className="detail-item">
                    <div className="detail-label">Make</div>
                    <div className="detail-value">{formData.make}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Model</div>
                    <div className="detail-value">{formData.model}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Year</div>
                    <div className="detail-value">{formData.year}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">VIN</div>
                    <div className="detail-value">{formData.vin}</div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Modal;