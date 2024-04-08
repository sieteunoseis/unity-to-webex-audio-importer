const fs = require("fs");
const path = require("path");
const pLimit = require("p-limit");
const limit = pLimit(5);
const { cleanEnv, str, host, bool } = require("envalid");
const webex = require("./lib/webexApi.js");
const cupi = require("./lib/cupiRest.js");
const isArrayBuffer = require("is-array-buffer");

// Use dotenv for enviromental variables if development
if (process.env.NODE_ENV === "development") {
  require("dotenv").config({ path: path.join(__dirname, ".", "env", "development.env") });
} else if (process.env.NODE_ENV === "test") {
  require("dotenv").config({ path: path.join(__dirname, ".", "env", "test.env") });
} else if (process.env.NODE_ENV === "staging") {
  require("dotenv").config({ path: path.join(__dirname, ".", "env", "staging.env") });
}

var env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production", "staging"],
    desc: "Node environment",
  }),
  CUC_HOSTNAME: host({ desc: "Cisco Unity Connections Hostname or IP Address." }),
  CUC_USERNAME: str({ desc: "Cisco Unity Connections REST Username." }),
  CUC_PASSWORD: str({ desc: "Cisco Unity Connections REST Password." }),
  CUC_LANGUAGE: str({ choices: ["ar-SA","bg-BG","ca-ES","zh-TW","cs-CZ","da-DK","de-DE","gr-GR","en-US","es-ES","fi-FI","fr-FR","he-IL","hu-HU","is-IL","it-IT","ja-JP","ko-KR","nl-NL","nb-NO","pl-PL","pt-BR","rm-CH","ro-RO","ru-RU","hr-HV","sk-SK","sq-al","sv-SE","th-TH","tr-TR","ur-PK","id-ID","uk-UA","be-BY","sl-SI","et-EE","lv-LV","lt-LT","fa-IR","vi-NV","hy-AM","aze-AZ","eu-ES","wen-DE","mk-MK","sot-ZA","ts-MZ","tn-BW","xh-ZA","zu-ZA","af-ZA","ka-GE","fo-FO","hi-IN","mt-MT","gd-GB","ji-XY","ms-MY","kk-KZ","ky-KG","sw-KE","uz-UZ","tt-TR","pa-IN","gu-IN","ta-IN","te-IN","kn-IN","mr-IN","sa-IN","mn-MN","gl-ES","kok-IN","syr-SY","dv-MV","ar-IQ","zh-CN","de-CH","en-GB","es-MX","fr-BE","it-CH","nl-BE","nn-NO","pt-PT","mo-RO","mo-RU","sr-RS","sv-FI","az-AZ","ms-BN","uzb-UZ","ar-EG","zh-HK","de-AT","en-AU","es-XM","fr-CA","sr-CS","ar-LY","zh-SG","de-LU","en-CA","es-GT","fr-CH","ar-DZ","zh-MO","de-LI","en-NZ","es-CR","fr-LU","ar-MA","en-IE","es-PA","fr-MC","ar-TN","en-SA","es-DO","ar-OM","en-JM","es-VE","ar-YE","en-XC","es-CO","ar-SY","en-BZ","es-PE","ar-JO","en-TT","es-AR","ar-LB","en-ZW","es-EC","ar-KW","en-PH","es-CL","ar-AE","es-UY","ar-BH","es-PY","ar-QA","en-IN","es-BO","es-SV","es-HN","es-NI","es-PR"], desc: "Cisco Unity Connections Language Code", default: "en-US" }),  
  CUC_DOWNLOAD: bool({ desc: "Download greetings from Unity", default: false })
});

if (clean(process.env.WEBEX)) {
  var withWebexEnv = cleanEnv(process.env, {
    WEBEX: bool({ desc: "Upload to Webex (Optional)", default: false }),
    WEBEX_API_KEY: str({ desc: "Webex API Key (Required if Webex is set to true, otherwise optional)" }),
    WEBEX_ORG_ID: str({ desc: "Webex ORG ID (Required if Webex is set to false, otherwise optional)" }),
    WEBEX_SITE_ID: str({ desc: "Webex SITE ID (Optional, ", default: false }),
  });
} else {
  var withoutWebexEnv = cleanEnv(process.env, {
    WEBEX: bool({ desc: "Upload to Webex (Optional)", default: false }),
    WEBEX_API_KEY: str({ desc: "Webex API Key (Required if WEBEX is set to true, otherwise optional)", default: false }),
    WEBEX_ORG_ID: str({ desc: "Webex ORG ID (Required if WEBEX is set to true, otherwise optional)", default: false }),
    WEBEX_SITE_ID: str({ desc: "Webex SITE ID (Optional however will not be used unless WEBEX is set to true ", default: false }),
  });
}

env = { ...env, ...withWebexEnv, ...withoutWebexEnv };

let server = env.CUC_HOSTNAME;
let username = env.CUC_USERNAME;
let password = env.CUC_PASSWORD;

