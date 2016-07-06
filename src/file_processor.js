/**
 * Created by colonaut on 04.07.2016.
 */
'use strict';

const uuid = (a, b) => { //TODO extract or use package
    for(b = a = ''; // b - result , a - numeric variable
        a++<36;     //
        b += a * 51&52 ?  // if "a" is not 9 or 14 or 19 or 24
                                    // return a random number or 4
            (a^15 ?                 // if "a" is not 15
                8^Math.random() *   // generate a random number from 0 to 15
                (a^20?16:4) :       // unless "a" is 20, in which case a random number from 8 to 11
                    4               // otherwise 4
            ).toString(16) :
            '-'                     // in other cases (if "a" is 9,14,19,24) insert "-"
    );
    return b
};

//should be file info?
function FileProcessor (file, handleCallback) {
    //console.log('file processing instance, file:', file, 'handleCallback', handleCallback);



    const id = uuid();

    const read = (type, callback) => {
        let reader = new FileReader();
        reader.onload = ((loaded_file) => {

            console.log('loaded!');

            return (file_progress_event) => {
                callback(null, file_progress_event.target.result);
            };
        })(file);

        switch (type) {
            case 'array_buffer':
                reader.readAsArrayBuffer(file); // � returns the file contents as an ArrayBuffer (good for binary data such as images)
            case 'url':
                reader.readAsDataURL(file); // � returns the file contents as a data URL
            default:
                reader.readAsText(file); //� returns the file contents as plain text

        }

    }


    this.id = () => {
        return id;
    }

    this.url = (callback) => {
        read('url', callback);
    };

    this.text = (callback) => {
        read('text', callback);
    };

    this.bytes = (callback) => {
        read('array_buffer',callback);
    };

};

export default FileProcessor;
