# set up the namespace
kubectl create -f namespace.yaml
ns=cinema

    # set your default admin username and password
    kubectl create secret generic dbuser --from-literal=dbuser=changemeuser -n $ns
    kubectl create secret generic dbpass --from-literal=dbpass=changemepassword -n $ns 

    kubectl create configmap dbservers --from-literal=dbservers="mongo" -n $ns     


    # mongo-replica configmap
    kubectl create configmap dbservers --from-literal=dbservers="mongo-replica-0.mongo-replica.$ns.svc.cluster.local mongo-replica-1.mongo-replica.$ns.svc.cluster.local mongo-replica-2.mongo-replica.$ns.svc.cluster.local" -n $ns 
    
    # kubectl create secret generic dbservers --from-literal=dbservers= -n $ns 

    kubectl create configmap cinemainitdata --from-file=../cinema-catalog-service/src/mock/countries.json --from-file=../cinema-catalog-service/src/mock/states.json --from-file=../cinema-catalog-service/src/mock/cities.json --from-file=../cinema-catalog-service/src/mock/cinemas.json --from-file=../movies-service/src/mock/movies.json -n $ns

    kubectl get configmaps cinemainitdata -n $ns -o yaml

    # Replace BLUEFYRE_AGENT_ID with the API key from the Bluefyre app
    BLUEFYRE_AGENT_ID=17e1d8c3-ef87-4c1e-9b17-6282d562654b
    kubectl create secret generic bluefyre-agent-id --from-literal=agentid=$BLUEFYRE_AGENT_ID -n $ns


    kubectl get secrets -n $ns 


# Mongo
    # Option 1: mongo-service
        # set up the mongo service, pvclaim, deployment1
        kubectl apply -f mongo.yaml -n $ns

        # mongo-init
        kubectl apply -f mongo-init.yaml -n $ns

    # Option 2: mongo-replica
        # alternative to the simple mongo service
        kubectl apply -f mongo-replica/mongo-replica.yaml -n $ns

        # mongo-init-replica
        kubectl apply -f mongo-replica/mongo-init-replica.yaml -n $ns


# Services
    # setup service
    array=('movies-service'
    'cinema-catalog-service'
    'booking-service'
    'payment-service'
    'notification-service'
    'api-gateway'
    'login-service'
    )

    for ((i = 0; i < ${#array[@]}; ++i)); do
        kubectl apply -f $array[$i].yaml -n $ns
    done
    for ((i = 0; i < ${#array[@]}; ++i)); do
        kubectl patch deployment $array[$i] -p "{\"spec\":{\"template\":{\"metadata\":{\"labels\":{\"date\":\"`date +'%s'`\"}}}}}" -n $ns
    done


    # movies-service
    app=movies-service
    app=cinema-catalog-service
    app=login-service
    app=booking-service
    kubectl apply -f $app.yaml -n $ns
    kubectl patch deployment $app -p "{\"spec\":{\"template\":{\"metadata\":{\"labels\":{\"date\":\"`date +'%s'`\"}}}}}" -n $ns
    

# Ingress
    kubectl create -f ingress2.yaml -n $ns


# logs
kubectl get po -l app=movies-service -n $ns




## DElETE
    # delete mongo
        # Option 1: delete mongo
        kubectl delete pvc,pv,svc,rc,svc,po -l name=mongo -n $ns

        # delete jobs
        kubectl delete job,po -l app=mongo-init -n $ns

        # # Option 2: delete mongo-replica
        kubectl delete pvc,pv,svc,rc,sts,po -l name=mongo-replica -n $ns    

        # delete jobs
        kubectl delete job,po -l app=mongo-init -n $ns

    # delete configmaps
    kubectl delete configmap dbservers -n $ns
    kubectl delete configmap cinemainitdata -n $ns

    # delete services
    array=('movies-service'
    'cinema-catalog-service'
    'booking-service'
    'payment-service'
    'notification-service'
    'api-gateway'
    'login-service'
    )

    for ((i = 0; i < ${#array[@]}; ++i)); do
        kubectl delete deploy,pvc,pv,svc,rs,po -l app=$array[$i] -n $ns
    done
    
    # delete individual service
    app=movies-service
    app=api-gateway
    app=cinema-catalog-service
    app=login-service
    kubectl delete deploy,pvc,pv,svc,rs,po -l app=$app -n $ns


    # delete the namespace
    kubectl delete ns $ns



## DEBUGGING
    # movies-service
    kubectl exec -it movies-service-79b799c888-fdw6f -n cinema sh    

    # create alpine httpie dockerfile
    app=httpie
    project=customerdemo-001
    docker build -t $app -f httpie.Dockerfile .
    docker tag $app gcr.io/$project/$app
    docker push gcr.io/$project/$app
    kubectl delete deploy,pvc,pv,svc,rc,po -l app=$app -n $ns
    kubectl run httpie --image=gcr.io/$project/$app -i --tty -l app=httpie -n $ns
    httpiepod=httpie-f855785b-7jzwb
    kubectl attach $httpiepod -c httpie -i -t -n $ns