<template>
  <v-app id="setting" class="grey lighten-5 pa-4">
    <v-expansion-panels
      class="my-5"
      focusable
      multiple
      hover
    >
      <v-expansion-panel>
        <v-expansion-panel-header>Users last connexion</v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="text-right pt-3">
            <v-btn
              @click="loadUsers()"
              title="Refresh"
              small
            >
              <v-icon size="14" class="pr-2">fa-refresh</v-icon>
              Check
            </v-btn>            
          </div>
          <highcharts
            v-if="dataUsers.loading === 1"
            :options="chartStatistique"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>Process</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-btn
            rounded
            color="blue-grey lighten-5"
            @click="runFtpGet()"
            title="Execute check"
          >
            FtpGet
          </v-btn>
          <v-btn
            rounded
            color="blue-grey lighten-5"
            @click="runBddImport()"
            title="Execute check"
          >
            BddImport
          </v-btn>
          <v-btn
            rounded
            color="blue-grey lighten-5"
            @click="runTendersImport()"
            title="Execute check"
          >
            TendersImport
          </v-btn>
          <v-btn
            rounded
            color="blue-grey lighten-5"
            @click="runTendersPurge()"
            title="Execute check"
          >
            TendersPurge
          </v-btn>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>Schema</v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="text-right pt-3">
            <v-btn
              @click="getSchemaCheck()"
              title="Execute check"
              small
            >
              <v-icon size="14" class="pr-2">fa-refresh</v-icon>
              Check
            </v-btn>            
          </div>
          <div>
            <div v-if="dataSchemaCheck.loading === 0" class="pa-5 text-center">
              <div class="pa-2 grey--text">Loading...</div>
              <v-progress-circular :size="50" color="grey" indeterminate />
            </div>
            <div
              v-else-if="dataSchemaCheck.loading === -1"
              class="pa-5 text-center"
            >
              <v-icon class="red--text">error</v-icon>
              <div class="pa-2 red--text">Error while loading data</div>
              <div class="pa-2 red--text">{{ dataSchemaCheck.errorMessage }}</div>
            </div>
            <div
              v-else-if="!dataSchemaCheck.CheckResult"
              class="pa-5 text-center"
            >
              <div class="pa-2 grey--text">Aucune vérification effectuée</div>
            </div>
            <div v-else>
              <v-expansion-panels
                v-model="expansionPanel"
                multiple
                class="mt-3"
              >
                <v-expansion-panel
                  v-for="(Bdd, index1) of dataSchemaCheck.CheckResult.BddList"
                  :key="`Bdd${index1}`"
                >
                  <v-expansion-panel-header>
                    <div>
                      <v-icon
                        v-if="Bdd.ErrorFlg"
                        color="red"
                        class="pr-2"
                      >fa-times-circle</v-icon>
                      <v-icon
                        v-else
                        color="green"
                        class="pr-2"
                      >fa-check-circle</v-icon>
                      <v-icon>fa-database</v-icon>
                      {{ Bdd.Name }}
                    </div>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <div
                      v-if="Bdd.Error"
                      class="pa-5 text-center"
                    >
                      <v-icon class="red--text">error</v-icon>
                      <div class="pa-2 red--text">Error while loading data</div>
                      <div class="pa-2 red--text">{{ Bdd.Error }}</div>
                    </div>
                    <v-expansion-panels
                      v-else
                      v-model="Bdd.panels"
                      multiple
                      class="mt-3"
                    >
                      <v-expansion-panel
                        v-for="(Table, index2) of Bdd.TableList"
                        :key="`Table${index2}`"
                      >
                        <v-expansion-panel-header>
                          <div>
                            <v-icon
                              v-if="Table.Error && Table.Error !== ''"
                              color="red"
                              class="pr-2"
                            >fa-ban</v-icon>
                            <v-icon
                              v-else-if="Table.ColumnList && Table.ColumnList.length"
                              color="red"
                              class="pr-2"
                            >fa-times-circle</v-icon>
                            <v-icon
                              v-else
                              color="green"
                              class="pr-2"
                            >fa-check-circle</v-icon>
                            <v-icon>fa-table</v-icon>
                            {{ Table.TableName }}
                            <v-chip
                              v-if="Table.ColumnList && Table.ColumnList.length"
                              small
                              dark
                              color="red"
                              class="ml-2"
                            >
                              {{ Table.ColumnList.length }}
                            </v-chip>
                          </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <div
                            v-if="Table.Error && Table.Error !== ''"
                            style="color: #FF0000;"
                          >
                            <table
                              class="table table-sm table-hover table-striped is-indent"
                              data-plugin="animateList"
                              data-animate="fade"
                              data-child="tr"
                              data-selectable="selectable"
                            >
                              <tbody style="background-color: #FFFFFF;">
                                <tr style="cursor: pointer;">
                                  <td style="width: 100%; color: #FF0000;">
                                    {{ Table.Error }}
                                  </td>
                                  <td style="width: 50px;">
                                    <v-btn
                                      @click="TableScriptSql(Bdd.Name, Table)"
                                      title="Script SQL"
                                      small
                                      class="ma-1"
                                    >
                                      <v-icon
                                        size="14"
                                        class="pr-2"
                                      >fa-file-code-o</v-icon>
                                      SQL
                                    </v-btn>
                                  </td>
                                  <td style="width: 50px;">
                                    <v-btn
                                      @click="TableAdd(Bdd.Name, Table)"
                                      title="Ajouter la table en BDD"
                                      small
                                      class="ma-1"
                                    >
                                      <v-icon
                                        size="14"
                                        class="pr-2"
                                      >fa-plus</v-icon
                                      >
                                      Ajouter
                                    </v-btn>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div
                            v-else-if="
                              !Table.ColumnList || Table.ColumnList.length === 0
                            "
                            style="color: #46be8a;"
                          >
                            Schema valide
                          </div>
                          <div v-else>
                            <table
                              class="table table-sm table-hover table-striped is-indent"
                              data-plugin="animateList"
                              data-animate="fade"
                              data-child="tr"
                              data-selectable="selectable"
                            >
                              <tbody style="background-color: #FFFFFF;">
                                <tr
                                  v-for="Column in Table.ColumnList"
                                  :key="Column.ColumnName"
                                  style="cursor: pointer;"
                                >
                                  <td>{{ Column.ColumnName }}</td>
                                  <td style="width: 100%; color: #FF0000;">
                                    {{ Column.Error }}
                                  </td>
                                  <td style="width: 50px;">
                                    <v-btn
                                      @click="ColumnScriptSql(Bdd.Name, Table.TableName, Column)"
                                      title="Script SQL"
                                      small
                                      class="ma-1"
                                    >
                                      <v-icon
                                        size="14"
                                        class="pr-2"
                                      >fa-file-code-o</v-icon>
                                      SQL
                                    </v-btn>
                                  </td>
                                  <td style="width: 50px;">
                                    <v-btn
                                      @click="ColumnAdd(Bdd.Name, Table.TableName, Column)"
                                      title="Ajouter la colonne en BDD"
                                      small
                                      class="ma-1"
                                    >
                                      <v-icon
                                        size="14"
                                        class="pr-2"
                                      >fa-plus</v-icon>
                                      Ajouter
                                    </v-btn>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Dialog -->
    <UserListDialog ref="UserListDialog" />
  </v-app>
