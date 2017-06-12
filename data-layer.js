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

function update(db, sql) {
	var args = [].slice.call(arguments, 1);
	return new Promise(function(resolve, reject) {
		args.push(getDefaultDBCallBack(resolve, reject));
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

	this.getPolls = function(include_closed) {
		let sql = "SELECT polls.*, " + 
            "(select count(*) from poll_responses " + 
            "where poll_responses.poll_id = polls.poll_id) as response_count " + 
            "FROM polls"
		if (!!!include_closed) {
			sql = sql + " WHERE status=1"
		}
		return getAll(db, sql).then((polls) => {
			return polls.map((poll) => {
				if (poll.options) {
					try {
						poll.options = JSON.parse(poll.options)
					} catch(e) {
						poll.options = null
					}
				}
				return poll;
			});
		});
	};

	this.getPoll = function(poll_id) {
		let sql = "SELECT polls.*, "+
            "(select count(*) from poll_responses " + 
            "where poll_responses.poll_id = polls.poll_id) as response_count " + 
            "FROM polls " +
            "WHERE poll_id = ?"
        return getOne(db, sql, poll_id).then((poll) => {
			if (poll.options) {
				try {
					poll.options = JSON.parse(poll.options)
				} catch(e) {
					poll.options = null
				}
			}
			return poll;
		});
	};

    this.addPoll = function(poll) {
        return insert(db, "INSERT INTO polls (title, type, options) " +
            "values (?, ?, ?)", poll.title, poll.type, poll.options).then((result) => {
                return this.getPoll(result.newID)
            })
    };

	this.openPoll = function(poll) {
        return update(db, "UPDATE polls SET status=1, " + 
            "open_seq = (SELECT max(open_seq) from polls)+1 " + 
            "WHERE poll_id=?", poll.poll_id).then(() => {
                return this.getPoll(poll.poll_id)
            });
    };
	this.closePoll = function(poll) {
        return update(db, "UPDATE polls SET status=2 WHERE poll_id=?", 
            poll.poll_id).then(() => {
                return this.getPoll(poll.poll_id)
        });
    };
	this.updatePoll = function(poll) {
        return update(db, "UPDATE polls SET title=?, type=?, options=? WHERE poll_id=?", 
            poll.title, poll.type, poll.options, poll.poll_id).then(() => {
                return this.getPoll(poll.poll_id)
        });
    };
	this.addPollResponse = function(resp) {
        return upsert(db, "poll_responses",  ["poll_id", "client_id"], ["response"],
            [resp.poll_id, resp.client_id, resp.value]).then((actions) => {
				resp.rowid = actions.newID;
                resp.response = resp.value;
                resp.action = actions.action;
				return resp;
			});
    };

    this.deletePoll = function(poll) {
        let sql = "DELETE FROM polls WHERE poll_id=?";
        return update(db, sql, poll.poll_id)
    };

    this.getPollResponses = function(poll) {
        let sql = "SELECT rowid, response FROM poll_responses WHERE poll_id=?"
        return getAll(db, sql, poll.poll_id) 
    }

    this.addSnippet = function(snip) {
        return insert(db, "INSERT INTO snippets (title, code) " +
            "values (?, ?) ", snip.title, snip.code).then((result) => {
                return this.getSnippet(result.newID)
            })
    };

	this.getSnippets = function(include_closed) {
		let sql = "SELECT * FROM snippets"
		if (!!!include_closed) {
			sql = sql + " WHERE status=1"
		}
		sql = sql + " ORDER BY rowid DESC"
		return getAll(db, sql);
	};

	this.getSnippet = function(snippet_id) {
		return getOne(db, "SELECT * FROM snippets where snippet_id=?", snippet_id);
	};

	this.openSnippet = function(snip) {
        return update(db, "UPDATE snippets SET status=1, " + 
            "open_seq = (SELECT max(open_seq) from snippets)+1 " + 
            "WHERE snippet_id=?", snip.snippet_id).then(() => {
                return this.getSnippet(snip.snippet_id)
            });
    };

	this.closeSnippet = function(snip) {
        return update(db, "UPDATE snippets SET status=2 WHERE snippet_id=?", 
            snip.snippet_id).then(() => {
                return this.getSnippet(snip.snippet_id)
        });
    };

    this.deleteSnippet = function(snip) {
        let sql = "DELETE FROM snippets WHERE snippet_id=?";
        return update(db, sql, snip.snippet_id)
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
