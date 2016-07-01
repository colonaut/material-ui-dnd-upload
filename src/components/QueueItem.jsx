/**
 * Created by colonaut on 01.07.2016.
 */
'use strict';
import React, { PropTypes } from 'react';
import { ListItem } from 'material-ui/lib/lists';
import Divider from 'material-ui/lib/divider';
import FileTypeAvatar from './FileTypeAvatar.jsx';
import ProcessStateIcon from './ProcessStateIcon.jsx';

const QueueItem = (props) => (
    <div>
        <Divider inset={true} />
        <ListItem primaryText={props.name}
                  secondaryTextLines={1}
                  secondaryText={props.messages}
                  rightIcon={ProcessStateIcon({
                        processState: props.processState
                    })}
                  leftAvatar={FileTypeAvatar({
                        type: props.type
                    })}
                  onClick={function(e){
                        e.preventDefault();
                        e.stopPropagation();
                        alert('display all messages');
                    }}
        />
    </div>
);

QueueItem.propTypes = {
    name: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    processState: React.PropTypes.string.isRequired,
    size: React.PropTypes.number,
    messages: React.PropTypes.array
};

//TODO: introduce default here

export default QueueItem;