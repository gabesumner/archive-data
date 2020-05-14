({
    deleteBigObjectRecords : function(component,accountName,newAccountId) {
        var action = component.get("c.deleteBigObjectAccountAndChilds");
        action.setParams({
            "bigObjectAccountName": accountName
        });
        action.setCallback(component, function(response) {
            var result = response.getReturnValue();
            var state = response.getState();
            if (state === 'SUCCESS'){
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "type" : "success",
                    "title": "Success!",
                    "message": "The record has been retrieved successfully."
                });
                toastEvent.fire();
                window.open("/lightning/r/Account/"+newAccountId+"/view");
                component.set('v.showSpinner',false); 
                $A.get('e.force:refreshView').fire();
            } 
        });
        $A.enqueueAction(action); 
    }
})