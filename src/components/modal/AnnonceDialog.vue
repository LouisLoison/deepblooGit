<template>
  <v-dialog
    v-model="isShowDialog"
    scrollable
    :max-width="!getIsMobile ? 900 : null"
    :fullscreen="getIsMobile"
    :hide-overlay="getIsMobile"
  >
    <v-card v-if="annonceId">
      <v-toolbar dark dense color="blue-grey lighten-4 black--text">
        <div class="title">
          <span v-if="!annonceId">New annonce statistic</span>
          <span v-else>Annonce #{{ annonceId }} - Statistic</span>
        </div>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon light @click="isShowDialog = false">
            <v-icon color="grey darken-2">
              fa-times
            </v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-divider></v-divider>

      <v-card-text>
        <div v-if="getAnnonceClicks">
          <highcharts :options="chart1"></highcharts>

          <div class="annonce-modal-grid">
            <div class="pt-4">
              <highcharts :options="chart2"></highcharts>
            </div>

            <div class="pr-2">
              <v-select
                v-model="membership"
                :items="memberships"
                label="Membership"
                solo
                @change="changeMembership"
              />
              <v-list
                v-if="getAnnonceClicks"
                two-line
                style="max-height: 400px; overflow: auto;"
              >
                <template v-for="(annonceClick, index) in getAnnonceClicks">
                  <v-divider :key="`annonceClick-divider${index}`" />

                  <v-list-item :key="`annonceClick${index}`" avatar @click.stop>
                    <v-list-item-avatar>
                      <img
                        v-if="annonceClick.user"
                        :src="annonceClick.user.photo"
                      />
                      <v-icon
                        v-else
                        color="grey darken-2"
                        style="font-size: 30px;"
                        >fa-user</v-icon
                      >
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <v-list-item-title
                        v-if="annonceClick.user"
                        v-html="annonceClick.user.username"
                      ></v-list-item-title>
                      <v-list-item-title v-else class="grey--text"
                        >Unknow</v-list-item-title
                      >
                      <v-list-item-subtitle
                        v-html="annonceClick.creationDate"
                      />
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";

