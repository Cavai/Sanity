<template>
  <div class="logoLoader">
    <div class="logoLoader__fader">
      <div class="logoLoader__inner1"></div>
      <div class="logoLoader__inner2"></div>
      <div class="logoLoader__inner3"></div>
      <div class="logoLoader__outer1"></div>
      <div class="logoLoader__outer2"></div>
      <div class="logoLoader__outer3"></div>
    </div>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Spinner'
};
</script>

<style lang="scss" scoped>
.logoLoader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
}

.logoLoader__fader {
  width: 100%;
  height: 100%;
  animation-name: loaderFaderAnimation;
  animation-delay: 1s;
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-timing-function: ease;
  animation-direction: alternate-reverse;
}

.logoLoader__inner1,
.logoLoader__inner2,
.logoLoader__inner3,
.logoLoader__outer1,
.logoLoader__outer2,
.logoLoader__outer3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
  transform-origin: center;

  animation-name: loaderPiecesAnimation;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-timing-function: ease;
  animation-direction: normal;
}

.logoLoader__inner1 {
  animation-delay: 0.6s;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQ3LjA4MzcgMjAuMDI3NEw0Mi42NjAyIDE3LjY0OTZDNDMuMjk5MyAxOS4xNzYgNDMuNjA2NiAyMC44MjA0IDQzLjU2MTYgMjIuNDc0Mkw0My41MzI3IDM3LjU0MzhDNDMuNTU3NSAzOS4wOTYzIDQzLjI4MTYgNDAuNjM5IDQyLjcyMDMgNDIuMDg3TDQ3LjkzNzEgMzguNjM2NEM1MS41OTg3IDM2LjIxNDggNTMuNzAzMiAzMy4yMTMgNTMuOTc0OCAzMC4wODgyVjI4Ljc0NkM1My42OTU0IDI1LjM2MTQgNTEuMjY0NSAyMi4yNzQ0IDQ3LjA4MzcgMjAuMDI3NFoiIGZpbGw9IiMzMDMwMzAiLz4KPC9zdmc+Cg==");
}

.logoLoader__inner2 {
  animation-delay: 0.7s;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMwLjgxOTEgNDkuOTU2NkwzNi4wNzY4IDQ2LjQ3NjZDMzQuMzAwMSA0Ni4zNzU2IDMyLjU3MTEgNDUuODY1MSAzMS4wMjUyIDQ0Ljk4NUwxOS44NTQ4IDM4Ljk4MzhDMTguMjcxOSAzOC4xODE2IDE2Ljg5NTYgMzcuMDI1NyAxNS44MzMyIDM1LjYwNThMMTUuODIxOCA0MS44OTYyQzE1LjgxMjggNDYuNDA3IDE3LjE0MzkgNDkuNzUxNCAxOS41Nzc3IDUxLjQxNzZMMjAuNzkyOSA1Mi4wNjg2QzIzLjUyNDIgNTMuMTgxNiAyNy4wNTE3IDUyLjQ0ODQgMzAuODE5MSA0OS45NTY2WiIgZmlsbD0iIzMwMzAzMCIvPgo8L3N2Zz4K");
}

.logoLoader__inner3 {
  animation-delay: 0.8s;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1Ljg0ODYgMjcuNjI4MkMxNi43NDkzIDI2LjM2ODYgMTcuODg0IDI1LjI5MzUgMTkuMTkxMSAyNC40NjE0TDMxLjc3MiAxNi4xNEMzMy4xMjkzIDE1LjE5MTMgMzQuNjcyOSAxNC41NDEyIDM2LjMwMDcgMTQuMjMyNkwzMS44ODc5IDExLjg2MTRDMjcuNjY2OSA5LjU5MjIxIDIzLjcxMDggOS4yODE0MSAyMC43MTc1IDEwLjk2NUwxOS43NzQ2IDExLjU4ODRDMTcuMjUzNiAxMy41MjIyIDE1Ljg2ODUgMTYuOTU5IDE1Ljg2MDcgMjEuMzk5TDE1Ljg0ODYgMjcuNjI4MloiIGZpbGw9IiMzMDMwMzAiLz4KPC9zdmc+Cg==");
}

