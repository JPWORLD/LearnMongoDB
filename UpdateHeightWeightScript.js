//printjson(db.adminCommand('listDatabases'));

db = db.getSiblingDB('Pokemon');

cursor = db.samples_pokemon.find({ }, { height : 1, weight : 1 , name: 1, _id : 1});

while ( cursor.hasNext() ) {
	currCursor = cursor.next();
	currCursor.heightInM = Number(currCursor.height.replace(" m", ""));
	currCursor.weightInKg = Number(currCursor.weight.replace(" kg", ""));
   	//printjson( currCursor );
   	//print( ObjectId(currCursor._id.str) )
   	printjson(db.samples_pokemon.updateOne( 
   		{ _id : ObjectId(currCursor._id.str) }, 
   		{ $set : { "heightInM" : currCursor.heightInM, "weightInKg" : currCursor.weightInKg } } ) );
}