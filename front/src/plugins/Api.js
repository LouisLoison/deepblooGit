import axios from "axios";
import store from "@/store";
import router from "@/router/";

export class ApiService {
  constructor(init = true) {
    this.instance = null;
    this.source = null;
    if (init) {
      this.init({});
    }
  }

  getApiHost = () => {
    var Host = store.getters.getApiUrl;
    if (Host === null || Host === "") {
      Host = process.env.VUE_APP_API_HOST;
    }
    return Host;
  };

  Instance = (
    baseURL = this.getApiHost() + "api",
    headers = { Authorization: `bearer ${store.getters.getUserToken}` }
  ) => {
    headers = {
      Authorization: `bearer ${store.getters.getUserToken}`
    };
    var instance = new ApiService();
    instance.setInstance(
      axios.create({
        baseURL: baseURL,
        tieout: 30000,
        headers: headers
      })
    );
    return instance;
  };

  setInstance = instance => {
    this.instance = instance;
  };

  init = (
    headers = { Authorization: `bearer ${store.getters.getUserToken}` }
  ) => {
    headers = {
      Authorization: `bearer ${store.getters.getUserToken}`
    };
    this.instance = axios.create({
      baseURL: `${this.getApiHost()}api`,
      tieout: 30000,
      headers: headers
    });
  };

  check = () => {
    return new Promise((resolve, reject) => {
      try {
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  };

  post = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      this.check()
        .then(() => {
          this.instance
            .post(method, params)
            .then(res => {
              if (res.status !== 200) {
                throw new Error("Api error!");
              }
              if (res.data.status === 403) {
                router.push({
                  name: "Login",
                  params: { logout: true }
                });
                console.log(method);
                throw new Error("Login error!");
              }
              resolve(res.data);
            })
            .catch(err => {
              reject(err);
            });
        })
        .catch(err => {
          // @TODO something with catching user not logged in maybe
          console.log(err);
        });
    });
  };

  get = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      this.check()
        .then(() => {
          this.source = axios.CancelToken.source();
          this.instance
            .get(method, {
              params,
              cancelToken: this.source.token
            })
            .then(res => {
              resolve(res);
            })
            .catch(err => {
              reject(err);
            });
        })
        .catch(err => {
          // @TODO something with catching user not logged in maybe
          console.log(err);
        });
    });
  };

  put = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      this.check()
        .then(() => {
          this.instance
            .put(method, params)
            .then(res => {
              resolve(res);
            })
            .catch(err => {
              reject(err);
            });
        })
        .catch(err => {
          // @TODO something with catching user not logged in maybe
          console.log(err);
        });
    });
  };

  patch = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      this.check()
        .then(() => {
          this.instance
            .patch(method, params)
            .then(res => {
              resolve(res);
            })
            .catch(err => {
              reject(err);
            });
        })
        .catch(err => {
          // @TODO something with catching user not logged in maybe
          console.log(err);
        });
    });
  };

  delete = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      this.check()
        .then(() => {
          this.instance
            .delete(method, { params })
            .then(res => {
              resolve(res);
            })
            .catch(err => {
              reject(err);
            });
        })
        .catch(err => {
          // @TODO something with catching user not logged in maybe
          console.log(err);
        });
    });
  };

  cancel = (message = "") => {
    if (this.source !== null) {
      this.source.cancel(message);
    }
  };

  error = (err = "") => {
    console.log(err);
  };

  fileDownload = fileName => {
    return new Promise((resolve, reject) => {
      if (!fileName || fileName === "") {
        resolve();
        return;
      }
      axios
        .get(this.getApiHost() + `download/${fileName}`)
        .then(res => {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  fileUpload = files => {
    return new Promise((resolve, reject) => {
      if (files.length <= 0) {
        resolve();
        return;
      }
      let Option = JSON.parse(JSON.stringify(store.getters.getSetting));
      Option.ProgressModal.visible = true;
      Option.ProgressModal.value = 0;
      store.commit("UPDATE_SETTING", Option);
      var file = files[0];
      let formData = new FormData();
      formData.append("file", file);
      axios
        .post(this.getApiHost() + "upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: function(progressEvent) {
            if (progressEvent.total === 0) {
              throw new Error("Upload faild !");
            }
            let uploadPercentage = parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            );
            let Option = JSON.parse(JSON.stringify(store.getters.getSetting));
            Option.ProgressModal.value = uploadPercentage;
            store.commit("UPDATE_SETTING", Option);
          }
        })
        .then(() => {
          let Option = JSON.parse(JSON.stringify(store.getters.getSetting));
          Option.ProgressModal.visible = false;
          Option.ProgressModal.value = 0;
          store.commit("UPDATE_SETTING", Option);
          resolve();
        })
        .catch(err => {
          let Option = JSON.parse(JSON.stringify(store.getters.getSetting));
          Option.ProgressModal.visible = false;
          Option.ProgressModal.value = 0;
          store.commit("UPDATE_SETTING", Option);
          reject(err);
        });
    });
  };
}

const ret = () => {};

ret.install = Vue => {
  const api = new ApiService();
  Vue.api = api;
  Object.defineProperty(Vue.prototype, "$api", {
    get: function get() {
      return api;
    }
  });
};

export default ret;
