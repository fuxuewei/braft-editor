import React from "react";
import ReactDOM from "react-dom";
import BraftEditor from "../src";
import ColorPicker from "braft-extensions/dist/color-picker";
import Table from "braft-extensions/dist/table";
import { ContentUtils } from "braft-utils";
import CodeHighlighter from "braft-extensions/dist/code-highlighter";
import Emoticon, { defaultEmoticons } from "braft-extensions/dist/emoticon";
import "braft-extensions/dist/emoticon.css";
import "braft-extensions/dist/color-picker.css";
import "braft-extensions/dist/table.css";
import "braft-extensions/dist/code-highlighter.css";
import MediaComponent from "./MediaCom.jsx";

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
    ContentUtils.insertAtomicBlock(this.state.editorState, "text", true, { tipText });
    // window.setImmediate(this.props.editor.forceRender);
  };

  imageControls = [
    "float-left",
    "float-right",
    {
      text: "Foo", // 指定控件文字，可传入jsx
      render: (mediaData, block) => {
        return (
          <div className="bf-image-link-editor">
            <div className="editor-input-group">
              <input
                type="text"
                placeholder={"写点文字注解吧"}
                onKeyDown={(e) => this.handleTipInputKeyDown(e, block)}
                onChange={this.settipText}
                defaultValue={this.state.tipText}
              />
              <button type="button" onClick={this.confirmtipText(block)}>
                确认
              </button>
            </div>
          </div>
        );
      }, // 控件渲染函数，该属性指定时，text和onClick属性将被忽略
      onClick: (block) => {}, // 指定控件点击后的回调，参数为当前图片的block对象
    },
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
      editorState: BraftEditor.createEditorState({
        blocks: [
          {
            key: "6vmpa",
            text: "",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {
              nodeAttributes: { "data-foo": "adasd", class: "my-classname" },
            },
          },
          {
            key: "843pk",
            text: "ameihuanyu",
            type: "atomic",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [{ offset: 0, length: 1, key: 0 }],
            data: {
              nodeAttributes: { class: "media-wrap image-wrap" },
              float: "",
              alignment: "",
            },
          },
          {
            key: "34sh7",
            text: "asdasdasdaasdads",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
              { offset: 0, length: 10, style: "COLOR-E25041" },
            ],
            entityRanges: [],
            data: { nodeAttributes: {} },
          },
        ],
        entityMap: {
          "0": {
            type: "IMAGE",
            mutability: "IMMUTABLE",
            data: {
              meta: {},
              url: "https://www.baidu.com/img/bd_logo1.png?where=super",
              tipText: "31231",
            },
          },
        },
      }),
    };
  }

  myBlockRenderer = (contentBlock) => {
    const type = contentBlock.getType();
    if(type==="atomic"){

      const contentState = this.state.editorState.getCurrentContent();
      const block = contentState.getBlockForKey(contentBlock.key);

      const entityKey = block.getEntityAt(0);
      const entity = contentState.getEntity(entityKey);
      const mediaType = entity.getType();
      const mediaData = entity.getData()
      console.log(mediaData)
  
      if (mediaType === "IMAGE") {
        const mediaData = entity.getData();
        const { superProps } = this;
        const mediaProps = {
          ...superProps,
          block: contentBlock,
          mediaData,
          entityKey,
        };
        return {
          component: MediaComponent,
          editable: false,
          props: { ...mediaProps },
        };
      }
    }
  }

  handleChange = (editorState) => {
    this.logRAW();
    this.setState({ editorState });
  };

  logHTML = () => {
    console.log(
      this.state.editorState.toHTML({
        blockExportFn: (contentState, block) => {
          if (block.type === "atomic") {
            const { nodeAttributes = {} } = block.data;
            console.log(block);
            return convertAtomicBlock(block, contentState, nodeAttributes);
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
