/**
 * Created by colonaut on 04.07.2016.
 */
'use strict';


function FileProcessor (file, handleCallback) {
    //console.log('file processing instance, file:', file, 'handleCallback', handleCallback);

    const readAs = (type, callback) => {
        let reader = new FileReader();
        reader.onload = ((loaded_file) => {

            console.log('loaded!');

            return (file_progress_event) => {
                callback(null, file_progress_event.target.result)
            };
        })(file);

        //reader.readAsText(file); //� returns the file contents as plain text
        //reader.readAsArrayBuffer(file); // � returns the file contents as an ArrayBuffer (good for binary data such as images)
        //reader.readAsDataURL(file); // � returns the file contents as a data URL
    }

    this.upload = (url, callback) => {

    };

    this.text = (callback) => {
        readAs('foo', () => {
            console.log('HURRA');
        });
    };

    this.bytes = (callback) => {

    };

};

export default FileProcessor;
