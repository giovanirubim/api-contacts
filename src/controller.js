const prepare = require('mysql').escape
const mysqlConnector = require('./connectors/mysql-connector')
const postgresConnector = require('./connectors/postgres-connector')

// Insere um contato no banco do cliente de Macapá
const addMacapaContact = async (conn, contact) => {
	
	let { name, cellphone } = contact
	
	name = name
		.trim() // Remove espaçamentos nas extremidades
		.replace(/\s+/g, ' ') // Removes espaçamentos duplicados e/ou inválidos (\t, \n, ...)
		.toUpperCase() // Alterna os caracteres alfabéticos para maiúsculos
	
	cellphone = cellphone
		.replace(/[^\d]/g, '') // Remove caracteres não dígitos
		.replace(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/, '+$1 ($2) $3-$4') // Formata

	// Insere registro no banco
	const res = await conn.query(`
		INSERT INTO contacts
		SET
			nome = ${prepare(name)},
			celular = ${prepare(cellphone)}
	`)

	return { key: res.insertId }
}

// Insere um contato no banco do cliente de VareJão
const addVarejaoContact = async (conn, contact) => {
	
	let { name, cellphone } = contact
	
	name = name
		.trim() // Remove espaçamentos nas extremidades
		.replace(/\s+/g, ' ') // Removes espaçamentos duplicados e/ou inválidos (\t, \n, ...)
	
	cellphone = cellphone.replace(/[^\d]/g, '') // Remove caracteres não dígitos

	// Insere registro no banco
	const res = await conn.query(`
		INSERT INTO contacts (
			nome, celular
		) VALUES (
			${prepare(name)},
			${prepare(cellphone)}
		)
		RETURNING id
	`)

	return { key: res.rows[0].id }
}

module.exports.addContact = (req, res) => {

	const { clientName } = req.jwt
	let conn = null
	let connector = clientName === 'macapa'? mysqlConnector: postgresConnector
		
	// Realiza conexão com o servidor e adiciona o contato
	connector.connect()
		.then((res) => {
			conn = res
			if (clientName === 'macapa') {
				return addMacapaContact(conn, req.body)
			} else {
				return addVarejaoContact(conn, req.body)
			}
		})
		.then((data) => {
			res.status(201).json(data)
			conn.end()
		})
		.catch((err) => {
			console.error(err)
			res.status(500).json({ message: 'Internal server error' })
			if (conn) conn.end()
		})
}
