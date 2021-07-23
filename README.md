# Exemplo simples de utilização do redis

## Incluíndo a classe
```node
var redis = require("redis");
```

## Chamada por callback
```node
new cache().ready(async (error, cache)=>{
    cache.setValue("minhachave","valor-da-minha-chave");
    var value = await cache.getValue("minhachave");
    console.log(value)  
})
```

## Chamada por promise
```node
new cache().ready().then(async (cache) => {
    cache.setValue("minhachave","valor-da-minha-chave");
    var value = await cache.getValue("minhachave");
    console.log(value)  
})
```
