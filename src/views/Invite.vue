<template>
  <v-container>
    <v-row justify="space-around">
      <v-card
        class="mt-5"
        width="600"
      >
        <v-card-text>
          <v-text-field
            label="First name"
          />

          <v-text-field
            label="Last name"
          />
          
          <v-text-field
            label="Invitee email"
          />

          <v-textarea
            label="This message will be sent to your invitee"
          />

          <v-card-actions>
            <v-spacer />
            <v-btn
              depressed
              color="primary"
            >
              Send invitation
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Invite',
}
</script>
