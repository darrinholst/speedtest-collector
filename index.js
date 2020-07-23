const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const moment = require("moment");
require("moment-timezone");

const app = express();
app.use(bodyParser.json());

app.post("/collect", async (req, res) => {
  try {
    const { body } = req;
    const { timestamp, download, upload, ping } = body;
    console.log(timestamp, download, upload);
    const raw = JSON.stringify(body);
    const email = process.env.GOOGLE_EMAIL;
    const key = process.env.GOOGLE_KEY.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const scopes = "https://www.googleapis.com/auth/spreadsheets";

    const jwt = new google.auth.JWT(email, null, key, scopes);
    await jwt.authorize();

    await google
      .sheets({ version: "v4", auth: jwt })
      .spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1!A1:E1",
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [
            [
              moment(timestamp)
                .tz("America/Chicago")
                .format("YYYY-MM-DD HH:mm:ss"),
              ping,
              download / 1e6,
              upload / 1e6,
              raw,
            ],
          ],
        },
      });
  } catch (e) {
    console.error(e);
  }

  res.status(204).end();
});

app.listen(process.env.PORT || 3000);
