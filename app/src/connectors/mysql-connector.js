const mysql = require('mysql')

const {
	env: {
		MYSQL_ROOT_HOST = 'localhost',
		MYSQL_USER = 'root',
		MYSQL_PASSWORD = '',
		MYSQL_DATABASE = 'macapa',
	}
} = process

// Wraps a connection and promisify the methods
class MysqlConnection {
	constructor() {
		const conn = mysql.createConnection({
			host: MYSQL_ROOT_HOST,
			user: MYSQL_USER,
			password: MYSQL_PASSWORD,
			database: MYSQL_DATABASE
		})
		this.conn = conn
	}
	connect() {
		const { conn } = this
		return new Promise((done, fail) => {
			conn.connect((err) => {
				if (err) {
					fail(err)
				} else {
					done(this)
				}
			})
		})
	}
	query(query) {
		const { conn } = this
		return new Promise((done, fail) => {
			conn.query(query, (err, res) => {
				if (err) {
					fail(err)
				} else {
					done(res)
				}
			})
		})
	}
	end() {
		const { conn } = this
		return new Promise((done) => {
			conn.end((err) => {
				if (err) {
					conn.destroy()
				}
				done()
			})
		})
	}
}

module.exports.connect = () => {
	const conn = new MysqlConnection()
	return conn.connect()
}
