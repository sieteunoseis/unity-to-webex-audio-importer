const { cleanEnv, str, host, bool } = require("envalid");
const path = require("path");
const webex = require("../lib/webexApi.js");

// Use dotenv for enviromental variables if development
if (process.env.NODE_ENV === "development") {
  require("dotenv").config({ path: path.join(__dirname, "..", "env", "development.env") });
} else if (process.env.NODE_ENV === "test") {
  require("dotenv").config({ path: path.join(__dirname, "..", "env", "test.env") });
} else if (process.env.NODE_ENV === "staging") {
  require("dotenv").config({ path: path.join(__dirname, "..", "env", "staging.env") });
}

let env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production", "staging"],
    desc: "Node environment",
  }),
  CUC_HOSTNAME: host({ desc: "Cisco Unity Connections Hostname or IP Address." }),
  CUC_USERNAME: str({ desc: "Cisco Unity Connections REST Username." }),
  CUC_PASSWORD: str({ desc: "Cisco Unity Connections REST Password." }),
  CUC_LANGUAGE: str({ choices: ["ar-SA","bg-BG","ca-ES","zh-TW","cs-CZ","da-DK","de-DE","gr-GR","en-US","es-ES","fi-FI","fr-FR","he-IL","hu-HU","is-IL","it-IT","ja-JP","ko-KR","nl-NL","nb-NO","pl-PL","pt-BR","rm-CH","ro-RO","ru-RU","hr-HV","sk-SK","sq-al","sv-SE","th-TH","tr-TR","ur-PK","id-ID","uk-UA","be-BY","sl-SI","et-EE","lv-LV","lt-LT","fa-IR","vi-NV","hy-AM","aze-AZ","eu-ES","wen-DE","mk-MK","sot-ZA","ts-MZ","tn-BW","xh-ZA","zu-ZA","af-ZA","ka-GE","fo-FO","hi-IN","mt-MT","gd-GB","ji-XY","ms-MY","kk-KZ","ky-KG","sw-KE","uz-UZ","tt-TR","pa-IN","gu-IN","ta-IN","te-IN","kn-IN","mr-IN","sa-IN","mn-MN","gl-ES","kok-IN","syr-SY","dv-MV","ar-IQ","zh-CN","de-CH","en-GB","es-MX","fr-BE","it-CH","nl-BE","nn-NO","pt-PT","mo-RO","mo-RU","sr-RS","sv-FI","az-AZ","ms-BN","uzb-UZ","ar-EG","zh-HK","de-AT","en-AU","es-XM","fr-CA","sr-CS","ar-LY","zh-SG","de-LU","en-CA","es-GT","fr-CH","ar-DZ","zh-MO","de-LI","en-NZ","es-CR","fr-LU","ar-MA","en-IE","es-PA","fr-MC","ar-TN","en-SA","es-DO","ar-OM","en-JM","es-VE","ar-YE","en-XC","es-CO","ar-SY","en-BZ","es-PE","ar-JO","en-TT","es-AR","ar-LB","en-ZW","es-EC","ar-KW","en-PH","es-CL","ar-AE","es-UY","ar-BH","es-PY","ar-QA","en-IN","es-BO","es-SV","es-HN","es-NI","es-PR","en-XX"], desc: "Cisco Unity Connections Language Code", default: "en-US" }),  
  CUC_DOWNLOAD: bool({ desc: "Download greetings from Unity", default: false }),
  WEBEX: bool({ desc: "Upload to Webex" })
});


if (env.WEBEX){
  console.log("WEBEX is set to true");
  var withWebexEnv = cleanEnv(process.env, {
    WEBEX: bool({ desc: "Upload to Webex (Optional)", default: false }),
    WEBEX_API_KEY: str({ desc: "Webex API Key (Required if Webex is set to true, otherwise optional)"}),
    WEBEX_ORG_ID: str({ desc: "Webex ORG ID (Required if Webex is set to false, otherwise optional)" }),
    WEBEX_SITE_ID: str({ desc: "Webex SITE ID (Optional, ", default: false }),
  });
}else{
  var withoutWebexEnv = cleanEnv(process.env, {
    WEBEX: bool({ desc: "Upload to Webex (Optional)", default: false }),
    WEBEX_API_KEY: str({ desc: "Webex API Key (Required if WEBEX is set to true, otherwise optional)", default: false}),
    WEBEX_ORG_ID: str({ desc: "Webex ORG ID (Required if WEBEX is set to true, otherwise optional)", default: false }),
    WEBEX_SITE_ID: str({ desc: "Webex SITE ID (Optional however will not be used unless WEBEX is set to true ", default: false }),
  });
}

env = { ...env, ...withWebexEnv, ...withoutWebexEnv }

console.log(env)


// (async () => {
//   console.log("Deleting all announcements on the org and site level");

//   // Let's delete all the announcements on the org and site level
//   var announcementFilesOrg = await webex.getAnnouncementFiles(env.WEBEX_API_KEY, env.WEBEX_ORG_ID);
//   var announcementFilesSite = await webex.getAnnouncementFiles(env.WEBEX_API_KEY, env.WEBEX_ORG_ID,env.WEBEX_SITE_ID);

//   // Org level
//   if (Array.isArray(announcementFilesOrg.body.announcements)){
//     for (const files of announcementFilesOrg.body.announcements) {
//       webex.deleteAnnouncementFiles(env.WEBEX_API_KEY, env.WEBEX_ORG_ID, files.id).then((result) => { console.log(result); });
//     }
//   }
//   // Site level
//   if (Array.isArray(announcementFilesSite.body.announcements)){
//     for (const files of announcementFilesSite.body.announcements) {
//       webex.deleteAnnouncementFiles(env.WEBEX_API_KEY, env.WEBEX_ORG_ID, files.id, env.WEBEX_SITE_ID).then((result) => { console.log(result); });
//     }
//   }
// })();
