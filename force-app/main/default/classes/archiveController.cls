public with sharing class archiveController {
    @AuraEnabled
    public static Boolean archiveAccountAndChildren(String accountId){
        try{
            List<sObject> casesToDelete = new List<sObject>();
            List<sObject> contactsToDelete = new List<sObject>();
            List<Id> contactIdsToDelete = new List<Id>();
            List<sObject> recordsToInsert = new List<sObject>();
            List<sObject> sObjectsToInsert = new List<sObject>();
            Account acc = [SELECT Id,Name,Type,(SELECT Id,Name FROM Contacts),
                           (SELECT Id,Subject,Status,CaseNumber,Description FROM Cases)
                           FROM Account WHERE Id = :accountId LIMIT 1];
            Account__b accountBO = new Account__b(Account_Name__c = acc.Name, Account_Id__c = acc.Id,Type__c = acc.Type);
            recordsToInsert.add(accountBO);
            for(Contact con : acc.Contacts){
                Contact__b contactBO = new Contact__b(Account_Id__c = acc.Id, Name__c = con.Name, Record_Id__c = con.Id);
                Contact_Account_BigObject_Map__c conAccBigObjMap = new Contact_Account_BigObject_Map__c(Contact_Id__c = con.Id, Account_Id__c = acc.Id, Contact_Name__c = con.Name);
                sObjectsToInsert.add(conAccBigObjMap); 
                recordsToInsert.add(contactBO);
                contactsToDelete.add(con);
                contactIdsToDelete.add(con.Id);
            }
            for(Case lCase : acc.Cases){
                Case__b caseBO = new Case__b(Account_Id__c = acc.Id,Case_Number__c = lCase.CaseNumber,Description__c = lCase.Description,
                                             Record_Id__c = lCase.Id,Subject__c = lCase.Subject,Status__c = lCase.Status); 
                recordsToInsert.add(caseBO);
                casesToDelete.add(lCase);
            }
            Database.SaveResult[] saveResults = Database.insertImmediate(recordsToInsert);
            insert sObjectsToInsert;
            List<Case> contactCases = [SELECT Id FROM Case WHERE ContactId IN :contactIdsToDelete];
            casesToDelete.addAll(contactCases);
            delete casesToDelete;
            delete contactsToDelete;
            delete acc;
            return true;
        } catch(Exception e) {
            System.debug(e);
            return false;
        }
    }

    @AuraEnabled
    public static void archiveCase(String recordId) {
        Case caseS = [
            SELECT 
            Id,
            ContactId,
            AccountId,
            CaseNumber,
            CreatedDate,
            LastModifiedDate,
            ClosedDate,
            Origin,
            Priority,
            Type,
            Reason,
            Status,
            Subject,
            Description,
            Account.Name,
            Contact.Name,
            Contact.FirstName,
            Contact.LastName
            FROM Case WHERE Id = :recordId
        ];

        Case__b caseB = convertCaseToBigObject(caseS);
        Database.SaveResult result = Database.insertImmediate(caseB);

        delete caseS;
    }

    @AuraEnabled
    public static Boolean archiveCases(String archiveDate) {
        Boolean finished = true;
        DateTime parsedDate = DateTime.valueOf(archiveDate);
        System.debug('parsedDate: ' + parsedDate.format());

        List<Case> casesS = [
            SELECT
            Id,
            ContactId,
            AccountId,
            CaseNumber,
            CreatedDate,
            LastModifiedDate,
            ClosedDate,
            Origin,
            Priority,
            Type,
            Reason,
            Status,
            Subject,
            Description,
            Account.Name,
            Contact.Name,
            Contact.FirstName,
            Contact.LastName
            FROM Case 
            WHERE CreatedDate < :parsedDate
            LIMIT 1000
        ];

        List<Case__b> casesB = new List<Case__b>();
        for (Case caseS : casesS) {
            casesB.add(convertCaseToBigObject(caseS));
        }

        Database.insertImmediate(casesB);

        // If we retrieved our limit of Cases then it means where are more to delete.
        if (casesS.size() == 1000) {
            finished = false;
        }

        delete casesS;

        return finished;
    }

    @AuraEnabled
    public static List<Case__b> getArchivedCases(String accountId, String contactId) {
        // If we have a Contact ID, but not the parent Account ID, then retrieve it.
        if (String.isBlank(accountId) == true && String.isBlank(contactId) == false) {
            Contact contact = [SELECT AccountId FROM Contact WHERE id = :contactId];
            accountId = contact.AccountId;
        }

        // Compose the SOQL to retrieve the Archived Cases
        List<Case__b> cases;
        List<String> columns = new List<String>();
        columns.add('Record_Id__c');
        columns.add('Account_Id__c');
        columns.add('Contact_Id__c');
        columns.add('Subject__c');
        columns.add('Account_Name__c');
        columns.add('Contact_Name__c');
        columns.add('Type__c');
        columns.add('ClosedDate__c');

        String query = 'SELECT ';
        for (Integer i = 0; i < columns.size(); i++) {
            query = query + columns[i];
            if (i < (columns.size() - 1)) {
                query = query + ', ';
            }
        }

        query = query + ' FROM Case__b';

        // Filter by Account ID if available.
        if (String.isBlank(accountId) == false) {
            query = query + ' WHERE Account_Id__c = :accountId';
        }

        // Also filter by Contact ID if available.
        if (String.isBlank(contactId) == false) {
            query = query + ' AND Contact_Id__c = :contactId';
        }

        query = query + ' LIMIT 30';

        cases = Database.query(query);
        return cases;
    }

    @AuraEnabled(cacheable=true)
    public static Case__b getArchivedCase(String accountId, String contactId, String recordId) {
        Case__b caseB = [
            SELECT 
            Record_Id__c,
            Case_Number__c,
            Account_Id__c,
            Contact_Id__c,
            CreatedDate__c,
            LastModifiedDate__c,
            ClosedDate__c,
            Origin__c,
            Priority__c,
            Type__c,
            Reason__c,
            Status__c,
            Subject__c,
            Description__c,
            Account_Name__c,
            Contact_Name__c
            FROM Case__b
            WHERE Account_Id__c = :accountId 
            AND Contact_Id__c = :contactId
            AND Record_Id__c = :recordId
        ];
        return caseB;
    }

    public static String generateArchivedCasesReport(){
        String query =
        '{' +
        '  "query": "SELECT count(Record_Id__c) recordCount, calendar_year(CreatedDate__c) createdYear, calendar_month(CreatedDate__c) createdMonth FROM Case__b GROUP BY calendar_year(CreatedDate__c), calendar_month(CreatedDate__c)",' +
        '  "operation": "insert",' +
        '  "targetObject": "Report_Item__c", ' +
        '  "targetFieldMap": {' +
        '    "recordCount": "Value__c",'  +
        '    "createdYear": "Year__c",' +        
        '    "createdMonth": "Month__c"' +
        '  },' +
        '  "targetValueMap": {' +
        '    "$JOB_ID": "BackgroundOperationLookup__c",' +
        '    "Yearly Total": "Category__c"' +
        '  }' + 
        '}';

        System.debug(query);
        
        HttpRequest req = new HttpRequest();
        HttpResponse res = new HttpResponse();
        Http http = new Http();
        
        System.debug('getSalesforceBaseUrl:' + URL.getSalesforceBaseUrl().toExternalForm());
        System.debug('getSessionId: ' + UserInfo.getSessionId());

        req.setEndpoint(URL.getSalesforceBaseUrl().toExternalForm() + '/services/data/v48.0/async-queries');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json; charset=utf-8');
        req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionID());
        req.setBody(query);
        
        res = http.send(req);
        String rBody = res.getBody();
        return rBody;
    }

    private static Case__b convertCaseToBigObject(Case caseS) {
        Case__b caseB = new Case__b();
        caseB.Record_Id__c = caseS.Id;
        caseB.Case_Number__c = caseS.CaseNumber;
        caseB.Account_Id__c = caseS.AccountId;
        caseB.Contact_Id__c = caseS.ContactId;
        caseB.CreatedDate__c = caseS.CreatedDate;
        caseB.LastModifiedDate__c = caseS.LastModifiedDate;
        caseB.ClosedDate__c = caseS.ClosedDate;
        caseB.Origin__c = caseS.Origin;
        caseB.Priority__c = caseS.Priority;
        caseB.Type__c = caseS.Type;
        caseB.Reason__c = caseS.Reason;
        caseB.Status__c = caseS.Status;
        caseB.Subject__c = caseS.Subject;
        caseB.Description__c = caseS.Description;
        caseB.Account_Name__c = caseS.Account.Name;
        caseB.Contact_Name__c = caseS.Contact.Name;
        return caseB;
    }
}
