// It is not possible to use Async SOQL from a Lightning Component because the Rest API is unavailable for 
// sfdx force:apex:execute -f ./scripts/asyncSOQL.apex
System.debug(archiveController.generateArchivedCasesReport());