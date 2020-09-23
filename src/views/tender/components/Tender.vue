<template>
  <v-card>
    <div v-if="!tender" class="text-center pa-5">
      <v-progress-circular
        :size="50"
        color="blue-grey lighten-4"
        indeterminate
      />
    </div>
    <div v-else>
      <div>
        <div
          v-if="hasReadRight"
          style="position: absolute; z-index: 10; right: 110px;"
        >
          <v-btn
            icon
            light
            fixed
            right
            top
            class="display-1"
            style="position: absolute; background-color: rgba(255, 255, 255, 0.4);"
            title="Share this opportuntiy with a colleague"
            @click.stop="openSentEmailDialog(tender)"
          >
            <v-icon color="black darken-2" style="font-size: 20px;">
              fa fa-envelope
            </v-icon>
          </v-btn>
          <div click.stop class="btn-badge">
            <v-progress-circular
              v-if="!dataUserNotifys.loading"
              :size="15"
              color="grey"
              indeterminate
              style="margin: 0px 4px 0px 0px;"
            />
            <v-btn
              v-else-if="
                dataUserNotifys.loading &&
                  dataUserNotifys.data &&
                  dataUserNotifys.data.length
              "
              color="red"
              fab
              small
              dark
              class="ma-0"
              style="width: 20px; height: 20px;"
              title="Email notification"
              @click="$refs.NotifyDialog.show(getUserId, tender.id)"
            >
              {{ dataUserNotifys.data.length }}
            </v-btn>
          </div>
        </div>
        <v-btn
          icon
          light
          fixed
          right
          top
          class="display-1"
          style="position: absolute; z-index: 10; right: 70px; background-color: rgba(255, 255, 255, 0.4);"
          title="Open the tender in a new tab"
          :to="{ name: 'tender', query: { tenderId: tender.id } }"
          target="_blank"
        >
          <v-icon color="black darken-2" style="font-size: 20px;">
            fa-external-link-alt
          </v-icon>
        </v-btn>
        <v-btn
          icon
          light
          @click="$emit('close')"
          fixed
          right
          top
          class="display-1"
          style="position: absolute; z-index: 10; background-color: rgba(255, 255, 255, 0.4);"
          title="Close"
        >
          <v-icon color="black darken-2" style="font-size: 20px;">fa-times</v-icon>
        </v-btn>
      </div>
      <div style="background-color: #78909c;">
        <v-img
          v-if="tender"
          :src="$global.cpvPicture(this.tender.cpvDescriptions, this.getDataCpvs.data)"
          aspect-ratio="2.75"
          :height="getIsMobile ? 100 : 300"
        >
          <div
            :class="getIsMobile ? '' : 'text-center'"
            style="position: absolute; bottom: 10px; left: 50%; transform: translate(-50%, 0%);"
          >
            <v-avatar
              class="elevation-10 head-avatar"
              :size="getIsMobile ? 90 : 200"
            >
              <img
                class="pa-4"
                :src="$global.cpvLogo(this.tender.cpvDescriptions, this.getDataCpvs.data)"
                alt=""
              />
            </v-avatar>
          </div>
        </v-img>
      </div>
      <div
        class="text-center blue--text text--darken-1 pt-3"
        :class="getIsMobile ? '' : 'display-1'"
      >
        {{ tender.title }}
      </div>
      <div class="text-center">{{ tender.country }}</div>
      <div class="pa-4" style="overflow: auto;">
        <div class="modal-grid">
          <div>
            <div v-if="tender.cpvs" class="pt-4">
              <h3 class="blue--text text--darken-1">{{ tender.buyerName }}</h3>
              <v-chip
                v-for="(industrie, index) in tender.industries"
                :key="index"
              >
                {{ industrie }}
              </v-chip>
            </div>

            <div v-if="tender.cpvs && tender.cpvDescriptions" class="pt-4">
              <div>
                <h3 class="blue--text text--darken-1">CPV description</h3>
                <div class="caption font-italic">
                  (The Common Procurement Vocabulary (CPV) which has been
                  developed by the European Union is a single classification
                  system to facilitate invitation to public tenders)
                </div>
              </div>
              <v-chip
                v-for="(cpv, index) in tender.cpvDescriptions"
                :key="index"
                outlined
                class="mr-1 mb-1"
              >
                <v-avatar class="pa-1">
                  <img :src="cpvLogo(cpv)" alt="" />
                </v-avatar>
                {{ cpv }}
              </v-chip>
            </div>

            <div :class="getIsMobile ? 'pt-0' : 'pt-4'">
              <h3 class="blue--text text--darken-1">
                Description
              </h3>
              <v-card-text class="text-left">
                <div v-if="hasReadRight">
                  <div
                    v-if="tender.description && tender.description !== ''"
                    v-html="$global.htmlText(tender.description)"
                  />
                  <div v-else class="">No description</div>
                </div>
                <div v-else style="position: relative;">
                  <span class="text-blur">
                    data not available...<br />
                    <br />
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur scelerisque aliquam pretium. Vivamus convallis libero at quam bibendum congue. Integer diam est, accumsan in condimentum at, elementum eu enim. Vivamus luctus, nulla eget tempus scelerisque, mauris nibh hendrerit tellus, vel efficitur nulla metus eget tortor. Quisque efficitur metus vel velit auctor, non lacinia nibh porta. Suspendisse vel nunc bibendum, commodo diam vitae, sagittis nibh. Nullam varius ante vel dui tincidunt rhoncus.<br>
                    <br />
                    Donec ut libero dolor. Etiam commodo interdum lorem pretium posuere. In urna turpis, auctor vitae pellentesque ornare, auctor eget erat. Quisque pellentesque ornare nibh, in ornare enim euismod in. Donec eu neque semper augue consequat tempus at a arcu. Sed nisi mauris, tristique eleifend tortor vel, lacinia sodales ex. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed augue nisl. Morbi bibendum nunc eu ex condimentum, lobortis venenatis velit volutpat. Ut ultricies nec quam quis congue. Nulla mollis varius enim sit amet pellentesque. Etiam lobortis, augue sit amet imperdiet tempus, ante odio laoreet nibh, non condimentum leo sapien at metus. Maecenas sagittis nibh sed euismod interdum.<br>
                    <br />
                    Mauris magna dolor, tincidunt vitae placerat id, efficitur eu risus. Etiam vulputate molestie neque fringilla ultrices. In id justo placerat, aliquet erat elementum, pretium risus. Aliquam ac odio quis lorem convallis viverra. In nec ornare odio. Cras eget est ac odio cursus porttitor. Mauris nec ullamcorper velit, eu dapibus enim. Quisque euismod diam sed erat accumsan, eu tempus dui suscipit. Aliquam et pulvinar urna, in placerat elit. Vestibulum euismod vulputate nisl, sed ultrices quam placerat in. Nunc sed pretium purus, sed tempor mi. Phasellus purus ante, dignissim et orci nec, dapibus laoreet arcu. Mauris gravida arcu ac nisi pretium ultricies. Sed luctus velit erat, nec tristique neque porta ac.<br>
                  </span><br />
                  <div
                    style="position: absolute; top: 50%; right: 50%; transform: translate(50%, -50%); text-align: center; background-color: rgba(255, 255, 255, 0.6); padding: 20px; border-radius: 20px;"
                  >
                    Info available with premium memberships<br />
                    <v-btn
                      round
                      dark
                      color="success"
                      href="https://platform.deepbloo.com/memberships"
                      target="_parent"
                      title="Free trial - Premium"
                    >
                      Premium/Business+
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </div>
            <div v-if="documents && documents.length" class="pb-5">
              <h3 class="blue--text text--darken-1">
                Documents
              </h3>
              <div
                v-for="(document, index) in documents"
                :key="`document${index}`"
                class="document-item cursor-pointer ma-2 pa-2"
                @click="$refs.DocumentDialog.show(document)"
                :title="document.filename"
              >
                <div
                  style="display: inline-block; position: absolute; right: 0px; top: 4px; border-radius: 10px; width: 30px;"
                >
                  <v-btn
                    v-if="document"
                    text
                    icon
                    small
                    color="blue-grey"
                    class="pa-0 mt-0 mb-1 mx-0"
                    title="download"
                    :href="document.s3Url"
                    target="_blank"
                    @click.stop
                  >
                    <v-icon>fa-download</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="getUserType === 1"
                    text
                    icon
                    small
                    color="red"
                    class="pa-0 mt-0 mb-1 mx-0"
                    title="delete"
                    @click.stop="documentDeleteDialog(document)"
                  >
                    <v-icon>fa-trash</v-icon>
                  </v-btn>
                </div>
                <v-icon
                  v-if="document.filename.toLowerCase().endsWith('.pdf')"
                  color="red"
                  size="100"
                  class="pr-2"
                >
                  fa-file-pdf
                </v-icon>
                <v-icon
                  v-else-if="
                    document.filename.toLowerCase().endsWith('.doc') ||
                      document.filename.toLowerCase().endsWith('.docx')
                  "
                  color="blue"
                  size="100"
                  class="pr-2"
                >
                  fa-file-word
                </v-icon>
                <v-icon
                  v-else-if="
                    document.filename.toLowerCase().endsWith('.xls') ||
                      document.filename.toLowerCase().endsWith('.xlsx')
                  "
                  color="green"
                  size="100"
                  class="pr-2"
                >
                  fa-file-excel
                </v-icon>
                <v-icon
                  v-else-if="document.filename.toLowerCase().endsWith('.csv')"
                  color="lime"
                  size="100"
                  class="pr-2"
                >
                  fa-file-csv
                </v-icon>
                <v-icon
                  v-else-if="document.filename.toLowerCase().endsWith('.zip')"
                  color="orange"
                  size="100"
                  class="pr-2"
                >
                  fa-file-archive
                </v-icon>
                <v-icon
                  v-else-if="
                    document.filename.toLowerCase().endsWith('.jpg') ||
                      document.filename.toLowerCase().endsWith('.png')
                  "
                  color="purple"
                  size="100"
                  class="pr-2"
                >
                  fa-file-image
                </v-icon>
                <v-icon
                  v-else-if="
                    document.filename.toLowerCase().endsWith('.htm') ||
                      document.filename.toLowerCase().endsWith('.html') ||
                      document.filename.toLowerCase().endsWith('.php')
                  "
                  color="teal"
                  size="100"
                  class="pr-2"
                >
                  fa-file-code
                </v-icon>
                <v-icon v-else size="100" class="pr-2">
                  fa-file
                </v-icon>
                <div style="font-size: 12px; height: 20px; overflow: hidden;">
                  {{ document.filename }}
                </div>
              </div>
            </div>
          </div>
          <div>
            <v-card color="grey lighten-5">
              <v-card-text class="pa-3">
                <div class="grey--text">Bid Deadline</div>
                <div
                  v-if="tender.bidDeadlineDate && tender.bidDeadlineDate !== ''"
                >
                  {{
                    moment(tender.bidDeadlineDate, "YYYY-MM-DD").format("LL")
                  }}
                </div>
                <div class="grey--text pt-3">Publication date</div>
                <div
                  v-if="tender.publicationDate && tender.publicationDate !== ''"
                >
                  {{
                    moment(tender.publicationDate, "YYYY-MM-DD").format("LL")
                  }}
                </div>
                <div>
                  <div class="grey--text pt-3">
                    Link to tender documentation
                  </div>
                  <div
                    v-if="getItemUrl(tender) && getItemUrl(tender).length"
                    style="max-height: 300px; overflow: auto;"
                  >
                    <div
                      v-for="(url, index) in getItemUrl(tender)"
                      :key="index"
                      class="url-block"
                    >
                      <span v-if="hasReadRight">
                        <a :href="url" target="_blank">
                          <i class="fa fa-external-link" />
                          {{
                            !url.includes("www.dgmarket.com")
                              ? url
                              : "Link to tender documents"
                          }}
                        </a>
                      </span>
                      <span v-else class="text-blur">
                        data not available
                      </span>
                    </div>
                    <v-btn
                      v-if="hasDocumentToImport"
                      :loading="documentImport"
                      round
                      dark
                      outlined
                      color="blue-grey lighten-1"
                      title="Import into DeepBloo"
                      @click.stop="tenderFileImport()"
                    >
                      Import into DeepBloo
                    </v-btn>
                  </div>
                  <div v-else>None</div>
                </div>
              </v-card-text>
            </v-card>

            <v-card
              v-if="
                tender.noticeType !== 'Contract Award' &&
                  tender.cpvDescriptions &&
                  tender.cpvDescriptions.length
              "
              color="grey lighten-3"
              class="my-4"
            >
              <v-card-text class="pa-3">
                <div class="grey--text">Contract award</div>
                <div class="py-2">
                  <a
                    @click="$refs.ContractAwardDialog.show(tender)"
                    target="_blank"
                  >
                    Check which organization has been awarded in this region in
                    relevant business
                  </a>
                </div>
              </v-card-text>
            </v-card>

            <v-card
              v-if="
                tender.noticeType !== 'Contract Award' &&
                  tender.cpvDescriptions &&
                  tender.cpvDescriptions.length
              "
              color="grey lighten-5"
              class="my-4"
            >
              <v-card-text class="pa-3">
                <div class="grey--text">Potential partners</div>
                <div style="position: absolute; top: 10px; right: 10px;">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-icon v-on="on" class="organization-name-5 mr-1" style="font-size: 14px;">
                        fa-circle
                      </v-icon>
                    </template>
                    <span>
                      Match on user CPV and user region and user country
                    </span>
                  </v-tooltip>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-icon v-on="on" class="organization-name-3 mr-1" style="font-size: 14px;">
                        fa-circle
                      </v-icon>
                    </template>
                    <span>
                      Match on user CPV and user region
                    </span>
                  </v-tooltip>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-icon v-on="on" class="organization-name-1 mr-1" style="font-size: 14px;">
                        fa-circle
                      </v-icon>
                    </template>
                    <span>
                      Match on user CPV
                    </span>
                  </v-tooltip>
                </div>
                <div v-if="!TenderOrganizations" class="pa-5 text-center">
                  <v-progress-circular :size="50" color="grey" indeterminate />
                </div>
                <div
                  v-else-if="TenderOrganizations.length === 0"
                  class="pa-5 text-center"
                >
                  <div class="grey--text">none</div>
                </div>
                <v-list v-else two-line>
                  <template
                    v-for="(organization, index) in (hasReadRight ? TenderOrganizations.slice(0, 10) : TenderOrganizations.slice(0, 5))"
                  >
                    <v-subheader
                      v-if="organization.header"
                      :key="organization.header"
                    >
                      {{ organization.header }}
                    </v-subheader>

                    <v-divider
                      v-else-if="organization.divider"
                      :key="index"
                      :inset="organization.inset"
                    ></v-divider>

                    <v-list-item
                      v-else
                      :key="organization.title"
                      :href="hasReadRight ? `https://platform.deepbloo.com/companies/${organization.dgmarketId}` : ''"
                      target="_blank"
                      @click.stop
                      class="pb-1"
                    >
                      <v-list-item-content class="organization-content pb-1">
                        <v-list-item-title
                          :class="`organization-name-${organization.cpvRating}`"
                          style="height: 22px;"
                        >
                          <span v-if="hasReadRight">
                            {{ organization.name }}
                          </span>
                          <span v-else class="text-blur">
                            data not available
                          </span>
                        </v-list-item-title>
                        <v-list-item-subtitle style="height: 18px;">
                          {{ organization.cpvFounds.join(", ") }}
                        </v-list-item-subtitle>
                        <v-list-item-subtitle
                          style="height: 30px; padding-top: 6px;"
                        >
                          <v-avatar
                            v-for="user of organization.users"
                            :key="`user${user.userId}`"
                            size="24"
                          >
                            <a
                              v-if="user.photo"
                              :href="hasReadRight ? `https://platform.deepbloo.com/users/${user.hivebriteId}` : null"
                              target="_blank"
                              @click.stop
                              :title="hasReadRight ? user.username : 'Name not available'"
                            >
                              <img
                                :src="user.photo"
                                :alt="user.username"
                                style="width: 24px; height: 24px;"
                              />
                            </a>
                            <v-icon v-else :title="user.username">
                              account_circle
                            </v-icon>
                          </v-avatar>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-list>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <div class="modal-grid-footer pb-4">
          <div>
            <v-card color="grey lighten-5 mb-3">
              <v-card-text class="pa-3">
                <div class="modal-data-grid">
                  <div>
                    <div class="grey--text">Notice type</div>
                    <div>
                      <span v-if="hasReadRight">
                        {{ tender.noticeType }}
                      </span>
                      <span v-else class="text-blur">
                        data not available
                      </span>
                    </div>
                    <div class="grey--text pt-3">Buyer country</div>
                    <div>
                      <span v-if="hasReadRight">
                        {{ tender.buyerCountry }}
                      </span>
                      <span v-else class="text-blur">
                        data not available
                      </span>
                    </div>
                    <div class="grey--text pt-3">Currency</div>
                    <div>
                      <span v-if="hasReadRight">
                        {{ tender.currency }}
                      </span>
                      <span v-else class="text-blur">
                        data not available
                      </span>
                    </div>
                    <div class="grey--text pt-3">Biding type</div>
                    <div v-if="tender.bidingType">
                      <span v-if="hasReadRight">
                        {{ tender.bidingType }}
                      </span>
                      <span v-else class="text-blur">
                        data not available
                      </span>
                    </div>
                    <div v-else class="grey--text text--lighten-1">-</div>
                  </div>
                  <div>
                    <div class="grey--text">Brand</div>
                    <div>
                      <span v-if="hasReadRight">
                        {{ tender.brand }}
                      </span>
                      <span v-else class="text-blur">
                        data not available
                      </span>
                    </div>
                    <div class="grey--text pt-3">Contract type</div>
                    <div>
                      <span v-if="hasReadRight">
                        {{
                          tender.contractType1
                            ? "Long term / Frame Agreement"
                            : "-"
                        }}
                      </span>
                      <span v-else class="text-blur">
                        data not available
                      </span>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <v-card color="grey lighten-5">
              <v-card-text class="pa-3">
                <h3 class="pb-2">Organization procurement</h3>
                <div class="grey--text pt-3">Method</div>
                <div>
                  <span v-if="hasReadRight">
                    {{ tender.procurementMethod }}
                  </span>
                  <span v-else class="text-blur">
                    data not available
                  </span>
                </div>
                <div class="grey--text pt-3">ID</div>
                <div>
                  <span v-if="hasReadRight">
                    {{ tender.procurementId }}
                  </span>
                  <span v-else class="text-blur">
                    data not available
                  </span>
                </div>
              </v-card-text>
            </v-card>
          </div>
          <div>
            <v-card color="grey lighten-5">
              <v-card-text class="pa-3">
                <h3 class="pb-3">Contact</h3>
                <div class="grey--text">First name</div>
                <div v-if="tender.contactFirstName">
                  <span v-if="hasReadRight">
                    {{ tender.contactFirstName }}
                  </span>
                  <span v-else class="text-blur">
                    data not available
                  </span>
                </div>
                <div v-else class="grey--text text--lighten-1">-</div>
                <div class="grey--text">Last name</div>
                <div v-if="tender.contactLastName">
                  <span v-if="hasReadRight">
                    {{ tender.contactLastName }}
                  </span>
                  <span v-else class="text-blur">
                    data not available
                  </span>
                </div>
                <div v-else class="grey--text text--lighten-1">-</div>
                <hr class="my-2 white" style="border: 1px solid #ffffff;" />
                <div class="grey--text">Address</div>
                <div v-if="tender.contactAdress">
                  <span v-if="hasReadRight">
                    {{ tender.contactAdress }}
                  </span>
                  <span v-else class="text-blur">
                    data not available
                  </span>
                </div>
                <div v-else class="grey--text text--lighten-1">-</div>
                <div class="grey--text">City</div>
                <div v-if="tender.contactCity">
                  <span v-if="hasReadRight">
                    {{ tender.contactCity }}
                  </span>
                  <span v-else class="text-blur">
                    data not available
                  </span>
                </div>
                <div v-else class="grey--text text--lighten-1">-</div>
                <div class="grey--text">State</div>
                <div v-if="tender.contactState">
                  <span v-if="hasReadRight">
                    {{ tender.contactState }}
                  </span>
                  <span v-else class="text-blur">
                    data not available
                  </span>
                </div>
                <div v-else class="grey--text text--lighten-1">-</div>
                <div class="grey--text">Country</div>
                <div v-if="tender.contactCountry">
                  <span v-if="hasReadRight">
                    {{ tender.contactCountry }}
                  </span>
                  <span v-else class="text-blur">
                    data not available
                  </span>
                </div>
                <div v-else class="grey--text text--lighten-1">-</div>
                <hr class="my-2 white" style="border: 1px solid #ffffff;" />
                <div class="grey--text">Email</div>
                <div v-if="tender.contactEmail">
                  <span v-if="hasReadRight">
                    {{ tender.contactEmail }}
                  </span>
                  <span v-else class="text-blur">
                    data not available
                  </span>
                </div>
                <div v-else class="grey--text text--lighten-1">-</div>
                <div class="grey--text">Phone</div>
                <div v-if="tender.contactPhone">
                  <span v-if="hasReadRight">
                    {{ tender.contactPhone }}
                  </span>
                  <span v-else class="text-blur">
                    data not available
                  </span>
                </div>
                <div v-else class="grey--text text--lighten-1">-</div>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <div v-if="isBusiness && tenderDetail" class="modal-grid-footer mb-3">
          <div>
            <v-card color="grey lighten-5">
              <v-card-text class="pa-3">
                <v-textarea
                  label="Comment"
                  v-model="tenderDetail.comment"
                  auto-grow
                  @keyup="isModifie = true"
                />
                <hr class="my-2 white" style="border: 1px solid #ffffff;" />
                <v-text-field
                  label="Estimated value of the scope"
                  v-model="tenderDetail.amoutOffer"
                  @keyup="isModifie = true"
                />
              </v-card-text>
            </v-card>
          </div>
          <div class="pa-0">
            <v-card color="grey lighten-5">
              <v-card-text class="pa-3">
                <div v-if="groups">
                  <div class="grey--text">Group</div>
                  <div>
                    <v-menu :nudge-width="200" offset-y max-height="500">
                      <template v-slot:activator="{ on }">
                        <template>
                          <div v-if="!groups || !groups.find(a => a.isCheck)">
                            <v-btn text small v-on="on" class="grey--text">
                              None
                            </v-btn>
                          </div>
                          <div v-else>
                            <v-btn
                              v-for="(groupSelect,
                              indexSelect) in groups.filter(a => a.isCheck)"
                              :key="`groupSelect${indexSelect}`"
                              text
                              small
                              v-on="on"
                            >
                              <v-icon
                                :style="
                                  `font-size: 12px; margin-right: 4px; color:${
                                    groupSelect.color
                                  };`
                                "
                              >
                                fa-circle
                              </v-icon>
                              {{ groupSelect.label }}
                            </v-btn>
                          </div>
                        </template>
                      </template>

                      <v-list>
                        <v-list-item
                          v-for="(group, index) in groups"
                          :key="`group${index}`"
                          @click="group.isCheck = !group.isCheck"
                        >
                          <v-list-item-action
                            style="padding-top: 10px; min-width: 40px;"
                          >
                            <v-checkbox
                              v-model="group.isCheck"
                              @click.stop="
                                group.isCheck = !group.isCheck;
                                isModifie = true;
                              "
                            />
                          </v-list-item-action>
                          <v-list-item-title>
                            <span v-html="group.label" />
                          </v-list-item-title>
                          <v-list-item-avatar>
                            <v-icon
                              :style="`font-size: 30px; color:${group.color};`"
                            >
                              fa-circle
                            </v-icon>
                          </v-list-item-avatar>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                  <hr class="my-2 white" style="border: 1px solid #ffffff;" />
                </div>
                <div class="grey--text">Sales Manager</div>
                <div>
                  <v-menu :nudge-width="200" offset-y max-height="500">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-if="!tenderDetail.salesManagerId"
                        text
                        small
                        v-on="on"
                        class="grey--text"
                      >
                        None
                      </v-btn>
                      <v-btn v-else text small v-on="on">
                        <v-avatar v-if="users" size="20" class="mr-2">
                          <img
                            :src="
                              users.find(
                                a => a.userId === tenderDetail.salesManagerId
                              ).photo
                            "
                            alt=""
                          />
                        </v-avatar>
                        {{
                          users.find(
                            a => a.userId === tenderDetail.salesManagerId
                          ).username
                        }}
                      </v-btn>
                    </template>

                    <v-list>
                      <v-list-item
                        v-for="(user, index) in users"
                        :key="index"
                        @click="
                          tenderDetail.salesManagerId = user.userId;
                          isModifie = true;
                        "
                      >
                        <v-list-item-avatar>
                          <v-avatar size="24">
                            <img :src="user.photo" alt="" />
                          </v-avatar>
                        </v-list-item-avatar>
                        <v-list-item-title>
                          <span v-html="user.username" />
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
                <hr class="my-2 white" style="border: 1px solid #ffffff;" />
                <div class="grey--text">Bid Manager</div>
                <div>
                  <v-menu :nudge-width="200" offset-y max-height="500">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-if="!tenderDetail.bidManagerId"
                        text
                        small
                        v-on="on"
                        class="grey--text"
                      >
                        None
                      </v-btn>
                      <v-btn v-else text small v-on="on">
                        <v-avatar v-if="users" size="20" class="mr-2">
                          <img
                            :src="
                              users.find(
                                a => a.userId === tenderDetail.bidManagerId
                              ).photo
                            "
                            alt=""
                          />
                        </v-avatar>
                        {{
                          users.find(
                            a => a.userId === tenderDetail.bidManagerId
                          ).username
                        }}
                      </v-btn>
                    </template>

                    <v-list>
                      <v-list-item
                        v-for="(user, index) in users"
                        :key="index"
                        @click="
                          tenderDetail.bidManagerId = user.userId;
                          isModifie = true;
                        "
                      >
                        <v-list-item-avatar>
                          <v-avatar size="24">
                            <img :src="user.photo" alt="" />
                          </v-avatar>
                        </v-list-item-avatar>
                        <v-list-item-title>
                          <span v-html="user.username" />
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
        <div
          v-if="
            tender.noticeType !== 'Contract Award' &&
              tender.cpvDescriptions &&
              tender.cpvDescriptions.length
          "
        >
          <div class="pt-3">
            Mapping of identified organizations (on Deepbloo)
          </div>
          <div v-if="!TenderOrganizations" class="pa-5 text-center">
            <v-progress-circular :size="50" color="grey" indeterminate />
          </div>
          <div v-else>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <span class="caption grey--text" v-on="on">
                  <v-icon class="pr-1" style="font-size: 14px;">fa-question-circle</v-icon>
                  Zooming in chart is possible
                </span>
              </template>
              <span>
                With a mouse pointer, the zooming is performed by dragging out a
                rectangle in the chart.<br />
                When zooming, a button appears that lets the user zoom out.<br />
                On touch devices, the user can zoom by pinching in the chart
                area.<br />
                On these devices, the user may also move the zoomed area by
                panning with one finger across the chart.<br />
              </span>
            </v-tooltip>
            <div class="grey--text text-center" v-if="!user.organizationId">
              <a
                class="caption"
                style="text-decoration: none;"
                :href="
                  `https://platform.deepbloo.com/users/${getUserHivebriteId}`
                "
                target="_blank"
                @click.stop
                :title="getUsername"
              >
                To ensure your company appears as potential partner - go on your
                profile and add an experience with your company
              </a>
            </div>
            <highcharts :options="chartStatistique" />
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex"
import moment from "moment"

