<template>
  <div id="horizon">
    <Alert
      v-if="error.show"
      type="error"
      show-icon
      class="error_container"
    >
      {{ error.message }}
      <span slot="desc">
        Please try again in a few minutes.
      </span>
    </Alert>
    <Header />
    <div class="sub-header">
      <h2>Horizon</h2>
    </div>
    <div class="requests-content">
      <HorizonTable />
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import HorizonTable from '@/components/HorizonTable.vue';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Horizon',
  components: {
    Header,
    HorizonTable,
  },
  data() {
    return {
      error: {
        show: false,
        message: 'Service temporarily unavailable',
      },
    }
  }
}
</script>

<style>

</style>
