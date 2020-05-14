public with sharing class BigObjectListView {
    
    public integer count =1; 
    public integer counter=0; 
    public integer list_size = 10; 
    public integer total_size; 
    
    @AuraEnabled
    public static String getSessionID(){
        return UserInfo.getSessionId();
    }
    
    @AuraEnabled
    public static List<SObject> getBOs(String recordId, String objectname, String lookupfield, String columnlist) {     
        List<SObject> bos;
        columnlist= columnlist.replaceAll( '\\s+', '');
        List<String> fieldNames = columnlist.split(',');
        
        if(!checkAccessibleFLS(fieldNames,objectname)){
            throw new System.NoAccessException();
        }
        
        //String strQuery = 'SELECT ' + columnlist + ' FROM ' + objectname + ' WHERE ' + lookupfield + ' = \'' + recordId + '\'' + ' LIMIT 5000';
        String strQuery = 'SELECT ' + columnlist + ' FROM ' + objectname + ' LIMIT 10';
        
        
        try { 
            bos = Database.query(strQuery);
            
        }
        
        
        catch (Exception ce) {
            System.debug('Error in query or you may not have access to one of the fields.  Make sure you apply your permission set.  Query string is ' + strQuery);
            
        }
        return bos;
    }   
    
    @AuraEnabled 
    public void getNext()
    {
        
        
    }
    /* This method ensures the fields are Accessible. Ensuring FLS. */
    public static boolean checkAccessibleFLS(List<String> fieldNames, String objName){
        boolean isSafe = false;
        Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
        SObjectType myObj = schemaMap.get(objName);
        if(myObj.getDescribe().isAccessible()){ 
            for(String fldName: fieldNames){
                SObjectField myField = myObj.getDescribe().fields.getMap().get(fldName);
                
                if(myField.getDescribe().isAccessible()){
                    isSafe = true;
                }else{
                    isSafe = false;
                    break;
                }    
            }
        }else{
            isSafe = false;
        }
        return isSafe;
    }
    
    @AuraEnabled
    public static BigObjectRecordsResponse getNextRecords(String url,String sessionId){
        //Make sure your Salesforce instance URL is added in remote site settings
        String sfdcURL = System.URL.getSalesforceBaseUrl().toExternalForm(); 
        String restAPIURL = sfdcURL + url;  
        
        HttpRequest httpRequest = new HttpRequest();  
        httpRequest.setMethod('GET');   
        httpRequest.setHeader('Authorization', 'OAuth ' + sessionId);        
        httpRequest.setEndpoint(restAPIURL);  
        try {  
            Http http = new Http();   
            HttpResponse httpResponse = http.send(httpRequest);  
            if (httpResponse.getStatusCode() == 200 ) {  
                System.debug(httpResponse.getBody());
                BigObjectRecordsResponse bigObjectResponse= (BigObjectRecordsResponse)
                    JSON.deserialize(httpResponse.getBody(),BigObjectRecordsResponse.class);
                return bigObjectResponse;
            } else {  
                System.debug(' httpResponse ' + httpResponse.getBody() );  
                throw new CalloutException( httpResponse.getBody() );  
            }   
        } catch( System.Exception e) {  
            System.debug('ERROR: '+ e);  
            throw e;  
        }  
    }
    
    public class BigObjectRecordsResponse{
        @AuraEnabled
        public List<sObject> records{get;set;}
        @AuraEnabled
        public String nextRecordsUrl{get;set;}
        @AuraEnabled
        public String totalSize{get;set;}
        @AuraEnabled
        public String done{get;set;}
        
        public BigObjectRecordsResponse(){
            
        }
        
    }
    
    @AuraEnabled
    public static String retrieveBigObjectAccount(String bigObjectAccountName){
        
        
        Account__b lAccount = [SELECT Account_Name__c, Account_Id__c,Type__c FROM Account__b WHERE Account_Name__c = :bigObjectAccountName LIMIT 1];
        List<Contact__b> lContacts = [SELECT Account_Id__c, Name__c , Record_Id__c FROM Contact__b WHERE Account_Id__c = :lAccount.Account_Id__c];
        List<Case__b> lCases = [SELECT Account_Id__c, Case_Number__c, Description__c, Record_Id__c, Status__c , Subject__c FROM Case__b WHERE Account_Id__c = :lAccount.Account_Id__c];
        
        Account newAccount = new Account(Name = lAccount.Account_Name__c, Type = lAccount.Type__c);
        insert newAccount;
        List<sObject> recordsToInsert = new List<sObject>();
        for(Case__b lCase : lCases){
            Case newCase = new Case(AccountId = newAccount.Id, Description = lCase.Description__c,
                                    Status = lCase.Status__c, Subject = lCase.Subject__c);
            recordsToInsert.add(newCase);
        }
        for(Contact__b lContact : lContacts){
            List<String> nameParams = lContact.Name__c.split(' ');
            Contact newContact;
            if(nameParams.size() > 1)
                newContact = new Contact(AccountId = newAccount.Id,FirstName = nameParams[0],LastName = nameParams[1]);
            else if(nameParams.size() == 1)
                newContact = new Contact(AccountId = newAccount.Id,LastName = nameParams[0]);
            recordsToInsert.add(newContact);
        }
        insert recordsToInsert;
        return newAccount.Id;
    }
    
    @AuraEnabled
    public static Boolean deleteBigObjectAccountAndChilds(String bigObjectAccountName){
        try{
            List<sObject> recordsToDelete = new List<sObject>();
            Account__b lAccount = [SELECT Account_Name__c, Account_Id__c FROM Account__b WHERE Account_Name__c = :bigObjectAccountName LIMIT 1];
            recordsToDelete.add(lAccount);
            List<Contact__b> lContacts = [SELECT Account_Id__c , Record_Id__c FROM Contact__b WHERE Account_Id__c = :lAccount.Account_Id__c];
            recordsToDelete.addAll(lContacts);
            List<Case__b> lCases = [SELECT Account_Id__c, Record_Id__c FROM Case__b WHERE Account_Id__c = :lAccount.Account_Id__c];
            recordsToDelete.addAll(lCases);
            Database.deleteImmediate(recordsToDelete);
            return true;
        } catch(Exception e){
            return false;
        }
    }
    
}