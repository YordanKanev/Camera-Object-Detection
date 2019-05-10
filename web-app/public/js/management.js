var ajaxEngine = new AjaxEngine();

var devices = [];

$(document).ready(function(){
    handleAddDevice();
    reportData();
});


var reportData = function(){
    ajaxEngine.getDevices(function(err,devs){
        if(err){
            return;
        }
        devices = devs;
        renderReportData();
        return;
    });
}

var renderReportData = function(){
    $("#jsGrid").jsGrid({

        width: "100%",

        fields: [
            { title: "Name", name: "name", type: "text", align: "left", width: 70, headercss: "jsgrid-header-sort jsgrid-header-sort-desc" },
            { title: "ID", name: "deviceId", type: "text", align: "left", width: 70 },
            { title: "Email", type: "text", name: "ownerId", align: "left", width: 90 }
        ],

        autoload: true,
        sorting: true,
        paging: true,
        pageSize: 10,
        filtering: true,
        autosearch: true,

        data: devices,
        controller: {
            loadData: function (filter) {
                var updated = devices;

                var d = $.Deferred();
                d.resolve(updated);
                return d.promise();
            }
        }
    });
    $("#jsGrid").jsGrid("sort", 0);
}

function handleAddDevice(){
    $("#addDevice").on("click", function (event) {
        clearCreateDeviceForm();
        $("#createDeviceModal").modal('toggle');
    });
    $("#createDeviceBtn").on("click", function (event) {
        clearCreateDeviceValidation();
        var data = {
            name: $("#name").val(),
            deviceId: $("#deviceId").val(),
            email: $("#email").val(),
            password: $("#password").val()
        };
        ajaxEngine.addDevice(data, function(err, suc){
            if (err) {
                $("#device_error").text(err);
                $("#device_error").show();
                return;
            }
            else {
                $("#device_success").show();
                reportData();
                setTimeout(() => { $("#createDeviceModal").modal('hide'); }, 1000);
                return;
            }
        });
    });
}

function clearCreateDeviceValidation() {
    $("#device_error").hide();
    $("#device_success").hide();
}

function clearCreateDeviceForm() {
    clearCreateDeviceFields();
    clearCreateDeviceValidation();
}

function clearCreateDeviceFields() {
    $("#name").val("");
    $("#email").val("");
    $("#deviceId").val("");
    $("#password").val("");
}