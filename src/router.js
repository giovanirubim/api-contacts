const express = require('express')
const { celebrate, Joi, Segments, isCelebrateError } = require('celebrate')
const controller = require('./controller')

const router = express.Router()

// Rota do registro de contatos
router.post('/contact',
	celebrate({
		[Segments.BODY]: Joi.object().keys({
			name: Joi.string().required(),
			cellphone: Joi.string().required().regex(/^\d{12,13}$/)
		})
	}),
	controller.addContact
)

// Tratamento de erros de validação
router.use((err, req, res, next) => {
	if (!isCelebrateError(err)) {
		throw err
	}
	let response = { message: 'Invalid data format' }
	const { details } = err
	const body = details.get(Segments.BODY)
	if (body) {
		const item = body.details[0]
		if (item) {
			response = {
				key: item.context.label,
				message: item.message,
			}
		}
	}
	res.status(400).json(response)
})

module.exports = router
