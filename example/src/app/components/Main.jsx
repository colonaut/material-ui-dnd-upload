import React from 'react';
//import Colors from 'material-ui/lib/styles/colors';
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import DarkRawTheme from 'material-ui/lib/styles/raw-themes/dark-raw-theme';

import RaisedButton from 'material-ui/lib/raised-button';
import FileStorage from '../../../../src/FileStorage.jsx';

//

export default class Main extends React.Component {
    // Important! provide uiTheme context for children (static...) http://material-ui.com/#/customization/themes
    static get childContextTypes() {
        return {
            muiTheme: React.PropTypes.object
        };
    }

    // Important! http://material-ui.com/#/customization/themes
    getChildContext() {
        return {
            muiTheme: ThemeManager.getMuiTheme()
        };
    }

    handleFileLoaded(file, file_content, callback_file_loaded, callback_file_processed) {
        //console.log(file, file_content, callback_file_loaded, callback_file_processed);

        callback_file_loaded(file, 'loaded, start processing');

        this._fileUploadTimer = this._fileUploadTimer || 0;
        this._fileUploadTimer = this._fileUploadTimer + 1000;

        setTimeout(() => {
            //callback_file_processed('setTimeout upload simulation done for ' + file.name);
        }, this._fileUploadTimer);

    }


    /* <FileUpload
     onDrop={this.handleFileUploadDrop.bind(this)}
     dropMessage="Dropped!"/>*/

    render() {
        return (<div>
            <FileStorage
                onLoaded={this.handleFileLoaded.bind(this)}
                idleMessage="Your files go here, dude!"
                dropMessage="Dropped!"/>

        </div>);
    }
}


