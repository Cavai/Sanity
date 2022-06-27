<template>
  <Col class="demo-spin-col" span="8">
    <Spin fix>
      <Icon type="ios-loading" :size="48" class="demo-spin-icon-load"></Icon>
    </Spin>
  </Col>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Spinner",
};
</script>

<style lang="scss" scoped>
.demo-spin-col {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  z-index: 99999;
}

.demo-spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
  color: #202020;
}
@keyframes ani-demo-spin {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
