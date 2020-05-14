({
        init : function(component, event, helper) {
            
            var bigObjects = component.get("c.getBigObjects");
            console.log('bigObjects is', bigObjects);

            var columns = component.get('v.columnlist').split(",");
            var columnnames = component.get('v.columnlabellist').split(",");
            var columndatatypelist = component.get('v.columndatatypelist').split(",");
            var columnstoset = [];            
            var actions = [
            { label: 'Show details', name: 'show_details' },
            { label: 'Insert', name: 'insert' }   
            ];

            for( var i=0; i<columns.length; i++){
                var typetouse = 'text';
                if(columndatatypelist.length>i && columndatatypelist[i] != ""){
                    typetouse = columndatatypelist[i].trim();
                }
                columnstoset.push(
                    {label: columnnames[i].trim(), fieldName: columns[i].trim(), type: typetouse}
                );   
                
            };
            
            columnstoset.push(
                {type: 'action', typeAttributes: { rowActions: actions }});
            
            component.set('v.mycolumns', columnstoset);
            var action = component.get("c.getBOs");
            action.setParams({
                "recordId": component.get("v.recordId"),
                "objectname": component.get("v.objectname") ,
                "lookupfield": component.get("v.lookupfield"),
                "columnlist": component.get("v.columnlist")
            });
  
            action.setCallback(component, function(response) {
               
                console.log('-- Init results --- ', response.getReturnValue());
                var result = response.getReturnValue();

                var state = response.getState();
                console.log('--- array index 0 --- ', result[0]);
                
                var temp = new Array (); 
                for(var i = 0 ; i < 20 ; i++)
                {
                    temp.push(result[i]);
                }
                
                if (state === 'SUCCESS'){
              		//component.set('v.mydata', response.getReturnValue());
              		console.log('--- temp --- ', temp);
                    component.set('v.fullSet',result); 
                	component.set('v.mydata',temp);
                    component.set('v.arrayCounter','20'); 
                } 
            });
            $A.enqueueAction(action);
            
        },
    
    handleRowAction: function (component, event, helper) {
       
        var action = event.getParam('action');
        var row = event.getParam('row');

        switch (action.name) {
            case 'show_details':
                alert('Showing Details: ' + JSON.stringify(row));
                break;
            case 'insert':
                console.log('--insert clicked --- ');
                console.log(JSON.stringify(row.Trip_Id__c));
                var uiTripId = JSON.stringify(row);
                console.log('uiTripId is', uiTripId);
                //var subTripId = uiTripId.substring(1,7);
                var subTripId = uiTripId.substring(1,7);	                
                component.set('v.rowTripId', subTripId);
                console.log('---row details--- ',subTripId);
                helper.queryData (component, row);
                helper.openModel (component, event, helper);
                break;
                
           
                
        }
    },
    
    loadMoreJS : function(component, event, helper)
    {	
        var fullArray = new Array(); 
        fullArray = component.get('v.fullSet');      
        console.log('-- full set ---', fullArray[0]);        
        var tempIndex = Number(component.get('v.arrayCounter'));         
        console.log('-- tempIndex ---', tempIndex);       
        var tempArr = new Array(); 	
        
        for(var i = tempIndex ; i < tempIndex + 20 ; i++)
        {
            tempArr.push(fullArray[i]); 
        }
        
        console.log('-- tempArr --', tempArr); 
        
        //concatinate both arrays and update myData 
        var myDataArr = new Array(); 
        myDataArr = component.get('v.mydata'); 
        console.log('--- myDataArr --- ',myDataArr); 
        
        var resArr = new Array(); 
        resArr = myDataArr.concat(tempArr);       
        console.log('---resArr-- ',resArr);
        
        component.set('v.mydata',resArr); 
        var newCounter = tempIndex + 20; 
        component.set('v.arrayCounter', newCounter.toString());
        
    },
                
        refresh : function(component, event, helper) {
            var action = component.get('c.getEDInfo');
            action.setCallback(component, function(response) {
                var state = response.getState();
                if (state === 'SUCCESS'){
                    
                    $A.get('e.force:refreshView').fire();
                } else {
                    //do something
                }
            });
            $A.enqueueAction(action);
            
        },
    
        loadMoreData : function (cmp, event, helper) {
        //Display a spinner to signal that data is being loaded
        // event.getSource().set("v.isLoading", true);
        // Display "Loading" when more data is being loaded
        console.log("--- load more js controller ---"); 
        cmp.set('v.loadMoreStatus', 'Loading');
        helper.getData(cmp, cmp.get('v.rowsToLoad'))
            .then($A.getCallback(function (data) {
                if (cmp.get('v.mydata').length >= cmp.get('v.totalNumberOfRows')) {
                    event.getSource().set("v.isLoading", true);
                    cmp.set('v.enableInfiniteLoading', false);
                    cmp.set('v.loadMoreStatus', 'No more data to load');
                } else {
                    var currentData = cmp.get('v.data');
                    //Appends new data to the end of the table
                    var newData = currentData.concat(data);
                    cmp.set('v.mydata', newData);
                    cmp.set('v.loadMoreStatus', '');
                }
               event.getSource().set("v.isLoading", false);
            }));
    }, 
    
    closeEditor : function(cmp,event,helper)
    {
        console.log('--close modal---'); 
        document.getElementById('EditorModal').style.display="none"; 
    }, 
    
    saveData : function(cmp, event, helper)
    {
        console.log('-- save started --')
        // saving data 
        var newOrder = cmp.get("v.newData");  
        console.log('-- save Started --- ' + newOrder); 
        var action = cmp.get("c.saveOrder"); 
        action.setParams({"neworderdata" : newOrder[0],"rowTripId":newOrder[0].Trip_Id__c, "contactId":newOrder[0].ContactLookup__c});
        action.setCallback(this, function(response)
                           {
                               
                               var state = action.getState(); 
                               if(state === "SUCCESS")
                               {
                                   var temp = cmp.get("v.newData"); 
                                   console.log('-- upsert complete --- ' + temp ); 
                                   console.log('--- return values --- ' + response.getReturnValue());
									var toastEvent = $A.get("e.force:showToast");
                                   	toastEvent.setParams({
                                       message: 'Record Successfully Saved!',
                                       type: 'success',
                                       mode: 'sticky'
                                   });
                                   toastEvent.fire();
                                   
                               }
                               
                               else
                               {
                                   var toastEvent = $A.get("e.force:showToast");
                                   // error message 
                                   toastEvent.setParams({
                                       message: 'Error!',
                                       type: 'warning',
                                       mode: 'sticky'
                                   });
                                   toastEvent.fire();
                               }
                           });$A.enqueueAction(action); 
        
       // document.getElementById('EditorModal').style.display="none"; 
    }
     
})