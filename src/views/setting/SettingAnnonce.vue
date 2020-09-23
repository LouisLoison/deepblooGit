<template>
  <div>
    <div v-if="!dataAnnonces.loading" class="text-center">
      <div class="pa-2 grey--text">Loading...</div>
      <v-progress-circular :size="50" color="grey" indeterminate />
    </div>
    <div v-else style="overflow: auto;">
      <div class="annonce-grid">
        <div class="pt-3 text-center">Click</div>
        <div class="pt-3 text-center">Image</div>
        <div class="pt-3">Title</div>
        <div class="pt-3">Description</div>
        <div class="pt-3 text-center">URL</div>
        <div class="pt-3 text-center">Stat</div>
        <div class="pt-3 text-center">Active</div>
        <div>
          <v-btn @click="openAnnonceDialog()" icon small title="Add annonce">
            <v-icon>fa-plus</v-icon>
          </v-btn>
        </div>
      </div>
      <div
        v-for="(annonce, index) in getAnnonces"
        :key="`annonce${index}`"
        class="annonce-grid py-3 cursor-pointer"
        style="border-bottom: 1px solid #e0e0e0;"
        @click="openAnnonceDialog(annonce)"
      >
        <div>
          <v-btn fab dark small color="indigo">
            {{ annonce.clickCount }}
          </v-btn>
        </div>
        <div class="text-center">
          <v-avatar>
            <img :src="annonce.image" alt="" />
          </v-avatar>
        </div>
        <div class="subheading">
          {{ annonce.title }}
        </div>
        <div style="max-height: 100px; overflow-y: hidden; min-width: 100px;">
          {{ annonce.description }}
        </div>
        <div>
          <v-btn
            v-if="annonce.url"
            :href="annonce.url"
            target="_blank"
            @click.stop
          >
            link
            <v-icon class="ml-2">fa-external-link</v-icon>
          </v-btn>
        </div>
        <div>
          <v-btn
            @click.stop="$refs.AnnonceDialog.show(annonce.annonceId)"
            icon
            title="Statistics"
          >
            <v-icon>fa-chart-bar</v-icon>
          </v-btn>
        </div>
        <div class="text-center display-1">
          <v-icon v-if="annonce.status === 1" class="green--text"
            >fa-check</v-icon
          >
          <v-icon v-else class="red--text">fa-ban</v-icon>
        </div>
        <div>
          <v-btn
            icon
            class="red--text"
            title="Delete annonce"
            @click="deleteAnnonce(annonce)"
          >
            <v-icon>fa-trash</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <AnnonceDialog ref="AnnonceDialog" />

    <v-dialog
      v-if="isAnnonceDialog && annonceDialog"
      v-model="isAnnonceDialog"
      scrollable
      :max-width="!getIsMobile ? '500px' : null"
      :fullscreen="getIsMobile"
      :hide-overlay="getIsMobile"
    >
      <v-card class="text-center">
        <v-toolbar dark dense color="blue-grey lighten-4 black--text">
          <div class="title">
            <span v-if="!annonceDialog.annonceId">New annonce</span>
            <span v-else>Annonce #{{ annonceDialog.annonceId }}</span>
          </div>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon light @click="annonceDialog = false">
              <v-icon color="grey darken-2" style="font-size: 30px;">
                fa-times
              </v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text v-if="annonceDialog">
          <v-form v-model="annonceValid" ref="annonceForm" lazy-validation>
            <v-layout row wrap>
              <v-flex xs12 class="text-xs-right">
                Status
                <v-switch
                  v-model="annonceDialog.status"
                  color="green"
                  style="display: inline-block;"
                />
              </v-flex>
            </v-layout>
            <v-img>
              <img
                :src="annonceDialog.image"
                alt=""
                max-height="100px"
                width="300px"
              />
            </v-img>
            <v-text-field
              v-model="annonceDialog.image"
              label="Image"
              clearable
              :rules="notEmptyRules"
              required
            />
            <v-text-field
              v-model="annonceDialog.url"
              label="URL"
              clearable
              :rules="notEmptyRules"
              required
            />
            <v-text-field
              v-model="annonceDialog.title"
              label="Title"
              clearable
              :rules="notEmptyRules"
              required
            />
            <v-textarea
              v-model="annonceDialog.description"
              label="Description"
              auto-grow
              counter="255"
              :rules="notEmptyRules"
              required
            />
            <v-text-field
              v-model="annonceDialog.priority"
              label="Priority"
              clearable
            />
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="updateAnnonceDialog()">
            <span v-if="!annonceDialog.annonceId">Add</span>
            <span v-else>Save</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Vue from 'vue'
