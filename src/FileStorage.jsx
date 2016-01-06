/**
 * Created by kalle on 04.01.2016.
 */
'use strict';
import React from 'react';
import DefaultRawTheme from 'material-ui/lib/styles/raw-themes/light-raw-theme';
import ThemeManager from 'material-ui/lib/styles/theme-manager';

import Avatar from 'material-ui/lib/avatar';
import CircularProgress from 'material-ui/lib/circular-progress';
import LinearProgress from 'material-ui/lib/linear-progress';
import { List, ListItem } from 'material-ui/lib/lists';
import Divider from 'material-ui/lib/divider';

import { FileFileUpload } from 'material-ui/lib/svg-icons';
import { FileTypeUnknown, FileTypePdf, FileTypeText, FileTypeImage } from './svg_icons';


export default class FileStorage extends React.Component{
    constructor(props) {
        super(props);
    }

    //Important! this is to consume the attributes/fields that are set in a parent context. In this case muiTheme (which should be set in app/main)
    static get contextTypes() {
        return { muiTheme: React.PropTypes.object };
    }
/*
    // ?needed? we have no children - Important! provide uiTheme context for children (static...) http://material-ui.com/#/customization/themes
    static get childContextTypes() {
        return { muiTheme: React.PropTypes.object };
    }
    // ?needed? we have no children - Important! http://material-ui.com/#/customization/themes
    getChildContext() {
        return { muiTheme: this.state.muiTheme };
    }
*/
    //update theme inside state whenever a new theme is passed down from the parent / owner using context
    componentWillReceiveProps(next_props, next_context) {
        this.setState({
            muiTheme: next_context.muiTheme ? next_context.muiTheme : this.state.muiTheme
        });
    }

    componentWillMount(){
        //set theme inside state, either context from parent or imported default theme
        this.setState({
            muiTheme: this.context.muiTheme ? this.context.muiTheme : ThemeManager.getMuiTheme(DefaultRawTheme)
        });

        this._reset_states();
    }


    handleClick(){
        this._reset_states();
    }

    handleDragEnter(event){
        //console.log('drag enter');
        event.preventDefault();
        event.preventDefault();
        if (this.state.is_idle) {
            this.setState({
                box_style_key: 'drag_enter'
            });
        }
    }

    handleDragOver(event){
        //console.log('drag over');
        event.preventDefault();
        event.preventDefault();
        if (this.state.is_idle){
            this.setState({
                box_style_key: 'drag_over'
            });
        }
    }

    handleDragExit(event){
        //console.log('drag exit');
        event.preventDefault();
        event.preventDefault();
        this._reset_states();
    }

    handleDrop(event){
        //console.log('drop', event);
        event.stopPropagation();
        event.preventDefault();
        if (this.state.is_idle) { //only do drop stuff if there is something done on drop
            let has_processing_callback = typeof this.props.onLoaded === 'function';
            this.setState({
                box_style_key: 'drop',
                message: null,
                is_idle: false,
                is_processing: has_processing_callback
            });

            this._transfer_files = event.dataTransfer.files;
            for (let i = 0, transfer_file; transfer_file = this._transfer_files[i]; i++) {
                let reader = new FileReader();
                reader.onload = ((loaded_file) => {
                    return (evt) => {
                        this._update_queue(transfer_file);
                        if (has_processing_callback){
                            this.props.onLoaded(
                                loaded_file,
                                evt.target.result,
                                this._callbackFileLoaded.bind(this),
                                this._callbackFileProcessed.bind(this));
                        }
                    };
                })(transfer_file);

                console.log('determine right method for reader with transfer_file.type:', transfer_file.type);
                reader.readAsText(transfer_file); //– returns the file contents as plain text
                //reader.readAsArrayBuffer(file); // – returns the file contents as an ArrayBuffer (good for binary data such as images)
                //reader.readAsDataURL(file); // – returns the file contents as a data URL
            }
        } else if (this.state.is_idle) {
            this._reset_states();
        }
    }

    _update_queue(transfer_file){
        setTimeout(() => {
            let new_queue = this.state.queue;
            new_queue.unshift(transfer_file);
            this.setState({queue: new_queue});
        }, this.state.queue.length * 200 + 200);

    }

    _reset_states() {
        this.setState({
            is_idle: true,
            is_processing: false,
            box_style_key: 'idle',
            queue_item_style_key: 'loaded',
            queue: [],
            file_messages: [],
            message: this.props.idleMessage || 'Drag & drop your file(s) here!',
            process_messages: []
        });
        this._processed_files_count =  0;
    }


    _callbackFileLoaded(file, message){

        console.log(message);

        //This is the optional repassed callback for one single file, when it is loaded.
        //It's a hook for outside to i.e. pass a message
        // Do NOT do things for the component here!
        if (message) {
            let process_messages = this.state.process_messages || [];
            process_messages.unshift(message);
            this.setState({
                process_messages: process_messages,
                file_messages: Object.assign(this.state.file_messages, {[(() => file.name)()]: message })
            });
        }
    }

