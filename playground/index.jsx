import React from "react";
import ReactDOM from "react-dom";
import BraftEditor from 'braft-editor'
import ColorPicker from "braft-extensions/dist/color-picker";
import { Editor, EditorState } from "draft-js";
import { Map } from "immutable";
import Table from "braft-extensions/dist/table";
import { ContentUtils } from "braft-utils";
import CodeHighlighter from "braft-extensions/dist/code-highlighter";
import Emoticon, { defaultEmoticons } from "braft-extensions/dist/emoticon";
import "braft-extensions/dist/emoticon.css";
import "braft-extensions/dist/color-picker.css";
import "braft-extensions/dist/table.css";
import "braft-extensions/dist/code-highlighter.css";
import MediaComponent from "./MediaCom.jsx";
import Video from 'renderers/atomics/Video'
import Audio from 'renderers/atomics/Audio'
import Embed from 'renderers/atomics/Embed'
import HorizontalLine from 'renderers/atomics/HorizontalLine'
import 'braft-editor/dist/index.css'
import update from 'immutability-helper'

const convertAtomicBlock = (block, contentState, blockNodeAttributes) => {
  if (!block || !block.key) {
    return <p></p>;
  }

  const contentBlock = contentState.getBlockForKey(block.key);
  let { class: className, ...nodeAttrAsProps } = blockNodeAttributes;
  nodeAttrAsProps.className = className;

  if (!contentBlock) {
    return <p></p>;
  }

  const entityKey = contentBlock.getEntityAt(0);

  if (!entityKey) {
    return <p></p>;
  }

  const entity = contentState.getEntity(entityKey);
  const mediaType = entity.getType().toLowerCase();

  let { float, alignment } = block.data;
  let {
    url,
    link,
    link_target,
    width,
    height,
    meta,
    tipText,
  } = entity.getData();
  if (mediaType === "image") {
    let imageWrapStyle = {};
    let styledClassName = "";

    if (float) {
      imageWrapStyle.float = float;
      styledClassName += " float-" + float;
    } else if (alignment) {
      imageWrapStyle.textAlign = alignment;
      styledClassName += " align-" + alignment;
    }

    if (link) {
      return (
        <div
          className={"media-wrap image-wrap" + styledClassName}
          style={imageWrapStyle}
        >
          <a
            style={{ display: "inline-block" }}
            href={link}
            target={link_target}
          >
            <img
              {...nodeAttrAsProps}
              {...meta}
              src={url}
              width={width}
              height={height}
              style={{ width, height }}
            />
          </a>
        </div>
      );
    } else {
      return (
        <div
          className={"media-wrap image-wrap" + styledClassName}
          style={Object.assign({ display: "inline-block" }, imageWrapStyle)}
        >
          <img
            {...nodeAttrAsProps}
            {...meta}
            src={url}
            width={width}
            height={height}
            style={{ width, height }}
          />
          <div
            style={{
              color: "#6a6f7b",
              textAlign: "center",
              fontSize: "14px",
            }}
            className="tip-text"
            data-float={float}
            data-align={alignment}
          >
            <span>{tipText}</span>
          </div>
        </div>
      );
    }
  } else if (mediaType === "audio") {
    return (
      <div className="media-wrap audio-wrap">
        <audio controls {...nodeAttrAsProps} {...meta} src={url} />
      </div>
    );
  } else if (mediaType === "video") {
    return (
      <div className="media-wrap video-wrap">
        <video
          controls
          {...nodeAttrAsProps}
          {...meta}
          src={url}
          width={width}
          height={height}
        />
      </div>
    );
  } else if (mediaType === "embed") {
    return (
      <div className="media-wrap embed-wrap">
        <div dangerouslySetInnerHTML={{ __html: url }} />
      </div>
    );
  } else if (mediaType === "hr") {
    return <hr></hr>;
  } else {
    return <p></p>;
  }
};



const emoticons = defaultEmoticons.map((item) =>
  require(`braft-extensions/dist/assets/${item}`),
);

const hooks = {
  "set-image-alignment": () => {
    return "left";
  },
};

BraftEditor.use([
  Emoticon({
    emoticons: emoticons,
  }),
  // ColorPicker({
  //   theme: 'dark'
  // }),
  Table(),
  CodeHighlighter(),
]);

class Demo extends React.Component {
  handleTipInputKeyDown = (e, block) => {
    if (e.keyCode === 13) {
      this.confirmtipText(block);
    } else {
      return;
    }
  };
  tableAtomicBlock = (block, contentState, blockNodeAttributes) => {
    console.log(block)
    const previousBlock = contentState.getBlockBefore(block.key)
    const nextBlock = contentState.getBlockAfter(block.key)
    const previousBlockType = previousBlock ? previousBlock.getType() : null
    const previousBlockData = previousBlock ? previousBlock.getData().toJS() : {}
    const nextBlockType = nextBlock ? nextBlock.getType() : null
    const nextBlockData = nextBlock ? nextBlock.getData().toJS() : {}
  
    let start = ''
    let end = ''
    let blockStyle = ''

  
    if (previousBlockType !== 'table-cell') {
      start = `<table style="min-height: 44px; line-height: 25px; border-collapse: collapse ;border:1px solid #cccccc;width:100%;table-layout: fixed;"><tr style="background:#f9f9f9"><td${blockStyle} colSpan="${block.data.colSpan}" rowSpan="${block.data.rowSpan}">`
    } else if (previousBlockData.rowIndex !== block.data.rowIndex) {
      start = `<tr><td${blockStyle} colSpan="${block.data.colSpan}" rowSpan="${block.data.rowSpan}">`
    } else {
      start = `<td${blockStyle} colSpan="${block.data.colSpan}" rowSpan="${block.data.rowSpan}">`
    }
  
    if (nextBlockType !== 'table-cell') {
      end = '</td></tr></table>'
    } else if (nextBlockData.rowIndex !== block.data.rowIndex) {
      end = '</td></tr>'
    } else {
      end = '</td>'
    }
  
    if (!previousBlockType) {
      start = '<p></p>' + start
    }
  
    if (!nextBlockType) {
      end += '<p></p>'
    }
    const newBlock = update(block, {
       $set: { type:"unstyled",data: block.cata,entityRanges:block.entityRanges,inlineStyleRanges:block.inlineStyleRanges,key:block.key,text:block.text} 
    });
    console.log(newBlock)
    const xx = {blocks:[newBlock],entityMap:{}}
    console.log(JSON.stringify(xx))
    console.log(BraftEditor.createEditorState(JSON.stringify(xx)).toRAW())
    return start + BraftEditor.createEditorState(JSON.stringify(xx)).toHTML() +end
  };
  settipText = ({ currentTarget }) => {
    let { value } = currentTarget;

    value && !isNaN(value) && (value = value);

    this.setState({
      tipText: value,
    });

    return;
  };

