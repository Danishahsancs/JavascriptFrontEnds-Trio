<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  type: String,
  data: Object,
  allDealerships: Array
})

const emit = defineEmits(["close", "save"])

// Local reactive form data
const formData = ref({})

// Watch for data changes to update form
watch(() => props.data, (newData) => {
  formData.value = { ...newData }
}, { immediate: true, deep: true })

function handleSave() {
  // Basic validation
  if (props.type === 'dealership') {
    if (!formData.value.name || !formData.value.location || !formData.value.phonenumber) {
      alert('Please fill all fields')
      return
    }
  } else if (props.type === 'car') {
    if (!formData.value.car.make || !formData.value.car.model || !formData.value.car.year || !formData.value.car.vin) {
      alert('Please fill all fields')
      return
    }
  }
  
  emit('save', props.type, formData.value)
}
</script>

<template>
  <div class="modal" @click.self="emit('close')">
    <div class="modal-content">
      <span class="close" @click="emit('close')">&times;</span>

      <!-- Dealership Modal -->
      <template v-if="type === 'dealership'">
        <h2>{{ formData.id ? "Edit Dealership" : "Add New Dealership" }}</h2>
        <div class="form-row">
          <input 
            v-model="formData.name" 
            placeholder="Dealership Name"
            type="text"
          />
          <input 
            v-model="formData.location" 
            placeholder="Location"
            type="text"
          />
          <input 
            v-model="formData.phonenumber" 
            placeholder="Phone Number"
            type="text"
          />
        </div>
        <div class="form-row">
          <button class="create-btn" @click="handleSave">💾 Save</button>
          <button class="delete-btn" @click="emit('close')">❌ Cancel</button>
        </div>
      </template>

      <!-- Car Modal -->
      <template v-else-if="type === 'car'">
        <h2>{{ formData.car && formData.car.id ? "Edit Car" : "Add New Car" }}</h2>
        <div class="form-row">
          <input 
            v-model="formData.car.make" 
            placeholder="Make"
            type="text"
          />
          <input 
            v-model="formData.car.model" 
            placeholder="Model"
            type="text"
          />
          <input 
            v-model="formData.car.year" 
            placeholder="Year"
            type="number"
          />
          <input 
            v-model="formData.car.vin" 
            placeholder="VIN Number"
            type="text"
          />
          <select v-model="formData.dealershipId">
            <option value="">Select Dealership</option>
            <option 
              v-for="dealership in allDealerships" 
              :key="dealership.id" 
              :value="dealership.id"
            >
              {{ dealership.name }} ({{ dealership.location }})
            </option>
          </select>
        </div>
        <div class="form-row">
          <button class="create-btn" @click="handleSave">💾 Save</button>
          <button class="delete-btn" @click="emit('close')">❌ Cancel</button>
        </div>
      </template>

      <!-- Details Modal -->
      <template v-else-if="type === 'details'">
        <h2 
          :style="{ 
            color: formData.make ? '#00b894' : '#74b9ff', 
            borderBottom: formData.make ? '2px solid #00b894' : '2px solid #74b9ff' 
          }"
        >
          {{ formData.make ? 'Car Details' : 'Dealership Details' }}
        </h2>
        
        <div class="detail-content">
          <!-- Dealership Details -->
          <template v-if="formData.name">
            <div class="detail-item">
              <div class="detail-label">Dealership Name</div>
              <div class="detail-value">{{ formData.name }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Location</div>
              <div class="detail-value">{{ formData.location }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Phone Number</div>
              <div class="detail-value">{{ formData.phonenumber }}</div>
            </div>
          </template>

          <!-- Car Details -->
          <template v-if="formData.make">
            <div class="detail-item">
              <div class="detail-label">Make</div>
              <div class="detail-value">{{ formData.make }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Model</div>
              <div class="detail-value">{{ formData.model }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Year</div>
              <div class="detail-value">{{ formData.year }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">VIN</div>
              <div class="detail-value">{{ formData.vin }}</div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
