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
          <div v-if="1 === 2" class="pt-5">
            <svg
              width="600"
              height="600"
              viewBox="0 0 600 600"
            >
              <rect
                x="300"
                y="300"
                width="50"
                height="50"
                fill="#00ff00"
              />
              <g transform="translate(300, 300) rotate(45 25 25)">
                <rect
                  x="0"
                  y="0"
                  width="50"
                  height="50"
                  fill="#ffff00"
                />
              </g>
            </svg>
          </div>
        </div>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: 'NotFound',

  mounted() {
    const point1 = {
      x: 20,
      y: 10,
    }
    const point2 = {
      x: 40,
      y: 40,
    }
    const radians = Math.atan2(point1.x - point2.x, point1.y - point2.y)
    const degree = (radians * (180 / Math.PI) * -1) + 180
    console.log('-- mounted')
    console.log(degree)
  },
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
