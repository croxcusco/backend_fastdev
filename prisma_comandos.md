## prisma comandos

para iniciar un nuevo proyecto
> npx prisma init 

para crear los modelos desde una base de datos
> npx prisma db pull

generar las interfaces deacuerdo al modelo de la base de datos
> npx prisma generate


para ejecutar el servidor:
> npm run dev


para ejecutar un pull de otra base de datos
> npx prisma db pull --schema=prisma/schema1.prisma
> 
> npx prisma db pull --schema=prisma/schema2.prisma



para ejecutar un generate de otra base de datos
> npx prisma generate --schema=prisma/schema1.prisma
> 
> npx prisma generate --schema=prisma/schema2.prisma



## Docker iniciar comandos

para iniciar un nuevo proyecto
>
> docker-compose up -d --build


Para detener los contenedores, puedes usar:

> docker-compose down