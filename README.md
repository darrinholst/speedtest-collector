# speedtest-collector

``` sh 
while true; do curl -H "Content-Type: application/json" -d "$(speedtest --json)" http://localhost:3000/collect; sleep 870; done
```