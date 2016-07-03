/**
 * Created by kalle on 04.01.2016.
 */
'use strict';
import React, {PropTypes} from 'react';
import {List} from 'material-ui/lib/lists';
import {FileFileUpload} from 'material-ui/lib/svg-icons';
import getRelevantContextStyles from './styles';

//TODO better react state and class state separation
//TODO better Message handling (1st: as component)
//TODO: refactor, incl. default props && const () => () instead of class...
//TODO: support promises (promise polyfill in webpack plugins, es6 kann promises)
//TODO: file type icons own package
//TODO: rework theming: http://www.material-ui.com/#/customization/themes
//TODO: save file name instead of file, and file somewhere else.. makes code easier and we might find a way to not have to pass the file outside...

import QueueItem from './components/QueueItem.jsx';


export default class FileStorage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            is_drag: false,
            is_idle: true,
            queue: [],
            loaded: [],
            pending: [],
            processing: [],
            completed: []
        }
    }

    //Important! this is to consume the attributes/fields that are set in a parent context. In this case muiTheme (which should be set in app/main)
    static get contextTypes() {
        return {muiTheme: React.PropTypes.object.isRequired};
    }

    static get defaultProps() {
        const defaultProps = {
            idleMessage: 'Drag & drop your file(s) here!',
            dropMessage: 'Dropped!', //TODO depr???
            maxConcurrentProcessedFiles: 3,
            maxQueuedFiles: 10, //TODO implement
            allowQueueUpdate: true,
            onFileLoaded: (err, file, content, callback) => {
                //console.log(err, file, content, callback);
                callback(null, file, '...loaded! processing 1...', (err, file, callback) => {
                    setTimeout(function () {
                        callback(null, file, '...1 done, processing 2....', (err, file, callback) => {
                            setTimeout(function () {
                                callback(null, file, '...2 done, processing 2');
                            }, 2000);
                        });
                    }, 2000);
                });
            }
        };

        return defaultProps;
    }

    componentWillMount() {
        this._reset_states();
    }


    loadFile(payload_file) {
        let reader = new FileReader();
        reader.onload = ((loaded_file) => {
            return (file_progress_event) => {
                let loaded_content = file_progress_event.target.result;

                let new_files_waiting = this.state.files_waiting.slice(); //TODO depr
                new_files_waiting.push(loaded_file.name);

                //add to loaded, then onFileLoaded callback
                this.setState({
                    file_states: Object.assign(this.state.file_states, {
                        [(() => loaded_file.name)()]: { //TODO depr
                            message: loaded_file.size + ' | bytes',
                            process_state: 'loaded'
                        }
                    }),
                    files_waiting: new_files_waiting, //TODO: depr
                    loaded: [loaded_file].concat(this.state.loaded)
                }, () => {
                    this.props.onFileLoaded.call(this,
                        null,
                        loaded_file,
                        loaded_content,
                        this.handleCallback.bind(this)
                        //this._callbackFileTask.bind(this)

                    );
                });
            };
        })(payload_file);

        console.log('determine right method for reader with transfer_file.type:', payload_file.type);
        reader.readAsText(payload_file); //� returns the file contents as plain text
        //reader.readAsArrayBuffer(file); // � returns the file contents as an ArrayBuffer (good for binary data such as images)
        //reader.readAsDataURL(file); // � returns the file contents as a data URL
    }

    queueFiles(payload_files, index) {
        //TODO: implement max queue here
        index = index || 0;
        if (index >= payload_files.length)
            return;

        let payload_file = payload_files[index];
        if (this.state.queue.find(queue_file => queue_file.name === payload_file.name))
            return this.queueFiles(payload_files, index + 1); //if file is already queued, ignore it and try next

        this.setState({
            file_states: Object.assign(this.state.file_states, {//TODO depr
                [(() => payload_file.name)()]: {
                    message: 'loading...',
                    process_state: 'loading'
                }
            }),
            queue: [payload_file].concat(this.state.queue)
        }, () => {
            this.queueFiles(payload_files, index + 1);
            this.loadFile(payload_file);
        });
    }

    handleCallback(err, file, message, next) {
        if (typeof message === 'function') {
            next = message;
            message = 'starting next...'
        }

        if (err)
            message = err.message;

        let pending = this.state.pending;
        let processing = this.state.processing;
        let completed = this.state.completed;
        let poll_handle_callback, handle_next;

        if (typeof next === 'function') {
            //add given file at the end of pending, if not exists
            if (!pending.find(f => f.name === file.name)
                && !processing.find(f => f.name === file.name))
                pending = pending.concat(file);

            //shift up to max processing from pending to processing
            while (processing.length < this.props.maxConcurrentProcessedFiles
            && pending.length) {
                processing = processing.concat(pending[0]);
                pending.splice(0, 1);
            }

            //if file is in processing, remove from processing and call the task
            if (processing.find(f => f.name === file.name))
                handle_next = true;

            //else if in pending, poll (timeout recall this callback with the task)
            else if (pending.find(f => f.name === file.name))
                poll_handle_callback = true;

        } else {
            //remove file from processing, put into completed
            processing = processing.filter(f => f.name !== file.name);
            completed = completed.concat(file);
        }

        this.setState({
            processing: processing,
            pending: pending,
            completed: completed
        }, () => {
            console.log('processing', processing.join(),
                'pending', pending.join(),
                'completed', completed.join());

            if (poll_handle_callback)
                setTimeout(this.handleCallback.bind(this, null, file, message, next), 1000);

            if (handle_next)
                next.call(this, null, file, this.handleCallback.bind(this));
        });
    }

    handleClick() {
        if (this.state.box_style_key === 'processed')
            this._reset_states();
        else
            console.log('no reset:', this.state.box_style_key)
    }

    handleDragEnter(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.state.is_idle) {
            this.setState({
                box_style_key: 'drag_enter'
            });
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        //if (this.state.is_idle){
        this.setState({
            is_drag: true,
            box_style_key: 'drag_over'
        });
        //}
    }

    handleDragExit(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.state.is_idle) {
            this.setState({
                is_drag: false,
                box_style_key: 'idle'
            });
        }
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.state.is_idle) {
            this.setState({
                is_drag: false,
                box_style_key: 'idle'
            });
        }
    }

    handleDrop(event) {
        event.stopPropagation();
        event.preventDefault();
        let payload_files = Array.from(event.dataTransfer.files);
        this.setState({
            box_style_key: 'drop',
            is_idle: false
        }, () => {
            this.queueFiles(payload_files);
        });
    }


    _reset_states() {
        this.setState({
            is_drag: false,
            is_idle: true,
            queue: [],
            loaded: [],
            pending: [],
            processing: [],
            completed: [],

            box_style_key: 'idle',
            files_processed_count: 0,
            files_processing: [],
            files_waiting: [],
            file_states: []
        });
    }

    //TODO: depr
    _callbackFileTask(error, file, message, next_task_callback) {
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
        && files_waiting.length > 0) {//pass waiting files to processing files until max sim. is reached
            files_processing.push(files_waiting[0]);
            files_waiting.splice(0, 1);
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

        } else if (next_task_callback) { //when we have another processing task
            if (files_processing.indexOf(file.name) > -1) {
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
            file_states: Object.assign(this.state.file_states, {
                [(() => file.name)()]: {
                    message: message_parts,
                    process_state: file_process_state
                }
            })
        });
    }

    render() {
        let styles = getRelevantContextStyles(this.context.muiTheme);
        //console.log('the merged style:', merged_styles);

        return (
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
                        { this.props.idleMessage }
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
                        this.state.queue.map((queued_file, i) => <QueueItem
                            key={'queue_item_' + i}
                            file={this.state.loaded.find(f => f.name === queued_file.name) || queued_file}
                            processState={this.state.completed.find(f => f.name === queued_file.name) ? 'completed'
                                : this.state.pending.find(f => f.name === queued_file.name) ? 'pending'
                                : this.state.processing.find(f => f.name === queued_file.name) ? 'processing'
                                : 'foo'}
                            messages={[].concat('get the message in here')}
                        />)
                    }
                </List>

            </div>
        );
    }
}



