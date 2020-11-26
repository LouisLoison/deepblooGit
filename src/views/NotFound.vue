<template>
  <v-app id="404">
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <div class="text-center">
          <h1>404</h1>
          <h2 class="my-3 headline ">Sorry, page not found</h2>
          <div>
            <v-btn
              :to="{ name: 'Tenders' }"
              color="primary"
            >Go Home</v-btn>
          </div>
        </div>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: "NotFound",
}
</script>

<style scoped lang="css">
h1 {
  font-size: 150px;
  line-height: 150px;
  font-weight: 700;
  color: #252932;
  text-shadow: rgba(61, 61, 61, 0.3) 1px 1px, rgba(61, 61, 61, 0.2) 2px 2px, rgba(61, 61, 61, 0.3) 3px 3px;
}
</style>
