import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import callArchiveCase from '@salesforce/apex/archiveController.archiveCase';

export default class ArchiveCase extends NavigationMixin(LightningElement) {
    @api recordId;
    showArchive = true;
    showSuccess = false;

    @wire(getRecord, { recordId: '$recordId', fields: ['Case.AccountId', 'Case.ContactId'] })
    record;

    archiveClick(event) {
        console.log('archiveClick click:' + this.recordId);

        callArchiveCase({
            'recordId': this.recordId
        })
        .then(result => {
            this.showArchive = false;
            this.showSuccess = true;
            console.log(JSON.stringify(result));
        })
        .catch(error => {
            console.log('ERROR: ' + JSON.stringify(error));
        });        
    }

    navigateToAccount(event) {
        console.log(JSON.stringify(this.record));
        console.log('navigateToAccount: ' + this.record.data.fields.AccountId.value)

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.record.data.fields.AccountId.value,
                actionName: 'view'
            }
        });
    }

    navigateToContact(event) {
        console.log(JSON.stringify(this.record));
        console.log('navigateToContact: ' + this.record.data.fields.ContactId.value)

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.record.data.fields.ContactId.value,
                actionName: 'view'
            }
        });
    }
}