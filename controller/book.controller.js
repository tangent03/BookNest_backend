// book.controller.js
import Book from "../model/book.model.js";

// Sample books data to initialize if the database is empty
const sampleBooks = [
    {
        name: 'The Great Gatsby',
        description: 'A story of decadence and excess, Gatsby explores the darker aspects of the American Dream.',
        price: 29.99,
        originalPrice: 39.99,
        discount: 25,
        category: 'Fiction',
        author: 'F. Scott Fitzgerald',
        duration: '6 weeks',
        rating: 4.7,
        trending: 'yes',
        image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg'
    },
    {
        name: 'To Kill a Mockingbird',
        description: "Harper Lee's Pulitzer Prize-winning masterwork of honor and injustice in the deep South.",
        price: 24.99,
        originalPrice: 32.99,
        discount: 20,
        category: 'Classic',
        author: 'Harper Lee',
        duration: '8 weeks',
        rating: 4.9,
        trending: 'yes',
        image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg'
    },
    {
        name: '1984',
        description: "George Orwell's dystopian masterpiece, a vision of a totalitarian future.",
        price: 19.99,
        originalPrice: 27.99,
        discount: 30,
        category: 'Science Fiction',
        author: 'George Orwell',
        duration: '5 weeks',
        rating: 4.6,
        trending: 'no',
        image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1657781256i/61439040.jpg'
    },
    {
        name: 'Pride and Prejudice',
        description: "Jane Austen's beloved masterpiece of love and marriage in Georgian England.",
        price: 22.99,
        originalPrice: 29.99,
        discount: 15,
        category: 'Romance',
        author: 'Jane Austen',
        duration: '7 weeks',
        rating: 4.8,
        trending: 'yes',
        image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg'
    },
    {
        name: 'The Hobbit',
        description: "J.R.R. Tolkien's timeless classic about Bilbo Baggins' adventures with dwarves and a dragon.",
        price: 27.99,
        originalPrice: 34.99,
        discount: 20,
        category: 'Fantasy',
        author: 'J.R.R. Tolkien',
        duration: '9 weeks',
        rating: 4.8,
        trending: 'yes',
        image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg'
    },
    {
        name: 'The Catcher in the Rye',
        description: "J.D. Salinger's classic novel of teenage angst and alienation.",
        price: 18.99,
        originalPrice: 24.99,
        discount: 20,
        category: 'Fiction',
        author: 'J.D. Salinger',
        duration: '5 weeks',
        rating: 4.2,
        trending: 'no',
        image: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg'
    }
];

// Initialize the database with sample data if empty
const initializeDatabase = async () => {
    try {
        const count = await Book.countDocuments();
        if (count === 0) {
            await Book.insertMany(sampleBooks);
            console.log('Database initialized with sample books');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

// Call initialize function
initializeDatabase();

export const getBook = async (req, res) => {
    try {
        const books = await Book.find(); // Fetch all books from the database
        
        // If no books in database, use sample data
        if (books.length === 0) {
            return res.status(200).json(sampleBooks);
        }
        
        res.status(200).json(books); // Send the books as a JSON response
    } catch (error) {
        console.log("Error: ", error); // Log the error for debugging
        res.status(500).json({ message: 'Server error', error }); // Send a user-friendly error message
    }
}
