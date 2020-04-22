### dev setup

---

export MONGO_CERT=`cat x509-full.pem`
export JWT_PRIVATE_KEY=`cat jwt.pem`
export JWT_PUBLIC_KEY=`cat jwt.pub`

kubectl port-forward mongo-main-0 27000:27017 -n mongodb
mongo localhost:27000 --tls --tlsAllowInvalidCertificates --authenticationDatabase '$external' --authenticationMechanism MONGODB-X509 --tlsCertificateKeyFile x509-full.pem

yarn build:watch
yarn kube:hot
