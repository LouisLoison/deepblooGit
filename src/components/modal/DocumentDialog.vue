<template>
  <v-dialog
    v-model="isShowDialog"
    scrollable
    :max-width="!getIsMobile ? 2000 : null"
    :fullscreen="getIsMobile"
    :hide-overlay="getIsMobile"
  >
    <v-card class="pa-0">
      <v-toolbar dark dense color="blue-grey lighten-4 black--text">
        <div class="title">
          {{ document ? document.filename : "" }}
        </div>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon light @click="isShowDialog = false">
            <v-icon color="grey darken-2">
              fa-times
            </v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-divider style="padding-top: 4px;" />

      <v-card-text class="pa-0 modal-document-grid" style="overflow: hidden;">
        <div
          class="document-preview-iframe"
          style="background-color: #f1f1f1;"
          :style="!previewTab ? 'overflow: auto;' : 'overflow: hidden;'"
        >
          <div v-if="pages">
            <div class="preview-header-action">
              <v-tabs v-model="previewTab">
                <v-tab ripple>
                  Preview
                </v-tab>
                <v-tab ripple>
                  <span v-if="isPdf">
                    PDF
                  </span>
                  <span v-else-if="isHtml">
                    Html
                  </span>
                </v-tab>
              </v-tabs>
              <div
                v-if="!previewTab"
                style="position: absolute; top: 4px; right: 6px; z-index: 1000;"
              >
                <v-btn
                  v-if="document"
                  text
                  icon
                  class="my-0 mr-0 ml-2"
                  color="blue-grey"
                  title="download"
                  :href="document.s3Url"
                  target="_blank"
                  @click.stop
                >
                  <v-icon>fa-download</v-icon>
                </v-btn>
                <v-btn
                  small
                  outlined
                  fab
                  class="pa-0 my-0 mr-0 ml-2"
                  color="blue-grey"
                  title="Zomm out"
                  :disabled="imgZoom === 0.1"
                  @click="previewZoom(-0.1)"
                >
                  <v-icon>fa-search-minus</v-icon>
                </v-btn>
                <v-btn
                  small
                  outlined
                  fab
                  class="pa-0 my-0 mr-0 ml-2"
                  color="blue-grey"
                  title="Fit to page"
                  :disabled="imgZoom === 1"
                  @click="imgZoom = 1"
                >
                  <v-icon>fa-file</v-icon>
                </v-btn>
                <v-btn
                  small
                  outlined
                  fab
                  class="pa-0 my-0 mr-0 ml-2"
                  color="blue-grey"
                  title="Zoom in"
                  @click="previewZoom(0.1)"
                >
                  <v-icon>fa-search-plus</v-icon>
                </v-btn>
                <v-menu offset-y bottom left>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      text
                      icon
                      class="pa-0 my-0 mr-0 ml-2"
                      color="blue-grey"
                      title="Pages"
                      v-on="on"
                    >
                      <v-icon>fa-bookmark</v-icon>
                    </v-btn>
                  </template>
                  <v-list style="z-index: 1000000;">
                    <v-list-tile
                      v-for="(page, index) in pages"
                      :key="`page${index}`"
                      @click="scrollToPage(page)"
                    >
                      <v-list-tile-title>
                        Page {{ page.pageNum }}
                      </v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>
              </div>
            </div>
            <div
              v-if="!previewTab"
              id="viewPages"
              ref="documentDisplay"
              style="height: calc(100vh - 198px); overflow: auto;"
            >
              <v-menu
                v-model="showMenu"
                absolute
                offset-y
                style="max-width: 600px"
              >
                <template v-slot:activator="{ on }">
                  <div v-on="on" style="position: relative;">
                    <div
                      v-for="(page, index) in pages"
                      :key="`page${index}`"
                      style="position: relative; margin: 10px;"
                    >
                      <img
                        :src="page.location"
                        alt="document"
                        :style="
                          `width: ${imgZoom * page.imgWidth}px; height: ${imgZoom *
                            page.imgHeight}px;`
                        "
                      />
                      <div
                        v-for="(zone, index) in page.zones"
                        :key="`zone${index}`"
                        class="text-zone"
                        :class="zone.select ? 'text-select' : ''"
                        :style="
                          `left: ${(page.imgWidth * zone.left * imgZoom) - 2}px; top: ${(page.imgHeight * zone.top * imgZoom) - 4}px; width: ${(page.imgWidth * zone.width * imgZoom) + 4}px; height: ${(page.imgHeight * zone.height * imgZoom) + 8}px;`
                        "
                        :title="zone.text"
                      />
                    </div>
                    <v-menu
                      v-for="(posComment, index) in posComments"
                      :key="`posComment${index}`"
                      v-model="posComment.show"
                      :close-on-content-click="false"
                      :nudge-width="200"
                      offset-x
                    >
                      <template v-slot:activator="{ on }">
                        <div
                          v-on="on"
                          class="position-comment"
                          :style="
                            `top: ${posComment.posY *
                              imgZoom}px; left: ${posComment.posX * imgZoom}px;`
                          "
                          @click.stop
                        >
                          {{ index + 1 }}
                        </div>
                      </template>

                      <v-card min-width="350">
                        <v-list>
                          <v-list-tile
                            v-for="(message, index2) in posComment.messages"
                            :key="`message${index2}`"
                            avatar
                          >
                            <v-list-tile-avatar>
                              <img
                                :src="message.userPhoto"
                                :alt="message.username"
                              />
                            </v-list-tile-avatar>

                            <v-list-tile-content>
                              <v-list-tile-title>
                                {{ message.username }}
                                <span
                                  class="blue-grey--text"
                                  style="font-size: 11px;"
                                >
                                  {{
                                    ` (${moment(
                                      message.creationDate
                                    ).fromNow()} - ${moment(
                                      message.creationDate
                                    ).format("LT")})`
                                  }}
                                </span>
                              </v-list-tile-title>
                              <v-list-tile-sub-title>
                                {{ message.message }}
                              </v-list-tile-sub-title>
                            </v-list-tile-content>

                            <v-list-tile-action>
                              <v-btn
                                @click="messageDelete(posComment, message)"
                                icon
                                ripple
                              >
                                <v-icon color="grey lighten-1" title="Delete">
                                  fa-trash-o
                                </v-icon>
                              </v-btn>
                            </v-list-tile-action>
                          </v-list-tile>
                        </v-list>
                        <div class="px-2">
                          <v-text-field
                            v-model="addCommentMessage"
                            clearable
                            label="Comment"
                            type="text"
                          />
                        </div>

                        <v-divider></v-divider>

                        <v-card-actions>
                          <v-spacer></v-spacer>

                          <v-btn text @click="posComment.show = false">
                            Cancel
                          </v-btn>
                          <v-btn
                            text
                            color="primary"
                            @click="addComment2(posComment)"
                          >
                            Save
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-menu>
                  </div>
                </template>
                <v-card id="addCommentCard" @click.stop min-width="350">
                  <v-card-text class="headline pt-1 pb-0 px-2">
                    <v-text-field
                      v-model="addCommentMessage"
                      clearable
                      label="Comment"
                      type="text"
                    />
                  </v-card-text>

                  <v-divider />

                  <v-card-actions>
                    <v-avatar size="26px" class="pr-2">
                      <img :src="getUserPhoto" :alt="getUsername" />
                    </v-avatar>
                    <v-spacer></v-spacer>
                    <v-btn text @click="showMenu = false">
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      :color="
                        !addCommentMessage || addCommentMessage === ''
                          ? 'grey'
                          : 'primary'
                      "
                      @click="addComment()"
                    >
                      Add
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-menu>
            </div>
            <div v-else>
              <div v-if="isHtml || isPdf">
                <iframe
                  allow="encrypted-media"
                  allowfullscreen=""
                  frameborder="0"
                  gesture="media"
                  scrolling="yes"
                  :src="document.s3Url"
                  style="height: calc(100vh - 197px); border: 0; width: 100%;"
                />
              </div>
              <div v-else-if="isImage" class="ma-3" style="position: relative;">
                <img
                  v-if="imgWidth && imgHeight"
                  :src="document.s3Url"
                  alt="document"
                  :style="
                    `width: ${imgZoom * imgWidth}px; height: ${imgZoom * imgHeight}px;`
                  "
                />
                <div
                  v-for="(zone, index) in zones"
                  :key="`zone${index}`"
                  class="text-zone"
                  :class="zone.select ? 'text-select' : ''"
                  style="top: 305px; left: 440px; width: 235px; height: 40px;"
                  :style="
                    `left: ${(imgWidth * zone.left * imgZoom) - 2}px; top: ${(imgHeight * zone.top * imgZoom) - 4}px; width: ${(imgWidth * zone.width * imgZoom) + 4}px; height: ${(imgHeight * zone.height * imgZoom) + 8}px;`
                  "
                  :title="zone.text"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="document"
          class="pa-0 modal-side-panel-grid"
          style="overflow: auto;"
        >
          <div style="border-right: 1px solid #c1c1c1;">
            <div>
              <v-tooltip left>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    @click="menu = 'properties'"
                    :fab="menu === 'properties'"
                    :dark="menu === 'properties'"
                    :small="menu === 'properties'"
                    :text="menu !== 'properties'"
                    :icon="menu !== 'properties'"
                    color="blue"
                  >
                    <v-icon>fa-list-alt</v-icon>
                  </v-btn>
                </template>
                <span>Properties</span>
              </v-tooltip>
            </div>
            <div>
              <v-tooltip left>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    @click="menu = 'comments'"
                    :fab="menu === 'comments'"
                    :dark="menu === 'comments'"
                    :small="menu === 'comments'"
                    :text="menu !== 'comments'"
                    :icon="menu !== 'comments'"
                    color="blue"
                  >
                    <v-icon>fa-comments</v-icon>
                  </v-btn>
                </template>
                <span>comments</span>
              </v-tooltip>
            </div>
            <div>
              <v-tooltip left>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    @click="menu = 'info'"
                    :fab="menu === 'info'"
                    :dark="menu === 'info'"
                    :small="menu === 'info'"
                    :text="menu !== 'info'"
                    :icon="menu !== 'info'"
                    color="blue"
                  >
                    <v-icon>fa-info</v-icon>
                  </v-btn>
                </template>
                <span>info</span>
              </v-tooltip>
            </div>
          </div>
          <div>
            <div v-if="menu === 'properties'" class="pa-3">
              <h4 class="blue--text text--darken-1">
                CPV
              </h4>
              <div class="pb-3">
                
                <v-expansion-panels
                  v-if="cpvCategorys && cpvCategorys.length"
                  v-model="cpvPanels"
                  expand
                  focusable
                >
                  <v-expansion-panel
                    v-for="(cpvCategory, index2) in cpvCategorys"
                    :key="`cpvCategory${index2}`"
                    class="box-expansion-panel pa-0"
                  >
                    <v-expansion-panel-header>
                      <div>
                        <v-avatar class="ml-2" size="18">
                          <img :src="cpvLogo(cpvCategory.cpvs[0].cpv)" alt="" />
                        </v-avatar>
                        <span class="font-weight-bold">
                          {{ cpvCategory.category }}
                        </span>
                        ({{ cpvCategory.count }})
                      </div>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="pa-0">
                      <div style="background-color: #f8f8f8;">
                        <div
                          v-for="(cpv, index2) in cpvCategory.cpvs"
                          :key="`cpv${index2}`"
                        >
                          <div
                            class="cursor-pointer py-1 pl-2 blue-grey--text"
                            @click="cpv.isOpen = !cpv.isOpen"
                          >
                            <v-icon
                              v-if="!cpv.isOpen"
                              style="font-size: 16px; margin-bottom: 2px;"
                            >
                              fa-caret-right
                            </v-icon>
                            <v-icon
                              v-else
                              style="font-size: 16px; margin-bottom: 2px;"
                            >
                              fa-caret-down
                            </v-icon>
                            <span class="font-weight-bold">
                              {{ cpv.cpv.label }}
                              <span>({{ cpv.cpvs.length }})</span>
                            </span>
                          </div>
                          <div v-if="cpv.isOpen" class="pl-3 pr-1">
                            <div
                              v-for="(parseResult, index3) in cpv.cpvs"
                              :key="`parseResult${index3}`"
                              class="pt-1"
                              :class="
                                parseResult.boundingBox ? 'cursor-pointer' : ''
                              "
                              style="border-top: 1px solid #c1c1c1;"
                              :style="
                                parseResult.zone.select
                                  ? 'background-color: #e8f3db;'
                                  : ''
                              "
                              @click="scrollTo(parseResult.zone)"
                            >
                              <div class="blue-grey--text text--lighten-3">
                                (position {{ parseResult.startIndex }})
                              </div>
                              <span v-html="parseResult.contextHtml" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
                <div v-else class="grey--text text-xs-center pt-3 pb-4">
                  No CPV found
                </div>
              </div>
              <div
                v-if="
                  !dataTextParses.loading ||
                    !tenderCriterions ||
                    !tenderCriterions.length
                "
                class="grey--text text-xs-center pt-3 pb-4"
              >
                No properties
              </div>
              <div v-else>
                <div
                  v-for="(result, index) in tenderCriterions"
                  :key="`result${index}`"
                  class="pb-3"
                >
                  <h4 class="blue--text text--darken-1">
                    {{ result.theme }}
                  </h4>
                  <v-expansion-panels
                    v-if="cpvCategorys && cpvCategorys.length"
                    expand
                    focusable
                  >
                    <v-expansion-panel
                      v-for="(group, index2) in result.groups"
                      :key="`group${index2}`"
                      class="box-expansion-panel"
                    >
                      <v-expansion-panel-header>
                        <div>
                          <span class="font-weight-bold">
                            {{ group.group }}
                          </span>
                          ({{ group.count }})
                        </div>
                      </v-expansion-panel-header>
                      <v-expansion-panel-content>
                        <div
                          v-for="(word, index2) in group.words"
                          :key="`word${index2}`"
                        >
                          <div
                            class="cursor-pointer py-1 pl-2 blue-grey--text"
                            @click="word.isOpen = !word.isOpen"
                          >
                            <v-icon
                              v-if="!word.isOpen"
                              style="font-size: 16px; margin-bottom: 2px;"
                            >
                              fa-caret-right
                            </v-icon>
                            <v-icon
                              v-else
                              style="font-size: 16px; margin-bottom: 2px;"
                            >
                              fa-caret-down
                            </v-icon>
                            <span class="font-weight-bold">
                              {{ word.word }}
                              <span>({{ word.parseResults.length }})</span>
                            </span>
                          </div>
                          <div v-if="word.isOpen" class="pl-3 pr-1">
                            <div
                              v-for="(parseResult, index3) in word.parseResults"
                              :key="`parseResult${index3}`"
                              class="pt-1"
                              :class="
                                parseResult.zone ? 'cursor-pointer' : ''
                              "
                              style="border-top: 1px solid #c1c1c1;"
                              :style="
                                parseResult.zone && parseResult.zone.select
                                  ? 'background-color: #e8f3db;'
                                  : ''
                              "
                              @click="scrollTo(parseResult.zone)"
                            >
                              <div class="blue-grey--text text--lighten-3">
                                (position {{ parseResult.startIndex }})
                              </div>
                              <span v-html="parseResult.contextHtml" />
                            </div>
                          </div>
                        </div>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </div>
              </div>
            </div>

            <div v-if="menu === 'comments'" class="pa-3">
              <div v-if="posComments && posComments.length">
                <v-btn
                  v-for="(posComment, index) in posComments"
                  :key="`posComment${index}`"
                  fab
                  dark
                  small
                  color="blue-grey"
                  class="mr-0"
                  @click="scrollToComment(posComment)"
                >
                  {{ index + 1 }}
                </v-btn>

                <v-divider class="mt-2 pb-3" />
              </div>

              <v-text-field
                :disabled="
                  !user ||
                    !messageLoading ||
                    (commentTabActive === 0 && !user.organizationId)
                "
                v-model="message"
                :append-icon="message ? 'fa-share' : 'fa-ban'"
                outlined
                clearable
                hide-details
                label="Message"
                type="text"
                @keyup.enter="sendMessage()"
                @click:append="sendMessage()"
              />

              <v-tabs fixed-tabs grow v-model="commentTabActive">
                <v-tab ripple>
                  Private
                </v-tab>
                <v-tab ripple>
                  Public
                </v-tab>
                <v-tab-item>
                  <div
                    v-if="!this.user || !this.user.organizationId"
                    class="pa-5 text-xs-center"
                  >
                    <a
                      class="caption"
                      style="text-decoration: none;"
                      :href="`https://platform.deepbloo.com/users/${getUserHivebriteId}`"
                      target="_blank"
                      @click.stop
                      :title="getUsername"
                    >
                      No organization. to modify your preferences, go on your profile
                    </a>
                  </div>
                  <div
                    v-else-if="!dataDocumentMessages.loading"
                    class="pa-5 text-xs-center"
                  >
                    <v-progress-circular
                      :size="50"
                      color="blue-grey lighten-4"
                      indeterminate
                    />
                  </div>
                  <div
                    v-else-if="dataDocumentMessages.loading === -1"
                    class="pa-5 text-xs-center red--text"
                  >
                    Error !
                  </div>
                  <div
                    v-else-if="!getMessagePrivates.length"
                    class="pa-5 text-xs-center grey--text"
                  >
                    No message
                  </div>
                  <v-list v-else three-line>
                    <template v-for="(item, index) in getMessagePrivates">
                      <v-subheader v-if="item.header" :key="item.header">
                        {{ item.header }}
                      </v-subheader>

                      <v-divider
                        v-else-if="item.divider"
                        :key="index"
                        :inset="item.inset"
                      ></v-divider>

                      <v-list-tile v-else :key="item.title" avatar @click.stop>
                        <v-list-tile-avatar>
                          <img :src="item.avatar" />
                        </v-list-tile-avatar>

                        <v-list-tile-content>
                          <v-list-tile-title
                            class="blue-grey--text text--lighten-2 caption"
                          >
                            {{ item.title }}
                          </v-list-tile-title>
                          <v-list-tile-sub-title class="black--text">
                            {{ item.subtitle }}
                          </v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </template>
                  </v-list>
                </v-tab-item>
                <v-tab-item>
                  <div
                    v-if="!dataDocumentMessages.loading"
                    class="pa-5 text-xs-center"
                  >
                    <v-progress-circular
                      :size="50"
                      color="blue-grey lighten-4"
                      indeterminate
                    />
                  </div>
                  <div
                    v-else-if="dataDocumentMessages.loading === -1"
                    class="pa-5 text-xs-center red--text"
                  >
                    Error !
                  </div>
                  <div
                    v-else-if="!getMessagePublics.length"
                    class="pa-5 text-xs-center grey--text"
                  >
                    No message
                  </div>
                  <v-list v-else three-line>
                    <template v-for="(item, index) in getMessagePublics">
                      <v-subheader v-if="item.header" :key="item.header">
                        {{ item.header }}
                      </v-subheader>

                      <v-divider
                        v-else-if="item.divider"
                        :key="index"
                        :inset="item.inset"
                      ></v-divider>

                      <v-list-tile v-else :key="item.title" avatar @click.stop>
                        <v-list-tile-avatar>
                          <img :src="item.avatar" />
                        </v-list-tile-avatar>

                        <v-list-tile-content>
                          <v-list-tile-title
                            class="blue-grey--text text--lighten-2 caption"
                          >
                            {{ item.title }}
                          </v-list-tile-title>
                          <v-list-tile-sub-title class="black--text">
                            {{ item.subtitle }}
                          </v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </template>
                  </v-list>
                </v-tab-item>
              </v-tabs>
            </div>

            <div v-if="menu === 'info'" class="pa-3">
              <div class="pb-3">
                <div class="blue-grey--text text--lighten-2">Creation:</div>
                <div>{{ moment(document.creationDate).format("LL - LTS") }}</div>
              </div>
              <div class="pb-3">
                <div class="blue-grey--text text--lighten-2">Size</div>
                <div>{{ humanFileSize(true) }}</div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from "vuex"
