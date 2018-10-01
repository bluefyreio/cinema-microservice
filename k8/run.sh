
# use this if you want to docker build locally
function buildlocalAndDeployToGoogle {
    app=$1
    docker build -t $app .

    # move to google registry
    docker tag $app gcr.io/$projectid/$app
    docker push gcr.io/$projectid/$app
}

# use this if you want to google to docker build
# saves on network bandwidth
function buildAndDeployToGoogle {
    app=$1
    projectid='customerdemo-001'
    # submit build job to google container builder and push to google registry
    gcloud builds submit --tag gcr.io/$projectid/$app .
    
}

array=('movies-service'
  'cinema-catalog-service'
  'booking-service'
  'payment-service'
  'notification-service'
  'api-gateway'
  'login-service'
)

for ((i = 0; i < ${#array[@]}; ++i)); do
    # running service
    echo 'Running '${array[$i]}

    # and we go back to the root again :D
    cd ..

    # we go to each folder
    cd ${array[$i]}

    # we create or recreate our image
    buildAndDeployToGoogle ${array[$i]}
done

