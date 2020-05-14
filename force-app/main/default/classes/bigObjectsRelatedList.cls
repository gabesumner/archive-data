public class bigObjectsRelatedList {
    
    /*
    @AuraEnabled
    public static List<SObject> getBigObjects(){
        List<SObject> bigObjectsQuery = [SELECT QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName LIKE '%__b' order by QualifiedApiName LIMIT 10];
		System.debug('---bigObjectsQuery---' + bigObjectsQuery);
        return bigObjectsQuery;        
    }
    

    
    @AuraEnabled
    public static List<SObject> getBOs(String recordId, String objectname, String lookupfield, String columnlist) {     
        List<SObject> bos;
        columnlist= columnlist.replaceAll( '\\s+', '');
        List<String> fieldNames = columnlist.split(',');
        
        if(!checkAccessibleFLS(fieldNames,objectname)){
            throw new System.NoAccessException();
        }
        String strQuery = 'SELECT ' + columnlist + ' FROM ' + objectname + ' WHERE ' + lookupfield + ' = \'' + recordId + '\'' + ' LIMIT 5000';

        try {       
            bos = Database.query(strQuery);
            System.debug('-- big object length --- ' + bos.Size());           
        }
        
        
        catch (Exception e) {
            System.debug('Error in query or you may not have access to one of the fields.  Make sure you apply your permission set.  Query string is ' + strQuery);
        }
        return bos;
    }   
    
    @AuraEnabled 
    public void getNext()
    {
        	
        
    }
    */

    /* This method ensures the fields are Accessible. Ensuring FLS. */
    /*
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
    public static List<SObject> insertModal(String recordId, String objectname, String lookupfield, String columnlist, String rowTripId, String contactId){
    
       List<SObject> newRecord = [SELECT ContactLookup__c, From_Station_Id__c,From_Station_Name__c,Id,Start_Time__c,Stop_Time__c,To_Station_Id__c,To_Station_Name__c,Trip_Id__c FROM Ride__b WHERE ContactLookup__c = :contactId AND Trip_Id__c = :rowTripId AND Start_Time__c > 2010-11-30T12:58:56.000Z];
	   
       String strQuery = 'SELECT ' + columnlist + ' FROM ' + objectname + ' WHERE ' + lookupfield + ' = \'' + recordId + '\'';
       
       System.debug('newRecord is ' + newRecord);
       return newRecord;
    }
    
    @AuraEnabled 
    public static SObject saveOrder (Ride__b neworderdata, String rowTripId, String contactId)
    {
       List<Ride__b> os =[SELECT ContactLookup__c, 
                                         //Day__c,
                                         //Events__c,
                                         From_Station_Id__c,
                                         From_Station_Name__c,
                                         //Gender__c,
                                         Id,
                                         //Latitude_End__c,
                                         //Latitude_Start__c,
                                         //Longitude_End__c,
                                         //Longitude_Start__c,
                                         //Month__c,
                                         Start_Time__c,
                                         Stop_Time__c,
                                         //Temperature__c,
                                         To_Station_Id__c,
                                         To_Station_Name__c,
                                         //Trip_Duration__c,
                                         Trip_Id__c
                                         //User_Type__c,
                                         //Week__c,
                                         //Year__c 
                                    FROM Ride__b 
                                   WHERE ContactLookup__c = :contactId AND Trip_Id__c >= '1' AND Start_Time__c <= 2017-11-30T12:58:56.000Z
                                     AND Trip_Id__c = :rowTripId];               

        system.debug('-- new order from ui --- '+ neworderdata);
              try{     
        		upsert neworderdata; 
            	} 
        	  
        		catch(DMLException e){
             	System.debug('-- exception --- ' + e);   
                }
        
                return neworderdata; 

    }
    */
}