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
			resolve({newID: this.lastID, changes: this.changes});
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

function upsert(db, table, keys, fields, values) {
	var key_values = values.splice(0, keys.length);
	var where_clause = "WHERE " + keys.map((val,i) => {return val + "=?"}).join(" and ");
	var values_clause = "VALUES (" + keys.concat(fields).map( (val)=> {return "?"}).join(", ") + ")";
	var set_clause = "SET " + fields.map((val,i) => {return val + "=?"}).join(", ")
	var sql_select = "SELECT rowid FROM " + table + " " + where_clause;
	var sql_update = "UPDATE " + table + " " + set_clause + " WHERE rowid=?";
	var sql_insert = "INSERT INTO " + table + "(" + keys.concat(fields).join(",") + ") " + values_clause;
	return new Promise(function(resolve, reject) {
		db.serialize(() => {
			db.get.apply(db, [sql_select].concat(key_values, function(err, row) {
				if (row) {
					let args = [sql_update].concat(values, row.rowid, function(err, row2) {
						if (err !== null) {
							reject(err);
						} else {
							resolve({newID: row.rowid, action: "update"})
						}
					})
					db.run.apply(db, args);
				} else {
					let args = [sql_insert].concat(key_values, values, function(err, row2) {
						if (err !== null) {
							reject(err);
						} else {
							resolve({newID: this.lastID, action: "insert"})
						}
					})
					db.run.apply(db, args);
				}
			}));
		});
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
            "values (?, ?, ?, ?)", prompt.prompt_id, prompt.title, prompt.type, prompt.options).then((result) => {
                return this.getPoll(result.newID)
            })
    };

	this.addPollResponse = function(resp) {
        return upsert(db, "poll_responses",  ["poll_id", "client_id"], ["response"],
            [resp.poll_id, resp.client_id, resp.value]).then((actions) => {
				resp.id = actions.newID;
				return resp;
			});
    };

    this.addSnippet = function(snip) {
        return insert(db, "INSERT INTO snippets (title, code) " +
            "values (?, ?) ", snip.title, snip.code).then((result) => {
                return this.getSnippet(result.newID)
            })
    };

	this.getSnippets = function() {
		return getAll(db, "SELECT * FROM snippets");
	};

	this.getSnippet = function(snippet_id) {
		return getOne(db, "SELECT * FROM snippets where snippet_id=?", snippet_id);
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
