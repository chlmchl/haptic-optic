function authenticate() {
  return gapi.auth2.getAuthInstance()
      .signIn({scope: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/spreadsheets.readonly"})
      .then(function() { console.log("Sign-in successful"); },
            function(err) { console.error("Error signing in", err); });
}
function loadClient() {
  gapi.client.setApiKey("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");
  return gapi.client.load("https://sheets.googleapis.com/$discovery/rest?version=v4")
      .then(function() { console.log("GAPI client loaded for API"); },
            function(err) { console.error("Error loading GAPI client for API", err); });
}
// Make sure the client is loaded and sign-in is complete before calling this method.
function execute() {
  return gapi.client.sheets.spreadsheets.get({
    "spreadsheetId": "1WtwrA3Bou1MluhOmcEFiJSNBVFt5aq_1821tFXLiehI/edit#gid=0"
  })
      .then(function(response) {
              // Handle the results here (response.result has the parsed body).
              console.log("Response", response);
            },
            function(err) { console.error("Execute error", err); });
}
gapi.load("client:auth2", function() {
  gapi.auth2.init({client_id: "255204675293-qf0j713dstm795sjka52l3lbj8ipfafe.apps.googleusercontent.com"});
});