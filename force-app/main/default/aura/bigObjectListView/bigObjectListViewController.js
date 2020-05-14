(
    {
        doInit : function(component, event, helper) {
            var spinnerComp = component.find('spinner');
            $A.util.removeClass(spinnerComp,'slds-hide');
            $A.util.addClass(spinnerComp,'slds-show');
            
            var columns = component.get('v.columnlist').split(",");
            var columnnames = component.get('v.columnlabellist').split(",");
            var columndatatypelist = component.get('v.columndatatypelist').split(",");
            var columnstoset = [];
            
            for( var i=0; i<columns.length; i++){
                var typetouse = 'text';
                if(columndatatypelist.length>i && columndatatypelist[i] != ""){
                    typetouse = columndatatypelist[i].trim();
                }
                columnstoset.push({label: columnnames[i].trim(), fieldName: columns[i].trim(), type: typetouse});
            }
            if(component.get('v.showActions') == true){
                var actions = [{
                    'label': 'View Contacts',
                    'iconName': 'standard:contact',
                    'name': 'view_contacts'
                }];
                var deleteAction = {
                    'label': 'View Cases',
                    'iconName': 'standard:case',
                    'name': 'view_cases'
                };
                var retrieveAction = {
                    'label': 'Retrieve',
                    'iconName': 'standard:account',
                    'name': 'retrieve_account'
                };
                actions.push(deleteAction);
                actions.push(retrieveAction);
                columnstoset.push({typeAttributes: { rowActions: actions }, type: 'action'});
            }
            component.set('v.mycolumns', columnstoset);
            var query = 'SELECT ' + component.get('v.columnlist') + ' FROM ' + component.get("v.objectname");
            if(component.get('v.whereClause') != null && component.get('v.whereClause') != ''){
                query = query+' WHERE ';
                var whereClausesOn = component.get('v.whereClauseOn').split(',');
                var whereClauses = component.get('v.whereClause').split(',');
                for(var i=0;i<whereClausesOn.length;i++){
                    query = query + whereClausesOn[i]+' = \''+whereClauses[i]+'\'';
                    if(i != whereClausesOn.length-1)
                        query = query + ' AND ';
                }
            }
            var vfHost = component.get("v.vfHost");
            component.set('v.iframeUrl','https://' + vfHost + '/apex/BigObjectListView?Query='+query);
            window.addEventListener("message", function(event) {
                if (event.origin !== "https://" + vfHost) {
                    return;
                }
                var dataRecieved = event.data;
                if(dataRecieved == undefined || dataRecieved == null || 
                   dataRecieved.result == undefined || dataRecieved.result == null){
                    return;
                }
                if(!dataRecieved.result.done){
                    component.set('v.nextRecordsUrl',dataRecieved.result.nextRecordsUrl);
                }
                component.set('v.mydata',dataRecieved.result.records);
                var bigObjectRecordsMap = new Object();
                bigObjectRecordsMap[component.get('v.pageNo')] = dataRecieved.result.records;
                component.set('v.bigObjectRecordsMap',bigObjectRecordsMap);
                component.set('v.sessionId',dataRecieved.sessionId);
                component.set('v.isDone',dataRecieved.result.done);
                var spinnerComp = component.find('spinner');
                $A.util.removeClass(spinnerComp,'slds-show');
                $A.util.addClass(spinnerComp,'slds-hide');
            }, false);
        },
        refresh : function(component, event, helper) {
            var action = component.get('c.getEDInfo');
            action.setCallback(component, function(response) {
                var state = response.getState();
                if (state === 'SUCCESS'){
                    $A.get('e.force:refreshView').fire();
                } else {
                }
            });
            $A.enqueueAction(action);
        },
        handleRowAction : function(component,event,helper){
            var action = event.getParam('action');
            var row = event.getParam('row');
            component.set('v.selectedParentId',row.Account_Id__c);
            switch(action.name){
                case 'view_contacts' :
                    component.set('v.navigationPage',2);
                    break;
                case 'view_cases' :
                    component.set('v.navigationPage',3);
                    break;
                case 'retrieve_account' :
                    component.set('v.showSpinner',true);
                    var action = component.get("c.retrieveBigObjectAccount");
                    action.setParams({
                        "bigObjectAccountName": row.Account_Name__c
                    });
                    action.setCallback(component, function(response) {
                        var result = response.getReturnValue();
                        var state = response.getState();
                        if (state === 'SUCCESS'){
                            helper.deleteBigObjectRecords(component,row.Account_Name__c,response.getReturnValue());
                        } 
                    });
                    $A.enqueueAction(action); 
                    break;
            }
        },
        onClickPrevious : function(component,event,helper){
            var spinnerComp = component.find('spinner');
            $A.util.removeClass(spinnerComp,'slds-hide');
            $A.util.addClass(spinnerComp,'slds-show');
            component.set('v.pageNo',component.get('v.pageNo')-1);
            var bigObjectRecordsMap = component.get('v.bigObjectRecordsMap');
            component.set("v.mydata",bigObjectRecordsMap[component.get('v.pageNo')]);
            var spinnerComp = component.find('spinner');
            $A.util.removeClass(spinnerComp,'slds-show');
            $A.util.addClass(spinnerComp,'slds-hide');
        },
        onClickBack : function(c,e,h){
            $A.get('e.force:refreshView').fire(); 
        },
        onClickNext : function(component,event,helper){
            component.set('v.pageNo',component.get('v.pageNo')+1);
            var spinnerComp = component.find('spinner');
            $A.util.removeClass(spinnerComp,'slds-hide');
            $A.util.addClass(spinnerComp,'slds-show');
            var isDone = component.get('v.isDone');
            if(isDone == true){
                var spinnerComp = component.find('spinner');
                $A.util.removeClass(spinnerComp,'slds-show');
                $A.util.addClass(spinnerComp,'slds-hide');
            }else{
                var action = component.get("c.getNextRecords");
                action.setParams({
                    "url": component.get('v.nextRecordsUrl'),
                    "sessionId" : component.get('v.sessionId')
                });
                action.setCallback(component, function(response) {
                    var result = response.getReturnValue();
                    var state = response.getState();
                    if (state === 'SUCCESS'){
                        var bigObjectResponse = response.getReturnValue();
                        console.log(bigObjectResponse);
                        component.set("v.mydata", bigObjectResponse.records);
                        var bigObjectRecordsMap = component.get('v.bigObjectRecordsMap');
                        bigObjectRecordsMap[component.get('v.pageNo')] = bigObjectResponse.records;
                        component.set('v.bigObjectRecordsMap',bigObjectRecordsMap);
                        component.set('v.isDone',bigObjectResponse.done);
                        component.set('v.nextRecordsUrl',bigObjectResponse.nextRecordsUrl);
                        var spinnerComp = component.find('spinner');
                        $A.util.removeClass(spinnerComp,'slds-show');
                        $A.util.addClass(spinnerComp,'slds-hide');
                    } 
                });
                $A.enqueueAction(action); 
            }
        }
    })