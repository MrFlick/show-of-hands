/* global require module*/
/* eslint-disable no-unused-vars */

var sqlite3 = require("sqlite3").verbose();

var getDefaultDBCallBack = function(resolve,reject) {
	return function(err, rows) {
		if (err !== null) {
			console.log(err);
			reject(err);
		} else {
			resolve(rows);
		}
	};
};

function getAll(db, sql) {
	var args = [].slice.call(arguments, 1);
	return new Promise(function(resolve, reject) {
		args.push(getDefaultDBCallBack(resolve, reject));
		db.all.apply(db, args);
	});
}

function getOne(db, sql) {
	var args = [].slice.call(arguments, 1);
	return new Promise(function(resolve, reject) {
		args.push(getDefaultDBCallBack(resolve, reject));
		db.get.apply(db, args);
	});
}

var DataStore = function(dbpath) {
	var db = new sqlite3.Database(dbpath);

	this.getOpenPrompts = function() {
		return getOne(db, "SELECT * FROM prompts");
	};

	this.close = function() {
		db.close();
	};
};

module.exports = {
	getDataStore: function(dbpath) {
		return new DataStore(dbpath);
	}
};