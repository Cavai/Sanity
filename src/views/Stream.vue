<template>
  <div id="stream">
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
      <h2>Stream</h2>
    </div>
    <div class="requests-content">
      <StreamTable />
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import StreamTable from '@/components/StreamTable.vue';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Stream',
  components: {
    Header,
    StreamTable,
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
