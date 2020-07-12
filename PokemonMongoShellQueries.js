//Single Value match - give all pokemon which match name
db.samples_pokemon.find(
	{ name : "Bulbasaur" }
).pretty()

//Mulitple Value match - give all pokemon where candy count and egg both match
db.samples_pokemon.find(
	{ "candy_count" : 25 , "egg" : "10 km"}
).pretty()

//Exists operator - give all pokemon which do not have prev evolution or next evolution
db.samples_pokemon.find(
	{ prev_evolution : { $exists : false }, next_evolution : { $exists : false } }
).pretty()

//Comparison Operators 
db.samples_pokemon.find(
	{ "weightInKg" : { $exists : true }, "weightInKg" : { $gt : 400 } }
).pretty()

db.samples_pokemon.find(
	{ "weightInKg" : { $exists : true }, "weightInKg" : { $lt : 1 } }
).pretty()

db.samples_pokemon.find(
	{ "weightInKg" : { $exists : true }, "weightInKg" : { $lte : 0.1 } }
).pretty()

db.samples_pokemon.find(
	{ "weightInKg" : { $exists : true }, "weightInKg" : { $gte : 300 } }
).pretty()

//Range search
db.samples_pokemon.find(
	{ "weightInKg" : { $exists : true }, "weightInKg" : { $gte : 10, $lte : 100 } }
).pretty()

//Not operator
db.samples_pokemon.find(
	{ "weightInKg" : { $exists : true }, "weightInKg" : { $not : { $gte : 10, $lte : 100 } } }
).pretty()

//Array value match - match if value is present in array
db.samples_pokemon.find(
	{ type : "Dragon" } 
).pretty()

//Array value match from list - give all pokemon where type in list of value provided
db.samples_pokemon.find(
	{ type : { $in : ["Fighting", "Dragon"] } }
).pretty()

//Array value match from list - give all pokemon where type not in list of value provided
db.samples_pokemon.find(
	{ type : { $nin : ["Normal"] } }
).pretty()

//Array value match - match where all values provided in list are present in array
db.samples_pokemon.find(
	{ type : { $all : ["Grass", "Poison"] } } 
).pretty()

//Array size match
db.samples_pokemon.find(
	{ weaknesses : { $size : 5 } }
).pretty()

//Array size comparison
db.samples_pokemon.find(
	{ weaknesses : { $exists : true }, $where : 'this.weaknesses.length > 4' }
).pretty()

//Document Array match - give all pokemon where prev evolution name match
db.samples_pokemon.find(
	{ "prev_evolution.name" : "Dratini" } 
).pretty()

//Document Array Match - give all pokemon where both the below values in a document match
db.samples_pokemon.find(
	{ "prev_evolution" : { $elemMatch : { "name" : "Dragonair" , "num" : "148" } } }
).pretty()

//Give only name and num - suppress_id as well
db.samples_pokemon.find(
	{ }, { name : 1, num : 1 , _id : 0 } 
).pretty()

//Give only name and num sorted by number ascending
db.samples_pokemon.find(
	{ }, { name : 1, num : 1 , _id : 0 } 
).sort( { num : 1 } ).pretty()

//Get tallest, shortest, lightest, heaviest pokemon dimensions
db.samples_pokemon.aggregate([
	{ $project : { heightInM : 1, weightInKg : 1 }},
	{ $group : { _id : 1, 
				 minHeight : { $min : "$heightInM" },
				 maxHeight : { $max : "$heightInM" },
				 minWeight : { $min : "$weightInKg" },
				 maxWeight : { $max : "$weightInKg" }	
				}
	}
])

//give count of pokemons per type
db.samples_pokemon.aggregate([
	{ $project : { type : 1 }}, 
	{ $unwind : "$type" },
	{ $group : { _id : "$type", count : { $sum : 1 }}},
	{ $sort : { count : -1}}
])

//give count of pokemon who are weak against different types
db.samples_pokemon.aggregate([
	{ $project : { weaknesses : 1 }},
	{ $unwind : "$weaknesses" },
	{ $group : { _id : "$weaknesses", count : { $sum : 1  } } },
	{ $sort : { count : -1}}
])

//get list of all pokemon and array of other pokemon who have type advantage
db.samples_pokemon.aggregate([
		{ $project : { weaknesses : 1, name : 1, _id : 0 }}, //select reqd columns
		{ $unwind : "$weaknesses"},	//break array into documents
		{ $lookup : {
			from : "samples_pokemon", // lookup from same table
			localField : "weaknesses", // lookup all type the pokemon is weak against
			foreignField : "type", // lookup all pokemon of the type
			as : "WeakAgainst"
		}},
		{ $unwind : "$WeakAgainst"}, // break array into documents
		{ $project : { "WeakAgainst.name" : 1, "name" : 1 }}, // select required columns
		{ $group : { _id : "$name" , isWeakAgainst : { $push : "$WeakAgainst.name"}}} // create one doc per pokemon with list of pokemon it is weak against
])