.logoLoader__outer1 {
  animation-delay: 1.6s;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMzLjAyNjggOS43NDYzNkwzNy40MzkgMTIuMTJMNDMuNzk4MiAxNS41NEw0OC4yMjE4IDE3LjkxNzhDNTAuNDUzIDE5LjA2MTggNTIuNDE3IDIwLjY2MzQgNTMuOTg1NSAyMi42MTc2TDUzLjk5ODcgMTUuNzc3NkM1NC4wMTM4IDguNjk5OTYgNTEuNjcwNyAzLjUzOTk2IDQ3LjQwMzMgMS4yNDczNkM0My4xMzYgLTEuMDQ1MjQgMzcuNTMzNCAtMC4xNTcyNDEgMzEuNjI1NCAzLjc0OTk2TDI1LjkxMTYgNy41Mjk5NkMyOC40MTQgNy43NTYyNyAzMC44Mzk1IDguNTExODEgMzMuMDI2OCA5Ljc0NjM2VjkuNzQ2MzZaIiBmaWxsPSIjMzAzMDMwIi8+Cjwvc3ZnPgo=");
}

.logoLoader__outer2 {
  animation-delay: 1.7s;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjEiIHZpZXdCb3g9IjAgMCA2MCA2MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQ5LjI2MjQgNDAuNjM3NEw0NC4wNDU1IDQ0LjA4OEwzNy40MDQ1IDQ4LjQ4TDMyLjE0NjIgNTEuOTZDMzAuMjE5NyA1My4yOTUgMjguMDQ5OCA1NC4yNDAyIDI1Ljc1OTMgNTQuNzQyMkwzMC4zMTgxIDU3LjE5MjZDMzMuODI1MiA1OS4wNzcyIDM3LjIyOSA2MC4wMTggNDAuMzM4OSA2MC4wMDI0QzQyLjY2MiA2MC4wMTg5IDQ0Ljk0NjIgNTkuNDA3MyA0Ni45NDkzIDU4LjIzMjRDNTEuNDQ3NCA1NS41NTU4IDUzLjkzMTcgNTAuMTkyNCA1My45NDQ5IDQzLjEzMDRMNTMuOTYgMzYuM0M1Mi42NTc1IDM4LjAwNjUgNTEuMDY4IDM5LjQ3NDEgNDkuMjYyNCA0MC42Mzc0VjQwLjYzNzRaIiBmaWxsPSIjMzAzMDMwIi8+Cjwvc3ZnPgo=");
}

.logoLoader__outer3 {
  animation-delay: 1.8s;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEzLjQxOCA0MS44OTE0TDEzLjQyOTUgMzUuNjAxTDEzLjQ0NTEgMjcuNjIxTDEzLjQ1NzEgMjEuMzkwNkMxMy40MzQ4IDE5LjI0MTEgMTMuNzg3IDE3LjEwNDEgMTQuNDk3OSAxNS4wNzVMOC43ODg5NCAxOC44NTVDMi44OTA2MyAyMi43NTUgLTAuMjI1Mjg2IDI3Ljc4IDAuMDEyNjg5OCAzM0MwLjI1MDY2NSAzOC4yMiAzLjgxMzA5IDQyLjk0MiAxMC4wNDA3IDQ2LjI4OTRMMTQuNjE4MSA0OC43NDk0QzEzLjc3NjUgNDYuNTYyNyAxMy4zNjg5IDQ0LjIzMzUgMTMuNDE4IDQxLjg5MTRWNDEuODkxNFoiIGZpbGw9IiMzMDMwMzAiLz4KPC9zdmc+Cg==");
}

@keyframes loaderPiecesAnimation {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  20% {
    opacity: 0;
  }

  25% {
    transform: scale(0.8);
    opacity: 0;
  }

  30% {
    opacity: 0;
  }

  50% {
    /* 1s */
    transform: scale(1);
    opacity: 1;
  }

  100% {
    /* 2s */
  }
}

@keyframes loaderFaderAnimation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