    _callbackFileProcessed(message){
        //This is the optional repassed callback for one single file, when it i.e. has been processed from outside.
        //One can use that multiple times, i.e. to change the message for the individual file
        // Do NOT do things for the component here!
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
                message: this.props.processedMessage || 'Processig Done!',
                box_style_key: 'processed'
            });
        }
    }

    static get _icons(){
        return {
            pdf: <FileTypePdf/>,
            image: <FileTypeImage />,
            text: <FileTypeText color="#FF0" />

        }
    }

    static _getIRelevantFileTypeIcon(file_type){
        let icon = <FileTypeUnknown/>;
        let keys = Object.keys(FileStorage._icons);

        for (let i = 0, key; key = keys[i], i < keys.length; i++){
            if (file_type.startsWith(key) || file_type.endsWith(key)) {
                icon = FileStorage._icons[key];
                break;
            }
        }

        return <Avatar icon={icon} />;
    }

    static get _styles(){
        const _float_boxes = {
            boxSizing: 'border-box',
            float: 'left',
            padding: '5px'
        };

        const drag_box = {
            idle: Object.assign({ width: '100%', minWidth: '300px', minHeight: '200px', borderWidth: '5px', borderStyle: 'dashed', borderRadius: '10px' }, _float_boxes),
            drag_enter: Object.assign({ width: '100%', minWidth: '300px', minHeight: '200px', borderWidth: '5px', borderStyle: 'dashed', borderRadius: '5px' }, _float_boxes),
            drag_over: Object.assign({ width: '100%', minWidth: '300px', minHeight: '200px', borderWidth: '5px', borderStyle: 'dashed', borderRadius: '5px' }, _float_boxes),
            drop: Object.assign({ width: '50%', minWidth: '250px', minHeight: '200px' }, _float_boxes),
            processed: Object.assign({ width: '50%', minWidth: '250px', minHeight: '200px' }, _float_boxes)
        };
        const queue_box = {
            idle: Object.assign({display: 'none'}, _float_boxes),
            drag_enter: Object.assign({display: 'none'}, _float_boxes),
            drag_over: Object.assign({display: 'none'}, _float_boxes),
            drop: Object.assign({ width: '50%', minWidth: '150px', minHeight: '200px', borderWidth: '1px', borderStyle: 'solid', borderRadius: '2px' }, _float_boxes),
            processed: Object.assign({ width: '50%', minWidth: '150px', minHeight: '200px', borderWidth: '1px', borderStyle: 'solid', borderRadius: '2px' }, _float_boxes)
        };

        return {
            canvas: { boxSizing: 'border-box' },
            drag_box: drag_box,
            queue_box: queue_box
        };
    }

    static _mergeRelevantContextStyles(mui_theme){
        const styles = FileStorage._styles;
        let raw_theme = mui_theme.rawTheme;

        //console.log('the raw theme:', raw_theme);
        //TODO: apply colors from theme

        Object.assign(styles.canvas, {
            fontFamily: raw_theme.fontFamily,
            backgroundColor: raw_theme.canvasColor
        });
        Object.assign(styles.drag_box.idle, {
           borderColor: raw_theme.palette.borderColor
        });
        Object.assign(styles.queue_box.drop, {
            borderColor: raw_theme.palette.borderColor
        });
        Object.assign(styles.queue_box.processed, {
            borderColor: raw_theme.palette.borderColor
        });

        return styles;
    }


    render() {
        let merged_styles = this.constructor._mergeRelevantContextStyles(this.state.muiTheme);
        //console.log('the merged style:', merged_styles);

        return(
            <div onClick={this.handleClick.bind(this)}
                 onDragEnter={this.handleDragEnter.bind(this)}
                 onDragOver={this.handleDragOver.bind(this)}
                 onDragExit={this.handleDragExit.bind(this)}
                 onDrop={this.handleDrop.bind(this)}
                 style={merged_styles.canvas}>

                <div style={merged_styles.drag_box[this.state.box_style_key]}>

                    <div style={{display: this.state.message ? 'block' : 'none'
                        }}>
                        <p style={{}}>{this.state.message}</p>
                    </div>

                    <div style={{display: this.state.is_processing ? 'block' : 'none'
                    }}>
                        <CircularProgress mode="indeterminate" />
                    </div>

                </div>


                <div style={merged_styles.queue_box[this.state.box_style_key]}>

                    <List subheader="Queued files">
                        {
                            this.state.queue.map((file, i) => {
                                return(<div key={'queue_list_item_' + i}>
                                    <Divider inset={true} />
                                    <ListItem primaryText={file.name}
                                            secondaryTextLines={2}
                                            secondaryText={[
                                                <LinearProgress key={'queue_list_item_progress_' + i} />,
                                                file.size + ' bytes | ' + file.type,
                                                ' -> ' + this.state.file_messages[file.name]
                                            ]} leftAvatar={FileStorage._getIRelevantFileTypeIcon(file.type)}>
                                    </ListItem>
                                </div>);
                            })
                        }
                    </List>

                    <div style={{display: this.state.process_messages.length ? 'block' : 'none',
                        border: '1px solid #f00',
                        overflow: 'auto',
                        fontFamily: 'Roboto, sans-serif'
                        }}>
                        <pre>{this.state.process_messages.join('\n')}</pre>
                    </div>

                </div>

                <div style={{clear: 'both'}}></div>

            </div>);
    }
}



