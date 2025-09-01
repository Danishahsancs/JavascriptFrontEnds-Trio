<script setup>
import CarItem from "./CarItem.vue"

const props = defineProps({
  dealerships: Array,
  cars: Array,
  expandedDealerships: Object
})

const emit = defineEmits([
  "toggle-expand", 
  "open-dealership-modal",
  "open-car-modal", 
  "open-detail-modal",
  "delete-dealership", 
  "delete-car"
])

// Filter cars for a given dealership
const carsByDealership = (dealership) => {
  if (!props.cars || !dealership) return []
  return props.cars.filter((car) => car.dealership && car.dealership.id === dealership.id)
}
</script>

<template>
  <div>
    <div
      v-for="d in props.dealerships"
      :key="d.id"
      class="dealership-card"
      :class="{ expanded: expandedDealerships.has(d.id) }"
      :data-id="d.id"
    >
      <div class="dealership-header" @click="$emit('toggle-expand', d.id)">
        <div class="dealership-info">
          <div class="dealership-name">{{ d.name }}</div>
          <div class="dealership-details">📍 {{ d.location }}</div>
        </div>

        <div class="dealership-actions" @click.stop>
          <span class="car-count">{{ carsByDealership(d).length }} cars</span>
          <button class="btn-small" @click="console.log('Details clicked', d); $emit('open-detail-modal', d)">details</button>
          <button class="btn-small" @click="console.log('Edit clicked', d); $emit('open-dealership-modal', d)">✏️</button>
          <button class="btn-small delete-btn" @click="$emit('delete-dealership', d.id)">🗑️</button>
          <span class="expand-icon" @click="$emit('toggle-expand', d.id)">▼</span>
        </div>
      </div>

      <div class="dealership-content" v-if="expandedDealerships.has(d.id)">
        <div class="cars-section">
          <div
            class="cars-header"
            style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;"
          >
            <h3 style="color: #00b894ff; margin: 0;">
              🚗 Cars ({{ carsByDealership(d).length }})
            </h3>
            <button class="create-btn btn-small" @click="$emit('open-car-modal', d.id)">
              ➕ Add Car
            </button>
          </div>

          <div v-if="!carsByDealership(d).length" class="no-cars">
            No cars in this dealership
          </div>
          <CarItem 
            v-else
            :cars="carsByDealership(d)" 
            @edit-car="(car) => $emit('open-car-modal', d.id, car)"
            @view-car-details="(car) => $emit('open-detail-modal', null, car)"
            @delete-car="(carId) => $emit('delete-car', carId)"
          />
        </div>
      </div>
    </div>
  </div>
</template>