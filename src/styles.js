'use strict';

const _BOX = {
    boxSizing: 'border-box',
    marginLeft: 'auto',
    marginRight: 'auto',
    minWidth: '250px',
    maxWidth: '600px',
    width: '100%'
};

const _DRAG_BOX = {
    idle: Object.assign({ minHeight: '200px', borderWidth: '5px', borderStyle: 'dashed', borderRadius: '3px' }, _BOX),
    drag_enter: Object.assign({ minHeight: '200px', borderWidth: '5px', borderStyle: 'dashed', borderRadius: '3px' }, _BOX),
    drag_over: Object.assign({ minHeight: '200px', borderWidth: '5px', borderStyle: 'dashed', borderRadius: '3px' }, _BOX),
    drop: Object.assign({ minHeight: '200px', borderWidth: '5px', borderStyle: 'dashed', borderRadius: '3px' }, _BOX),
    processed: Object.assign({ minHeight: '200px', borderWidth: '5px', borderStyle: 'dashed', borderRadius: '3px' }, _BOX)
};
const _QUEUE_BOX = {
    idle: {display: 'none'},
    //idle: Object.assign({ marginTop: '0.3em', borderWidth: '1px', borderStyle: 'solid', borderRadius: '2px' }, _inner_containers),
    drag_enter: { display: 'none'},
    drag_over: { display: 'none'},
    drop: Object.assign({ marginTop: '0.3em', borderWidth: '1px', borderStyle: 'solid', borderRadius: '2px' }, _BOX),
    processed: Object.assign({ marginTop: '0.3em', borderWidth: '1px', borderStyle: 'solid', borderRadius: '2px' }, _BOX)
};

const STYLES = {
    canvas: { boxSizing: 'border-box', padding: '2em 1em'},
    drag_box: _DRAG_BOX,
    queue_box: _QUEUE_BOX
};

export default function getRelevantContextStyles(mui_theme){
    let raw_theme = mui_theme.rawTheme;
    //console.log('the raw theme:', raw_theme);

    Object.assign(STYLES.canvas, {
        fontFamily: raw_theme.fontFamily,
        backgroundColor: raw_theme.palette.accent2Color
    });
    Object.assign(STYLES.drag_box.idle, {
        color: raw_theme.palette.primary3Color, borderColor: raw_theme.palette.primary3Color
    });
    Object.assign(STYLES.drag_box.drag_enter, {
        color: raw_theme.palette.accent3Color, borderColor: raw_theme.palette.accent3Color
    });
    Object.assign(STYLES.drag_box.drag_over, {
        color: raw_theme.palette.accent3Color, borderColor: raw_theme.palette.accent3Color
    });
    Object.assign(STYLES.drag_box.drop, {
        color: raw_theme.palette.primary1Color, borderColor: raw_theme.palette.primary1Color
    });
    Object.assign(STYLES.drag_box.processed, {
        color: raw_theme.palette.primary2Color, borderColor: raw_theme.palette.primary2Color
    });

    Object.assign(STYLES.queue_box.idle, { //tmp for test only
        borderColor: raw_theme.palette.borderColor, backgroundColor: raw_theme.palette.canvasColor
    });
    Object.assign(STYLES.queue_box.drop, {
        borderColor: raw_theme.palette.borderColor, backgroundColor: raw_theme.palette.canvasColor
    });
    Object.assign(STYLES.queue_box.processed, {
        borderColor: raw_theme.palette.borderColor, backgroundColor: raw_theme.palette.canvasColor
    });

    return STYLES;
}


