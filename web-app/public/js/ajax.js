AjaxEngine = function(){
    function getDevices(callback){
        $.ajax({
            url: '/devices'
        }).done(function(response){
            callback(null,response);
        });
    }

    function addDevice(data, callback){
        $.ajax({
            type: 'POST',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            url: '/devices',
            data: JSON.stringify(data)
        }).done(function(response){
            callback(null, response);
        }).fail(function(response){
            callback(response, null);
        });
    }
    return {
        getDevices: getDevices,
        addDevice: addDevice
    }
}