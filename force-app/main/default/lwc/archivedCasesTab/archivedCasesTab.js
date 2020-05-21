import { LightningElement } from 'lwc';
import callArchiveCases from '@salesforce/apex/archiveController.archiveCases';

export default class ArchivedCasesTab extends LightningElement {
    showArchiveCases = false;
    showArchiveCasesForm = true;
    showGenerateReport = false;
    showLog = false;
    jobId;
    archiveDate = new Date().getFullYear() + '-01-01 00:00:00';
    log = '';

    openArchiveCases() {
        this.showArchiveCases = true;
        this.showArchiveCasesForm = true;
        this.showLog = false;
        this.log = '';
    }

    openGenerateReport() {
        this.showGenerateReport = true;
        this.log = '';
        this.generateReport();
    }

    closeArchiveCases() {
        this.showArchiveCases = false;
    }

    handleArchiveDate(event) {
        this.archiveDate = event.detail.value;        
    }

    refresh() {
        console.log('Refresh');

        let archivedCasesListView = this.template.querySelector('.archivedCasesListView');
        archivedCasesListView.refresh();
    }

    archiveCases() {
        this.showLog = true;
        this.showArchiveCasesForm = false;

        // If we're at the start of our log (this method might be called multiple times)
        if (!this.log) {
            this.addToLog('Archiving cases... (please wait)')
        }

        callArchiveCases({
            'archiveDate': this.archiveDate
        })
        .then(result => {
            console.log(JSON.stringify(result));
            if (result == false) {
                this.archiveCases();
                this.addToLog('Still processing...');
            } else {
                this.addToLog('Finished! You may now close this window.');
            }
            
        })
        .catch(error => {
            console.log('ERROR: ' + JSON.stringify(error));
        });
    }

    generateReport() {
        // If we're at the start of our log (this method might be called multiple times)
        if (!this.log) {
            this.addToLog('START: Executing Async SOQL')
        }
    }

    addToLog(message) {
        console.log(message);
        var today = new Date(); 
        var time = 
            (today.getHours()<10?'0':'') + today.getHours() + ':' +
            (today.getMinutes()<10?'0':'') + today.getMinutes() + ':' +
            (today.getSeconds()<10?'0':'') + today.getSeconds();

        this.log = this.log + time + ": " + message + "\n";
    }    
}