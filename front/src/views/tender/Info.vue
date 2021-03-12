<template>
  <v-app id="add" class="grey lighten-5 pa-5" style="font-size: 18px;">
    <v-btn
      :to="{ name: 'Tenders' }"
      fixed
      top
      right
      fab
      small
      dark
      color="blue-grey lighten-1"
      style="opacity: 0.8;"
      title="Back"
    >
      <v-icon>close</v-icon>
    </v-btn>

    <div class="text-center">
      <h1 class="blue--text text--darken-2">How does it work ?</h1>
      <h1 class="blue--text text--darken-2">FAQ</h1>
    </div>
    <br />
    <br />
    <br />
    <h2 class="blue--text text--darken-1 pt-4">
      How do our system works and how do we source tenders ?
    </h2>
    <br />
    Our system works with different algorithms. Basically:<br />
    <ul>
      <li>
        Our engine collect all energy-related tenders from thousands of
        organizations working in the energy industry
      </li>
      <li>
        Our engine collect as well other tenders which are not specifically
        related to energy such as Agriculture, O&G, services, consulting,
        ect…but which include a scope of work in relation with the energy sector
        (in offgrid, solar, cables,….)
      </li>
      <li>
        Then, another algorithm classify all tenders in categories in function
        of the scope of works related to the tenders
      </li>
    </ul>
    <br />
    <br />
    <h2 class="blue--text text--darken-1 pt-4">
      How to find the right tenders ?
    </h2>
    <br />
    The few things you need to know are:<br />
    <ul>
      <li>
        We manage synonymous: We know that if you type “offgrid’, your intention
        is to find all tenders related to offgrid sector, therefore our search
        engine will display results such as “mini-grid”, “micro-grid”, “rural
        electrification”,... Moreover we manage spelling mistakes.
      </li>
      <li>
        Any new tender of the day is market with “NEW” and you can use the
        filter “was published today” to filter only the new tenders
      </li>
      <li>
        We have defined categories to help you to search tenders and you can use
        CPV codes as well
      </li>
    </ul>
    <br />
    We do encourage you to search by keywords, categories or CPV<br />
    <br />
    <br />
    <h2 class="blue--text text--darken-1 pt-4">
      How can you access to private opportunities ?
    </h2>
    <br />
    <ul>
      <li>Many of our tenders are from private companies</li>
      <li>
        You and other users can create their own RFQ’s on Deepbloo. Just click
        on “add a tender” to create a RFQ and if you want to see only tenders
        created by other users, just use the filter “Tenders created by Deepbloo
        user”
      </li>
    </ul>
    <br />
    <br />
    <h2 class="blue--text text--darken-1 pt-4">
      How could you get exactly what you are looking for ?
    </h2>
    <br />
    <ul>
      <li>
        We have identified keywords in thousands of tenders in order to capture
        energy-related scope of work. You can give us your specific keywords
        that you would like our algorithm to search for. We will need a bit of
        time to implement but after some days, all tenders including the
        keywords you have specified will appear;
      </li>
      <li>
        We are working to implement on our next version a matchmaking system.
        Please make sure that your profile is properly completed on Deepbloo and
        we will be able in some time to propose you in priority tenders which
        corresponds to your profile.
      </li>
      <li>
        If there are specific organizations you are interested in and you
        believe that we are not capturing the tenders of these organizations,
        please give us the name and URL link and we will make sure (as long as
        this is legally and technically possible) that we will collect the
        tenders of these organizations.
      </li>
    </ul>
    <br />
    <br />
  </v-app>
</template>

<script>
export default {
  name: 'TenderInfo'
}
</script>
