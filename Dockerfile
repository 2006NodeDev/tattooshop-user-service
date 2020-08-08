FROM  node:12.18-stretch

#copy files for the app
# copy node modules
#deal with env vars
#copy in the service account key for GCP


COPY build  tattooshop-user-service/build/
COPY node_modules tattooshop-user-service/node_modules/
COPY tattooshop-284315-c8b29d3b36b5.json tattooshop-user-service/

#this is the command that starts our application
CMD npm run deploy --prefix tattooshop-user-service/build
# FROM and CMD that we need to put in docker file 
