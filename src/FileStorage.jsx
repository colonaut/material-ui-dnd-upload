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

import { FileFileUpload, ActionDone, ActionDoneAll, ActionHourglassEmpty, ActionHourglassFull } from 'material-ui/lib/svg-icons';
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
        if (this.state.is_idle || this.props.allowQueueUpdate) { //only do drop stuff if there is something done on drop
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
                                this._callbackFileTask.bind(this));
                        } else {
                            this.setState({file_states: Object.assign(this.state.file_states, {
                                [(() => transfer_file.name)()]: {
                                    message: transfer_file.size + ' | bytes',
                                    is_processing: false
                                }
                            })});
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
            this.setState({
                queue: new_queue
            });
        }, this.state.queue.length * 200 + 200);
    }

    _reset_states() {
        this.setState({
            is_idle: true,
            is_processing: false, //will not be needed when we start building left side
            box_style_key: 'idle',
            queue: [],
            file_states: [],
            message: this.props.idleMessage || 'Drag & drop your file(s) here!'
        });
    }


    _callbackFileTask(file, message, next_task){
        //This is the optional re-passed callback for one single file, when it is loaded.
        //It's a hook for outside to i.e. pass a message
        // Do NOT do things for the component here!
        next_task = typeof next_task === 'function' ? next_task : typeof message === 'function' ? message : undefined;

        let new_message = [file.size + ' bytes'];
        if (typeof message === 'string') {
            new_message.push(' | ' + message);
            if (next_task)
                new_message.unshift(<LinearProgress key={Math.random()}/>);
        }

        this.setState({
            file_states: Object.assign(this.state.file_states, {[(() => file.name)()]: {
                message: new_message,
                secondary_text_lines: next_task ? 2 : 1,
                right_icon: next_task ? <ActionHourglassEmpty key={Math.random()}/> : <ActionDoneAll key={Math.random()}/>
            }})
        });

        if (next_task)
            next_task(file, this._callbackFileTask.bind(this));
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

        return <Avatar key={Math.random()} icon={icon} />;
    }

    static get _styles(){
        const _inner_containers = {
            boxSizing: 'border-box',
            display: 'table',
            marginLeft: 'auto',
            marginRight: 'auto',
            minWidth: '250px',
            maxWidth: '600px',
            width: '100%',
            padding: '5px'
        };

        const drag_box = {
            idle: Object.assign({ minHeight: '200px', borderWidth: '5px', borderStyle: 'dashed', borderRadius: '3px' }, _inner_containers),
            drag_enter: Object.assign({ minHeight: '200px', borderWidth: '3px', borderStyle: 'dashed', borderRadius: '3px' }, _inner_containers),
            drag_over: Object.assign({ minHeight: '200px', borderWidth: '3px', borderStyle: 'dashed', borderRadius: '3px' }, _inner_containers),
            drop: Object.assign({ minHeight: '200px' }, _inner_containers),
            processed: Object.assign({ minHeight: '200px' }, _inner_containers)
        };
        const queue_box = {
            //idle: {display: 'none'},
            idle: Object.assign({ marginTop: '0.3em', borderWidth: '1px', borderStyle: 'solid', borderRadius: '2px' }, _inner_containers),
            drag_enter: { display: 'none'},
            drag_over: { display: 'none'},
            drop: Object.assign({ marginTop: '0.3em', borderWidth: '1px', borderStyle: 'solid', borderRadius: '2px' }, _inner_containers),
            processed: Object.assign({ marginTop: '0.3em', borderWidth: '1px', borderStyle: 'solid', borderRadius: '2px' }, _inner_containers)
        };

        return {
            canvas: { boxSizing: 'border-box', padding: '2em 1em'},
            drag_box: drag_box,
            queue_box: queue_box
        };
    }

    static _mergeRelevantContextStyles(mui_theme){
        const styles = FileStorage._styles;
        let raw_theme = mui_theme.rawTheme;
        //console.log('the raw theme:', raw_theme);

        Object.assign(styles.canvas, {
            fontFamily: raw_theme.fontFamily,
            backgroundColor: raw_theme.palette.accent2Color
        });
        Object.assign(styles.drag_box.idle, {
            color: raw_theme.palette.primary3Color, borderColor: raw_theme.palette.primary3Color
        });
        Object.assign(styles.drag_box.drag_enter, {
            color: raw_theme.palette.accent3Color, borderColor: raw_theme.palette.accent3Color
        });
        Object.assign(styles.drag_box.drag_over, {
            color: raw_theme.palette.accent3Color, borderColor: raw_theme.palette.accent3Color
        });
        Object.assign(styles.drag_box.drop, {
            color: raw_theme.palette.primary1Color, borderColor: raw_theme.palette.primary1Color
        });
        Object.assign(styles.drag_box.processed, {
            color: raw_theme.palette.primary2Color, borderColor: raw_theme.palette.primary2Color
        });

        Object.assign(styles.queue_box.idle, { //tmp for test only
            borderColor: raw_theme.palette.borderColor, backgroundColor: raw_theme.palette.canvasColor
        });
        Object.assign(styles.queue_box.drop, {
            borderColor: raw_theme.palette.borderColor, backgroundColor: raw_theme.palette.canvasColor
        });
        Object.assign(styles.queue_box.processed, {
            borderColor: raw_theme.palette.borderColor, backgroundColor: raw_theme.palette.canvasColor
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

                        <FileFileUpload style={{width:'16%', height: '16%',
                                            display: 'table', margin: '5% auto 0 auto'}}
                                        color={merged_styles.drag_box[this.state.box_style_key].color}/>

                        <p style={{textAlign: 'center', fontSize: '1.5em', fontWeight: 'bold', margin: '0'}}>
                            {this.state.message}
                        </p>

                        {/*
                        <div style={{border: '1px solid ' + temp_colors.accent1Color, margin:'5px'}}>a 1</div>
                        <div style={{border: '1px solid ' + temp_colors.accent2Color, margin:'5px'}}>a 2</div>
                        <div style={{border: '1px solid ' + temp_colors.accent3Color, margin:'5px'}}>a 3</div>

                        <div style={{border: '1px solid ' + temp_colors.primary1Color, margin:'5px'}}>p 1</div>
                        <div style={{border: '1px solid ' + temp_colors.primary2Color, margin:'5px'}}>p 2</div>
                        <div style={{border: '1px solid ' + temp_colors.primary3Color, margin:'5px'}}>p 3</div>
                         */}

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
                                                  secondaryTextLines={this.state.file_states[file.name].secondary_text_lines}
                                                  secondaryText={this.state.file_states[file.name].message}
                                                  rightIcon={this.state.file_states[file.name].right_icon}
                                                  leftAvatar={FileStorage._getIRelevantFileTypeIcon(file.type)} />
                                    </div>);
                                })
                            }
                        </List>
                    </div>

                    <div style={{clear: 'both'}}></div>


            </div>);
    }
}



