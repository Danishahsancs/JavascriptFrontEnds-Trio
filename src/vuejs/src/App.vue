<script setup>
import dealerships from './components/DealershipCard.vue'
import { ref, onMounted } from "vue"
const baseUrl = "http://localhost:8080/api";
import axios from "axios"

const Dealerships = ref([])
const cars = ref([])
const expandedDealerships = ref(new Set())
const searchTerms = ref("")

async function loadAllData() {
  try {
    const [dealershipsRes, carsRes] = await Promise.all([
      axios.get(baseUrl + "/dealership"),
      axios.get(baseUrl + "/car")
    ])
    dealerships.value = dealershipsRes.data
    cars.value = carsRes.data
  } catch (err) {
    console.error("Error loading data:", err)
  }
}


onMounted(() => {
  loadAllData()
})

</script>

<template>

  <body>
    <div class="container">
      <H1>Dealership API with Vue</H1>
      <div class="search-section">
        <H2>Search & Add Dealerships</H2>
        <div class="search-row">
          <input type="text" placeholder="Search through dealerships & Cars">
          <button>refresh</button>
          <button class="create-btn">add Dealership</button>
        </div>
      </div>

      <div class="main-section">
        <h2>Dealerships & Their Cars</h2>
        <div id="dealershipsContainer">
          <dealerships :dealerships="dealerships" :cars="cars" />
        </div>
      </div>
    </div>



  </body>
</template>
