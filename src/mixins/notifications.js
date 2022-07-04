const notifications = {
  methods: {
    notificationSuccess(desc) {
      this.$Notice.success({
        title: "Success",
        desc,
      });
    },
    notificationError(desc) {
      this.$Notice.error({
        title: "Error",
        desc,
      });
    },
    notificationWarning(desc) {
      this.$Notice.warning({
        title: "Warning",
        desc,
      });
    },
    notificationInfo(desc) {
      this.$Notice.info({
        title: "Info",
        desc,
      });
    },
  },
};

export default notifications;
