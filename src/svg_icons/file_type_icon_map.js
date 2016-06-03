/**
 * Created by cb on 1/18/2016.
 */
'use strict';
import React from 'react';
import * as Icons from './index';

const FILE_TYPE_ICON_MAP = {
    pdf: <Icons.FileTypePdf/>,
    image: <Icons.FileTypeImage />,
    text: <Icons.FileTypeText />
};
export {FILE_TYPE_ICON_MAP as default}
