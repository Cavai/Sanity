<template>
  <div id="home">
    <Header />
    <div class="sub-header">
      <h2>Sanity</h2>
    </div>
    <div class="home-content">
      <div class="home-content-cards">
        <router-link to="/requests">
          <div class="home-card">
            <div class="home-card-image card-horizons"></div>
            <h3>Horizons</h3>
            <Icon :size="30" type="ios-arrow-round-forward home-card-icon" />
          </div>
        </router-link>
        <router-link to="/utils">
          <div class="home-card">
            <div class="home-card-image card-maintenance"></div>
            <h3>Utils</h3>
            <Icon :size="30" type="ios-arrow-round-forward home-card-icon" />
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "@/components/Header.vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Home",
  components: {
    Header,
  },
};
</script>

<style></style>
