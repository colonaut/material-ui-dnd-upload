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
//TODO: LET QUEUE_ITEM HANDLE THE CALLBACK CHAIN! (redux then?)

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
            onFileLoaded: (err, file, content, callback) => { //TODO this should be onFileQueued, as we might rather give out the file reader and eliminate loaded
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

        console.log('reader', reader);

        reader.onload = ((loaded_file) => {
            return (file_progress_event) => {
                let loaded_content = file_progress_event.target.result;

                //add to loaded, then onFileLoaded callback
                this.setState({
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

        console.log('determine right method for reader with transfer_file.type: CHANGE THIS! WE WANT TO GIVE OUT THE READER', payload_file.type);
        //TODO: pass the reader instead of the for result. eliminate loaded (this is business code!)
        //-> or: just give out file name and reader, pass in options for as text, as stream (which is the reader) and eliminate loaded. loading is business code!
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
            /*console.log('processing', processing.join(),
                'pending', pending.join(),
                'completed', completed.join());*/

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

            box_style_key: 'idle'
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



