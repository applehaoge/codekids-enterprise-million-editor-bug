#!/bin/bash
helm repo add kong https://charts.konghq.com
helm repo update
helm install kong kong/kong --namespace kong --create-namespace \
  --set ingressController.installCRDs=false \
  --set proxy.type=LoadBalancer
