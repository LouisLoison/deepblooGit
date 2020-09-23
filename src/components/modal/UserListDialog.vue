<template>
  <v-dialog v-model="isShowDialog" max-width="400">
    <v-card>
      <v-toolbar dark color="blue-grey">
        <v-toolbar-title>Users</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon dark @click="isShowDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-divider></v-divider>

      <v-card-text>
        <div v-if="!users" class="pa-5 text-center">
          <div class="pa-2 grey--text">
            Please wait...
          </div>
          <v-progress-circular :size="50" color="grey" indeterminate />
        </div>
        <div v-else-if="users && users.length">
          <v-list two-line>
            <template v-for="(user, index) of users">
              <v-list-tile
                :key="`users${index}`"
                avatar
                :href="`https://platform.deepbloo.com/users/${user.hivebriteId}`"
                target="_blank"
                @click.stop
              >
                <v-list-tile-avatar>
                  <img :src="user.photo" />
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title v-html="user.username" />
                  <v-list-tile-sub-title>
                    {{ moment(user.creationDate).format("LL - LTS") }}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </div>
        <div v-else class="pa-5 text-center">
          <div class="pa-2 grey--text">
            No data...
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
  name: "UserListDialog",

  data: () => ({
    moment,
    users: null,
    isShowDialog: false
  }),

  computed: {
    ...mapGetters(["getIsMobile"])
  },

  methods: {
    show(users) {
      this.users = users;
      this.isShowDialog = true;
    }
  }
};
</script>
