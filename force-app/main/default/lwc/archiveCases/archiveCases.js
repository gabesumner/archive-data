import { LightningElement } from 'lwc';
import callArchiveCases from '@salesforce/apex/archiveController.archiveCases';

export default class ArchiveCases extends LightningElement {
    archiveDate = '2019-01-01';

    handleArchiveDate(event) {
        this.archiveDate = event.detail.value;        
    }

    archiveCases() {
        console.log('archiveCases:' + this.archiveDate);

        callArchiveCases({
            'archiveDate': this.archiveDate
        })
        .then(result => {
            console.log(JSON.stringify(result));
            if (result == false) {
                this.archiveCases();
            }
        })
        .catch(error => {
            console.log('ERROR: ' + JSON.stringify(error));
        });  
    }
}