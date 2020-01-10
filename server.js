require('dotenv').config();
const express = require('express'),
	app = express(),
	twilio = require('twilio'),
	bodyParser = require('body-parser'),
	PhoneNumberParser = require('libphonenumber-js');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

//twilio client
var client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
const twilio_phone_number = process.env.PN;

var names = [];

//index route
app.get('/', (req, res) => {
	res.redirect('/lookup');
});

//show lookup form
app.get('/lookup', (req, res) => {
	res.render('lookup');
});

//create result
app.post('/result', (req, res) => {
	//get data from form and add it to numbers array
	let number = req.body.number;
	if (number[0] !== '+') {
		number = `+1${number}`;
	}
	let phoneNumber = PhoneNumberParser.parsePhoneNumberFromString(number);

	if (phoneNumber) {
		//phoneNumber.format('INTERNATIONAL').replace(/\s/g, '');
		console.log(phoneNumber.number);
		number = phoneNumber.number;
	} else {
		number = 'null';
	}

	//lookup caller name by number
	client.lookups
		.phoneNumbers(number)
		.fetch({ countryCode: 'US', type: [ 'caller-name' ] })
		.then((phone_number) => {
			if (phone_number.callerName.caller_name !== null) {
				console.log(phone_number);
				names.push(phone_number.callerName.caller_name);
			} else {
				names.push('No Name Found!!');
			}
			//redirect back to get page
			res.redirect('/result');
		})
		.catch((message) => {
			console.log(message);
			names.push('Wrong number format. Go back and try again!');
			//redirect back to get page
			res.redirect('/result');
		});
});

// show result
app.get('/result', (req, res) => {
	if (names) {
		var name = names.pop();
		res.render('result', { name: name });
	} else {
		console.log('empty array');
		res.render('result', { name: null });
	}
});
app.listen(process.env.PORT, () => {
	console.log('Server running...');
});
