require("dotenv").config();
const { scraping_kmutnb_grade } = require("./getData");
const schedule = require("node-schedule");
const axios = require("axios");
const querystring = require("querystring");

const main = async () => {
  const rule = new schedule.RecurrenceRule();
  rule.hour = 12;
  rule.minute = 0;
  rule.tz = "Asia/Bangkok";

  schedule.scheduleJob(rule, async function () {
    await scraping()
  });
};

const scraping = async () => {
  const result = await scraping_kmutnb_grade(
    process.env.KMUTNB_USERNAME,
    process.env.KMUTNB_PASSWORD
  ); // [grade, term, account]
  let message = "";
  for (let grade of result[0]) {
    if (grade.length == 5) {
      const name_subject = grade[2];
      const grade_subject = grade[4];
      if (grade_subject != "รอคณะอนุมัติเกรด หรือคุณไม่ได้ประเมินการสอน") break;
      message += `${name_subject} คุณได้เกรด ${grade_subject} \n`;
    } else {
      const average_grade = grade[1];
      message += `เทอมนี้คุณได้เกรดเฉลี่ย ${average_grade} \n`;
    }
  }
  await line_notify(result[2]);
  await line_notify(result[1]);
  await line_notify(message);
};

const line_notify = async (message) => {
  axios({
    method: "post",
    url: "https://notify-api.line.me/api/notify",
    headers: {
      Authorization: "Bearer " + process.env.LINE_TOKEN,
      "Content-Type": "application/x-www-form-urlencoded",
      "Access-Control-Allow-Origin": "*",
    },
    data: querystring.stringify({
      message: message,
    }),
  }).catch(function (err) {
    console.error(err);
  });
};

main();
