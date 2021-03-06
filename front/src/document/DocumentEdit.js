import React , { useEffect , useState , useCallback } from 'react';

import { useParams } from "react-router";

import Quill from 'quill';
import 'quill/dist/quill.bubble.css';
import Sharedb from 'sharedb/lib/client';
import richText from 'rich-text';
import http from "../http/http";

import {initDocumentChange , changed , afterSave} from "../redux/slice/documentChangeSlice";
import {useDispatch, useSelector} from "react-redux";
import readyForVoteSubscribedFilter from "../redux/filter/readyForVoteSubscribedFilter";
import history from "../utils/history";

Sharedb.types.register(richText.type);



// Connecting to our socket server

// Querying for our document


const DocumentEdit = () => {

    const socket = new WebSocket('ws://127.0.0.1:8080');
    const connection = new Sharedb.Connection(socket);
    const { id } = useParams();
    const [ editor, setEditor] = useState( null );
    const [ focusChanged , setFocusChanged ] = useState( false );
    const options = {
        theme: 'snow',
    };
    let previousFocus = false;

    const dispatch = useDispatch();

    const user = useSelector(state => state.login.user );

    const rfv = useSelector( readyForVoteSubscribedFilter(id));

    const mouseMouve = useCallback(( evt ) => {
        const focus  = editor.hasFocus();
        if( focus === previousFocus ) {
            setFocusChanged(false );
        } else {
            setFocusChanged( true  );
        }
        previousFocus = focus;
    }, [editor , previousFocus]);

    const forSave = useSelector(state => {
        let elem = state.documentChange.find(elem => elem.id === id );
        if( elem ) {
            return elem.forSave;
        } else {
            return false;
        }
    })

    useEffect(() => {
        if( rfv.isReadyForVote ) {
            history.push('/document/' + id );
        }
    }, [id , rfv ]);

    useEffect(() => {
        if( forSave && connection ) {
            socket.onopen = () => {
                connection.send({a: 'hs', id: 'save-' + id + '---' + user });
                dispatch(afterSave({id}));
            }
        }
    }, [forSave , connection , id , socket])

    useEffect(() => {
        //console.log( connection );
        if( focusChanged && connection ) {
            socket.onopen = () => {
                connection.send({a: 'hs', id: 'save-' + id + '---' + user });
                dispatch(afterSave({id}));
            }
        }
    }, [focusChanged , connection, id , socket ])


    useEffect(() => {
        if(editor) {
            window.addEventListener('mousemove', mouseMouve)
        }
        return () => {
            window.removeEventListener('mousemove', mouseMouve );
        }
    }, [ editor ]);


    useEffect(() => {

        socket.onopen = () => {

            connection.send({a: 'hs', id: id });

            const doc = connection.get('documents', id );

            dispatch( initDocumentChange({id}));

            doc.subscribe( (err) => {
                if (err) throw err;

                if( ! quill ) {
                    quill = new Quill('#editor', options);
                    setEditor(quill);
                }
                /**
                 * On Initialising if data is present in server
                 * Updaing its content to editor
                 */
                if( doc.data ) {
                    quill.setContents(doc.data.ops);
                }
                doc.on('create', function( delta) {
                    quill.setContents(doc.data.ops);
                })
                /**
                 * On Text change publishing to our server
                 * so that it can be broadcasted to all other clients
                 */
                quill.on('text-change', function (delta, oldDelta, source) {
                    if (source !== 'user') return;
                    doc.submitOp(delta, {source: quill});
                    dispatch(changed({id}));
                });

                /** listening to changes in the document
                 * that is coming from our server
                 */
                doc.on('op', function (op, source) {
                    if (source === quill) return;
                    quill.updateContents(op);
                    dispatch( changed( {id }));
                });

            })

            let quill;


        }
        return () => {
            connection.close();
        };
    }, [id ]);

    useEffect(() => {
        http.get('/api/document/' + id ).then(data => {
            const quill = new Quill('#hiddenEditor');
            if( data.data.parent && data.data.parent.document  ) {
                quill.setContents(JSON.parse(data.data.parent.document.body));
                const before = quill.getContents(0, data.data.parent.link.index);
                const after = quill.getContents(data.data.parent.link.index + data.data.parent.link.length, quill.getLength());

                const beforequill = new Quill("#before", {readonly: true});
                beforequill.setContents(before);

                const afterquill = new Quill("#after", {readonly: true});
                afterquill.setContents(after);
            }
        })
    }, [id])



    return (
        <div>
            <div id="hiddenEditor" style={{ display : 'none'}}></div>
            <div id="before"></div>
            <div className="row">
                <div className="form-group col-sm-12">
                    <div id="editor"></div>
                </div>
            </div>
            <div id="after"></div>
        </div>
    )
}

export default DocumentEdit;