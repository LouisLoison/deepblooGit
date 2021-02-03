<template>
  <v-container fluid class="pt-0">
    <div v-if="!dataUserNotifys.loading" class="text-center">
      <div class="pa-2 grey--text">Loading...</div>
      <v-progress-circular :size="50" color="grey" indeterminate />
    </div>
    <div v-else style="overflow: auto;">
      <div class="userNotify-grid">
        <div class="pt-3">From</div>
        <div />
        <div class="pt-3">To</div>
        <div />
        <div class="pt-3">Tender</div>
        <div class="pt-3">Date</div>
      </div>
      <div
        v-for="(userNotify, index) in getUserNotifys"
        :key="`userNotify${index}`"
        class="userNotify-grid py-3 cursor-pointer"
        style="border-bottom: 1px solid #e0e0e0;"
        @click="openUserNotifyDialog(userNotify)"
      >
        <div class="subheading">
          <v-avatar size="30">
            <img :src="userNotify.userPhoto" alt="" />
          </v-avatar>
        </div>
        <div>
          <div>
            <a
              :href="`https://platform.deepbloo.com/users/${userNotify.userHivebriteId}`"
              target="_blank"
              style="cursor: pointer;"
            >
              {{ userNotify.userName }}
            </a>
          </div>
          <div>{{ userNotify.userEmail }}</div>
        </div>
        <div class="subheading">
          <v-avatar size="30">
            <img :src="userNotify.recipientPhoto" alt="" />
          </v-avatar>
        </div>
        <div>
          <div>
            <a
              :href="`https://platform.deepbloo.com/users/${userNotify.recipientHivebriteId}`"
              target="_blank"
              style="cursor: pointer;"
            >
              {{ userNotify.recipientName }}
            </a>
          </div>
          <div>{{ userNotify.recipientEmail }}</div>
        </div>
        <div>
          <a
            :href="`https://prod.deepbloo.com/#/tender?tenderId=${userNotify.tenderId}`"
            target="_blank"
            style="cursor: pointer;"
          >
            #{{ userNotify.tenderId }}
          </a>
          <div style="max-height: 40px; overflow: hidden;">
            {{ userNotify.tenderTitle }}
          </div>
        </div>
        <div>
          {{ moment(userNotify.creationDate).format("LL - LTS") }}
        </div>
      </div>
    </div>

    <!-- Dialog -->
  </v-container>
</template>

<script>
import Vue from 'vue'
import moment from 'moment'

export default {
  name: 'SettingUserNotify',

  data: () => ({
    moment,
    dataUserNotifys: {
      loading: null,
      data: null
    },
    filterLabel: '',
    filterWord: '',
    isUserNotifyDialog: false,
    userNotifyValid: null,
    userNotifyDialog: null,
    notEmptyRules: [v => !!v || 'Data is required'],
  }),

  computed: {
    getUserNotifys() {
      let userNotifys = this.dataUserNotifys.data;
      if (this.filterLabel && this.filterLabel.trim() !== '') {
        userNotifys = userNotifys.filter(a =>
          a.label.toUpperCase().includes(this.filterLabel.toUpperCase())
        )
      }
      return userNotifys
    },
  },

  mounted() {
    this.loadUserNotifys()
  },

  methods: {
    async loadUserNotifys() {
      try {
        this.dataUserNotifys.loading = 0
        const res = await this.$api.post('/User/userNotifyList', {
          userData: true,
          tenderData: true,
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataUserNotifys.data = res.data
        this.dataUserNotifys.loading = 1
      } catch (err) {
        this.dataUserNotifys.loading = -1
        this.$api.error(err, this)
      }
    },

    openUserNotifyDialog(userNotify) {
      this.userNotifyDialog = null
      if (userNotify) {
        this.userNotifyDialog = JSON.parse(JSON.stringify(userNotify))
      } else {
        this.userNotifyDialog = {
          title: ``,
          description: ``,
          image: ``,
          url: ``,
          priority: 0,
          status: 1,
          creationDate: new Date(),
        };
      }
      this.isUserNotifyDialog = true
      Vue.nextTick(() => {
        this.$refs.userNotifyForm.resetValidation()
      })
    },

    deleteUserNotify(userNotify) {
      this.dataUserNotifys.loading = 0
      this.$api
        .post("/UserNotify/Remove", { userNotifyId: userNotify.userNotifyId })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error)
          }
          this.loadUserNotifys()
          this.isUserNotifyDialog = false
        })
        .catch(err => {
          this.$api.error(err, this)
        })
    }
  }
};
</script>

<style>
.userNotify-grid {
  display: grid;
  grid-template-columns: 50px 200px 50px 200px 1fr 200px;
  grid-gap: 0px 10px;
}
.userNotify-grid:hover {
  background-color: #f5f5f5;
}
</style>
