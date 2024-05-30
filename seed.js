import BookJson from "./Bookstore.books.json" assert { type: "json" };
import Book from "./models/Book.js";

export const seedBooksData = async () => {
    try {
        // Clear existing data
        await Book.deleteMany({});

        // Insert new data
        await Book.insertMany(BookJson);
        console.log("Data Seeded Successfully!");
    } catch (err) {
        console.log('Error:', err);
    }
};
