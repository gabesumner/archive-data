import { LightningElement, api, wire } from 'lwc';
import callArchiveCase from '@salesforce/apex/archiveController.archiveCase';

export default class ArchiveCase extends LightningElement {
    @api recordId;

    buttonClick(event) {
        console.log('button click:' + this.recordId);

        callArchiveCase({
            'recordId': this.recordId
        })
        .then(result => {
            console.log(JSON.stringify(result));
        })
        .catch(error => {
            console.log('ERROR: ' + JSON.stringify(error));
        });        
    }
}