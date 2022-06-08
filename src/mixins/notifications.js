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
  },
};

export default notifications;
