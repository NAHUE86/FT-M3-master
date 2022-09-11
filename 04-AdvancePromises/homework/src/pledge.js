'use strict';
/*----------------------------------------------------------------
Promises Workshop: construye la libreria de ES6 promises, pledge.js
----------------------------------------------------------------*/
// // TU CÓDIGO AQUÍ:
function $Promise(executor){
    if (typeof executor !== "function") throw new TypeError ("executor must be a function")

    this._state = "pending"
    this._handlerGroups = []
    executor(this._internalResolve.bind(this),this._internalReject.bind(this))
}
$Promise.prototype._internalResolve = function(data){
  if(this._state === "pending"){
    this._state = "fulfilled"
    this._value = data
    this._callHandlers()
 }
}

$Promise.prototype._internalReject = function(reason){
 if(this._state === "pending"){
    this._state = "rejected"
    this._value = reason
    this._callHandlers()
 }
}

$Promise.prototype.then = function(successCb, errorCb){
    if(typeof successCb !== "function") successCb = false
    if(typeof errorCb !== "function") errorCb = false   
    
    const downstreamPromise = new $Promise(function(){})

    this._handlerGroups.push({
        successCb,
        errorCb,
        downstreamPromise
       })
       if(this._state !== "pending"){
        this._callHandlers()
       }
       return downstreamPromise
     }

$Promise.prototype._callHandlers = function(){
    while(this._handlerGroups.length){
        var hanlder = this._handlerGroups.shift()
        if(this._state === "fulfilled"){
           // hanlder.successCb && hanlder.successCb(this._value)
            if(!hanlder.successCb){
                hanlder.downstreamPromise._internalResolve(this._value)
            }else{
                try{
                const result = hanlder.successCb(this._value)
                //si arroja un error va al catch
                //y no lee nada mas de lo q haya
                //dentro del try
                if (result instanceof $Promise){
                   result.then (value => {
                    hanlder.downstreamPromise._internalResolve(value)
                   }, err => {
                    hanlder.downstreamPromise._internalReject(err)
                   })
                }else{
                    hanlder.downstreamPromise._internalResolve(result)
                }

                }catch(error){
                    hanlder.downstreamPromise._internalReject(error)

                }
            }        
        }else{
            //hanlder.errorCb && hanlder.errorCb(this._value)
            if(!hanlder.errorCb){
                hanlder.downstreamPromise._internalReject(this._value)
            }else{
                try{
                    const result = hanlder.errorCb(this._value)
                    if(result instanceof $Promise){
                        result.then(value => {
                            hanlder.downstreamPromise._internalResolve(value)
                        }, err => {
                            hanlder.downstreamPromise._internalReject(err)
                        })
                    }else{
                        hanlder.downstreamPromise._internalResolve(result)
                    }
                }catch(error){
                    hanlder.downstreamPromise._internalReject(error)
                }
            }
        }
    }
}
 $Promise.prototype.catch = function(errorCb){
    return this.then(null, errorCb)
 }    


module.exports = $Promise;
/*-------------------------------------------------------
El spec fue diseñado para funcionar con Test'Em, por lo tanto no necesitamos
realmente usar module.exports. Pero aquí está para referencia:

module.exports = $Promise;

Entonces en proyectos Node podemos esribir cosas como estas:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