export default {
  name: 'Tender',

  data: () => ({
    moment,
    tender: null,
    loadingMembership: false,
    isFreeMembership: false,
    isPremiumMembership: false,
    isBusinessMembership: false,
    hasFree: false,
    TenderOrganizations: null,
    dataUserNotifys: {
      loading: null,
      data: null
    },
    user: null,
    users: null,
    groups: null,
    tenderGroupLinks: null,
    tenderDetail: null,
    documents: null,
    documentImport: false,
    isModifie: false,
    chartStatistique: {
      chart: {
        type: "bubble",
        plotBorderWidth: 1,
        zoomType: "xy",
        height: 600
      },
      title: { text: "" },
      credits: { enabled: false },
      exporting: { enabled: false },
      xAxis: {
        min: 0,
        max: 4,
        allowDecimals: false,
        gridLineWidth: 1,
        title: {
          text: "regions"
        },
        labels: {
          format: "{value}"
        },
        plotLines: [
          {
            color: "black",
            dashStyle: "dot",
            width: 2,
            value: 0,
            label: {
              rotation: 0,
              y: 15,
              style: {
                fontStyle: "italic"
              },
              text: "Active in other continents"
            },
            zIndex: 3
          },
          {
            color: "black",
            dashStyle: "dot",
            width: 2,
            value: 1,
            label: {
              rotation: 0,
              y: 15,
              style: {
                fontStyle: "italic"
              },
              text: "Active in the same continent"
            },
            zIndex: 3
          },
          {
            color: "black",
            dashStyle: "dot",
            width: 2,
            value: 2,
            label: {
              rotation: 0,
              y: 15,
              style: {
                fontStyle: "italic"
              },
              text: "Active in the same sub-region"
            },
            zIndex: 3
          },
          {
            color: "black",
            dashStyle: "dot",
            width: 2,
            value: 3,
            label: {
              rotation: 0,
              y: 15,
              style: {
                fontStyle: "italic"
              },
              text: "Present in the same country"
            },
            zIndex: 3
          }
        ]
      },
      yAxis: {
        min: -1,
        allowDecimals: false,
        startOnTick: false,
        endOnTick: false,
        gridLineWidth: 0,
        title: {
          text: "CPV match"
        },
        labels: {
          format: "{value}"
        },
        maxPadding: 0.2
      },
      tooltip: {
        useHTML: true,
        headerFormat: "<table>",
        pointFormat:
          '<tr><th colspan="2"><h4>{point.tenderOrganization.name}</h4></th></tr>' +
          "<tr><th>Country:</th><td>{point.country}</td></tr>" +
          "<tr><th>CPV:</th><td>{point.cpv}</td></tr>" +
          "<tr><th>Users:</th><td>{point.user}</td></tr>",
        footerFormat: "</table>",
        followPointer: true
      },
      plotOptions: {
        series: {
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            color: "black",
            format: "{point.name}"
          }
        }
      },
      series: [
        {
          name: "Other",
          color: "#a9a9ae",
          data: []
        },
        {
          name: "Same continent",
          color: "#a0d9ff",
          data: []
        },
        {
          name: "Same sub-region",
          color: "#5891c8",
          data: []
        },
        {
          name: "Same country",
          color: "#0f487f",
          data: []
        },
        {
          name: "Your company",
          color: "#af1c09",
          data: []
        }
      ]
    }
  }),

  computed: {
    ...mapGetters([
      'getIsMobile',
      'isUserLoggedIn',
      'getUserId',
      'getUserHivebriteId',
      'getUsername',
      'getUserType',
      'getDataCpvs',
    ]),

    isFree() {
      if (
        (this.getUserType && this.getUserType === 1) ||
        this.isFreeMembership
      ) {
        return true;
      }
      return false;
    },

    isPremium() {
      if (
        (this.getUserType && this.getUserType === 1) ||
        this.isPremiumMembership
      ) {
        return true;
      }
      return false;
    },

    isBusiness() {
      if (
        (this.getUserType && this.getUserType === 1) ||
        this.isBusinessMembership
      ) {
        return true;
      }
      return false;
    },

    hasReadRight() {
      if (this.isBusiness || this.isFree || this.isPremium) {
        return true;
      }
      return false;
    },

    hasDocumentToImport() {
      if (
        this.getUserType !== 1 ||
        !this.documents ||
        !this.tender ||
        !this.tender.sourceUrl
      ) {
        return false;
      }

      let display = false;
      const sourceUrls = this.getItemUrl(this.tender);
      for (const sourceUrl of sourceUrls) {
        const document = this.documents.find(a => a.sourceUrl === sourceUrl);
        if (!document) {
          display = true;
        }
      }

      return display;
    },
  },

  methods: {
    async loadTender(tenderId) {
      try {
        this.tender = null
        const res = await this.$api.post("/Tender/TenderGet", {
          id: tenderId
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        res.data.cpvs = res.data.cpvs.split(',').map(Number)
        res.data.cpvDescriptions = res.data.cpvDescriptions.split(',')
        this.tender = res.data
        this.initData()
      } catch (err) {
        this.$api.error(err, this)
      }
    },

    initData() {
      this.tenderGroupLinks = null
      this.tenderDetail = null
      this.dataUserNotifys.loading = null
      this.dataUserNotifys.data = null
      this.chartStatistique.series[0].data = []
      this.chartStatistique.series[0].events = {
        click: event => {
          if (this.hasReadRight) {
            this.openTenderOrganization(event.point.tenderOrganization);
          }
        }
      }
      this.chartStatistique.series[1].data = []
      this.chartStatistique.series[1].events = {
        click: event => {
          if (this.hasReadRight) {
            this.openTenderOrganization(event.point.tenderOrganization)
          }
        }
      }
      this.chartStatistique.series[2].data = []
      this.chartStatistique.series[2].events = {
        click: event => {
          if (this.hasReadRight) {
            this.openTenderOrganization(event.point.tenderOrganization)
          }
        }
      }
      this.chartStatistique.series[3].data = []
      this.chartStatistique.series[3].events = {
        click: event => {
          if (this.hasReadRight) {
            this.openTenderOrganization(event.point.tenderOrganization)
          }
        }
      }
      this.chartStatistique.series[4].data = []
      this.chartStatistique.series[4].events = {
        click: event => {
          if (this.hasReadRight) {
            this.openTenderOrganization(event.point.tenderOrganization)
          }
        }
      }
      this.isModifie = false
      this.loadUserNotifys()
      this.loadCustomData()
      this.documentList()
    },

    getUserMemberships() {
      this.loadingMembership = false;
      this.isFreeMembership = false;
      this.isPremiumMembership = false;
      this.isBusinessMembership = false;
      if (!this.getUserId) {
        return;
      }
      this.$api
        .post("/User/Memberships", { userId: this.getUserId })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.isFreeMembership = res.data.isFreeMembership;
          this.isPremiumMembership = res.data.isPremiumMembership;
          this.isBusinessMembership = res.data.isBusinessMembership;
          this.hasFree = res.data.hasFree;
          this.loadingMembership = true;
        })
        .catch(err => {
          this.$api.error(err, this);
        });
    },

    async loadUserNotifys() {
      try {
        if (!this.getUserId) {
          this.dataUserNotifys.data = [];
          this.dataUserNotifys.loading = 1;
          return;
        }
        this.dataUserNotifys.loading = 0;
        const res = await this.$api.post("/user/userNotifyList", {
          filter: {
            userId: this.getUserId,
            tenderId: this.tender.id
          }
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        this.dataUserNotifys.data = res.data;
        this.dataUserNotifys.loading = 1;
      } catch (err) {
        this.dataUserNotifys.loading = -1;
        this.$api.error(err, this);
      }
    },

    async loadCustomData() {
      await this.loadUser();
      this.loadOrganizations();
      if (!this.user || !this.user.organizationId) {
        return;
      }
      await this.loadUserList();
      await this.loadTenderGroupList();
      await this.loadTenderGroupLinkList();
      await this.loadTenderDetail();
    },

    async loadUser() {
      try {
        if (!this.getUserId) {
          return;
        }
        const res = await this.$api.post("/User/User", {
          userId: this.getUserId
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        this.user = res.Utilisateur;
      } catch (err) {
        this.$api.error(err, this);
      }
    },

    loadOrganizations() {
      this.TenderOrganizations = null;
      if (
        !this.tender.cpvDescriptions ||
        !this.tender.cpvDescriptions.length
      ) {
        return;
      }
      this.$api
        .post("/Organization/ListFromCpvs", {
          cpvs:
            this.tender && this.tender.cpvDescriptions
              ? this.tender.cpvDescriptions
              : undefined,
          country: this.tender.country
        })
        .then(res => {
          if (!res.success) {
            throw new Error(res.Error);
          }
          this.TenderOrganizations = res.data;
          // this.initCpvs();
          this.chartStatistique.yAxis.max =
            this.tender.cpvDescriptions.length + 1;
          let cpvMax = Math.max(
            ...this.TenderOrganizations.map(a =>
              a.organization && a.organization.cpvs
                ? a.organization.cpvs.length
                : 0
            )
          );
          let userMax = Math.max(
            ...this.TenderOrganizations.map(a =>
              a.organization && a.organization.users
                ? a.organization.users.length
                : 0
            )
          );
          for (const tenderOrganization of this.TenderOrganizations) {
            if (!this.hasReadRight) {
              tenderOrganization.name = "---";
            }
            let regionNum = 0;
            if (tenderOrganization.userCountryFlg) {
              regionNum = 3;
            } else if (tenderOrganization.userSubRegionFlg) {
              regionNum = 2;
            } else if (tenderOrganization.userRegionFlg) {
              regionNum = 1;
            }
            let xValue =
              regionNum +
              (tenderOrganization.users.length * 0.8) /
                (userMax ? userMax : 1) +
              0.1;
            let yValue =
              tenderOrganization.cpvFounds.length +
              (tenderOrganization.cpvs.length * 0.8) / (cpvMax ? cpvMax : 1) +
              0.1;
            const data = {
              x: xValue,
              y: yValue,
              z:
                tenderOrganization.organization &&
                tenderOrganization.organization.users
                  ? tenderOrganization.organization.users.length
                  : 0,
              tenderOrganization: tenderOrganization,
              name: tenderOrganization.name,
              country: tenderOrganization.countrys
                ? tenderOrganization.countrys.join()
                : "",
              cpv: tenderOrganization.cpvFounds
                ? tenderOrganization.cpvFounds.join()
                : "",
              user:
                tenderOrganization.organization &&
                tenderOrganization.organization.users
                  ? tenderOrganization.organization.users.length
                  : 0
            };
            if (
              tenderOrganization &&
              this.user &&
              tenderOrganization.organizationId === this.user.organizationId
            ) {
              this.chartStatistique.series[4].data.push(data);
            } else if (regionNum === 3) {
              this.chartStatistique.series[3].data.push(data);
            } else if (regionNum === 2) {
              this.chartStatistique.series[2].data.push(data);
            } else if (regionNum === 1) {
              this.chartStatistique.series[1].data.push(data);
            } else {
              this.chartStatistique.series[0].data.push(data);
            }
          }
        })
        .catch(err => {
          this.$api.error(err, this);
        });
    },

    async loadUserList() {
      try {
        const res = await this.$api.post("/User/List", {
          filter: {
            organizationId: this.user.organizationId
          }
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        this.users = res.data;
      } catch (err) {
        this.$api.error(err, this);
      }
    },

    async loadTenderGroupList() {
      try {
        if (!this.getUserId) {
          return;
        }
        const res = await this.$api.post("/Tender/TenderGroupList", {
          userId: this.getUserId
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        this.groups = [];
        for (const group of res.data) {
          this.groups.push({
            ...group,
            isCheck: false
          });
        }
      } catch (err) {
        this.$api.error(err, this);
      }
    },

    async loadTenderGroupLinkList() {
      try {
        const res = await this.$api.post("/Tender/TenderGroupLinkList", {
          userId: this.getUserId,
          tenderId: this.tender.id
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        this.tenderGroupLinks = res.data;
        for (const tenderGroupLink of this.tenderGroupLinks) {
          const group = this.groups.find(
            a => a.tenderGroupId === tenderGroupLink.tenderGroupId
          );
          if (group) {
            group.isCheck = true;
          }
        }
      } catch (err) {
        this.$api.error(err, this);
      }
    },

    getItemUrl(tender) {
      if (!tender || !tender.sourceUrl || tender.sourceUrl.trim() === "") {
        return [];
      }
      const sourceUrls = [];
      if (tender.sourceUrl) {
        for (const sourceUrl of tender.sourceUrl.split(",")) {
          if (sourceUrl.trim() === "") {
            continue;
          }
          if (this.documents) {
            const document = this.documents.find(
              a => a.sourceUrl === sourceUrl
            );
            if (document) {
              continue;
            }
          }
          sourceUrls.push(sourceUrl.trim());
        }
      }
      return sourceUrls;
    },

    async loadTenderDetail() {
      try {
        const res = await this.$api.post("/Tender/TenderDetailList", {
          userId: this.getUserId,
          tenderId: this.tender.id
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        if (res.data && res.data.length) {
          this.tenderDetail = res.data[0];
        }
        if (!this.tenderDetail) {
          this.tenderDetail = {
            userId: this.getUserId,
            tenderId: this.tender.id,
            comment: null,
            salesManagerId: null,
            bidManagerId: null,
            amoutOffer: null,
            status: 1
          };
        }
      } catch (err) {
        this.$api.error(err, this);
      }
    },

    cpvLogo(cpvCode) {
      if (
        !this.getDataCpvs ||
        !this.getDataCpvs.data ||
        !cpvCode
      ) {
        return "https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png";
      }
      const cpv = this.getDataCpvs.data.find(a => a.code === cpvCode);
      if (!cpv || !cpv.logo || cpv.logo === "") {
        return "https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png";
      }
      return cpv.logo;
    },

    async updateTenderDetail() {
      try {
        this.$emit('close')
        const res = await this.$api.post("/Tender/TenderDetailAddUpdate", {
          tenderDetail: this.tenderDetail
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        const tenderDetailNew = res.data
        this.$emit("updateTender", { tenderDetail: tenderDetailNew })
      } catch (err) {
        this.$api.error(err, this)
      }
    },

    openTenderOrganization(tenderOrganization) {
      this.$refs.TenderOrganizationDialog.show(tenderOrganization);
    },

    openExternal() {
      let routeData = this.$router.resolve({
        name: "tender",
        query: { tenderId: this.tender.id }
      });
      window.open(routeData.href, "_blank");
    },

    openSentEmailDialog(item) {
      let tenderId = item.tenderId ? item.tenderId : item.id;
      let subject = "Deepbloo - this tender should interest you";
      let body = "\n";
      body += "Title :\n";
      body += `${this.htmlText(item.title)
        .trim()
        .substring(0, 50)}...\n`;
      body += "\n";
      body += "Description :\n";
      body += `${this.htmlText(item.description)
        .trim()
        .substring(0, 400)}...\n`;
      body += "\n";
      let footerHtml = `
        <a href="https://prod.deepbloo.com/#/tender?tenderId=${tenderId}" target="_blank">Open this tender #${tenderId}</a>
        The Deepbloo team
      `;
      this.$refs.SentEmailDialog.show(
        subject.trim(),
        body.trim(),
        footerHtml.trim(),
        tenderId
      );
    },

    async documentList() {
      try {
        if (!this.getUserId) {
          this.documents = [];
          return;
        }
        const res = await this.$api.post("/Document/documentList", {
          filter: {
            tenderId: this.tender.id
          }
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        this.documents = res.data;
      } catch (err) {
        this.$api.error(err, this);
      }
    },

    async tenderFileImport() {
      this.documentImport = true;
      try {
        const res = await this.$api.post("/Document/tenderFileImport", {
          tenderId: this.tender.id
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        this.documentList();
      } catch (err) {
        this.$api.error(err, this);
      }
      this.documentImport = false;
    },

    documentDeleteDialog(document) {
      if (!document.documentId) {
        return;
      }
      var message = "Do you really want to delete this document ?<br>";
      message += `Filename: <span class="black--text">${document.filename}</span><br>`;
      this.showConfirmModal({
        headerClass: "white--text red lighten-1",
        headerIcon: "fa-trash",
        title: "Delete",
        message: message,
        buttons: [
          {
            libelle: "Yes",
            class: "red--text",
            action: async dialog => {
              await this.documentDelete(document);
              dialog.close();
            }
          },
          { libelle: "No", text: true, class: "" }
        ]
      });
    },

    async documentDelete(document) {
      try {
        const res = await this.$api.post("/Document/documentDelete", {
          documentId: document.documentId
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        this.documentList();
      } catch (err) {
        this.$api.error(err, this);
      }
    },
  },
}
</script>

<style>
@media screen and (max-width: 600px) {
  .modal-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 0px 10px;
  }

  .modal-data-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 0px 10px;
  }

  .modal-grid-footer {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 0px 10px;
  }

  .head-avatar {
    background-color: rgba(255, 255, 255, 0.77);
    border: 3px solid #ffffff;
    opacity: 0.8;
  }
}
@media screen and (min-width: 600px) {
  .modal-grid {
    display: grid;
    grid-template-columns: 1fr 30%;
    grid-gap: 0px 10px;
  }

  .modal-data-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 0px 10px;
  }

  .modal-grid-footer {
    display: grid;
    grid-template-columns: 1fr 40%;
    grid-gap: 0px 20px;
  }

  .head-avatar {
    background-color: rgba(255, 255, 255, 0.77);
    border: 3px solid #ffffff;
    opacity: 0.8;
  }
}

.btn-badge {
  position: absolute;
  display: inline-block;
  top: 36px;
  right: 8px;
  cursor: pointer;
}

.url-block {
  word-break: break-all;
  max-height: 106px;
  overflow: hidden;
  text-overflow: ellipsis;
  border-bottom: 1px solid #ffffff;
  padding-top: 5px;
  padding-bottom: 5px;
}
.url-block:hover {
  background-color: #f4f4f4;
}

.organization-content {
  border-bottom: 1px solid #d8d9da;
}

.document-item {
  display: inline-block;
  position: relative;
  width: 124px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 10px;
  opacity: 0.9;
}
.document-item:hover {
  border: 1px solid #eeeeee;
  opacity: 1;
}
</style>
