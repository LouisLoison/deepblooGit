<template>
  <v-container>
    <v-row justify="space-around">
      <v-card
        v-if="!isSent"
        class="mt-5"
        width="600"
      >
        <v-card-text>
          <v-form
            v-model="sendInvitationValid"
            ref="sendInvitationForm"
            lazy-validation
          >
            <v-text-field
              v-model="firstname"
              label="First name*"
              :rules="notEmptyRules"
              required
            />

            <v-text-field
              v-model="lastname"
              label="Last name*"
              :rules="notEmptyRules"
              required
            />
            
            <v-text-field
              v-model="email"
              label="Invitee email*"
              :rules="notEmptyRules"
              required
            />

            <v-textarea
              v-model="message"
              label="This message will be sent to your invitee"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="sendInvitation()"
            :loading="loading"
            depressed
            color="primary"
          >
            Send invitation
          </v-btn>
        </v-card-actions>
        <div
          v-if="error"
          class="red--text"
        >
          {{ error }}
        </div>
      </v-card>

      <v-card
        v-else
        class="mt-5"
        width="400"
      >
        <v-card-text class="text-center">
          <v-icon
            color="green"
            style="font-size: 30px;"
          >
            fa-check
          </v-icon>
          <div>
            The invitation has been send
          </div>
        </v-card-text>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Invite',

  data: () => ({
    firstname: null,
    lastname: null,
    email: null,
    message: null,
    loading: false,
    error: null,
    isSent: false,
    sendInvitationValid: false,
    notEmptyRules: [v => !!v || 'Data is required'],
  }),

  methods: {
    async sendInvitation() {
      try {
        if (!this.$refs.sendInvitationForm.validate()) {
          return
        }
        this.loading = true
        const res = await this.$api.post('/Hivebrite/sendInvitation', {
          firstname: this.firstname,
          lastname: this.lastname,
          email: this.email,
          message: this.message,
        })
        if (!res.success) {
          this.error = res && res.data && res.data.errors ? res.data.errors : res.Error
          // throw new Error(res.Error)
        }
        this.isSent = true
      } catch (err) {
        this.$api.error(err, this)
      }
      this.loading = false
    },

    resetForm() {
      this.loading = false
    },
  },
}
</script>
