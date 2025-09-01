<script setup>
defineProps({
  cars: Array
})

defineEmits(['edit-car', 'view-car-details', 'delete-car'])
</script>

<template>
  <div v-for="car in cars" :key="car.id" class="car-item">
    <div class="car-info">
      <div class="car-title">{{ car.year }} {{ car.make }} {{ car.model }}</div>
    </div>
    <div class="car-actions">
      <button class="btn-small" @click="$emit('view-car-details', car)">details</button>
      <button class="btn-small" @click="$emit('edit-car', car)">✏️</button>
      <button class="btn-small delete-btn" @click="$emit('delete-car', car.id)">🗑️</button>
    </div>
  </div>
</template>