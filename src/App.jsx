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

    // Create state for notes objects array (includes body of writing and id from firebase database)
    // Set initially to an empty array
    const [notes, setNotes] = React.useState([]);

    // Create state for current note id to determine what note is currently selected
    // Set initially to an empty string
    const [currentNoteId, setCurrentNoteId] = React.useState("");
    
    // Create state for temporary note text to store the current note's body
    // Set initially to an empty string
    const [tempNoteText, setTempNoteText] = React.useState("");

    // Find the current note object selected based on the current note id
    const currentNote = 
        notes.find(note => note.id === currentNoteId) || notes[0];

    // Sort the notes objects array by the date it was last updated in reverse chronological order
    const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt);
    
    // Use onSnapshot to listen for changes in the notes collection in the firebase database
    // Used to sync the notes array with the database (local changes will reflect the saved database)
    // Need to return the unsubscribe function to prevent memory leaks
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
    
    // Use useEffect to set the current note id to the first note id in the notes array if there is no current note
    React.useEffect(() => {
        if (!currentNoteId) {
            setCurrentNoteId(notes[0]?.id);
        }
    }, [notes]);
    
    // Use useEffect to set the temporary note text to the current note's body when the current note changes
    React.useEffect(() => {
        if (currentNote) {
            setTempNoteText(currentNote.body);
        }
    }, [currentNote]);
    
    // Use useEffect to update the note in the firebase database when the temporary note text changes upon editing
    // Set a timeout to prevent the note from updating and connecting to the database too frequently (will override previous connection)
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (tempNoteText !== currentNote.body) {
                updateNote(tempNoteText);
            }
        }, 500)
        return () => clearTimeout(timeoutId);
    }, [tempNoteText]);

    // Function to create a new note object and add it to firebase database
    // Also sets the date/time it was created and last updated
    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here",
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        const newNoteRef = await addDoc(notesCollection, newNote);
        setCurrentNoteId(newNoteRef.id);
    }

    // Function to update the firebase database with the updated note text (tempNoteText as its being updated)
    async function updateNote(text) {
        const docRef = doc(db, "notes", currentNoteId);
        await setDoc(
            docRef, 
            { body: text, updatedAt: Date.now() }, 
            { merge: true }
        );
    }

    // Function to delete a note object from the firebase database
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
