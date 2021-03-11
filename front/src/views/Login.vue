<template>
  <v-app id="login" class="blue-grey darken-2">
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4 lg4>
            <div class="text-center">
              <img
                src="/static/image/deepbloo-original.png"
                alt="DeepBloo"
                width="300"
              />
            </div>
            <v-card class="elevation-1 pa-3">
              <v-card-text>
                <v-form v-model="valid">
                  <v-text-field
                    append-icon="fa-user"
                    name="login"
                    label="Login"
                    type="text"
                    v-model="username"
                    :rules="[v => !!v || 'Data is required']"
                  />
                  <v-text-field
                    append-icon="fa-lock"
                    name="password"
                    label="Password"
                    id="password"
                    type="password"
                    v-model="password"
                    :rules="[v => !!v || 'Data is required']"
                  />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  block
                  color="blue-grey lighten-4"
                  @click="login()"
                  :loading="loading"
                  :disabled="!valid"
                >
                  Login
                </v-btn>
              </v-card-actions>
              <v-alert
                :value="error"
                color="error"
                icon="fa-exclamation"
                outlined
                dense
                transition="scale-transition"
              >
                The username or password you entered is incorrect.
              </v-alert>
            </v-card>
            <div class="text-center">
              <v-btn
                :to="{ name: 'Tenders' }"
                color="grey darken-1"
                text
                style="font-weight: 400; font-size: 10px; color: #b7b7b7 !important;"
              >
                Back to tenders
              </v-btn>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Login',

  data: () => ({
    valid: false,
    loading: false,
    error: false,
    username: null,
    password: null,
    redirect: null,
  }),

  mounted() {
    if (this.$route.params) {
      this.username = this.$route.params.email
      this.password = this.$route.params.password
      this.redirect = this.$route.params.redirect
    }
  },

  methods: {
    ...mapActions('defaultStore', [
      'loadUser',
    ]),

    login() {
      this.loading = true
      this.error = false
      this.$api
        .post('/User/Login', {
          username: this.username,
          password: this.password,
        })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error)
          }
          this.loadUser({
            userId: res.user.userId,
            hivebriteId: res.user.hivebriteId,
            type: res.user.type,
            email: res.user.email,
            username: res.user.username,
            password: this.password,
            photo: res.user.photo,
            token: res.token,
          })
          this.$api.init()
          if (this.redirect) {
            this.$router.push({ name: this.redirect })
          } else {
            this.$router.push({ name: 'Tenders' })
          }
        })
        .catch(err => {
          this.loading = false
          this.error = true
          console.log(err)
        })
    }
  },
}
</script>

<style scoped lang="css">
#login {
  height: 50%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  content: "";
  z-index: 0;
}
</style>