</template>

<script>
import moment from 'moment'
import UserListDialog from '@/components/modal/UserListDialog'

export default {
  name: "SettingOther",

  components: {
    UserListDialog
  },

  data: () => ({
    moment,
    Environnement: "prod",
    dataSchemaCheck: {
      loading: 1,
      errorMessage: "",
      CheckResult: null
    },
    expansionPanel: null,
    dataUsers: {
      loading: null,
      error: null,
      data: null
    },
    chartStatistique: {
      chart: {
        type: "column",
        plotBorderWidth: 1,
        zoomType: "xy",
        height: 600
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
        pointFormat: "{series.name}: {point.y}<br/>Total: {point.stackTotal}"
      },
      plotOptions: {
        column: {
          cursor: "pointer",
          stacking: "normal",
          dataLabels: {
            enabled: true
          }
        }
      },
      series: []
    }
  }),

  computed: {},

  mounted() {
    this.loadUsers();
  },

  methods: {
    loadUsers() {
      this.dataUsers.loading = 0;
      let filter = {
        hasConnexionTender: true
      };
      this.$api
        .post("/User/List", { filter })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.dataUsers.data = res.data;
          this.initUserConnexionGraph();
          this.dataUsers.loading = 1;
        })
        .catch(err => {
          this.dataUsers.loading = -1;
          this.dataUsers.error = err;
          this.$api.error(err, this);
        });
    },

    initUserConnexionGraph() {
      const typeLabels = [
        {
          type: 1,
          name: "Admin",
          color: "#434348"
        },
        {
          type: 2,
          name: "Premium",
          color: "#7cb5ec"
        },
        {
          type: 3,
          name: "Public",
          color: "#f7a35c"
        },
        {
          type: 4,
          name: "Business",
          color: "#90ed7d"
        },
        {
          type: 5,
          name: "Free",
          color: "#f7a35c"
        }
      ];
      const userTypes = [];
      const periods = [];
      for (const data of this.dataUsers.data) {
        if (!userTypes.includes(data.type)) {
          userTypes.push(data.type);
        }
        let date = null;
        if (data.connexionTender && data.connexionTender.trim() !== "") {
          date = data.connexionTender.substring(0, 10);
        }
        if (!date || periods.includes(date)) {
          continue;
        }
        let period = periods.find(a => a.date === date);
        if (!period) {
          period = {
            date,
            types: []
          };
          periods.push(period);
        }
        let type = period.types.find(a => a.type === data.type);
        if (!type) {
          type = {
            type: data.type,
            users: []
          };
          period.types.push(type);
        }
        type.users.push(data);
      }
      periods.sort((a, b) => {
        let na = a.date;
        let nb = b.date;
        return na < nb ? -1 : na > nb ? 1 : 0;
      });
      this.chartStatistique.xAxis.categories = periods.map(a => a.date);
      this.chartStatistique.series = [];
      for (const userType of userTypes) {
        const serie = {
          name: userType,
          data: []
        };
        const typeLabel = typeLabels.find(a => a.type === userType);
        if (typeLabel) {
          serie.userType = typeLabel.type;
          serie.name = typeLabel.name;
          serie.color = typeLabel.color;
        }
        for (const period of periods) {
          let users = [];
          const type = period.types.find(a => a.type === userType);
          if (type) {
            users = type.users;
          }
          serie.data.push(users.length);
        }
        serie.events = {
          click: event => {
            console.log(event);
            // this.openTenderOrganization(event.point.tenderOrganization);
            const date = event.point.category;
            const userType = event.point.series.userOptions.userType;
            const period = periods.find(a => a.date === date);
            if (period) {
              const type = period.types.find(a => a.type === userType);
              if (type) {
                this.$refs.UserListDialog.show(type.users);
              }
            }
          }
        };
        this.chartStatistique.series.push(serie);
      }
    },

    getSchemaCheck() {
      this.dataSchemaCheck.loading = 0;
      this.$api
        .post("/Setting/SchemaCheck", {
          Environnement: this.Environnement
        })
        .then(res => {
          // console.log('/Setting/SchemaCheck')
          // console.log(res)
          if (!res.success) {
            throw new Error(res.Error);
          }
          for (let Bdd of res.CheckResult.BddList) {
            Bdd.TableList.sort((a, b) => {
              let na = a.TableName.toLowerCase();
              let nb = b.TableName.toLowerCase();
              return na < nb ? -1 : na > nb ? 1 : 0;
            });
          }
          this.dataSchemaCheck.CheckResult = res.CheckResult;
          this.dataSchemaCheck.loading = 1;
          this.expansionPanel = [1];
        })
        .catch(err => {
          console.log(err);
          this.dataSchemaCheck.loading = -1;
          this.dataSchemaCheck.errorMessage = "[" + err + "]";
          this.$api.error(err, this);
        });
    },

    TableScriptSql(BddName, Table) {
      this.$api
        .post("/Setting/TableScriptSql", {
          Environnement: this.Environnement,
          BddName: BddName,
          TableName: Table.TableName
        })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.$refs.ScriptModal.ModalOpen("text/x-sql", res.ScriptSql);
        })
        .catch(err => {
          this.$api.error(err, this);
        });
    },

    TableAdd(BddName, Table) {
      this.dataSchemaCheck.loading = 0;
      this.$api
        .post("/Setting/TableAddBdd", {
          Environnement: this.Environnement,
          BddName: BddName,
          TableName: Table.TableName
        })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.getSchemaCheck();
        })
        .catch(err => {
          this.$api.error(err, this);
        });
    },

    ColumnScriptSql(BddName, TableName, Column) {
      this.$api
        .post("/Setting/ColumnScriptSql", {
          Environnement: this.Environnement,
          BddName: BddName,
          TableName: TableName,
          ColumnName: Column.ColumnName
        })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.$refs.ScriptModal.ModalOpen("text/x-sql", res.ScriptSql);
        })
        .catch(err => {
          this.$api.error(err, this);
        });
    },

    ColumnAdd(BddName, TableName, Column) {
      this.dataSchemaCheck.loading = 0;
      this.$api
        .post("/Setting/ColumnAddBdd", {
          Environnement: this.Environnement,
          BddName: BddName,
          TableName: TableName,
          ColumnName: Column.ColumnName
        })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.getSchemaCheck();
        })
        .catch(err => {
          this.$api.error(err, this);
        });
    },

    runFtpGet() {
      this.$api
        .post("/DgMarket/FtpGet")
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          console.log("runFtpGet");
          console.log(res);
        })
        .catch(err => {
          this.$api.error(err, this);
        });
    },

    runBddImport() {
      this.$api
        .post("/DgMarket/BddImport")
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          console.log("runBddImport");
          console.log(res);
        })
        .catch(err => {
          this.$api.error(err, this);
        });
    },

    runTendersImport() {
      this.$api
        .post("/Algolia/TendersImport")
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          console.log("runTendersImport");
          console.log(res);
        })
        .catch(err => {
          this.$api.error(err, this);
        });
    },

    runTendersPurge() {
      this.$api
        .post("/Algolia/TendersPurge")
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          console.log("runTendersPurge");
          console.log(res);
        })
        .catch(err => {
          this.$api.error(err, this);
        });
    }
  }
};
</script>

<style></style>
