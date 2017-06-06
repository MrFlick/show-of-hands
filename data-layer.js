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
var getInsertDBCallBack = function(resolve,reject) {
	return function(err) {
		if (err !== null) {
			console.log(err);
			reject(err);
		} else {
			resolve(this.lastID);
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

function insert(db, sql) {
	var args = [].slice.call(arguments, 1);
	return new Promise(function(resolve, reject) {
		args.push(getInsertDBCallBack(resolve, reject));
		db.run.apply(db, args);
	});
}

var DataStore = function(dbpath) {
	var db = new sqlite3.Database(dbpath);

	this.getPrompts = function() {
		return getAll(db, "SELECT * FROM prompts");
	};

	this.getPolls = function(poll_id) {
		return getAll(db, "SELECT * FROM polls").then((polls) => {
			return polls.map((poll) => {
				if (poll.options) {
					poll.options = JSON.parse(poll.options)
				}
				return poll;
			});
		});
	};

	this.getPoll = function(poll_id) {
		return getOne(db, "SELECT * FROM polls where poll_id=?", poll_id).then((poll) => {
			if (poll.options) {
				poll.options = JSON.parse(poll.options)
			}
			return poll;
		});
	};

    this.addPoll = function(prompt) {
        return insert(db, "INSERT INTO polls (prompt_id, title, type, options) " +
            "values (?, ?, ?, ?)", prompt.prompt_id, prompt.title, prompt.type, prompt.options).then((newid) => {
                return this.getPoll(newid)
            })
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
