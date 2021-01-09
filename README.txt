Para iniciar a aplicação basta executar:
docker-compose up

A autenticação via JWT utiliza a seguinte configuração

HEADER
{
  "alg": "HS256",
  "typ": "JWT"
}

PAYLOAD
{
	"clientName": <nome do cliente>,
	"exp": <timestamp de expiração>
}

HMACSHA256(
	base64UrlEncode(header) + "." +
	base64UrlEncode(payload),
	JWT_SECRET
)

A variável JWT_SECRET é definida no arquivo de configurações em ./src/.env
