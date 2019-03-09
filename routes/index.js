const express = require("express");
const router = express.Router();
const Room = require("../models/room");
const User = require("../models/user");
const Review = require("../models/review");
const ensureLogin = require("connect-ensure-login");
const roles = require("../middlewares/roles");
const uploadCloud = require('../config/cloudinary.js');

/* GET home page */
// router.get("/", (req, res, next) => {
//   res.render("home");
// });

// GET => to retrieve all the restaurants from the DB
router.get('/', (req, res, next) => {
	Room.find({}, (error, roomsFromDB) => {
		if (error) {
			next(error);
		} else {
			res.render('home', { rooms: roomsFromDB });
		}
	});
});

router.use(ensureLogin.ensureLoggedIn());

router.get('/rooms/new', (req, res, next) => {
	res.render('rooms/new');
});

// POST => to create new restaurant and save it to the DB
router.post('/rooms', uploadCloud.single('photo'), (req, res, next) => {
	// add location object here

	let location = {
		type: "Point",
		coordinates: [req.body.longitude, req.body.latitude]
	}

	const newRoom = new Room({
		name: req.body.name,
		description: req.body.description,
		imageUrl: req.file.url,
		// type: req.body.type,
		location: location,
		owner: req.user
	});

	newRoom.save((error) => {
		if (error) {
			next(error);
		} else {
			res.redirect('/');
		}
	});
});



// GET => get the form pre-filled with the details of one restaurant
router.get('/rooms/:room_id/edit', (req, res, next) => {


	Room.findById(req.params.room_id, (error, room) => {
		if (error) {
			next(error);
		} else {
			var isOwner = false;
			var currentUser = req.user._id;

			if (String(room.owner) == String(currentUser)) {
				isOwner = true;
				res.render('rooms/update', { room });
			}
		}
	});

});

// POST => save updates in the database
router.post('/rooms/:room_id', uploadCloud.single('photo'), (req, res, next) => {
	Room.findById(req.params.room_id, (error, room) => {
		if (error) {
			next(error);
		} else {
			let location = {
				type: "Point",
				coordinates: [req.body.longitude, req.body.latitude]
			}
			room.name = req.body.name;
			room.description = req.body.description;
			if(req.file){
			room.imageUrl = req.file.url;
			}// place.type = req.body.type;
			room.location = location;

			room.save(error => {
				if (error) {
					next(error);
				} else {
					res.redirect(`/rooms/${req.params.room_id}`);
				}
			});
		}
	});
});

// DELETE => remove the restaurant from the DB
router.get('/rooms/:room_id/delete', (req, res, next) => {
	Room.remove({ _id: req.params.room_id }, function (error, room) {
		if (error) {
			next(error);
		} else {
			res.redirect('/');
		}
	});
});


// to see raw data in your browser, just go on: http://localhost:3000/api
router.get('/rooms/api', (req, res, next) => {
	Room.find({}, (error, allRoomsFromDB) => {
		if (error) {
			next(error);
		} else {
			res.status(200).json({ rooms: allRoomsFromDB });
		}
	});
});

// to see raw data in your browser, just go on: http://localhost:3000/api/someIdHere
router.get('/rooms/api/:id', (req, res, next) => {
	let roomId = req.params.id;
	Room.findOne({ _id: roomId }, (error, oneRoomFromDB) => {
		if (error) {
			next(error)
		} else {
			res.status(200).json({ room: oneRoomFromDB });
		}
	});
});

// GET => get the details of one place
router.get('/rooms/:room_id', (req, res, next) => {

	// Room.findById(req.params.room_id, (error, room) => {
	// 	if (error) {
	// 		next(error);
	// 	} else {
	// 		res.render('rooms/show', { room: room  });
	// 	}
	// });
	// if(req.user._id == room.owner){
	// 	var ownRoom = true
	// }
	let roomId = req.params.room_id;
	Room.findById({ _id: roomId })
		.populate({
			path: 'reviews',
			populate: { path: 'user' }
		})
		.then(room => {
			var isOwner = false;
			var currentUser = req.user._id;

			if (String(room.owner) == String(currentUser)) {

				isOwner = true;
			}

			res.render('rooms/show', { room: room, isOwner });
		})
		.catch(error => {
			console.log(error);
		});
});

router.post("/reviews/add", (req, res, next) => {

	const newReview = new Review({
		user: req.user._id,
		comment: req.body.comment,
		rating: req.body.rating,

	});

	newReview.save((error) => {
		if (error) {
			next(error);
		} else {
			Room.update(
				{ _id: req.body.id },
				{ $push: { reviews: newReview._id } }
			)
				.then(rooms => {
					res.redirect(`/rooms/${req.body.id}`);
				})
				.catch(error => {
					console.log(error);
				});
		}
	});


	// Room.update(
	//   { _id: req.query.room_id },
	//   { $push: { newReview }}
	// )
	//   .then(rooms=> {
	// 	res.redirect(`/rooms/${req.query.room_id}`);
	//   })
	//   .catch(error => {
	// 	console.log(error);
	//   });
});



module.exports = router;