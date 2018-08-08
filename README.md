Изначально архитектура предполагалась такой [the diagram](https://drive.google.com/file/d/1widiFHSuVWol_Q0mbLvhp3Kqp0RAzGEk/view?usp=sharing), но для PoC кэширование, шардирование и веб-сокеты были отложены в сторону.

## Быстрый старт

- `git clone https://github.com/peramor/log_mq`
- `cd log_mq`
- `yarn` или `npm install`
Запустит постгрес и создаст базу log_mq:
- `docker run --name some-postgres -d -p 5432:5432 -e POSTGRES_DB=log_mq postgres`
Запустит rabbit_mq:
- `docker run --name some-rabbit -p 5672:5672 -d rabbitmq`
Запустит проект
- `npm start` или `node app.js` 

Для указания пути к файлу с логами используйте LOG_PATH переменную окружения, по умолчанию будет взят `input.csv` файл из корня проекта.

Для подключение к postgres установите переменную окружения `PGDATABASE` = `log_mq`

## Как работает

- при старте reader начнет считывать указанный log файл
- асинхронно записи идут в mapper
- из mapper'a записи попадают в очередь log на добавление в базу. (предполагалось, что на эту очередь будут также подписаны воркеры на кэширование и отправку web-socket'ов)
- дальше модуль `db` берез объекты из очереди и добавляет по одному в базу (для ускорения можно брать пачками и добавлять в транзакции, но если пачка не будет заполнена полностью - записи не попадут в базу (нужно добавить условие на ожидание, но это сложно))
- процесс подгрузки в бд может занять от 5 минут в зависимости от возможностей вашей машины

при перезапуске все повторится, так что лучше поменять LOG_PATH на `input.1.csv` (в будущем возможно добавить сохранение курсора, это описано в `reader.js`)

## Прослушивание новых записей в логгах

приложение постоянно слушает новые записи, как только новая строка или несколько строк появляются в файле, они проходят тот же пайплайн, что и исторические данные:  
`reading` -> `mapping` -> `queue` -> `populating db`

## Connection with postgres

You can setup connection by using the following env variables:
- `PGDATABASE` - the db should be created before start
- `PGUSER` - default: pg-user

## Структура проекта

```
.
├── apidoc
│   ├── api.raml
│   └── examples
├── app.js
├── Dockerfile
├── input.1.csv
├── input.csv
├── package.json
├── public
│   ├── app.css
│   ├── app.js
│   └── index.html
├── README.md
├── src
│   ├── db.js
│   ├── exchange.js
│   ├── http-server.js
│   ├── mapper.js
│   ├── reader.js
│   ├── schema
│   └── schema-validator.js
├── tests
│   ├── fake-logger.js
│   ├── README.md
│   ├── try-db.js
│   └── try-exchange.js
└── yarn.lock
```

- /apidoc - документация к API
- /src - главные модули
- /src/reader - модуль для чтения из логгов
- /src/mapper - модуль маппинга строки в объект
- /src/db - запросы к базе данных
- /src/http-server - express сервер
- /src/schema - схема для маппинга и создания бд
- /src/schema-validator - проверка схемы 
- /tests - unit-тесты, которые использовались на этапе разработки
- /tests/fake-logger - дописывает файл логгов рандомными значениями (подробнее /tests/README.md)
- /app.js - подгружает и запускает модули, файл запуска проекта
- /input.csv - файл с логами (более 50 000 записей)
- /input.1.csv - пустой файл с логами для рестарта проекта, когда база заполнена
- /public - `здесь должен лежать веб-интерфейс`