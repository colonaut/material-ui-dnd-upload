/**
 * Created by colonaut on 01.07.2016.
 */
'use strict';
import React, { PropTypes } from 'react';
import { ListItem } from 'material-ui/lib/lists';
import Divider from 'material-ui/lib/divider';
import FileTypeAvatar from './FileTypeAvatar.jsx';
import ProcessStateIcon from './ProcessStateIcon.jsx';

const QueueItem = (props) => {

    //props.onFileQueued(null, props.file, props.handleCallback);

    console.log('queue item:', null, props.file, props.handleCallback);

    props.onFileQueued(null, props.file, props.handleCallback);

    return (
        <div>
            <Divider inset={true}/>
            <ListItem primaryText={props.file.name}
                      secondaryTextLines={1}
                      secondaryText={props.messages + ' DEBUG' + props.processState}
                      rightIcon={ProcessStateIcon({
                        processState: props.processState //check the props to get the right key
                    })}
                      leftAvatar={FileTypeAvatar({
                        type: props.file.type
                    })}
                      onClick={function(e){
                        e.preventDefault();
                        e.stopPropagation();
                        alert('display all messages');
                    }}
            />
        </div>
    )
};

QueueItem.propTypes = {
    file: React.PropTypes.object.isRequired, //TODO: describe object, must be file
    onFileQueued: React.PropTypes.func.isRequired,
    handleCallback: React.PropTypes.func.isRequired,

    processState: React.PropTypes.string.isRequired,
    messages: React.PropTypes.array
};

//TODO: introduce default here

export default QueueItem;