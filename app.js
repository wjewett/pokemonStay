const port = process.env.PORT || 3000;
(express = require('express')),
	(passport = require('passport')),
	(bodyParser = require('body-parser')),
	(methodOverride = require('method-override')),
	(expressSanitizer = require('express-sanitizer')),
	(flash = require('connect-flash')),
	(passportLocalMongoose = require('passport-local-mongoose')),
	(LocalStrategy = require('passport-local')),
	(fs = require('fs')),
	(mongoose = require('mongoose')),
	(request = require('request')),
	(rp = require('request-promise')),
	(Pokemon = require('./models/pokemon')),
	(Pokedex = require('./models/pokedex')),
	(User = require('./models/user'));

// mongoose.connect("mongodb://localhost/pokemonStay", { useNewUrlParser: true});

mongoose
	.connect('mongodb+srv://wjewett:cheesypoofs9985@pokemonstay-4juub.mongodb.net/test?retryWrites=true&w=majority', {
		useNewUrlParser: true,
		useCreateIndex: true
	})
	.then(() => {
		console.log('Connected to DB!');
	})
	.catch((err) => {
		console.log('ERROR:', err.message);
	});

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	require('express-session')({
		secret: 'I like cubing',
		resave: false,
		saveUninitialized: false
	})
);
mongoose.set('useFindAndModify', false);
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(flash());
app.use(expressSanitizer());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Add pokedex.json to it's own MongoDB
// Run once and then delete
// let rawData = fs.readFileSync('pokedex.json');
// let pokedex = JSON.parse(rawData);

// let x = 1;
// pokedex.forEach(pokemon => {
// Pokedex.create(pokemon, (err, pokemon) => {
//   if(err){
//     console.log(err);
//   }
// });
//   x++;
// });
// console.log(x);

// ============
// ROUTES
// ============

// LOGIN ROUTES
//render login form
app.get('/', (req, res) => {
	if (req.isAuthenticated()) {
		res.redirect('/collection');
	} else {
		res.render('login');
	}
});

//login logic
//middleware
app.post(
	'/',
	passport.authenticate('local', {
		successRedirect: '/collection',
		failureRedirect: '/'
	}),
	(req, res) => {}
);

app.get('/collection', isLoggedIn, (req, res) => {
	Pokemon.find({}, (err, pokedex) => {
		if (err) {
			res.redirect('/');
		} else {
			res.render('collection', { collection: pokedex, page: 'login' });
		}
	});
});

//show sign up form
app.get('/register', (req, res) => {
	res.render('register');
});

//handling user sign up
app.post('/register', (req, res) => {
	// req.body.username
	// req.body.password
	User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
		if (err) {
			console.log(err);
			return res.render('register');
		}
		passport.authenticate('local')(req, res, () => {
			res.redirect('/collection');
		});
	});
});

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

app.get('/collection', isLoggedIn, (req, res) => {
	Pokemon.find({}, (err, pokedex) => {
		if (err) {
			console.log(err);
		} else {
			res.render('collection', { collection: pokedex, page: 'login' });
		}
	});
});

// For waking up from remove location
app.get('/wakeup', function(req, res) {
	res.send('Waking up');
});

// NEW ROUTE
app.get('/collection/new', isLoggedIn, (req, res) => {
	res.render('new');
});

// CREATE ROUTE
app.post('/collection', isLoggedIn, function(req, res) {
	// create pokemon
	let newPokemon = new Pokemon();
	let userID = req.user._id;
	let username = req.user.username;
	let query = req.body.searchMon;
	let comments = req.body.comments;
	let monster = getPokemonInfo(query);
	monster
		.then((info) => {
			if (info.id > 721) {
				res.render('new');
			} else {
				Pokedex.findOne({ id: info.id })
					.then((newPoke) => {
						let newMon = makeNewPokemon(info, comments, newPoke);
						let author = {
							id: userID,
							username: username
						};
						newMon.author = author;
						newPokemon = newMon;
						Pokemon.create(newPokemon, (err, newPokemon) => {
							if (err) {
								console.log(err);
								res.render('new');
							} else {
								res.redirect('/collection');
							}
						});
					})
					.catch((err) => {
						console.log(err);
					});
			}
		})
		.catch((err) => {
			console.log(err);
		});
});

