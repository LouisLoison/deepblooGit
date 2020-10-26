<template>
  <v-app id="setting" class="grey lighten-5 pa-4">
    <div class="content-grid">
      <v-card class="pa-3 ma-2">
        <div class="title pb-0">Sources</div>
        <v-divider class="mx-0 mb-2" />
        <v-simple-table dense>
          <template v-slot:default>
            <tbody>
              <tr>
                <td class="font-weight-bold">
                  DgMarket
                </td>
                <td class="text-center" style="word-break: break-all;">
                </td>
              </tr>
              <tr>
                <td class="font-weight-bold">
                  TenderInfo
                </td>
                <td class="text-center" style="word-break: break-all;">
                  <v-btn
                    icon
                    color="blue-grey"
                    :to="{ name: 'SettingImportTenderInfos' }"
                  >
                    <v-icon>fa-eye</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card>

      <v-card class="pa-0 ma-2">
        <v-toolbar dense class="mb-5">
          <v-toolbar-title>Import</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="blue-grey"
                dark
                text
                v-bind="attrs"
                v-on="on"
              >
                {{ dayCount }} days
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(dayCountTemp, index) of dayCounts"
                :key="`dayCountTemp${index}`"
                @click="changeDayCount(dayCountTemp)"
              >
                <v-list-item-title>
                  {{ dayCountTemp }} days
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
        <div
          v-if="!dataTenderImportStatistics.loading"
          class="pa-5 text-center"
        >
          <v-progress-circular :size="50" color="grey" indeterminate />
        </div>
        <highcharts
          v-else
          :options="chartStatistique"
        />
      </v-card>
    </div>

    <div class="content-grid2">
      <v-card class="pa-3 ma-2">
        <div class="title pb-0">Files</div>
        <v-divider class="mx-0 mb-2" />
        <div
          v-if="!dataTenderImportStatistics.loading"
          class="pa-5 text-center"
        >
          <v-progress-circular :size="50" color="grey" indeterminate />
        </div>
        <v-simple-table
          v-else
          dense
        >
          <template v-slot:default>
            <tbody>
              <tr
                v-for="(tenderInfo, index) in dataTenderImportStatistics.data.tenderInfo"
                :key="`tenderInfo${index}`"
              >
                <td class="caption" style="word-break: break-all;">
                  {{ tenderInfo.fileSource }}
                </td>
                <td class="text-right">
                  {{ tenderInfo.total }}
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card>

      <v-card class="pa-3 ma-2">
        <div class="title pb-0">Merge</div>
        <v-divider class="mx-0 mb-2" />
        <div
          v-if="!dataTenderImportStatistics.loading"
          class="pa-5 text-center"
        >
          <v-progress-circular :size="50" color="grey" indeterminate />
        </div>
        <highcharts
          v-else
          :options="chartMerge"
        />
      </v-card>
      
      <v-card class="pa-3 ma-2">
        <div class="title pb-0">Methode</div>
        <v-divider class="mx-0 mb-2" />
        <div
          v-if="!dataTenderImportStatistics.loading"
          class="pa-5 text-center"
        >
          <v-progress-circular :size="50" color="grey" indeterminate />
        </div>
        <highcharts
          v-else
          :options="chartMergeMethode"
        />
      </v-card>
    </div>
  </v-app>
</template>

<script>
import moment from 'moment'

