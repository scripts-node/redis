"use strict";

/**
 * Inclui o módulo redis
 */
var redis = require("redis");

/**
 * Inclui o módulo debug
 */
var debug = require('debug')(process.env.SERVICE_NAME + ':src:cache');

/**
 * Classe para controle de cache com redis
 */
class Cache {

    constructor() {

        try {

            /**
             * Transfere para variável a propriedade this para ser usada dentro das funções
             */
            var c = this;

            /**
             * Porta de conexão com redis
             */
            let port = process.env.REDIS_PORT || 6379;

            /**
             * Ip de conexão com o redis
             */
            let address = process.env.REDIS_ADDRESS || '127.0.0.1';
    
            /**
             * LOG
             */
            debug("Estabelecendo conexão com o redis através da porta %s e endereço %s",port,address);
            
            /**
             * Cria a conexão com o redis
             */
            this.client = redis.createClient(
                port,
                address
            );
        
            /**
             * Se a conexão com o redis exigir senha
             */
            if (process.env.REDIS_PASSWORD){
                this.client.auth(process.env.REDIS_PASSWORD);
            }
    
            /**
             * Quando conseguir conectar
             */
            this.client.on("connect", function() {
                c.status = "connected";
                debug("Conexão estabelecida com sucesso.");
            })
        
            /**
             * Se não conseguir conectar
             */
            this.client.on("error", function (error) {
                c.status == "error";
                c.error = error;
                c.message = "Erro ao conectar na instância do REDIS.";
                debug(c.message,error);
                throw Error(c.message, error);
            });   

        } catch (error) {

            /**
             * Tratamento de erro
             */
            debug(error);
            throw new Error(error)
        }
    }

    /**
     * Metodo que é executado quando a conexão com redis estiver pronta
     * @param {function} callback 
     * @returns 
     */
    ready(callback){

        /**
         * Transfere a manupulação da propriedade this para a variavel para usar dentro das funções
         */
        var r = this;

        /**
         * Retorna uma promise
         */
        return new Promise((resolve,reject)=>{

            /**
             * Se o redis estiver conectado
             */
            if(r.status=="connected"){

                /**
                 * Retorna que está pronta
                 */
                if(callback)
                    callback(null,r);
                    return resolve(r);
            }else{

                /**
                 * Cria um controle com o número de tentativas de conexão com redis
                 */
                this.attempt = 1;

                /**
                 * Cria um temporiazado
                 */
                var interval = setInterval(()=>{

                    /**
                     * Avalia se a conexão com redis já está pronta
                     */
                    if(r.status=="connected"){

                        /**
                         * Finaliza o temporizador
                         */
                        clearInterval(interval)

                        /**
                         * Retorna que está pronta
                         */
                        if(callback)
                            callback(null,r);
                            return resolve(r);
                    }else{

                        /**
                         * Se o número máximo de tentativas de conexão for atingido
                         */
                        if(this.attempt>=50){

                            /**
                             * Finaliza o temporizador
                             */
                            clearInterval(interval);

                            /**
                             * Retorna que apresentou falha
                             */
                            if(callback)
                                return callback(r.message,null);
                                return reject(r.message);
                        }else{

                            /**
                             * Incrementa mais tempo ao temporizador
                             */
                            this.attempt ++;
                        }
                    }
                },100);
            }
        });
    }

    /**
     * Obtem o valor de uma chave em cache
     * @param {*} key 
     * @returns 
     */
    getValue(key) {

        /**
         * Promise para retorno
         */
        return new Promise((resolve,reject) => {

            /**
             * Obtem o conteúdo da chave
             */
            this.client.get(key,function(error,success){
                if(error) reject(error);
                resolve(success);
            });
        });
    }

    /**
     * Armazena uma chave e um valor
     * @param {*} chave 
     * @param {*} valor 
     * @param {int} expireAt 
     */
    setValue(chave,valor,expireAt){

        /**
         * Seta o valor da chave
         */
        this.client.set(chave,valor);
        this.client.expireat(chave, parseInt((+new Date)/1000) + (expireAt || 30));
    }

}

module.exports = Cache
