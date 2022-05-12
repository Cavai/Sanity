<template>
  <trend
    :data="generateRandomValues"
    gradientDirection="top"
    :gradient="['#679973', '#A6E6B3']"
    :padding="8"
    :radius="8"
    :stroke-width="3"
    stroke-linecap="butt"
    auto-draw
    smooth>
  </trend>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Sparkline',
  computed: {
    generateRandomValues() {
      return [...Array(7).keys()].map(() => Math.floor(Math.random() * 10));
    }
  }
}
</script>
