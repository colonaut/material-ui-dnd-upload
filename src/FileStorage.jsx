/**
 * Created by kalle on 04.01.2016.
 */
'use strict';
import React, { PropTypes } from 'react';
import { List, ListItem } from 'material-ui/lib/lists';
import Divider from 'material-ui/lib/divider';

import getRelevantContextStyles from './styles';

//TODO: refactor, incl. default props && const () => () instead of class...
//TODO: support promises (promise polyfill in webpack plugins, es6 kann promises)
//TODO: file type icons own package
//TODO: rework theming: http://www.material-ui.com/#/customization/themes

import FileTypeAvatar from './components/FileTypeAvatar.jsx';
import ProcessStateIcon from './components/ProcessStateIcon.jsx';

export default class FileStorage extends React.Component{
    constructor(props) {
        super(props);
    }

    //Important! this is to consume the attributes/fields that are set in a parent context. In this case muiTheme (which should be set in app/main)
    static get contextTypes() {
        return { muiTheme: React.PropTypes.object.isRequired };
    }

    componentWillMount(){
        this._reset_states();
    }


    handleClick(){
        if (this.state.box_style_key === 'processed')
            this._reset_states();
        else
            console.log('no reset:', this.state.box_style_key)
    }

    handleDragEnter(event){
        event.preventDefault();
        event.stopPropagation();
        if (this.state.is_idle) {
            this.setState({
                box_style_key: 'drag_enter'
            });
        }
    }

    handleDragOver(event){
        event.preventDefault();
        event.stopPropagation();
        //if (this.state.is_idle){
            this.setState({
                box_style_key: 'drag_over'
            });
        //}
    }

    handleDragExit(event){
        event.preventDefault();
        event.stopPropagation();
        if (this.state.is_idle) {
            this.setState({
                box_style_key: 'idle'
            });
        }
    }
    handleDragLeave(event){
        event.preventDefault();
        event.stopPropagation();
        if (this.state.is_idle) {
            this.setState({
                box_style_key: 'idle'
            });
        }
    }

    handleDrop(event){
        event.stopPropagation();
        event.preventDefault();

        this.setState({
            box_style_key: 'drop',
            //message: this.props.dropMessage || 'Drag & Drop files here to add to queue',
            is_idle: false
        });

        this._transfer_files = event.dataTransfer.files;
        for (let i = 0, transfer_file; transfer_file = this._transfer_files[i]; i++) {

            if (this.state.queue.find(f => f.name === transfer_file.name)) //if file is already queued, ignore it
                continue;

            let reader = new FileReader();
            reader.onload = ((loaded_file) => {

                return (evt) => {
                    let new_queue = this.state.queue;
                    new_queue.unshift(transfer_file);
                    let new_files_waiting = this.state.files_waiting;
                    new_files_waiting.push(transfer_file.name);

                    this.setState({
                        file_states: Object.assign(this.state.file_states, {
                            [(() => transfer_file.name)()]: {
                                message: transfer_file.size + ' | bytes',
                                process_state: 'loaded'
                            }}),
                        queue: new_queue,
                        files_waiting: new_files_waiting
                    }, () => {
                        if (typeof this.props.onFileLoaded === 'function'){
                            this.props.onFileLoaded.call(this,
                                loaded_file,
                                evt.target.result,
                                this._callbackFileTask.bind(this));
                        }
                    });

                };
            })(transfer_file);

            console.log('determine right method for reader with transfer_file.type:', transfer_file.type);
            reader.readAsText(transfer_file); //� returns the file contents as plain text
            //reader.readAsArrayBuffer(file); // � returns the file contents as an ArrayBuffer (good for binary data such as images)
            //reader.readAsDataURL(file); // � returns the file contents as a data URL
        }

    }


    _reset_states() {
        this.setState({
            is_idle: true,
            box_style_key: 'idle',
            files_processed_count: 0,
            queue: [],
            files_processing: [],
            files_waiting: [],
            file_states: [],
            message: this.props.idleMessage || 'Drag & drop your file(s) here!'
        });
    }


