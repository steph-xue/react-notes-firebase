import React from "react"
import ReactMde from "react-mde"
import Showdown from "showdown"

function Editor({ tempNoteText, setTempNoteText }) {

    // Create state for selected tab (write or preview) in the markdown editor
    const [selectedTab, setSelectedTab] = React.useState("write");

    const converter = new Showdown.Converter({
        tables: true,
        simplifiedAutoLink: true,
        strikethrough: true,
        tasklists: true,
    });

    // Return the markdown editor component
    return (
        <section className="pane editor">
            <ReactMde
                value={tempNoteText}
                onChange={setTempNoteText}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={(markdown) =>
                    Promise.resolve(converter.makeHtml(markdown))
                }
                minEditorHeight={80}
                heightUnits="vh"
            />
        </section>
    );
}

export default Editor;