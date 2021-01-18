<template>
  <v-dialog
    v-model="isShowDialog"
    :scrollable="getIsMobile"
    max-width="900"
  >
    <v-card>
      <v-card-text v-if="users" class="pa-0">
        <div class="content-grid">
          <div v-if="userTabs" class="box-member">
            <v-tabs
              v-model="userTab"
              @change="initUsers()"
              fixed-tabs
            >
              <v-tab
                v-for="(userTab, index) in userTabs"
                :key="`userTab${index}}`"
                color="primary"
                style="font-size: 10px;"
              >
                {{ userTab.label }}
              </v-tab>
            </v-tabs>

            <div class="px-3">
              <v-text-field
                label="Search"
                v-model="userSearch"
                :append-icon="'fa-search'"
                clearable
              />
            </div>

            <div
              class="card-member px-2"
              style="overflow: auto;"
            >
              <div v-if="userTab === 1 && !userAlls" class="py-5 text-center">
                <div class="grey--text">Loading...</div>
                <v-progress-circular :size="50" color="grey" indeterminate />
              </div>
              <div v-else-if="!getUsers || !getUsers.length" class="py-5 text-center">
                No users
              </div>
              <v-list v-else two-line>
                <template v-for="(item, index) in getUsers.slice(0, 100)">
                  <v-subheader v-if="item.header" :key="`itemHeader${index}`">
                    {{ item.header }}
                  </v-subheader>

                  <v-divider
                    v-else-if="item.divider"
                    :key="`itemDivider${index}`"
                    :inset="item.inset"
                  />

                  <v-list-item
                    v-else
                    :key="`item${index}`"
                    @click.stop="item.select = !item.select"
                    class="pa-0"
                  >
                    <v-list-item-action @click.stop class="mr-2">
                      <v-checkbox dense v-model="item.select" />
                    </v-list-item-action>

                    <v-list-item-content class="text-left">
                      <v-list-item-title v-html="item.title" />
                      <v-list-item-subtitle v-html="item.subtitle" />
                    </v-list-item-content>

                    <v-list-item-avatar>
                      <v-img :src="item.avatar" />
                    </v-list-item-avatar>
                  </v-list-item>
                </template>
              </v-list>
            </div>
          </div>
          <div
            class="pa-3 text-left card-email"
            style="overflow: auto;"
          >
            <div class="grey--text caption">
              To *
            </div>
            <div v-if="users && users.find(a => a.select)" class="pb-2">
              <v-chip
                v-for="(user, index) in users.filter(a => a.select)"
                :key="`user${index}`"
                @input="user.select = false"
                pill
                close
                class="mr-1 mb-1"
              >
                <v-avatar left color="red">
                  <img :src="user.avatar" />
                </v-avatar>
                {{ user.title }}
              </v-chip>
            </div>
            <div v-else class="grey--text">
              <div v-if="!emails.length">
                No user selected or email enter
              </div>
            </div>
            <div>
              <v-chip
                v-for="(emailTemp, index) in emails"
                :key="`emailTemp${index}`"
                @input="removeEmail(emailTemp)"
                pill
                close
                class="mr-1 mb-1"
              >
                {{ emailTemp }}
              </v-chip>
            </div>
            <div class="grey--text pb-3">
              <v-btn
                small
                text
                color="grey"
                @click="
                  email = '';
                  dialogInsufficientRight = true;
                "
              >
                <v-icon dark class="pr-1" style="font-size: 10px;">fa-plus</v-icon>
                Add an email
              </v-btn>
            </div>
            <v-text-field
              label="Subject *"
              v-model="subject"
              :rules="notEmptyRules"
              required
            />

            <div class="py-3">
              <v-textarea
                label="Body *"
                v-model="body"
                :rules="notEmptyRules"
                auto-grow
              />
            </div>
            <div class="grey--text caption">
              Footer
            </div>
            <div
              v-html="footerHtml.trim().replace(/(?:\r\n|\r|\n)/g, '<br>')"
            ></div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          small
          color="primary"
          @click="notifyUser()"
          :disabled="
            (!users || !users.find(a => a.select)) &&
              (!emails || !emails.length)
          "
        >
          Send notification
        </v-btn>
        <v-btn text small color="primary" @click="isShowDialog = false">
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog
      v-if="dialogInsufficientRight"
      v-model="dialogInsufficientRight"
      max-width="400"
    >
      <v-card>
        <v-card-title class="headline pb-0">
          Email
        </v-card-title>

        <v-card-text class="text-center pt-0">
          <v-text-field
            v-model="email"
            :append-icon="'fa-envelope'"
            clearable
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" text @click="addEmail()">
            add
          </v-btn>
          <v-btn
            color="grey darken-1"
            text
            @click="dialogInsufficientRight = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import Fuse from 'fuse.js'

