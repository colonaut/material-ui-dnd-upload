/**
 * Created by kalle on 04.01.2016.
 */
'use strict';
import React from 'react';
import CircularProgress from 'material-ui/lib/circular-progress';

export default class FileUpload extends React.Component{
    constructor(props) {
        super(props);
    }

    componentWillMount(){
        this._default_droparea_styles = {
            initial: {position: 'relative', fontFamily: 'Roboto, sans-serif', width: '90%', height: '300px', border: '5px dashed #9e9e9e', borderRadius: '5px', margin: 'auto', textAlign: 'center'},
            drag_enter: {position: 'relative', fontFamily: 'Roboto, sans-serif', width: '90%', height: '300px', border: '5px dashed #0080D4', borderRadius: '5px', margin: 'auto', textAlign: 'center'},
            drag_over: {position: 'relative', fontFamily: 'Roboto, sans-serif', width: '90%', height: '300px', border: '5px dashed #0080D4', borderRadius: '5px', margin: 'auto', textAlign: 'center'},
            drop: {position: 'relative', fontFamily: 'Roboto, sans-serif', width: '90%', height: '300px', margin: 'auto', textAlign: 'center'},
            processed: {position: 'relative', fontFamily: 'Roboto, sans-serif', width: '90%', height: '300px', margin: 'auto', textAlign: 'center'}
        };

        this._processed_files_count =  0;

        this._reset();
    }


    _reset() {
        this.setState({
            is_idle: true,
            is_processing: false,
            message: 'Drag your file(s) here!',
            process_messages: [],
            style: this._default_droparea_styles.initial
        });
    }


    handleClick(){
        this._reset();
    }

    handleDragEnter(event){
        //console.log('drag enter');
        if (this.state.is_idle) {
            this.setState({
                style: this.props.dragEnterStyle || this._default_droparea_styles.drag_enter
            });
        }
    }

    handleDragOver(event){
        //console.log('drag over');
        event.preventDefault();
        event.preventDefault();
        if (this.state.is_idle){
            this.setState({
                style: this.props.dragOverStyle || this._default_droparea_styles.drag_over
            });
        }
    }

    handleDragExit(){
        console.log('drag exit');
        this._reset();
    }

    handleDrop(event){
        //console.log('drop', event);
        event.stopPropagation();
        event.preventDefault();
        if (typeof this.props.onDrop === 'function' && this.state.is_idle) { //only do drop stuff if there is something done on drop
            this.setState({
                style: this.props.dropStyle || this._default_droparea_styles.drop,
                message: null,
                is_idle: false,
                is_processing: true
            });
            this._transfer_files = event.dataTransfer.files;
            for (let i = 0, transfer_file; transfer_file = this._transfer_files[i]; i++) {
                let reader = new FileReader();
                reader.onload = ((loaded_file) => {
                    return (evt) => {
                        this.props.onDrop(
                            loaded_file,
                            evt.target.result,
                            this._callbackFileLoaded.bind(this),
                            this._callbackFileProcessed.bind(this));

                    };
                })(transfer_file);
                console.log('determine right method for reader with transfer_file.type:', transfer_file.type);
                reader.readAsText(transfer_file); //– returns the file contents as plain text
                //reader.readAsArrayBuffer(file); // – returns the file contents as an ArrayBuffer (good for binary data such as images)
                //reader.readAsDataURL(file); // – returns the file contents as a data URL
            }
        } else if (this.state.is_idle) {
            this._reset();
        }
    }



    _callbackFileLoaded(message){
        //when a message is passed, we update the messages state
        if (message) {
            let process_messages = this.state.process_messages || [];
            process_messages.unshift(message);
            this.setState({
                process_messages: process_messages
            });
        }
    }

    _callbackFileProcessed(message){
        this._processed_files_count++;

        //when a message is passed, we update the messages state
        if (message) {
            let process_messages = this.state.process_messages || [];
            process_messages.unshift(message);
            this.setState({
                process_messages: process_messages
            });
        }

        //when all fies are done, we apply the done states
        if (this._processed_files_count === this._transfer_files.length){
            this._processed_files_count = 0;
            this.setState({
                is_processing: false,
                message: this.props.processedMessage || 'Done!',
                style: this.props.processedStyle || this._default_droparea_styles.processed
            });
        }
    }


    render() {
        return(
            <div onClick={this.handleClick.bind(this)}
                 onDragEnter={this.handleDragEnter.bind(this)}
                 onDragOver={this.handleDragOver.bind(this)}
                 onDragExit={this.handleDragExit.bind(this)}
                 onDrop={this.handleDrop.bind(this)}
                 style={this.state.style}>

                <div style={{display: this.state.message ? 'block' : 'none',
                    position: 'relative', height: '50%'}}>
                    <p style={{position: 'absolute', bottom: '0px', width: '100%', margin: '0.2em'}}>{this.state.message}</p>
                </div>

                <div style={{display: this.state.is_processing ? 'block' : 'none'}}>
                    <CircularProgress mode="indeterminate" />
                </div>

                <div style={{display: this.state.process_messages.length ? 'block' : 'none',
                    overflow: 'auto',
                    height: '50%',
                    width: '100%',
                    position: 'absolute',
                    bottom: '3px',
                    margin: '0 0.5em',
                    padding: '0.5em',
                    textAlign: 'left',
                    backgroundColor: '#f8f8f8',
                    transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
                    boxSizing: 'border-box',
                    fontFamily: 'Roboto, sans-serif',
                    boxShadow: '0 1px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.24)',
                    borderRadius: '2px'}}>
                    <pre>{this.state.process_messages.join('\n')}</pre>
                </div>

            </div>);
    }
}



