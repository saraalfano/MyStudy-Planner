docker container rm node1
docker container rm node2
docker container rm node3
docker container rm nodemailer-1
docker image rm progettoreti-node1
docker image rm progettoreti-node2
docker image rm progettoreti-node3
docker image rm progettoreti-nodemailer
docker stop nginx
docker-compose up