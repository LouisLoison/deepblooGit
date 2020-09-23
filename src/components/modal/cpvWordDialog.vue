<template>
  <v-dialog
    v-model="isShowDialog"
    scrollable
    :max-width="!getIsMobile ? 600 : null"
    :fullscreen="getIsMobile"
    :hide-overlay="getIsMobile"
  >
    <v-card v-if="cpvWord">
      <v-toolbar dark dense color="blue-grey lighten-4 black--text">
        <div class="title">
          <span v-if="!cpvWord.cpvWordId">New CPV word</span>
          <span v-else>CPV word #{{ cpvWord.cpvWordId }}</span>
        </div>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon light @click="isShowDialog = false">
            <v-icon color="grey darken-2">
              close
            </v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-divider></v-divider>

      <v-card-text>
        <v-text-field
          v-model="cpvWord.word"
          label="Word"
          clearable
          :rules="notEmptyRules"
          required
        />
        <div>
          <span class="grey--text pr-2">Creation:</span>
          {{ moment(cpvWord.creationDate, "YYYY-MM-DD").format("LL") }}
        </div>
        <div>
          <span class="grey--text pr-2">Update:</span>
          {{ moment(cpvWord.updateDate, "YYYY-MM-DD").format("LL") }}
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" flat @click="addUpdate()">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";

export default {
  name: "CpvWordDialog",

  data: () => ({
    moment,
    isShowDialog: false,
    cpvWord: null,
    notEmptyRules: [v => !!v || "Data is required"]
  }),

  computed: {
    ...mapGetters(["getIsMobile"])
  },

  methods: {
    show(cpvWord) {
      this.cpvWord = cpvWord;
      this.isShowDialog = true;
      if (!cpvWord || !cpvWord.cpvWordId || cpvWord.cpvWordId === 0) {
        if (!cpvWord) {
          this.cpvWord = {};
        }
        return;
      }
      this.load();
    },

    async load() {
      try {
        const res = await this.$api.post("Cpv/CpvWord", {
          cpvWordId: this.cpvWord.cpvWordId
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        this.cpvWord = res.data;
      } catch (err) {
        this.$api.error(err, this);
      }
    },

    async addUpdate() {
      try {
        const res = await this.$api.post("/cpv/CpvWordAddUpdate", {
          cpvWord: this.cpvWord
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        this.isShowDialog = false;
        this.$emit("ModalUpdate");
      } catch (err) {
        this.$api.error(err, this);
      }
    }
  }
};
</script>