  confirmtipText = (block) => {
    let { tipText } = this.state;
    const contentState = this.state.editorState.getCurrentContent();
    const contentBlock = contentState.getBlockForKey(block.key);
    const entityKey = contentBlock.getEntityAt(0);
    this.setState({
      editorState: ContentUtils.setMediaData(
        this.state.editorState,
        entityKey,
        { tipText },
      ),
    });
    ContentUtils.insertAtomicBlock(this.state.editorState, "text", true, {
      tipText,
    });
    // window.setImmediate(this.props.editor.forceRender);
  };

  imageControls = [
    // "float-left",
    // "float-right",
    "link",
    "size",
    "remove",
  ];

  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      tipText: "",
      readOnly: false,
      // editorState: BraftEditor.createEditorState('<p data-foo="adasd" class="my-classname"><img src="https://www.baidu.com/img/bd_logo1.png?where=super" /><span style="color:#e25041;">asdasdasda</span>asdads</p>')
      editorState: BraftEditor.createEditorState(),
    };
  }


  myBlockRenderer = (contentBlock, superProps) => {
    const type = contentBlock.getType();
    if (type === "atomic") {
      const Com = (props) => {
        const entityKey = props.block.getEntityAt(0)

        if (!entityKey) {
          return null
        }
        const entity = props.contentState.getEntity(entityKey)
        const mediaData = entity.getData()
        const mediaType = entity.getType()
        const mediaProps = {
          ...superProps,
          block: props.block,
          mediaData, entityKey
        }
        if (mediaType === 'IMAGE') {
          return <MediaComponent { ...mediaProps } />
        } else if (mediaType === 'AUDIO') {
          return <Audio { ...mediaProps } />
        } else if (mediaType === 'VIDEO') {
          return <Video { ...mediaProps } />
        } else if (mediaType === 'EMBED') {
          return <Embed { ...mediaProps } />
        } else if (mediaType === 'HR') {
          return <HorizontalLine { ...mediaProps } />
        }
        if (superProps.extendAtomics) {
          const atomics = superProps.extendAtomics
          for (let i = 0; i < atomics.length; i++) {
            if (mediaType === atomics[i].type) {
              const Component = atomics[i].component
              return <Component {...mediaProps} />
            }
          }
        }
        return null
      }
      return {
        component: Com,
        editable: false,
      };
    }
  };

  handleChange = (editorState) => {
    // this.logRAW();
    this.logHTML();
    this.setState({ editorState });
  };

  logHTML = () => {
    console.log(
      this.state.editorState.toHTML({
        blockExportFn: (contentState, block) => {

          // if (block.type === "atomic") {
          //   const { nodeAttributes = {} } = block.data;
          //   return convertAtomicBlock(block, contentState, nodeAttributes);
          // }
          if(block.type === "table-cell"){
            const { nodeAttributes = {} } = block.data;
            return this.tableAtomicBlock(block, contentState, nodeAttributes);
          }
        },
      }),
    );
  };

  logRAW = () => {
    console.log(this.state.editorState.toRAW());
  };

  render() {
    const { readOnly, editorState } = this.state;

    return (
      <div>
        <div className="demo" id="demo">
          <BraftEditor
            extendControls={[
              {
                key: "log-raw",
                type: "button",
                text: "Log RAW",
                // disabled: true,
                onClick: this.logRAW,
              },
              {
                key: "log-html",
                type: "button",
                text: "Log HTML",
                // disabled: true,
                onClick: this.logHTML,
              },
              {
                key: "my-modal",
                type: "modal",
                text: "modal",
                // disabled: true,
                modal: {
                  id: "a",
                  closeOnBlur: true,
                  confirmable: true,
                  closeOnConfirm: false,
                  component: <div>123123</div>,
                },
              },
              {
                key: "my-dropdown",
                type: "dropdown",
                text: "Hello",
                // disabled: true,
                component: <h1>Hello World!</h1>,
              },
            ]}
            colors={["#e25041"]}
            headings={["header-one", "unstyled"]}
            placeholder="Hello World!"
            fixPlaceholder={true}
            allowInsertLinkText={true}
            triggerChangeOnMount={false}
            value={editorState}
            onChange={this.handleChange}
            readOnly={readOnly}
            hooks={hooks}
            imageResizable={true}
            imageEqualRatio={true}
            imageControls={this.imageControls}
            blockRendererFn={this.myBlockRenderer}
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.querySelector("#root"));