import moment from 'moment'
import AnnonceDialog from '@/components/modal/AnnonceDialog'

export default {
  name: 'SettingAnnonce',

  components: {
    AnnonceDialog,
  },

  data: () => ({
    moment,
    dataAnnonces: {
      loading: null,
      data: null
    },
    filterLabel: "",
    filterWord: "",
    isAnnonceDialog: false,
    annonceValid: null,
    annonceDialog: null,
    isWordAddDialog: false,
    wordAddDialog: null,
    wordAdd: null,
    wordAddValid: null,
    wordAddRules: [],
    notEmptyRules: [v => !!v || "Data is required"]
  }),

  computed: {
    ...mapGetters(["getIsMobile"]),

    getAnnonces() {
      let annonces = this.dataAnnonces.data;
      if (this.filterLabel && this.filterLabel.trim() !== "") {
        annonces = annonces.filter(a =>
          a.label.toUpperCase().includes(this.filterLabel.toUpperCase())
        );
      }
      return annonces;
    }
  },

  mounted() {
    this.wordAddRules = [
      v => !!v || "Data is required",
      v =>
        !this.annonceDialog.words.find(
          a => a && v && a.toUpperCase() === v.toUpperCase().trim()
        ) || "Word already exist"
    ];
    this.loadAnnonces();
  },

  methods: {
    async loadAnnonces() {
      try {
        this.dataAnnonces.loading = 0;
        const res = await this.$api.post("/Annonce/List");
        if (!res.success) {
          throw new Error(res.Error);
        }
        this.dataAnnonces.data = res.data;
        this.dataAnnonces.loading = 1;
      } catch (err) {
        this.dataAnnonces.loading = -1;
        this.$api.error(err, this);
      }
    },

    openAnnonceDialog(annonce) {
      this.annonceDialog = null;
      if (annonce) {
        this.annonceDialog = JSON.parse(JSON.stringify(annonce));
      } else {
        this.annonceDialog = {
          title: ``,
          description: ``,
          image: ``,
          url: ``,
          priority: 0,
          status: 1,
          creationDate: new Date()
        };
      }
      this.isAnnonceDialog = true;
      Vue.nextTick(() => {
        this.$refs.annonceForm.resetValidation();
      });
    },

    updateAnnonceDialog() {
      this.dataAnnonces.loading = 0;
      this.annonceDialog.updateDate = new Date();
      this.$api
        .post("/Annonce/AddUpdate", { annonce: this.annonceDialog })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.loadAnnonces();
          this.isAnnonceDialog = false;
        })
        .catch(err => {
          this.$api.error(err, this);
        });
    },

    deleteAnnonce(annonce) {
      this.dataAnnonces.loading = 0;
      this.$api
        .post("/Annonce/Remove", { annonceId: annonce.annonceId })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.loadAnnonces();
          this.isAnnonceDialog = false;
        })
        .catch(err => {
          this.$api.error(err, this);
        });
    }
  }
};
</script>

<style>
@media screen and (max-width: 600px) {
  .annonce-grid {
    display: grid;
    grid-template-columns: 40px 70px 1fr 2fr 100px 50px 50px 50px;
    grid-gap: 0px 2px;
  }
}
@media screen and (min-width: 600px) {
  .annonce-grid {
    display: grid;
    grid-template-columns: 70px 100px 1fr 2fr 100px 50px 50px 50px;
    grid-gap: 0px 2px;
  }
}

.annonce-grid:hover {
  background-color: #f5f5f5;
}
</style>
