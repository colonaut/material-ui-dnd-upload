/**
 * Created by kalle on 29.06.2016.
 */
'use strict';
import React, { PropTypes } from 'react';
import * as FileTypeIcons from '../svg_icons';
import Avatar from 'material-ui/lib/avatar';

const FileTypeIconMap = {
    pdf: <FileTypeIcons.FileTypePdf/>,
    image: <FileTypeIcons.FileTypeImage />,
    text: <FileTypeIcons.FileTypeText />
};

const FileTypeAvatar = (props) => {

    let icon = <FileTypeIcons.FileTypeUnknown/>;
    let keys = Object.keys(FileTypeIconMap);

    for (let i = 0, key; key = keys[i], i < keys.length; i++){
        if (props.type.startsWith(key) || props.type.endsWith(key)) {
            icon = FileTypeIconMap[key];
            break;
        }
    }

    return <Avatar icon={icon} />;
};

FileTypeAvatar.propTypes = {
    type: PropTypes.string.isRequired
};

export default FileTypeAvatar;