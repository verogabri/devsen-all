
import { useState, useContext } from "react";
// import BooksContext from "../../context/Books";

import useBooksContextHook from "../../hooks/use-books-context";

function BookCreate() {

    const [title, setTitle] = useState('');

    // const { createBook} = useContext(BooksContext);
    const { createBook, configurazione} = useBooksContextHook();

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    }
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // onCreate(title);
        createBook(title);
        setTitle('');
    }

    return (
        <div className="book-create">
        
            <h3>Add a New Book</h3>
            <form onSubmit={handleSubmit}>
            
                <label htmlFor="title">Title:</label>
                <input className="input" type="text" value={title} onChange={handleTitleChange} placeholder="Enter book title" />
                <button className="button" type="submit">Add Book</button>
            </form>
            
            {/* Example of a conditional render to show a message if no book title is entered */}
            {title.length === 0 && <p>Please enter a book title</p>}

            
        </div>
    );

}

export default BookCreate;
