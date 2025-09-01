<script setup>
import DealershipCard from './components/DealershipCard.vue'
import Modal from './components/Modal.vue'
import { ref, onMounted, computed } from "vue"
import axios from 'axios'

const baseUrl = "http://localhost:8080/api"

const allDealerships = ref([])
const allCars = ref([])
const expandedDealerships = ref(new Set())
const searchTerms = ref("")

// Modal state - moved to App.vue for better control
const modal = ref({
  isOpen: false,
  type: null,
  data: {}
})

// Modal functions
function openDealershipModal(dealership = null) {
  modal.value = {
    isOpen: true,
    type: "dealership",
    data: dealership ? { ...dealership } : { name: "", location: "", phonenumber: "" }
  }
}

function openCarModal(dealershipId, car = null) {
  console.log('openCarModal called with:', dealershipId, car)
  modal.value = {
    isOpen: true,
    type: "car",
    data: {
      dealershipId,
      car: car ? { ...car } : { make: "", model: "", year: "", vin: "" }
    }
  }
}

function openDetailModal(dealership = null, car = null) {
  console.log('openDetailModal called with:', dealership, car)
  modal.value = {
    isOpen: true,
    type: "details",
    data: dealership || car || {}
  }
}

function closeModal() {
  modal.value = {
    isOpen: false,
    type: null,
    data: {}
  }
}

// Handle save operations
function handleSave(type, data) {
  if (type === 'dealership') {
    saveDealership(data)
  } else if (type === 'car') {
    const carData = {
      ...data.car,
      dealershipId: data.dealershipId
    }
    saveCar(carData)
  }
  closeModal()
}

// Computed properties for filtered data
const filteredDealerships = computed(() => {
  if (!searchTerms.value.trim()) {
    return allDealerships.value
  }

  const query = searchTerms.value.toLowerCase()
  
  // Filter dealerships that match the search
  const matchingDealerships = allDealerships.value.filter(d =>
    d.name.toLowerCase().includes(query) ||
    d.location.toLowerCase().includes(query) ||
    d.phonenumber.includes(query)
  )

  // Filter cars that match the search
  const matchingCars = allCars.value.filter(c =>
    c.make.toLowerCase().includes(query) ||
    c.model.toLowerCase().includes(query) ||
    c.vin.toLowerCase().includes(query) ||
    c.year.toString().includes(query)
  )

  // Get dealerships that have matching cars
  const dealershipsWithMatchingCars = [...new Set(
    matchingCars
      .filter(c => c.dealership)
      .map(c => c.dealership.id)
  )].map(id => allDealerships.value.find(d => d.id === id)).filter(d => d)

  // Combine and deduplicate
  const allMatchingDealerships = [...new Map(
    [...matchingDealerships, ...dealershipsWithMatchingCars]
      .map(d => [d.id, d])
  ).values()]

  // Auto-expand dealerships with matching cars
  matchingCars.forEach(car => {
    if (car.dealership) {
      expandedDealerships.value.add(car.dealership.id)
    }
  })

  return allMatchingDealerships
})

const filteredCars = computed(() => {
  if (!searchTerms.value.trim()) {
    return allCars.value
  }

  const query = searchTerms.value.toLowerCase()
  return allCars.value.filter(c =>
    c.make.toLowerCase().includes(query) ||
    c.model.toLowerCase().includes(query) ||
    c.vin.toLowerCase().includes(query) ||
    c.year.toString().includes(query)
  )
})

async function loadAllData() {
  try {
    const [dealershipsRes, carsRes] = await Promise.all([
      axios.get(`${baseUrl}/dealership`),
      axios.get(`${baseUrl}/car`)
    ])
    allDealerships.value = dealershipsRes.data
    allCars.value = carsRes.data
    expandedDealerships.value.clear()
    searchTerms.value = ''
  } catch (err) {
    console.error("Error loading data:", err)
    alert('Error loading data: ' + err.message)
  }
}

const toggleExpand = (id) => {
  if (expandedDealerships.value.has(id)) {
    expandedDealerships.value.delete(id)
  } else {
    expandedDealerships.value.add(id)
  }
  // Force reactivity update
  expandedDealerships.value = new Set(expandedDealerships.value)
}

async function saveDealership(dealershipData) {
  try {
    const url = dealershipData.id ? `${baseUrl}/dealership/${dealershipData.id}` : `${baseUrl}/dealership`
    const method = dealershipData.id ? 'put' : 'post'
    
    await axios[method](url, {
      name: dealershipData.name,
      location: dealershipData.location,
      phonenumber: dealershipData.phonenumber
    })
    
    await loadAllData()
  } catch (error) {
    console.error('Error saving dealership:', error)
    alert('Error saving dealership: ' + error.message)
  }
}

async function saveCar(carData) {
  try {
    const url = carData.id ? `${baseUrl}/car/${carData.id}` : `${baseUrl}/car`
    const method = carData.id ? 'put' : 'post'
    
    const body = {
      make: carData.make,
      model: carData.model,
      year: parseInt(carData.year),
      vin: carData.vin
    }
    
    if (carData.dealershipId) {
      body.dealership = { id: carData.dealershipId }
    }
    
    await axios[method](url, body)
    await loadAllData()
  } catch (error) {
    console.error('Error saving car:', error)
    alert('Error saving car: ' + error.message)
  }
}

async function deleteDealership(id) {
  if (!confirm('Delete this dealership?')) return
  
  try {
    await axios.delete(`${baseUrl}/dealership/${id}`)
    await loadAllData()
  } catch (error) {
    console.error('Error deleting dealership:', error)
    alert('Error deleting dealership: ' + error.message)
  }
}

async function deleteCar(id) {
  if (!confirm('Delete this car?')) return
  
  try {
    await axios.delete(`${baseUrl}/car/${id}`)
    await loadAllData()
  } catch (error) {
    console.error('Error deleting car:', error)
    alert('Error deleting car: ' + error.message)
  }
}

function performGlobalSearch() {
  expandedDealerships.value.clear()
  // The computed properties will handle the filtering
}

onMounted(() => {
  loadAllData()
})
</script>

<template>
  <div class="container">
    <h1>Dealership Management System</h1>
    
    <div class="search-section">
      <h2>🔍 Search & Filter</h2>
      <div class="search-row">
        <input 
          type="text" 
          v-model="searchTerms"
          @input="performGlobalSearch"
          placeholder="Search dealerships and cars..."
        >
        <button @click="loadAllData">🔄 Refresh All</button>
        <button class="create-btn" @click="openDealershipModal">➕ Add Dealership</button>
      </div>
    </div>

    <div class="main-section">
      <h2>🏪 Dealerships & Their Cars</h2>
      <div v-if="!filteredDealerships.length" class="no-cars">
        No dealerships found
      </div>
      <DealershipCard 
        :dealerships="filteredDealerships" 
        :cars="filteredCars" 
        :expandedDealerships="expandedDealerships"
        @toggle-expand="toggleExpand"
        @open-dealership-modal="openDealershipModal"
        @open-car-modal="openCarModal"
        @open-detail-modal="openDetailModal"
        @delete-dealership="deleteDealership"
        @delete-car="deleteCar"
      />
    </div>

    <!-- Modal -->
    <Modal
      v-if="modal.isOpen"
      :type="modal.type"
      :data="modal.data"
      :allDealerships="allDealerships"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<style>
@import './style.css';
</style>