function clean(value) {
  const FALSY_VALUES = ["", "null", "false", "undefined"];
  if (!value || FALSY_VALUES.includes(value)) {
    return undefined;
  }
  return value;
}

async function retrieveFile(server, username, password, uri, fileName, download = false) {
  var output = {
    fileName: fileName,
    cupiResults: "",
    downloadStatus: "",
    data: false,
  };
  try {
    var results = await cupi.getRequest(server, username, password, uri);
    if (isArrayBuffer(results)) {
      output.data = results;
      output.cupiResults = "Success";
      if (download) {
        try {
          buffer = await Buffer.from(results);
          // Replace any special characters in the file name
          fileName = fileName.replace(/[/\\?%*:|"<>\s]/g, "_");
          // Let's create the file path to the data folder
          filePath = path.join(__dirname, ".", "data", fileName);
          const ws = fs.createWriteStream(filePath);
          ws.on("error", (err) => (output.downloadStatus = err));
          ws.on("finish", () => (output.downloadStatus = "Success"));
          ws.write(buffer);
          ws.end();
        } catch (error) {
          output.downloadStatus = error;
        }
      } else {
        output.downloadStatus = "Download option is skipped";
      }
    } else {
      output.cupiResults = results.ErrorDetails.errors.message._text;
    }
  } catch (error) {
    output.cupiResults = error;
  }
  return output;
}

(async () => {
  // Array to store all promises
  let promises = [];
  // Get all call handlers
  var getCallHandlers = await cupi.getRequest(server, username, password, "vmrest/handlers/callhandlers/");
  // Create an array of call handlers with their ID, Name, and URI
  var callHandlersArr = getCallHandlers.Callhandlers.Callhandler.map((greeting) => {
    let output = {
      id: greeting.ObjectId._text, // Call Handler ID
      name: greeting.DisplayName._text, // Call Handler Name
      greetingsURI: greeting.GreetingsURI._text, // URI to get greetings
    };
    return output;
  });

  // Add an empty array to store greetings
  callHandlersArr = callHandlersArr.map((v) => ({ ...v, greetings: [] }));

  // Loop through the call handlers and get the greetings URI
  for (const callHandler of callHandlersArr) {
    promises.push(limit(() => cupi.getRequest(server, username, password, callHandler.greetingsURI)));
  }

  var callHandlerUri = await Promise.all(promises)
    .then((values) => {
      return values;
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  // Let's filter out the empty values
  callHandlerGreetingArr = callHandlerUri.filter((e) => e);

  // Let's get the correct language code for the greetings
  var uri = "vmrest/languagemap";
  var results = await cupi.getRequest(server, username, password, uri);
  var languageCode = results.LanguageMappings.LanguageMapping.find(o => o.LanguageTag._text === env.CUC_LANGUAGE);

  for (const element of callHandlerGreetingArr) {
    for (const greeting of element.Greetings.Greeting) {
      var foundIndex = callHandlersArr.findIndex((x) => x.id == greeting.CallHandlerObjectId._text);
      var json = {
        name: "",
        greetingStreamFilesURI: "",
      };
      json.name = greeting.GreetingType._text;
      json.greetingStreamFilesURI = path.join(greeting.GreetingStreamFilesURI._text, languageCode.LanguageCode._text, "audio");
      callHandlersArr[foundIndex].greetings.push(json);
    }
  }

  // Array to store all promises
  let retrieveFilePromises = [];

  // Loop through the call handlers and get the greetings URI
  for (const element of callHandlersArr) {
    for (const greeting of element.greetings) {
      let filename = element.name + "_" + greeting.name + ".wav";
      retrieveFilePromises.push(limit(() => retrieveFile(server, username, password, greeting.greetingStreamFilesURI, filename, env.CUC_DOWNLOAD)));
    }
  }

  var retrieveFileResults = await Promise.all(retrieveFilePromises);

  const date = new Date();
  const timestamp = date.getTime();
  const unityLogName = `unityResults-${timestamp}.log`;

  var dataPath = path.join(__dirname, ".", "data", unityLogName);

  fs.writeFile(dataPath, JSON.stringify(retrieveFileResults, null, 2), (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log(`Successfully wrote file: ${unityLogName}`);
    }
  });

  if (env.WEBEX) {
    let webexPromises = [];

    for (const results of retrieveFileResults) {
      if (results.data) {
        webexPromises.push(limit(() => webex.uploadAnnouncementFiles(results.data, results.fileName, env.WEBEX_API_KEY, env.WEBEX_ORG_ID, env.WEBEX_SITE_ID)));
      }
    }
    var webexResults = await Promise.all(webexPromises);
    const webexLogName = `webexResults-${timestamp}.log`;

    dataPath = path.join(__dirname, ".", "data", webexLogName);

    fs.writeFile(dataPath, JSON.stringify(webexResults, null, 2), (err) => {
      if (err) {
        console.log("Error writing file", err);
      } else {
        console.log(`Successfully wrote file: ${webexLogName}`);
      }
    });
  } else {
    console.log("WEBEX is set to false. Skipping uploading to Webex.");
  }
})();
