import React, { useState, useEffect, useMemo } from 'react';
import DealershipCard from './components/DealershipCard';
import Modal from './components/Modal';

const baseUrl = "http://localhost:8080/api";

function App() {
  const [allDealerships, setAllDealerships] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [expandedDealerships, setExpandedDealerships] = useState(new Set());
  const [searchTerms, setSearchTerms] = useState("");

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: null,
    data: {}
  });

  // Modal functions
  const openDealershipModal = (dealership = null) => {
    setModal({
      isOpen: true,
      type: "dealership",
      data: dealership ? { ...dealership } : { name: "", location: "", phonenumber: "" }
    });
  };

  const openCarModal = (dealershipId, car = null) => {
    console.log('openCarModal called with:', dealershipId, car);
    setModal({
      isOpen: true,
      type: "car",
      data: {
        dealershipId,
        car: car ? { ...car } : { make: "", model: "", year: "", vin: "" }
      }
    });
  };

  const openDetailModal = (dealership = null, car = null) => {
    console.log('openDetailModal called with:', dealership, car);
    setModal({
      isOpen: true,
      type: "details",
      data: dealership || car || {}
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: null,
      data: {}
    });
  };

  // Handle save operations
  const handleSave = (type, data) => {
    if (type === 'dealership') {
      saveDealership(data);
    } else if (type === 'car') {
      const carData = {
        ...data.car,
        dealershipId: data.dealershipId
      };
      saveCar(carData);
    }
    closeModal();
  };

  // Computed properties for filtered data
  const filteredDealerships = useMemo(() => {
    if (!searchTerms.trim()) {
      return allDealerships;
    }

    const query = searchTerms.toLowerCase();
    
    // Filter dealerships that match the search
    const matchingDealerships = allDealerships.filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.location.toLowerCase().includes(query) ||
      d.phonenumber.includes(query)
    );

    // Filter cars that match the search
    const matchingCars = allCars.filter(c =>
      c.make.toLowerCase().includes(query) ||
      c.model.toLowerCase().includes(query) ||
      c.vin.toLowerCase().includes(query) ||
      c.year.toString().includes(query)
    );

    // Get dealerships that have matching cars
    const dealershipsWithMatchingCars = [...new Set(
      matchingCars
        .filter(c => c.dealership)
        .map(c => c.dealership.id)
    )].map(id => allDealerships.find(d => d.id === id)).filter(d => d);

    // Combine and deduplicate
    const allMatchingDealerships = [...new Map(
      [...matchingDealerships, ...dealershipsWithMatchingCars]
        .map(d => [d.id, d])
    ).values()];

    // Auto-expand dealerships with matching cars
    const newExpandedSet = new Set(expandedDealerships);
    matchingCars.forEach(car => {
      if (car.dealership) {
        newExpandedSet.add(car.dealership.id);
      }
    });
    
    if (newExpandedSet.size !== expandedDealerships.size) {
      setExpandedDealerships(newExpandedSet);
    }

    return allMatchingDealerships;
  }, [allDealerships, allCars, searchTerms, expandedDealerships]);

  const filteredCars = useMemo(() => {
    if (!searchTerms.trim()) {
      return allCars;
    }

    const query = searchTerms.toLowerCase();
    return allCars.filter(c =>
      c.make.toLowerCase().includes(query) ||
      c.model.toLowerCase().includes(query) ||
      c.vin.toLowerCase().includes(query) ||
      c.year.toString().includes(query)
    );
  }, [allCars, searchTerms]);

  const loadAllData = async () => {
    try {
      const [dealershipsRes, carsRes] = await Promise.all([
        fetch(`${baseUrl}/dealership`),
        fetch(`${baseUrl}/car`)
      ]);
      
      const dealerships = await dealershipsRes.json();
      const cars = await carsRes.json();
      
      setAllDealerships(dealerships);
      setAllCars(cars);
      setExpandedDealerships(new Set());
      setSearchTerms('');
    } catch (err) {
      console.error("Error loading data:", err);
      alert('Error loading data: ' + err.message);
    }
  };

  const toggleExpand = (id) => {
    const newSet = new Set(expandedDealerships);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedDealerships(newSet);
  };

  const saveDealership = async (dealershipData) => {
    try {
      const url = dealershipData.id ? `${baseUrl}/dealership/${dealershipData.id}` : `${baseUrl}/dealership`;
      const method = dealershipData.id ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: dealershipData.name,
          location: dealershipData.location,
          phonenumber: dealershipData.phonenumber
        })
      });
      
      await loadAllData();
    } catch (error) {
      console.error('Error saving dealership:', error);
      alert('Error saving dealership: ' + error.message);
    }
  };

  const saveCar = async (carData) => {
    try {
      const url = carData.id ? `${baseUrl}/car/${carData.id}` : `${baseUrl}/car`;
      const method = carData.id ? 'PUT' : 'POST';
      
      const body = {
        make: carData.make,
        model: carData.model,
        year: parseInt(carData.year),
        vin: carData.vin
      };
      
      if (carData.dealershipId) {
        body.dealership = { id: carData.dealershipId };
      }
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
      
      await loadAllData();
    } catch (error) {
      console.error('Error saving car:', error);
      alert('Error saving car: ' + error.message);
    }
  };

  const deleteDealership = async (id) => {
    if (!window.confirm('Delete this dealership?')) return;
    
    try {
      await fetch(`${baseUrl}/dealership/${id}`, {
        method: 'DELETE'
      });
      await loadAllData();
    } catch (error) {
      console.error('Error deleting dealership:', error);
      alert('Error deleting dealership: ' + error.message);
    }
  };

  const deleteCar = async (id) => {
    if (!window.confirm('Delete this car?')) return;
    
    try {
      await fetch(`${baseUrl}/car/${id}`, {
        method: 'DELETE'
      });
      await loadAllData();
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('Error deleting car: ' + error.message);
    }
  };

  const performGlobalSearch = () => {
    setExpandedDealerships(new Set());
    // The useMemo will handle the filtering
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <div className="container">
      <h1>Dealership Management System React</h1>
      
      <div className="search-section">
        <h2>🔍 Search & Filter</h2>
        <div className="search-row">
          <input 
            type="text" 
            value={searchTerms}
            onChange={(e) => {
              setSearchTerms(e.target.value);
              performGlobalSearch();
            }}
            placeholder="Search dealerships and cars..."
          />
          <button onClick={loadAllData}>🔄 Refresh All</button>
          <button className="create-btn" onClick={() => openDealershipModal()}>
            ➕ Add Dealership
          </button>
        </div>
      </div>

      <div className="main-section">
        <h2>🏪 Dealerships & Their Cars</h2>
        {filteredDealerships.length === 0 ? (
          <div className="no-cars">
            No dealerships found
          </div>
        ) : (
          <DealershipCard 
            dealerships={filteredDealerships}
            cars={filteredCars}
            expandedDealerships={expandedDealerships}
            onToggleExpand={toggleExpand}
            onOpenDealershipModal={openDealershipModal}
            onOpenCarModal={openCarModal}
            onOpenDetailModal={openDetailModal}
            onDeleteDealership={deleteDealership}
            onDeleteCar={deleteCar}
          />
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        type={modal.type}
        data={modal.data}
        allDealerships={allDealerships}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}

export default App;