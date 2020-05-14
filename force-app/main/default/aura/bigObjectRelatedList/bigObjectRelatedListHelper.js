({
    
    removeBook: function (cmp, row) {
        var rows = cmp.get('v.mydata');
        var rowIndex = rows.indexOf(row);
        rows.splice(rowIndex, 1);
        cmp.set('v.mydata', rows);
    },
       
    getData : function(cmp) {
        var action = cmp.get('c.getBOs');
        action.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('-- get Data ---');
                cmp.set('v.data', response.getReturnValue());
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error(errors);
            }
        }));
        $A.enqueueAction(action);
    },
    
    queryData : function(cmp, row){
        var action = cmp.get("c.insertModal");
        action.setParams({
                "rowTripId": cmp.get("v.rowTripId"),
                "contactId": cmp.get("v.recordId"),
            });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                
                document.getElementById('EditorModal').style.display="block";
                //alert("From server: " + response.getReturnValue());
                var returnVal =  response.getReturnValue();
                cmp.set('v.newData', returnVal);
                //var temp = cmp.get('--- new data ---- ' + returnVal[0].Contact__c);
                console.log('---- newData 2---- ' + cmp.get('v.newData'));
                console.log('-- string --- ' + returnVal[0].Contact__c);
            }
            else if (state === "INCOMPLETE") {
            }
                else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " + 
                                        errors[0].message);
                        }
                    }                    
                    else {
                        console.log("Unknown error");
                    }
                }
        });
        $A.enqueueAction(action);
    },
    
   openModel: function(component, event, helper) {
        // for Display Model,set the "isOpen" attribute to "true"
       	document.getElementById('EditorModal').style.display="block"; 
      	component.set("v.isOpen", true);
        console.log('openModel has been clicked')
   },
 
   closeModel: function(component, event, helper) {
      // for Hide/Close Model,set the "isOpen" attribute to "Fasle"  
      component.set("v.isOpen", false);
   },
})