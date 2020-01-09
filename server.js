require("dotenv").config();
const express = require("express"),
  app = express(),
  twilio = require("twilio"),
  bodyParser = require("body-parser"),
  PhoneNumberParser = require("libphonenumber-js");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

//twilio client
var client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
const twilio_phone_number = process.env.PN;

var names = [];

//index route
app.get("/", (req, res) => {
  res.redirect("/lookup");
});

//show lookup form
app.get("/lookup", (req, res) => {
  res.render("lookup");
});

//create result
app.post("/result", (req, res) => {
  //get data from form and add it to numbers array
  const number = req.body.number;

  const phoneNumber = PhoneNumberParser.parsePhoneNumberFromString(number);
  //phoneNumber.format("INTERNATIONAL").replace(/\s/g, "")
  //lookup caller name by number
  client.lookups
    .phoneNumbers(number)
    .fetch({ type: ["caller-name"] })
    .then(phone_number => {
      names.push(phone_number.callerName.caller_name);
    })
    .catch(message => {
      console.log(message);
    });
  //redirect back to get page
  res.redirect("/result");
});

// show result
app.get("/result", (req, res) => {
  if (names) {
    var name = names[0];
    console.log(name);
    res.render("result", { name: name });
  } else {
    console.log("empty array");
    res.render("result", { name: null });
  }
});
app.listen(process.env.PORT, () => {
  console.log("Server running...");
});
