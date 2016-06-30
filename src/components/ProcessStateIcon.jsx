/**
 * Created by kalle on 29.06.2016.
 */
'use strict';
import React, { PropTypes } from 'react';
import { FileFileUpload, ActionDone, ActionDoneAll, ActionHourglassEmpty, ActionHourglassFull, AlertErrorOutline, AlertError } from 'material-ui/lib/svg-icons';
import CircularProgress from 'material-ui/lib/circular-progress';


const ProcessStateIcon = (props) => {
    switch(props.processState){
        case 'pending':
            return <ActionHourglassEmpty />;
        case 'error':
            return <AlertError color="#DD2C00" />;
        case 'processing':
            return <CircularProgress mode="indeterminate" size={0.5}
                                     style={{margin: 'auto 25px auto auto', top: '10px'}}/>;
        case 'completed':
            return <ActionDoneAll color="#4caf50"/>;
        default:
            return <ActionDone color="#4caf50"/>;
    }
};

ProcessStateIcon.propTypes = {
    processState: React.PropTypes.oneOf([
        'pending', 'error', 'processing', 'completed', 'loaded'
    ]).isRequired
}

export default ProcessStateIcon;