import moment from "moment"
import { v4 as uuidv4 } from "uuid"

export default {
  name: "DocumentDialog",

  data: () => ({
    moment,
    isShowDialog: false,
    document: null,
    fileSize: null,
    user: null,
    dataCpvs: {
      loading: null,
      data: null
    },
    dataTextParses: {
      loading: null,
      data: null
    },
    parseResults: null,
    cpvCategorys: null,
    tenderCriterions: null,
    messageLoading: 1,
    dataDocumentMessages: {
      loading: null,
      data: null
    },
    menu: "properties",
    cpvPanels: [],
    commentTabActive: null,
    message: null,
    addCommentMessage: "",
    previewTab: 0,
    imgZoom: 1,
    imgWidth: null,
    imgHeight: null,
    pages: [],
    zones: [],
    showMenu: false,
    posComments: [],
    notEmptyRules: [v => !!v || "Data is required"]
  }),

  computed: {
    ...mapGetters([
      "getIsMobile",
      "getUserId",
      "getUserHivebriteId",
      "getUserPhoto",
      "getUsername"
    ]),

    getCpvs() {
      const cpvs = []
      if (
        !this.document
        || !this.document.cpvs
        || !this.dataCpvs.data
      ) {
        return cpvs
      }
      const cpvCodes = this.document.cpvs.split(",")
      for (const cpvCode of cpvCodes) {
        const cpv = this.dataCpvs.data.find(
          a => a.code.toString() === cpvCode.toString()
        )
        if (cpv) {
          cpvs.push(cpv)
        }
      }
      return cpvs
    },

    getMessagePrivates() {
      const documentMessages = this.dataDocumentMessages.data.filter(
        a => (!a.type || a.type.trim() === "") && a.organizationId
      );

      const items = [];
      let header = null;
      for (const documentMessage of documentMessages) {
        const creationDate = moment(documentMessage.creationDate).format("LL");
        let documentHeader = creationDate;
        let now = moment(new Date()).format("LL");
        if (creationDate === now) {
          documentHeader = "Today";
        }
        if (header !== documentHeader) {
          items.push({ header: documentHeader });
          header = documentHeader;
        }
        items.push({
          avatar: documentMessage.userPhoto,
          title: `${moment(documentMessage.creationDate).fromNow()} - ${moment(documentMessage.creationDate).format("LT")}`,
          subtitle: documentMessage.message
        });
      }
      return items;
    },

    getMessagePublics() {
      const documentMessages = this.dataDocumentMessages.data.filter(
        a => (!a.type || a.type.trim() === "") && !a.organizationId
      );

      const items = [];
      let header = null;
      for (const documentMessage of documentMessages) {
        const creationDate = moment(documentMessage.creationDate).format("LL");
        let documentHeader = creationDate;
        let now = moment(new Date()).format("LL");
        if (creationDate === now) {
          documentHeader = "Today";
        }
        if (header !== documentHeader) {
          items.push({ header: documentHeader });
          header = documentHeader;
        }
        items.push({
          avatar: documentMessage.userPhoto,
          title: `${moment(documentMessage.creationDate).fromNow()} - ${moment(documentMessage.creationDate).format("LT")}`,
          subtitle: documentMessage.message
        });
      }
      return items;
    },

    isPdf() {
      if (
        this.document &&
        this.document.filename.toLowerCase().endsWith(".pdf")
      ) {
        return true;
      }
      return false;
    },

    isHtml() {
      if (
        this.document &&
        (this.document.filename.toLowerCase().endsWith(".html") ||
          this.document.filename.toLowerCase().endsWith(".htm"))
      ) {
        return true;
      }
      return false;
    },

    isImage() {
      if (
        this.document &&
        (this.document.filename.toLowerCase().endsWith(".jpg") ||
          this.document.filename.toLowerCase().endsWith(".png"))
      ) {
        return true;
      }
      return false;
    }
  },

  mounted() {
    this.loadUser();
    this.loadCpvs();
    this.loadTextParses();
  },

  methods: {
    show(document) {
      this.isShowDialog = true;
      this.posComments = [];
      this.document = document;
      this.initParseResult();
      if (this.isImage) {
        var img = new Image();
        img.onload = () => {
          this.imgWidth = img.width;
          this.imgHeight = img.height;
          // this.imgZoom = (this.$refs.documentDisplay.clientWidth - 50) / this.imgWidth
        };
        img.src = this.document.s3Url;
      }
      this.loadDocumentMessages();
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

    async loadCpvs() {
      try {
        this.dataCpvs.loading = 0
        const res = await this.$api.post("/Cpv/CpvList")
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataCpvs.data = res.data
        this.dataCpvs.loading = 1
      } catch (err) {
        this.dataCpvs.loading = -1
        this.$api.error(err, this)
      }
    },

    async loadTextParses() {
      try {
        this.dataTextParses.loading = 0
        const res = await this.$api.post("/TextParse/textParseList")
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataTextParses.data = res.data
        this.dataTextParses.loading = 1
      } catch (err) {
        this.dataTextParses.loading = -1
        this.$api.error(err, this)
      }
    },

    initParseResult() {
      if (
        !this.document
        || !this.document.parseResult
        || this.document.parseResult.trim() === ""
        || !this.dataTextParses.loading
        || !this.dataCpvs.data
      ) {
        return null
      }
      this.parseResults = JSON.parse(this.document.parseResult)
      this.cpvCategorys = []
      this.cpvPanels = []
      this.tenderCriterions = []
      this.pages = []
      this.zones = []
      if (this.parseResults && this.parseResults.pages) {
        let pageNum = 0
        for (const page of this.parseResults.pages) {
          pageNum = pageNum + 1
          page.zones = []
          page.pageNum = pageNum
          if (page.cpvs) {
            for (const cpv of page.cpvs) {
              const cpvData = this.dataCpvs.data.find(
                a => a.code.toString() === cpv.code.toString()
              )
              if (!cpvData) {
                continue
              }
              let cpvCategoryFind = this.cpvCategorys.find(
                a => a.category === cpvData.category
              )
              if (!cpvCategoryFind) {
                cpvCategoryFind = {
                  category: cpvData.category,
                  count: 0,
                  cpvs: [],
                }
                this.cpvCategorys.push(cpvCategoryFind)
                this.cpvPanels.push(false)
              }
              let cpvFind = cpvCategoryFind.cpvs.find(a => a.code === cpv.code)
              if (!cpvFind) {
                cpvFind = {
                  code: cpv.code,
                  cpv: cpvData,
                  isOpen: false,
                  cpvs: [],
                }
                cpvCategoryFind.cpvs.push(cpvFind)
              }
              let zone = {
                ...cpv.boundingBox,
                page,
                select: false,
              }
              const replaceMask = `<span class="yellow">${cpv.tenderCriterionCpv.wordMatch}</span>`
              cpv.contextHtml = `...${cpv.tenderCriterionCpv.context.replace(new RegExp(cpv.tenderCriterionCpv.wordMatch, "i"), replaceMask)}...`
              cpvFind.cpvs.push({
                ...cpv,
                startIndex: cpv.tenderCriterionCpv.startIndex,
                zone,
                pageNum,
              })
              page.zones.push(zone)
              this.zones.push(zone)
            }
          }
          this.pages.push(page)

          if (page.tenderCriterions) {
            for (const parseResult of page.tenderCriterions) {
              const parseResultFind = this.dataTextParses.data.find(
                a => a.textParseId === parseResult.textParseId
              )
              if (!parseResultFind) {
                continue
              }
              let result = this.tenderCriterions.find(
                a => a.theme === parseResultFind.theme
              )
              if (!result) {
                result = {
                  theme: parseResultFind.theme,
                  groups: [],
                }
                this.tenderCriterions.push(result)
              }
              let group = result.groups.find(
                a => a.group === parseResultFind.group
              )
              if (!group) {
                group = {
                  group: parseResultFind.group,
                  words: [],
                }
                result.groups.push(group)
              }
              let wordCode =
                parseResultFind.type === "METRIC"
                  ? `${parseResult.value} ${parseResult.word}`
                  : parseResult.word
              let word = group.words.find(
                a => a.word.toUpperCase() === wordCode.toUpperCase()
              )
              if (!word) {
                word = {
                  word: wordCode,
                  parseResult: parseResultFind,
                  isOpen: false,
                  parseResults: [],
                }
                group.words.push(word)
              }
              const replaceMask = `<span class="yellow">${parseResult.wordMatch}</span>`
              parseResult.contextHtml = `...${parseResult.context.replace(new RegExp(parseResult.wordMatch, "i"), replaceMask)}...`
              parseResult.page = page;
              if (parseResult.boundingBox) {
                parseResult.zone = {
                  text: parseResult.wordMatch,
                  select: false,
                  page,
                  ...parseResult.boundingBox,
                }
                page.zones.push(parseResult.zone)
                this.zones.push(parseResult.zone)
              }
              parseResult.parseResult = parseResultFind
              word.parseResults.push(parseResult)
            }
          }
        }
      }
      for (const cpvCategory of this.cpvCategorys) {
        cpvCategory.count = 0
        for (const cpv of cpvCategory.cpvs) {
          cpvCategory.count += cpv.cpvs.length
        }
      }
      this.cpvCategorys = this.cpvCategorys.sort((a, b) => {
        let na = a.count
        let nb = b.count
        return na < nb ? 1 : na > nb ? -1 : 0
      })
      for (const cpvCategory of this.cpvCategorys) {
        cpvCategory.cpvs = cpvCategory.cpvs.sort((a, b) => {
          let na = a.cpvs.length
          let nb = b.cpvs.length
          return na < nb ? 1 : na > nb ? -1 : 0
        })
      }

      for (const result of this.tenderCriterions) {
        for (const group of result.groups) {
          group.count = 0
          for (const word of group.words) {
            group.count += word.parseResults.length
          }
        }
      }
      for (const result of this.tenderCriterions) {
        result.groups = result.groups.sort((a, b) => {
          let na = a.count
          let nb = b.count
          return na < nb ? 1 : na > nb ? -1 : 0
        })
        for (const group of result.groups) {
          group.words = group.words.sort((a, b) => {
            let na = a.parseResults.length
            let nb = b.parseResults.length
            return na < nb ? 1 : na > nb ? -1 : 0
          })
        }
      }
    },

    async loadDocumentMessages() {
      try {
        this.dataDocumentMessages.loading = 0;
        const res = await this.$api.post("/Document/documentMessageList", {
          filter: {
            documentId: this.document.documentId
          },
          userData: true
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.dataDocumentMessages.data = res.data
        this.dataDocumentMessages.loading = 1
        this.initMessagePosition()
      } catch (err) {
        this.dataDocumentMessages.loading = -1
        this.$api.error(err, this)
      }
    },

    initMessagePosition() {
      this.posComments = []
      if (!this.dataDocumentMessages || !this.dataDocumentMessages.loading) {
        return null
      }
      const documentMessages = this.dataDocumentMessages.data
        .filter(a => a.type === "POSITION" && a.userId === this.getUserId)
        .sort((a, b) => {
          let na = a.creationDate
          let nb = b.creationDate
          return na < nb ? -1 : na > nb ? 1 : 0
        })
      for (const documentMessage of documentMessages) {
        const posComment = this.posComments.find(
          a => a.groupId === documentMessage.groupId
        )
        if (!posComment) {
          this.posComments.push({
            messages: [documentMessage],
            groupId: documentMessage.groupId,
            posX: documentMessage.posX,
            posY: documentMessage.posY,
            show: false,
          })
        } else {
          posComment.messages.push(documentMessage)
        }
      }
    },

    cpvLogo(cpv) {
      if (!cpv || !cpv.logo || cpv.logo === "") {
        return "https://tender-document-bucket-v2.s3-eu-west-1.amazonaws.com/images/default.png"
      }
      return cpv.logo
    },

    cpvLabel(cpvCode) {
      if (
        !cpvCode
        || cpvCode === ''
        || !this.dataCpvs.loading
        || !this.dataCpvs.data
      ) {
        return ''
      }
      const cpv = this.dataCpvs.data.find(
        a => a.code.toString() === cpvCode.toString()
      )
      if (!cpv || !cpv.logo || cpv.logo === "") {
        return ""
      }
      return cpv.label
    },

    humanFileSize(si) {
      if (!this.document || !this.document.size) {
        return '-'
      }
      let size = this.document.size // * 1000
      const thresh = si ? 1000 : 1024
      if (Math.abs(size) < thresh) {
        return size + " B"
      }
      var units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
      var u = -1
      do {
        size /= thresh
        ++u
      } while (Math.abs(size) >= thresh && u < units.length - 1)
      return size.toFixed(1) + " " + units[u]
    },

    async sendMessage() {
      try {
        if (
          !this.message
          || this.message.trim() === ''
        ) {
          return
        }
        this.messageLoading = 0
        const res = await this.$api.post("/Document/documentMessageAddUpdate", {
          documentMessage: {
            documentId: this.document.documentId,
            organizationId:
              this.commentTabActive === 0 ? this.user.organizationId : 0,
            userId: this.getUserId,
            message: this.message,
            status: 1
          }
        })
        if (!res.success) {
          throw new Error(res.Error)
        }
        this.message = "";
        this.messageLoading = 1;
        this.loadDocumentMessages();
      } catch (err) {
        this.messageLoading = -1;
        this.$api.error(err, this);
      }
    },

    previewZoom(value) {
      this.imgZoom = this.imgZoom + value;
      if (this.imgZoom <= 0) {
        this.imgZoom = 0.1;
      }
    },

    scrollToPage(page) {
      if (!page) {
        return;
      }
      let topPage = 0;
      for (let i = 1; i < page.pageNum; i++) {
        const page = this.parseResults.pages[i - 1];
        topPage = topPage + page.imgHeight;
      }
      let top = topPage * this.imgZoom;
      this.$refs.documentDisplay.scrollTo({
        top,
        left: 0,
        behavior: "smooth"
      });
    },

    scrollToComment(comment) {
      if (!comment) {
        return;
      }
      this.$refs.documentDisplay.scrollTo({
        top: comment.posY,
        left: 0,
        behavior: "auto"
      });
      setTimeout(() => {
        comment.show = true;
      }, 50);
    },

    scrollTo(zone) {
      if (!zone) {
        return;
      }
      for (const zoneTemp of this.zones) {
        zoneTemp.select = false;
      }
      let topPage = 0;
      for (let i = 1; i < zone.page.pageNum; i++) {
        const page = this.parseResults.pages[i - 1];
        topPage = topPage + page.imgHeight;
      }
      let top = topPage * this.imgZoom;
      top = top + (this.imgHeight * zone.top * this.imgZoom) - 50;
      this.$refs.documentDisplay.scrollTo({
        top,
        left: 0,
        behavior: "smooth"
      });
      zone.select = !zone.select;
    },

    addComment() {
      if (!this.addCommentMessage || this.addCommentMessage === "") {
        return;
      }
      const viewPages = document.getElementById("viewPages");
      const addCommentCard = document.getElementById("addCommentCard");
      let posX =
        addCommentCard.getBoundingClientRect().x -
        viewPages.getBoundingClientRect().x -
        15 +
        this.$refs.documentDisplay.scrollLeft;
      let posY =
        addCommentCard.getBoundingClientRect().y -
        viewPages.getBoundingClientRect().y -
        25 +
        this.$refs.documentDisplay.scrollTop;
      const documentMessage = {
        documentId: this.document.documentId,
        organizationId: this.user.organizationId,
        userId: this.getUserId,
        username: this.getUsername,
        userPhoto: this.getUserPhoto,
        type: "POSITION",
        groupId: uuidv4(),
        posX,
        posY,
        message: this.addCommentMessage
      };
      this.addPosMessage(documentMessage);

      this.showMenu = false;
      this.addCommentMessage = "";
    },

    addComment2(posComment) {
      if (!this.addCommentMessage || this.addCommentMessage === "") {
        return;
      }
      if (!posComment) {
        return;
      }
      const documentMessage = {
        documentId: this.document.documentId,
        organizationId: this.user.organizationId,
        userId: this.getUserId,
        username: this.getUsername,
        userPhoto: this.getUserPhoto,
        type: "POSITION",
        groupId: posComment.groupId,
        posX: posComment.posX,
        posY: posComment.posY,
        message: this.addCommentMessage
      };
      this.addPosMessage(documentMessage, posComment);

      posComment.show = false;
      this.addCommentMessage = "";
    },

    async addPosMessage(documentMessage, posComment) {
      try {
        if (!documentMessage) {
          return;
        }
        this.messageLoading = 0;
        const res = await this.$api.post("/Document/documentMessageAddUpdate", {
          documentMessage
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        if (!posComment) {
          this.posComments.push({
            messages: [{ ...documentMessage, ...res.data }],
            groupId: documentMessage.groupId,
            posX: documentMessage.posX,
            posY: documentMessage.posY,
            show: false
          });
        } else {
          posComment.messages.push(res.data);
        }
      } catch (err) {
        this.messageLoading = -1;
        this.$api.error(err, this);
      }
    },

    async messageDelete(posComment, message) {
      try {
        if (!message) {
          return;
        }
        const res = await this.$api.post("/Document/documentMessageDelete", {
          documentMessageId: message.documentMessageId
        });
        if (!res.success) {
          throw new Error(res.Error);
        }
        this.loadDocumentMessages();
      } catch (err) {
        this.messageLoading = -1;
        this.$api.error(err, this);
      }
    }
  }
};
</script>

<style>
.position-comment {
  position: absolute;
  background-color: rgba(96, 125, 139, 0.85);
  color: #ffffff;
  text-align: center;
  width: 30px;
  height: 30px;
  border-radius: 100px;
  padding-top: 4px;
  border: 1px solid #ffffff;
  box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.4);
  cursor: pointer;
}
.position-comment:hover {
  background-color: rgba(96, 125, 139, 1);
}

.modal-document-grid {
  display: grid;
  grid-template-columns: 1fr 450px;
  grid-gap: 0px 0px;
}

.modal-side-panel-grid {
  display: grid;
  grid-template-columns: 60px 1fr;
  grid-gap: 0px 0px;
}

.v-chip.box-chip .v-chip__content {
  word-break: break-all;
  white-space: inherit;
  line-height: 12px;
}

.document-preview-iframe {
  border: 0;
  width: 100%;
  height: calc(100vh - 149px);
}

.box-expansion-panel {
  box-shadow: none;
}

.v-expansion-panel.box-expansion-panel
  .v-expansion-panel__container
  .v-expansion-panel__header {
  min-height: 36px;
  padding: 0px 10px;
}

.text-zone {
  position: absolute;
  border: 1px solid rgba(33, 150, 243, 0);
  background-color: rgba(255, 255, 255, 0);
  cursor: pointer;
}
.text-zone-OLD:hover {
  position: absolute;
  border: 1px solid rgba(33, 150, 243, 1);
  background-color: rgba(0, 0, 0, 0.1);
}

.text-select {
  border: 1px solid rgba(139, 195, 74, 0.2);
  background-color: rgba(139, 195, 74, 0.2);
}

.preview-header-action {
  position: relative;
  z-index: 5;
}
</style>
