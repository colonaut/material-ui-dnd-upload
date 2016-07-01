/**
 * Created by colonaut on 01.07.2016.
 */
'use strict';
import React, { PropTypes } from 'react';
import { ListItem } from 'material-ui/lib/lists';
import Divider from 'material-ui/lib/divider';

const QueueItem = (props) => (
    <div>
        <Divider inset={true} />
        <ListItem primaryText={props.name}
                  secondaryTextLines={1}
                  secondaryText={props.messages}
                  rightIcon={props.processStateIcon}
                  leftAvatar={props.fileTypeAvatar}
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
    size: React.PropTypes.number,
    messages: React.PropTypes.array,
    processStateIcon: React.PropTypes.element,
    fileTypeAvatar: React.PropTypes.element,
};

//TODO: introduce default here

export default QueueItem;