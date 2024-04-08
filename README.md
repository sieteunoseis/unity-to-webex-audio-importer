# Cisco Unity Connections to Webex Audio Importer

A NodeJS application that allows you to download Call Handler greetings from Cisco Unity Connection and upload them to Webex Audio. This is useful when migrating from Cisco Unity Connection to Webex Calling. Application uses the Cisco Unity Connection Provisioning Interface (CUPI) to download the greetings and the Webex Audio API to upload them.

Cisco Unity Connection Provisioning Interface (CUPI) information can be found at:
[Cisco Unity Connection Provisioning Interface (CUPI)](https://www.cisco.com/c/en/us/td/docs/voice_ip_comm/connection/REST-API/CUPI_API/b_CUPI-API.html).

## Installation

Run as native node application using npm:

```javascript
npm install
npm run start
```

Build and run using Docker:

```bash
npm run docker:build
npm run docker:run
```

Pull image from Docker.io and run with the following:

```bash
docker run -d --rm -v ./data:/app/data --env-file=.env sieteunoseis/unity-to-webex-audio-importer:latest
```

## Environment Variable

```bash
CUC_HOSTNAME=devnetsandbox.cisco.com
CUC_USERNAME=administrator
CUC_PASSWORD=ciscopsdt
CUC_LANGUAGE=en-US
CUC_DOWNLOAD=true
WEBEX=true
WEBEX_API_KEY=
WEBEX_ORG_ID=
WEBEX_SITE_ID=
```

| Variable | Description | Required | Default |
|---|---|---|---|
| CUC_HOSTNAME | Cisco Unity Connections Hostname or IP Address. | Yes | N/A |
| CUC_USERNAME | Cisco Unity Connections REST Username. | Yes | N/A |
| CUC_PASSWORD | Cisco Unity Connections REST Password. | Yes | N/A |
| CUC_LANGUAGE | Cisco Unity Connections Language Code. | No | en-US |
| CUC_DOWNLOAD | Download wav greetings from Cisco Unity Connections and save before uploading to Webex.   Note: You will need to map a volume to Docker container to access these files. | No | false |
| WEBEX | Are we uploading the files directly to Webex? If so set this variable to true. Note: If this is set to true, the following two variables are also required. | Yes | N/A |
| WEBEX_API_KEY | Webex API Key (Required if WEBEX is set to true, otherwise ignored). | No, unless WEBEX is set to true | null |
| WEBEX_ORG_ID | Webex ORG ID (Required if WEBEX is set to true, otherwise ignored). | No, unless WEBEX is set to true | null |
| WEBEX_SITE_ID | Webex Location ID. Set this if you want greetings to be uploaded to a specific location. Otherwise greetings will be uploading to organization level. | No | Null |

## Giving Back

If you would like to support my work and the time I put in creating the code, you can click the image below to get me a coffee. I would really appreciate it (but is not required).

[![Buy Me a Coffee](https://github.com/appcraftstudio/buymeacoffee/raw/master/Images/snapshot-bmc-button.png)](https://www.buymeacoffee.com/automatebldrs)