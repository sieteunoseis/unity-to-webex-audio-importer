const fs = require("fs").promises;
const path = require("path");
const urljoin = require("url-join");

module.exports = {
  uploadAnnouncementFiles: async function (data, fileName, webexToken, webexOrgId, webexLocationId = null) {
    const extension = path.extname(fileName);
    const file = path.basename(fileName, extension);

    const body = new FormData();
    const blob = new Blob([data], {
      type: "audio/wav",
    });
    body.set("name", file);
    body.set("file", blob, fileName);

    let headers = new Headers();
    headers.set("Authorization", `Bearer ${webexToken}`);

    var fullUrl = "https://webexapis.com/v1/telephony/config/";
    if (webexLocationId) {
      fullUrl = urljoin(fullUrl, "locations", webexLocationId);
    }

    var fullUrl = urljoin(fullUrl, "announcements");
    const url = new URL(fullUrl);
    url.searchParams.append("orgId", webexOrgId);

    var output = {
      fileName: fileName,
      status: "",
      contentType: "",
      body: "",
    };

    return fetch(url, {
      method: "POST",
      headers: headers,
      body,
    })
      .then(async (response) => {
        if (response.ok) {
          const isJson = response.headers.get('content-type')?.includes('application/json');
          const data = isJson ? await response.json() : await response.text();
          output.status = response.status;
          output.contentType = response.headers.get("content-type");
          output.body = data;
          return output;
        } else {
          return Promise.reject(response);
        }
      })
      .catch((error) => {
        output.status = error.status;
        output.contentType = error.headers.get("content-type");
        output.body = error.statusText;
        return output;
      });
  },
  getAnnouncementFiles: async function (webexToken, webexOrgId, webexLocationId = null) {
    let headers = new Headers();
    headers.set("Authorization", `Bearer ${webexToken}`);

    const url = new URL("https://webexapis.com/v1/telephony/config/announcements");
    url.searchParams.append("orgId", webexOrgId);

    if (webexLocationId) {
      url.searchParams.append("locationId", webexLocationId);
    }

    var output = {
      status: "",
      contentType: "",
      body: "",
    };

    return fetch(url, {
      method: "GET",
      headers: headers
    })
      .then(async (response) => {
        if (response.ok) {
          const isJson = response.headers.get('content-type')?.includes('application/json');
          const data = isJson ? await response.json() : await response.text();
          output.status = response.status;
          output.contentType = response.headers.get("content-type");
          output.body = data
          return output;
        } else {
          return Promise.reject(response);
        }
      })
      .catch((error) => {
        output.status = error.status;
        output.contentType = error.headers.get("content-type");
        output.body = error.statusText;
        return output;
      });
  },
  deleteAnnouncementFiles: async function (webexToken, webexOrgId, announcementId, webexLocationId = null) {

    let headers = new Headers();
    headers.set("Authorization", `Bearer ${webexToken}`);

    var fullUrl = "https://webexapis.com/v1/telephony/config/";
    if (webexLocationId) {
      fullUrl = urljoin(fullUrl, "locations", webexLocationId);
    }

    var fullUrl = urljoin(fullUrl, "announcements");
    var fullUrl = urljoin(fullUrl, announcementId);
    const url = new URL(fullUrl);
    url.searchParams.append("orgId", webexOrgId);

    var output = {
      announcementId: announcementId,
      status: "",
      contentType: "",
      body: "",
    };

    return fetch(url, {
      method: "DELETE",
      headers: headers,
    })
      .then(async (response) => {
        if (response.ok) {
          const isJson = response.headers.get('content-type')?.includes('application/json');
          const data = isJson ? await response.json() : await response.text();
          output.status = response.status;
          output.contentType = response.headers.get("content-type");
          output.body = data;
          return output;
        } else {
          return Promise.reject(response);
        }
      })
      .catch((error) => {
        output.status = error.status;
        output.contentType = error.headers.get("content-type");
        output.body = error.statusText;
        return output;
      });
  },
};
