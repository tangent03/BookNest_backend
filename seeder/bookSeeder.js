import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Book from '../model/book.model.js';

// Load environment variables
dotenv.config();

// Sample book data
const books = [
  {
    name: "To Kill a Mockingbird",
    description: "A classic novel set in the American South during the 1930s, addressing issues of racism and moral growth as seen through the eyes of a young girl named Scout Finch.",
    price: 12.99,
    originalPrice: 19.99,
    discount: 35,
    image: "https://m.media-amazon.com/images/I/71FxgtFKcQL._AC_UF1000,1000_QL80_.jpg",
    category: "Fiction",
    author: "Harper Lee",
    duration: "386 pages",
    rating: 4.8,
    trending: "yes"
  },
  {
    name: "1984",
    description: "A dystopian social science fiction novel that examines the consequences of totalitarianism, mass surveillance, and repressive regimentation of persons and behaviors.",
    price: 11.99,
    originalPrice: 17.99,
    discount: 33,
    image: "https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg",
    category: "Science Fiction",
    author: "George Orwell",
    duration: "328 pages",
    rating: 4.7,
    trending: "yes"
  },
  {
    name: "The Great Gatsby",
    description: "A novel that follows a cast of characters living in the fictional towns of West Egg and East Egg on prosperous Long Island in the summer of 1922.",
    price: 9.99,
    originalPrice: 15.99,
    discount: 38,
    image: "https://m.media-amazon.com/images/I/71FTb9X6wsL._AC_UF1000,1000_QL80_.jpg",
    category: "Fiction",
    author: "F. Scott Fitzgerald",
    duration: "180 pages",
    rating: 4.5,
    trending: "no"
  },
  {
    name: "Atomic Habits",
    description: "An easy and proven way to build good habits and break bad ones, offering a framework for improving every day through tiny changes in behavior.",
    price: 19.99,
    originalPrice: 27.99,
    discount: 29,
    image: "https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg",
    category: "Self-Help",
    author: "James Clear",
    duration: "320 pages",
    rating: 4.8,
    trending: "yes"
  },
  {
    name: "Thinking, Fast and Slow",
    description: "A book that summarizes research that Kahneman conducted over decades, often in collaboration with Amos Tversky, covering the two systems that drive the way we think.",
    price: 16.99,
    originalPrice: 24.99,
    discount: 32,
    image: "https://m.media-amazon.com/images/I/71+mDoHG4ML._AC_UF1000,1000_QL80_.jpg",
    category: "Psychology",
    author: "Daniel Kahneman",
    duration: "499 pages",
    rating: 4.6,
    trending: "no"
  },
  {
    name: "Dune",
    description: "Set in the distant future amidst a feudal interstellar society in which various noble houses control planetary fiefs, Dune tells the story of young Paul Atreides.",
    price: 14.99,
    originalPrice: 21.99,
    discount: 32,
    image: "https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UF1000,1000_QL80_.jpg",
    category: "Science Fiction",
    author: "Frank Herbert",
    duration: "688 pages",
    rating: 4.7,
    trending: "yes"
  },
  {
    name: "The Hobbit",
    description: "A fantasy novel and children's book following the quest of home-loving Bilbo Baggins, who is convinced by the wizard Gandalf to join a company of dwarves to reclaim their mountain home.",
    price: 13.99,
    originalPrice: 19.99,
    discount: 30,
    image: "https://m.media-amazon.com/images/I/710+HcoP38L._AC_UF1000,1000_QL80_.jpg",
    category: "Fantasy",
    author: "J.R.R. Tolkien",
    duration: "366 pages",
    rating: 4.8,
    trending: "no"
  },
  {
    name: "Harry Potter and the Sorcerer's Stone",
    description: "The first novel in the Harry Potter series that follows Harry Potter, a young wizard who discovers his magical heritage on his eleventh birthday.",
    price: 15.99,
    originalPrice: 22.99,
    discount: 30,
    image: "https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_UF1000,1000_QL80_.jpg",
    category: "Fantasy",
    author: "J.K. Rowling",
    duration: "320 pages",
    rating: 4.9,
    trending: "yes"
  },
  {
    name: "Rich Dad Poor Dad",
    description: "A book that advocates the importance of financial literacy, financial independence and building wealth through investing in assets and real estate.",
    price: 11.99,
    originalPrice: 17.99,
    discount: 33,
    image: "https://m.media-amazon.com/images/I/81bsw6fnUiL._AC_UF1000,1000_QL80_.jpg",
    category: "Finance",
    author: "Robert Kiyosaki",
    duration: "336 pages",
    rating: 4.7,
    trending: "yes"
  },
  {
    name: "The Alchemist",
    description: "A novel about a young Andalusian shepherd who dreams of finding a worldly treasure and embarks on a journey to find it, discovering the meaning of life along the way.",
    price: 10.99,
    originalPrice: 16.99,
    discount: 35,
    image: "https://m.media-amazon.com/images/I/71aFt4+OTOL._AC_UF1000,1000_QL80_.jpg",
    category: "Fiction",
    author: "Paulo Coelho",
    duration: "208 pages",
    rating: 4.7,
    trending: "yes"
  },
  // Adding more books
  {
    name: "Sapiens: A Brief History of Humankind",
    description: "A book that explores the history of the human species from the evolution of archaic human species in the Stone Age up to the twenty-first century.",
    price: 18.99,
    originalPrice: 29.99,
    discount: 37,
    image: "https://m.media-amazon.com/images/I/71QTAX8-WgL._AC_UF1000,1000_QL80_.jpg",
    category: "History",
    author: "Yuval Noah Harari",
    duration: "464 pages",
    rating: 4.7,
    trending: "yes"
  },
  {
    name: "The Lord of the Rings: The Fellowship of the Ring",
    description: "An epic high-fantasy novel that follows hobbit Frodo Baggins as he embarks on a perilous journey to destroy the One Ring and save Middle-earth from the Dark Lord Sauron.",
    price: 14.99,
    originalPrice: 22.99,
    discount: 35,
    image: "https://m.media-amazon.com/images/I/81YyraOXplL._AC_UF1000,1000_QL80_.jpg",
    category: "Fantasy",
    author: "J.R.R. Tolkien",
    duration: "576 pages",
    rating: 4.9,
    trending: "yes"
  },
  {
    name: "Educated",
    description: "A memoir about a woman who leaves her survivalist family in Idaho and goes on to earn a PhD from Cambridge University.",
    price: 13.99,
    originalPrice: 20.99,
    discount: 33,
    image: "https://m.media-amazon.com/images/I/91AQs6qv9ML._AC_UF1000,1000_QL80_.jpg",
    category: "Biography",
    author: "Tara Westover",
    duration: "352 pages",
    rating: 4.7,
    trending: "yes"
  },
  {
    name: "The Silent Patient",
    description: "A psychological thriller about a woman's act of violence against her husband, and the therapist obsessed with uncovering her motive.",
    price: 12.99,
    originalPrice: 18.99,
    discount: 32,
    image: "https://m.media-amazon.com/images/I/91lslnZ-btL._AC_UF1000,1000_QL80_.jpg",
    category: "Thriller",
    author: "Alex Michaelides",
    duration: "336 pages",
    rating: 4.6,
    trending: "yes"
  },
  {
    name: "The Power of Now",
    description: "A guide to spiritual enlightenment that aims to show readers how to live fully in the present and avoid thoughts of the past or future.",
    price: 11.99,
    originalPrice: 17.99,
    discount: 33,
    image: "https://m.media-amazon.com/images/I/714FbKtXS+L._AC_UF1000,1000_QL80_.jpg",
    category: "Self-Help",
    author: "Eckhart Tolle",
    duration: "236 pages",
    rating: 4.7,
    trending: "no"
  },
  {
    name: "A Brief History of Time",
    description: "A landmark volume in science writing that presents the wonders of the universe in terms everyone can understand.",
    price: 15.99,
    originalPrice: 23.99,
    discount: 33,
    image: "https://m.media-amazon.com/images/I/A1xkFZX5k-L._AC_UF1000,1000_QL80_.jpg",
    category: "Science",
    author: "Stephen Hawking",
    duration: "256 pages",
    rating: 4.7,
    trending: "no"
  },
  {
    name: "The Da Vinci Code",
    description: "A mystery thriller novel that follows symbologist Robert Langdon and cryptologist Sophie Neveu after a murder in the Louvre Museum in Paris.",
    price: 9.99,
    originalPrice: 15.99,
    discount: 38,
    image: "https://m.media-amazon.com/images/I/91KF+k7Lt5L._AC_UF1000,1000_QL80_.jpg",
    category: "Mystery",
    author: "Dan Brown",
    duration: "489 pages",
    rating: 4.5,
    trending: "no"
  },
  {
    name: "The Road Less Traveled",
    description: "A classic self-help book that uses concepts from psychology, philosophy, and religion to help readers confront and solve their problems.",
    price: 10.99,
    originalPrice: 16.99,
    discount: 35,
    image: "https://m.media-amazon.com/images/I/81XTbEVT6JL._AC_UF1000,1000_QL80_.jpg",
    category: "Self-Help",
    author: "M. Scott Peck",
    duration: "320 pages",
    rating: 4.6,
    trending: "no"
  },
  {
    name: "The Hunger Games",
    description: "A dystopian novel set in a post-apocalyptic society where young people must participate in a televised death match called The Hunger Games.",
    price: 12.99,
    originalPrice: 18.99,
    discount: 32,
    image: "https://m.media-amazon.com/images/I/71WSzS6zvCL._AC_UF1000,1000_QL80_.jpg",
    category: "Science Fiction",
    author: "Suzanne Collins",
    duration: "374 pages",
    rating: 4.7,
    trending: "yes"
  },
  {
    name: "Pride and Prejudice",
    description: "A romantic novel that follows the emotional development of protagonist Elizabeth Bennet, who learns about the repercussions of hasty judgments.",
    price: 8.99,
    originalPrice: 13.99,
    discount: 36,
    image: "https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg",
    category: "Fiction",
    author: "Jane Austen",
    duration: "432 pages",
    rating: 4.7,
    trending: "no"
  }
];

// Connect to MongoDB
async function seedDatabase() {
  try {
    // Connect to MongoDB using hardcoded URI
    const MONGODB_URI = "mongodb+srv://amanawp03:tangent03@booknestcluster.7fxlq.mongodb.net/";
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing books
    await Book.deleteMany({});
    console.log('Existing books deleted');

    // Insert new books
    await Book.insertMany(books);
    console.log('Books successfully added to the database');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase(); 