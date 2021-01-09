const http = require('http')
const express = require('express')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const router = require('./router')

dotenv.config()

const {
	env: {
		JWT_SECRET,
		SERVER_PORT = 80
	}
} = process

const app = express()

// Retorna um timestamp em segundos da data atual
const currTimestamp = () => {
	const nowMs = new Date()
	return Math.floor(nowMs/1000)
}

// Autorização JWT
app.use((req, res, next) => {

	// Checa o cabeçalho Authorization
	const {authorization} = req.headers
	if (!authorization) {
		return res.status(401).json({
			message: 'The Authorization header is missing'
		})
	}

	// Remove o prefixo Bearer
	const token = authorization
		.trim()
		.replace(/^bearer\s+/i, '')

	// Valida a assinatura do token JWT e faz o parsing do payload
	let payload
	try {
		payload = jwt.verify(token, JWT_SECRET, { algorithm: 'HS256' })
	} catch(err) {
		return res.status(403).json({
			message: 'The provided token is invalid'
		})
	}

	// Valida a data de expiração do token
	const { iat } = payload
	if (iat <= currTimestamp()) {
		return res.status(403).json({
			message: 'The provided token has expired'
		})
	}

	// Armazena o conteúdo do token na requisição
	req.jwt = payload

	next()
})

// Faz o parsing do body da requisição considerando um JSON
app.use(express.json())

// Tratamento de erro na sintaxe do JSON
app.use((err, req, res, next) => {
	if (err instanceof SyntaxError && err.message.includes('JSON')) {
		res.status(400).json({
			message: 'The body sent does not contain a valid JSON syntax'
		})
	} else {
		throw err
	}
})

// Roteamento de endpoints
app.use(router)

// Tratamento de erros
app.use((err, req, res, next) => {
	console.error(err)
	res.status(500).json({
		message: 'Internal server error'
	})
})

// Tratamento de endpoint incorreto
app.use((req, res) => {
	let status = 404
	let message = 'Endpoint not found'
	const {stack} = app._router
	for (let layer of stack) {
		if (!layer.route) continue
		if (layer.regexp.test(req.url)) {
			status = 405
			message = 'Method not allowed'
		}
	}
	res.status(status).json({ message })
})

// Cria o servidor e inicia na porta contida no ambiente
const server = http.createServer(app)
server.listen(SERVER_PORT, () => {
	console.log(`Server running at port ${SERVER_PORT}`)
})