    _callbackFileTask(error, file, message, next_task_callback){
        next_task_callback = typeof next_task_callback === 'function' ?
            next_task_callback : typeof message === 'function' ?
            message : null;
        let message_parts = [<span key={Math.random()} style={{
                    marginRight: '1em'
                }}>{file.size} bytes</span>],
            files_processed_count = this.state.files_processed_count,
            files_processing = this.state.files_processing,
            files_waiting = this.state.files_waiting,
            box_style_key = 'drop',
            file_process_state = 'completed';

        while (files_processing.length < (this.props.maxConcurrentProcessedFiles || 5)
                && files_waiting.length > 0){//pass waiting files to processing files until max sim. is reached
            files_processing.push(files_waiting[0]);
            files_waiting.splice(0,1);
        }

        if (typeof message === 'string') { //apply message of current task callback
            message_parts.push(<span title={message} key={Math.random()} style={{
                    color: this.context.muiTheme.rawTheme.palette.primary1Color
                }}>{message}</span>);
        }

        if (error) { //when we get an error object
            files_processed_count++;
            files_processing.splice(files_processing.indexOf(file.name), 1);
            message_parts.push(<span title={error.message} key={Math.random()} style={{
                    color: '#DD2C00'
                }}>{error.message}</span>);
            file_process_state = 'error';

        } else if (next_task_callback){ //when we have another processing task
            if (files_processing.indexOf(file.name) > -1){
                file_process_state = 'processing';
                next_task_callback.call(this, file, this._callbackFileTask.bind(this));
            } else {
                file_process_state = 'pending';
                console.log(file.name, 'is pending');
                setTimeout(() => {
                    console.log(file.name, 'is processing');
                    this._callbackFileTask(null, file, message, next_task_callback);
                }, 1000);
            }
        } else { //process chain ends
            files_processed_count++;
            files_processing.splice(files_processing.indexOf(file.name), 1);
        }

        if (this.state.queue.length === files_processed_count)
            box_style_key = 'processed';

        this.setState({
            box_style_key: box_style_key,
            files_processed_count: files_processed_count,
            files_processing: files_processing,
            files_waiting: files_waiting,
            file_states: Object.assign(this.state.file_states, {[(() => file.name)()]: {
                message: message_parts,
                process_state: file_process_state
            }})
        });
    }

    render() {
        let styles = getRelevantContextStyles(this.context.muiTheme);
        //console.log('the merged style:', merged_styles);

        return(
            <div onClick={this.handleClick.bind(this)}
                 style={styles.canvas}>

                <div onDragEnter={this.handleDragEnter.bind(this)}
                     onDragOver={this.handleDragOver.bind(this)}
                     onDragLeave={this.handleDragLeave.bind(this)}
                     onDragExit={this.handleDragExit.bind(this)}
                     onDrop={this.handleDrop.bind(this)}
                     style={styles.drag_box[this.state.box_style_key]}>
                    <FileFileUpload style={{display: 'table',
                                            width:'16%', height: '16%',
                                            margin: '5% auto 0 auto'}}
                                    color={styles.drag_box[this.state.box_style_key].color}/>

                    <p style={{textAlign: 'center', fontSize: '1.5em', fontWeight: 'bold', margin: '0'}}>
                        {this.state.message}
                    </p>

                    bsk: {this.state.box_style_key}

                    {/*
                        <div style={{border: '1px solid ' + temp_colors.accent1Color, margin:'5px'}}>a 1</div>
                        <div style={{border: '1px solid ' + temp_colors.accent2Color, margin:'5px'}}>a 2</div>
                        <div style={{border: '1px solid ' + temp_colors.accent3Color, margin:'5px'}}>a 3</div>

                        <div style={{border: '1px solid ' + temp_colors.primary1Color, margin:'5px'}}>p 1</div>
                        <div style={{border: '1px solid ' + temp_colors.primary2Color, margin:'5px'}}>p 2</div>
                        <div style={{border: '1px solid ' + temp_colors.primary3Color, margin:'5px'}}>p 3</div>
                    */}
                </div>

                <List style={styles.queue_box[this.state.box_style_key]}
                      subheader="Queued files">
                    {
                        this.state.queue.map((file, i) => {
                            return(<div key={'queue_list_item_' + i}>
                                <Divider inset={true} />
                                <ListItem primaryText={file.name}
                                          secondaryTextLines={1}
                                          secondaryText={this.state.file_states[file.name].message}
                                          rightIcon={ProcessStateIcon({
                                                processState: this.state.file_states[file.name].process_state
                                            })}
                                          leftAvatar={FileTypeAvatar({
                                                fileType: file.type
                                            })}
                                />
                            </div>);
                        })
                    }
                </List>

            </div>
        );
    }
}