export default {
  name: "AnnonceDialog",

  data: () => ({
    moment,
    isShowDialog: false,
    dataAnnonceClicks: {
      loading: null,
      data: null
    },
    annonceId: null,
    notEmptyRules: [v => !!v || "Data is required"],
    membership: "Other",
    memberships: ["Business", "Premium", "Other"],
    colors: ["#7cb5ec", "#f7a35c", "#434348"],
    items: [
      {
        userId: 1,
        avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg",
        title: "Xxxx Xxxx",
        subtitle: "XX/XX/XXXX XX:XX:XX"
      },
      { divider: true, inset: true },
      {
        userId: 2,
        avatar: "https://cdn.vuetifyjs.com/images/lists/2.jpg",
        title: "Xxxx Xxxx",
        subtitle: "XX/XX/XXXX XX:XX:XX"
      },
      { divider: true, inset: true },
      {
        userId: 3,
        avatar: "https://cdn.vuetifyjs.com/images/lists/3.jpg",
        title: "Xxxx Xxxx",
        subtitle: "XX/XX/XXXX XX:XX:XX"
      },
      { divider: true, inset: true },
      {
        userId: 4,
        avatar: "https://cdn.vuetifyjs.com/images/lists/4.jpg",
        title: "Xxxx Xxxx",
        subtitle: "XX/XX/XXXX XX:XX:XX"
      },
      { divider: true, inset: true },
      {
        userId: 5,
        avatar: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
        title: "Xxxx Xxxx",
        subtitle: "XX/XX/XXXX XX:XX:XX"
      },
      { divider: true, inset: true },
      {
        userId: 6,
        avatar: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
        title: "Xxxx Xxxx",
        subtitle: "XX/XX/XXXX XX:XX:XX"
      },
      { divider: true, inset: true },
      {
        userId: 7,
        avatar: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
        title: "Xxxx Xxxx",
        subtitle: "XX/XX/XXXX XX:XX:XX"
      },
      { divider: true, inset: true },
      {
        userId: 8,
        avatar: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
        title: "Xxxx Xxxx",
        subtitle: "XX/XX/XXXX XX:XX:XX"
      },
      { divider: true, inset: true },
      {
        userId: 9,
        avatar: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
        title: "Xxxx Xxxx",
        subtitle: "XX/XX/XXXX XX:XX:XX"
      },
      { divider: true, inset: true },
      {
        userId: 10,
        avatar: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
        title: "Xxxx Xxxx",
        subtitle: "XX/XX/XXXX XX:XX:XX"
      },
      { divider: true, inset: true },
      {
        userId: 11,
        avatar: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
        title: "Xxxx Xxxx",
        subtitle: "XX/XX/XXXX XX:XX:XX"
      }
    ],
    chart1: {
      chart: {
        animation: true,
        height: 400,
        type: "column"
      },
      title: { text: "" },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: {
        categories: ["Apples", "Oranges", "Pears", "Grapes", "Bananas"]
      },
      yAxis: {
        min: 0,
        title: { text: "Total fruit consumption" },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: "bold",
            color: "gray"
          }
        }
      },
      tooltip: {
        headerFormat: "<b>{point.x}</b><br/>",
        pointFormat: "{series.name}: {point.y}<br/>Total: {point.stackTotal}"
      },
      plotOptions: {
        column: {
          stacking: "normal",
          dataLabels: {
            enabled: true
          }
        }
      },
      series: [
        {
          name: "Business",
          data: [5, 3, 4, 7, 2, 4]
        },
        {
          name: "Premium",
          data: [2, 2, 3, 2, 1, 3]
        },
        {
          name: "Other",
          data: [15, 13, 12, 14, 20, 15]
        }
      ]
    },
    chart2: {
      chart: {
        animation: true,
        height: 400,
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: "pie"
      },
      title: { text: "" },
      credits: { enabled: false },
      exporting: { enabled: false },
      tooltip: {
        pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>"
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            format: "<b>{point.name}</b>: {point.percentage:.1f} %"
          }
        },
        series: {
          animation: true,
          events: {
            click: function(event) {
              console.log(event.point.name);
            }
          }
        }
      },
      series: [
        {
          name: "Membership",
          colorByPoint: true,
          data: [
            {
              name: "Business",
              y: 80,
              sliced: true,
              selected: true
            },
            {
              name: "Premium",
              y: 56,
              sliced: false,
              selected: false
            },
            {
              name: "Other",
              y: 230,
              sliced: false,
              selected: false
            }
          ]
        }
      ]
    }
  }),

  computed: {
    ...mapGetters(["getIsMobile", "getUserId"]),

    getAnnonceClickBusinesss() {
      return this.dataAnnonceClicks.data.filter(
        a => a.user && (a.user.type === 1 || a.user.type === 4)
      );
    },

    getAnnonceClickPremiums() {
      return this.dataAnnonceClicks.data.filter(
        a => a.user && a.user.type === 2
      );
    },

    getAnnonceClickOthers() {
      return this.dataAnnonceClicks.data.filter(a => !a.user);
    },

    getAnnonceClicks() {
      if (!this.dataAnnonceClicks.data) {
        return null;
      }
      let annonceClicks = null;
      if (this.membership === "Business") {
        annonceClicks = this.getAnnonceClickBusinesss;
      } else if (this.membership === "Premium") {
        annonceClicks = this.getAnnonceClickPremiums;
      } else {
        annonceClicks = this.getAnnonceClickOthers;
      }
      return annonceClicks;
    }
  },

  mounted() {},

  methods: {
    show(annonceId) {
      this.membership = "Other";
      this.isShowDialog = true;
      this.dataAnnonceClicks.loading = null;
      this.dataAnnonceClicks.data = null;
      this.annonceId = annonceId;
      let months = [];
      for (let i = 0; i < 6; i++) {
        months.push(
          moment()
            .subtract(i, "month")
            .format("MMMM")
        );
      }
      months.reverse();
      this.chart1.xAxis.categories = months;
      this.chart1.colors = this.colors;
      this.chart2.colors = this.colors;
      this.chart2.chart.animation = true;
      this.chart2.plotOptions.series.animation = true;
      this.chart2.plotOptions.series.events = {
        click: event => {
          this.membership = event.point.name;
          this.changeMembership();
        }
      };
      for (let data of this.chart2.series[0].data) {
        data.y = 0;
      }
      this.changeMembership();
      this.loadAnnonceClicks(annonceId);
    },

    async loadAnnonceClicks() {
      try {
        this.dataAnnonceClicks.loading = 0;
        const res = await this.$api.post("/Annonce/AnnonceClickList", {
          filter: {
            annonceId: this.annonceId
          }
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        this.dataAnnonceClicks.data = res.data;
        this.dataAnnonceClicks.loading = 1;
        this.chart2.series[0].data[0].y = this.getAnnonceClickBusinesss.length;
        this.chart2.series[0].data[1].y = this.getAnnonceClickPremiums.length;
        this.chart2.series[0].data[2].y = this.getAnnonceClickOthers.length;
        this.membership = "Business";
        this.changeMembership();
      } catch (err) {
        this.dataAnnonceClicks.loading = -1;
        this.$api.error(err, this);
      }
    },

    changeMembership() {
      this.chart2.chart.animation = false;
      this.chart2.plotOptions.series.animation = false;
      for (let data of this.chart2.series[0].data) {
        if (this.membership === data.name) {
          data.sliced = true;
          data.selected = true;
        } else {
          data.sliced = false;
          data.selected = false;
        }
      }
    }
  }
};
</script>

<style scope>
.annonce-modal-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-gap: 0px 0px;
}
</style>
