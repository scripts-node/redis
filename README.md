# Exemplo simples de utilização do redis

## Incluíndo a classe
```node
var cache = require("./src/cache");
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
var cache = await new cache().ready();
cache.setValue("minhachave","valor-da-minha-chave");

var value = await cache.getValue("minhachave");
console.log(value)  
})
```
