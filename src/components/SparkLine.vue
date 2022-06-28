<template>
  <trend
    :data="generateValues"
    gradientDirection="top"
    :gradient="['#679973', '#A6E6B3']"
    :padding="8"
    :radius="8"
    :stroke-width="3"
    stroke-linecap="butt"
    auto-draw
    smooth
  >
  </trend>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import moment from "moment";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Sparkline",
  props: ["commits"],
  mounted() {
    if (this.commits.length) {
      let dates = this.commits.map((date) => date.split("T")[0]);

      this.generateSparkData(dates);
    }
  },
  data() {
    return {
      sparkData: [],
    };
  },
  computed: {
    generateValues() {
      if (this.commits.length) {
        return [0, ...this.sparkData];
      } else {
        return [0, 0, 0, 0, 0, 0, 0];
      }
    },
  },
  methods: {
    generateSparkData(dates) {
      let firstCommit = moment.min(dates.map((d) => moment(d)));
      let lastCommit = moment.max(dates.map((d) => moment(d))).add(1, "days");

      let datesRange = [];

      for (
        let m = moment(firstCommit);
        m.isBefore(lastCommit);
        m.add(1, "days")
      ) {
        datesRange.push(m.format("YYYY-MM-DD"));
      }

      const commitDates = {};

      for (const date of dates) {
        commitDates[date] = commitDates[date] ? commitDates[date] + 1 : 1;
      }

      this.sparkData = datesRange.map((date) => {
        return commitDates[date] ?? 0;
      });
    },
  },
};
</script>