// SHOW ROUTE
app.get('/collection/:id', checkOwnership, (req, res) => {
	Pokemon.findById(req.params.id, (err, foundPokemon) => {
		if (err) {
			console.log(err);
			res.redirect('/collection');
		} else {
			res.render('show', { pokemon: foundPokemon });
		}
	});
});

app.get('/collection/:id/evolve', checkOwnership, (req, res) => {
	Pokemon.findById(req.params.id, (err, foundPokemon) => {
		if (err) {
			console.log(err);
			res.redirect('/collection');
		} else {
			res.render('show', { pokemon: foundPokemon });
		}
	});
});

// EDIT ROUTE
app.get('/collection/:id/edit', checkOwnership, (req, res) => {
	Pokemon.findById(req.params.id, (err, foundPokemon) => {
		if (err) {
			res.redirect('/collection');
		} else {
			res.render('edit', { pokemon: foundPokemon });
		}
	});
});

// UPDATE ROUTE
app.put('/collection/:id', checkOwnership, (req, res) => {
	req.body.pokemon.comments = req.sanitize(req.body.pokemon.comments);
	req.body.pokemon.name = req.sanitize(req.body.pokemon.name);
	Pokemon.findByIdAndUpdate(req.params.id, req.body.pokemon, (err, updatedPokemon) => {
		if (err) {
			res.redirect('/collection');
		} else {
			res.redirect('/collection/' + req.params.id);
		}
	});
});

// EVOLVE ROUTE (A different update route)
app.put('/collection/:id/evolve', checkOwnership, (req, res) => {
	let comments = req.body.pokemon.comments;
	let name = req.body.pokemon.name;
	let evolvedMon;
	let monster = getPokemonInfo(name);
	monster
		.then((info) => {
			Pokedex.findOne({ id: info.id })
				.then((newPoke) => {
					evolvedMon = makeNewPokemon(info, comments, newPoke);
					evolvedMon.name = name;
					evolvedMon.comments = comments;
					Pokemon.findByIdAndUpdate(req.params.id, evolvedMon, (err, updatedPokemon) => {
						if (err) {
							res.redirect('/collection');
						} else {
							res.redirect('/collection/' + req.params.id);
						}
					});
				})
				.catch((err) => {
					console.log(err);
				});
		})
		.catch((err) => {
			console.log(err);
		});
});

// DESTROY ROUTE
app.delete('/collection/:id', (req, res) => {
	//destroy pokemon
	Pokemon.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			res.redirect('/collection/:id');
		} else {
			res.redirect('/collection');
		}
	});
});

function getPokemonInfo(query) {
	let url = 'https://pokeapi.co/api/v2/pokemon/' + query.toLowerCase();
	return rp({
		url: url,
		json: true
	});
}

function makeNewPokemon(data, comments, newPoke) {
	let baseStats = [];
	let evolve;
	let types;
	data.stats.forEach((stat) => {
		baseStats.push(stat.base_stat);
	});
	let evolutions;
	evolutions = newPoke.evolutions;
	types = newPoke.types;
	if (evolutions.toString() != '') {
		let evolveMon = evolutions[Math.floor(Math.random() * evolutions.length)];
		evolve = evolveMon.to.toString();
	} else {
		evolve = 'no';
	}
	let newPokemon = {
		name: data.forms[0].name,
		number: data.id,
		comments: comments,
		evolve: evolve,
		types: types,
		stats: baseStats
	};
	return newPokemon;
}

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.redirect('/');
	}
}

function checkOwnership(req, res, next) {
	if (req.isAuthenticated()) {
		Pokemon.findById(req.params.id, (err, foundPokemon) => {
			if (err) {
				req.flash('error', 'Pokemon not found');
				res.redirect('/collection');
			} else {
				// does user own the pokemon?
				if (foundPokemon.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash('error', "You don't have permission to do that");
					res.redirect('back');
				}
			}
		});
	} else {
		req.flash('error', 'You need to be logged in to do that');
		res.redirect('back');
	}
}

app.listen(port, process.env.IP, () => {
	console.log('Server started.......');
});
