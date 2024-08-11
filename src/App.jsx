import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import {
    onSnapshot,
    addDoc,
    doc,
    deleteDoc,
    setDoc
} from "firebase/firestore"
import { notesCollection, db } from "./firebase"

function App() {

    // Create state for notes objects array (includes id and body of writing)
    // Load notes from local storage (only once upon refresh) or set to empty array
    const [notes, setNotes] = React.useState([]);

    // Create state for current note id to determine what note is currently selected
    // Set to the first note's id or an empty string if there are no notes
    const [currentNoteId, setCurrentNoteId] = React.useState("");
    
    const [tempNoteText, setTempNoteText] = React.useState("");

    // Find the current note object selected based on the current note id
    const currentNote = 
        notes.find(note => note.id === currentNoteId) || notes[0];

    const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt);
    
    React.useEffect(() => {
        const unsubscribe = onSnapshot(notesCollection, function (snapshot) {
            const notesArr = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }));
            setNotes(notesArr);
        })
        return unsubscribe;
    }, []);
    
    React.useEffect(() => {
        if (!currentNoteId) {
            setCurrentNoteId(notes[0]?.id);
        }
    }, [notes]);
    
    React.useEffect(() => {
        if (currentNote) {
            setTempNoteText(currentNote.body);
        }
    }, [currentNote]);
    
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (tempNoteText !== currentNote.body) {
                updateNote(tempNoteText);
            }
        }, 500)
        return () => clearTimeout(timeoutId);
    }, [tempNoteText]);

    // Function to create a new note object and add it to the notes array
    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here",
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        const newNoteRef = await addDoc(notesCollection, newNote);
        setCurrentNoteId(newNoteRef.id);
    }

    // Function to update the body of the current note object
    async function updateNote(text) {
        const docRef = doc(db, "notes", currentNoteId);
        await setDoc(
            docRef, 
            { body: text, updatedAt: Date.now() }, 
            { merge: true }
        );
    }

    // Function to delete a note object from the notes array
    async function deleteNote(noteId) {
        const docRef = doc(db, "notes", noteId);
        await deleteDoc(docRef);
    }

    // Return the main app component with the sidebar and editor components split horizontally in two sections
    // If there are no notes, display a button to create a new note
    return (
        <main>
            {
                notes.length > 0
                    ?
                    <Split
                        sizes={[30, 70]}
                        direction="horizontal"
                        className="split"
                    >
                        <Sidebar
                            notes={sortedNotes}
                            currentNote={currentNote}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                        <Editor
                            tempNoteText={tempNoteText}
                            setTempNoteText={setTempNoteText}
                        />
                    </Split>
                    :
                    <div className="no-notes">
                        <h1>You have no notes</h1>
                        <button
                            className="first-note"
                            onClick={createNewNote}
                        >
                            Create one now
                </button>
                    </div>

            }
        </main>
    );
}

export default App;
