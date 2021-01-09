const {Client} = require('pg')

const {
	env: {
		POSTGRES_PASSWORD = 'admin',
		POSTGRES_USER = 'admin',
	}
} = process

// Wraps a connection and promisify the methods
class PostgresConnection {
	constructor() {
		const client = new Client({
			user: POSTGRES_USER,
			host: 'postgresql',
			database: 'admin',
			password: POSTGRES_PASSWORD,
			port: 5432,
		})
		this.client = client
	}
	connect() {
		const { client } = this
		return new Promise((done, fail) => {
			client.connect((err) => {
				if (err) {
					fail(err)
				} else {
					done(this)
				}
			})
		})
	}
	query(query) {
		const { client } = this
		return new Promise((done, fail) => {
			client.query(query, (err, res) => {
				if (err) {
					fail(err)
				} else {
					done(res)
				}
			})
		})
	}
	end() {
		const { client } = this
		return new Promise((done) => {
			client.end(() => {
				done()
			})
		})
	}
}

module.exports.connect = () => {
	const client = new PostgresConnection()
	return client.connect()
}