export default {
  name: "ImportStatistic",

  data: () => ({
    moment,
    dataUsers: {
      loading: null,
      error: null,
      data: null
    },
    dayCount: 7,
    dayCounts: [ 5, 7, 10, 15 ],
    dataTenderImportStatistics: {
      loading: null,
      error: null,
      data: null
    },
    chartStatistique: {
      chart: {
        type: "column",
        plotBorderWidth: 1,
        zoomType: "xy",
        height: 300
      },
      title: { text: "" },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: { categories: [] },
      yAxis: {
        min: 0,
        title: { text: "" },
        stackLabels: {
          enabled: true,
          style: { fontWeight: "bold", color: "gray" }
        }
      },
      tooltip: {
        headerFormat: "<b>{point.x}</b><br/>",
        pointFormat: "Total: {point.stackTotal}<br/>{series.name}: {point.y}"
      },
      plotOptions: {
        column: {
          cursor: "pointer",
          pointPadding: 0.2,
          borderWidth: 0,
          dataLabels: {
            enabled: true
          },
          stacking: 'normal',
        }
      },
      series: []
    },
    chartMerge: {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false
      },
      credits: { enabled: false },
      exporting: { enabled: false },
      title: {
        text: '',
        align: 'center',
        verticalAlign: 'middle',
        y: 60
      },
      tooltip: {
        pointFormat: '<b>{point.y}</b><br>({point.percentage:.1f}%)'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            distance: -50,
            style: {
              fontWeight: 'bold',
              color: 'white'
            }
          },
          startAngle: -90,
          endAngle: 90,
          center: ['50%', '75%'],
          size: '110%'
        }
      },
      series: []
    },
    chartMergeMethode: {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      credits: { enabled: false },
      exporting: { enabled: false },
      title: {
        text: ''
      },
      tooltip: {
        pointFormat: '<b>{point.y}</b><br>({point.percentage:.1f}%)'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false
          },
          showInLegend: true
        }
      },
      series: [],
    },
  }),

  mounted() {
    this.loadTenderImportStatistics()
  },

  methods: {
    async loadTenderImportStatistics() {
      try {
        this.dataTenderImportStatistics.loading = 0
        let filter = {}
        const res = await this.$api.post("/TenderImport/statistics", { filter })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataTenderImportStatistics.data = res.data
        this.getStatistics()
        this.dataTenderImportStatistics.loading = 1
      } catch (err) {
        this.dataTenderImportStatistics.loading = -1
        this.$api.error(err, this)
      }
    },

    getStatistics() {
      let total = 0
      let merge = 0
      let sameId = 0
      let titleBuyerBiddeadline = 0
      this.chartStatistique.xAxis.categories = []
      this.chartStatistique.series = [
        { name: 'DgMarket OK', data: [], stack: 'DgMarket' },
        { name: 'DgMarket KO', data: [], stack: 'DgMarket', color: 'rgba(186,0,0,.9)' },
        { name: 'TenderInfo OK', data: [], stack: 'TenderInfo' },
        { name: 'TenderInfo KO', data: [], stack: 'TenderInfo', color: 'rgba(186,0,0,.9)' },
      ]

      let periods = []
      const periodData = {}
      for (const dgMarket of this.dataTenderImportStatistics.data.dgMarket) {
        let date = dgMarket.fileSource.split('.')[0].split('feed-')[1].split('.')[0].split('.xml')[0].split('-')[0]
        date = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
        date = dgMarket.creationDate.substring(0, 10)
        if (!periods.includes(date)) {
          periods.push(date)
        }
        if (!periodData[date]) {
          periodData[date] = []
        }
        periodData[date].push({
          source: 'dgMarket',
          data: dgMarket,
        })
      }
      
      for (const tenderInfo of this.dataTenderImportStatistics.data.tenderInfo) {
        total += tenderInfo.total
        merge += tenderInfo.sameId
        merge += tenderInfo.titleBuyerBiddeadline
        sameId += tenderInfo.sameId
        titleBuyerBiddeadline += tenderInfo.titleBuyerBiddeadline
        let date = tenderInfo.fileSource.split('.')[0].split('Deepbloo_tenders-')[1]
        date = tenderInfo.creationDate.substring(0, 10)
        if (!periods.includes(date)) {
          periods.push(date)
        }
        if (!periodData[date]) {
          periodData[date] = []
        }
        periodData[date].push({
          source: 'tenderInfo',
          data: tenderInfo,
        })
      }
      periods.sort()
      periods = periods.reverse().slice(0, this.dayCount)
      periods.reverse()
      console.log(periodData)

      for (const period of periods) {
        const datas = periodData[period]
        const dgMarketTotal = datas
          .filter(a => a.source === 'dgMarket')
          .map(a => a.data.total)
          .reduce((prev, curr) => prev + curr, 0)
        const dgMarketExcluded = datas
          .filter(a => a.source === 'dgMarket')
          .map(a => a.data.excluded)
          .reduce((prev, curr) => prev + curr, 0)
        const tenderInfoTotal = datas
          .filter(a => a.source === 'tenderInfo')
          .map(a => a.data.total)
          .reduce((prev, curr) => prev + curr, 0)
        const tenderInfoExcluded = datas
          .filter(a => a.source === 'tenderInfo')
          .map(a => a.data.excluded)
          .reduce((prev, curr) => prev + curr, 0)
        this.chartStatistique.xAxis.categories.push(period)
        this.chartStatistique.series[0].data.push(dgMarketTotal)
        this.chartStatistique.series[1].data.push(dgMarketExcluded)
        this.chartStatistique.series[2].data.push(tenderInfoTotal)
        this.chartStatistique.series[3].data.push(tenderInfoExcluded)
      }

      this.chartMerge.series = [{
          type: 'pie',
          name: 'Merge tender',
          innerSize: '50%',
          data: [
              ['Unique', total - merge],
              ['Merge', merge],
          ]
      }]

      this.chartMergeMethode.series = [{
        name: 'Methode',
        colorByPoint: true,
        data: [{
          name: 'Same id',
          y: sameId,
          sliced: true,
          selected: true
        }, {
          name: 'Same title buyer biddeadline',
          y: titleBuyerBiddeadline
        }]
      }]
    },

    changeDayCount(dayCount) {
      this.dayCount = dayCount
      this.getStatistics()
    },
  }
};
</script>


<style>
@media screen and (max-width: 600px) {
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 0px 0px;
  }
  .content-grid2 {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 0px 0px;
  }
}
@media screen and (min-width: 600px) {
  .content-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    grid-gap: 0px 0px;
  }
  .content-grid2 {
    display: grid;
    grid-template-columns: 300px 1fr 1fr;
    grid-gap: 0px 0px;
  }
}
</style>