export default {
  name: 'SentEmailDialog',

  data: () => ({
    moment,
    isShowDialog: false,
    userTab: null,
    userTabs: null,
    users: null,
    userAlls: null,
    userSearch: '',
    subject: '',
    body: '',
    footerHtml: '',
    emails: [],
    email: '',
    tenderId: null,
    dialogInsufficientRight: false,
    notEmptyRules: [v => !!v || 'Data is required']
  }),

  computed: {
    ...mapGetters([
      'getIsMobile',
      'getUserId',
      'getDataOpportunity',
    ]),

    getColleagues() {
      if (
        !this.getUserId ||
        !this.getDataOpportunity ||
        !this.getDataOpportunity.data ||
        !this.getDataOpportunity.data.organization ||
        !this.getDataOpportunity.data.organization.users
      ) {
        return null
      }
      return this.getDataOpportunity.data.organization.users.filter(a => a.userId !== this.getUserId)
    },

    getUsers() {
      this.users;
      if (!this.userSearch || this.userSearch.trim() === '') {
        return this.users
      }
      const options = {
        threshold: 0.1,
        location: 0,
        distance: 300,
        maxPatternLength: 32,
        findAllMatches: true,
        keys: ['title', 'subtitle']
      }
      const fuse = new Fuse(this.users, options)
      return fuse.search(this.userSearch.trim())
    }
  },

  methods: {
    show(subject, body, footerHtml, tenderId) {
      if (this.getColleagues) {
        this.userTab = 1
        this.userTabs = [
          { id: 1, label: 'Colleagues' },
          { id: 2, label: 'Deepbloo members' }
        ]
      } else {
        this.userTab = 2
        this.userTabs = [{ id: 2, label: 'Deepbloo members' }]
      }
      this.subject = subject
      this.body = body
      this.footerHtml = footerHtml
      this.emails = []
      this.email = ''
      this.tenderId = tenderId
      this.isShowDialog = true
      this.initUsers()
    },

    async initUsers() {
      try {
        this.users = []
        if (!this.userTab) {
          if (this.getColleagues) {
            for (const user of this.getColleagues) {
              this.users.push({
                userId: user.userId,
                select: false,
                title: user.username,
                subtitle: user.email,
                avatar: user.photo
              })
            }
          }
        } else {
          if (!this.userAlls) {
            const res = await this.$api.post('/User/List')
            this.userAlls = res.data
          }
          for (const user of this.userAlls) {
            this.users.push({
              userId: user.userId,
              select: false,
              title: user.username,
              subtitle: user.email,
              avatar: user.photo
            })
          }
        }
      } catch (err) {
        this.$api.error(err, this)
      }
    },

    addEmail() {
      this.emails.push(this.email)
      this.dialogInsufficientRight = false
    },

    removeEmail(email) {
      this.emails = this.emails.filter(a => a !== email)
    },

    async notifyUser() {
      this.isShowDialog = false
      const userIds = this.users.filter(a => a.select).map(a => a.userId)
      try {
        const res = await this.$api.post('/User/Notify', {
          userIds: userIds,
          emails: this.emails.length ? this.emails : undefined,
          subject: this.subject,
          body: this.body,
          footerHtml: this.footerHtml,
          tenderId: this.tenderId
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.$emit('notifySent')
      } catch (err) {
        this.$api.error(err, this)
      }
    }
  }
};
</script>

<style scope>
@media screen and (max-width: 600px) {
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 0px 0px;
  }

  .box-member {
    padding-bottom: 10px;
    border-bottom: 1px solid #e0e0e0;
  }

  .card-member {
    min-height: 200px;
    max-height: 200px;
  }
}
@media screen and (min-width: 600px) {
  .content-grid {
    display: grid;
    grid-template-columns: 380px 1fr;
    grid-gap: 0px 0px;
  }

  .box-member {
    border-right: 1px solid #e0e0e0;
  }

  .card-member {
    min-height: 500px;
    max-height: 500px;
  }

  .card-email {
    min-height: 616px;
    max-height: 616px;
  }
}
</style>
