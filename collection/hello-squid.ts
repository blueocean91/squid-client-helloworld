import { Squid } from '@squidcloud/client'
import 'dotenv/config'

interface Book {
    title: string;
    author: string;
    genre: string;
    publishedYear: number;
    rating: number;
}

async function addBook(squid: Squid, book: Book) {
    console.log(`📚  Connecting to books collection …`);
    const booksCollection = squid.collection('books');
    
    const bookToInsert = {
        ...book,
        addedAt: new Date()
    };
    
    await booksCollection.doc().insert(bookToInsert);
    console.log(`📖  Added book: ${book.title} by ${book.author}`);
}

async function getAllBooks(squid: Squid) {
    console.log(`📚  Fetching all books from collection …`);
    const booksCollection = squid.collection('books');
    
    const books = await booksCollection.query().snapshot();
    console.log(`📖  Found ${books?.length || 0} books:`);
    books?.forEach((book, index) => {
        const bookData = book.data;
        console.log(`${index + 1}. ${bookData.title} by ${bookData.author} (${bookData.publishedYear}) - Rating: ${bookData.rating}/5`);
    });
    
    return books;
}

async function deleteAllBooks(squid: Squid) {
    console.log(`🗑️  Deleting all books from collection …`);
    const booksCollection = squid.collection('books');
    
    const books = await booksCollection.query().snapshot();
    
    if (!books || books.length === 0) {
        console.log(`📖  No books found to delete.`);
        return;
    }
    
    console.log(`🗑️  Deleting ${books.length} books...`);
    
    for (const book of books) {
        await book.delete();
    }
    
    console.log(`✅  Successfully deleted all ${books.length} books.`);
}

async function getHighRatedBooks(squid: Squid, minRating: number) {
    console.log(`⭐  Fetching books with rating ${minRating} or higher using query …`);
    const booksCollection = squid.collection('books');
    
    const highRatedBooks = await booksCollection
        .query()
        .gte('rating', minRating)
        .snapshot();
    
    if (!highRatedBooks || highRatedBooks.length === 0) {
        console.log(`📖  No books found with rating ${minRating} or higher.`);
        return [];
    }
    
    console.log(`⭐  Found ${highRatedBooks.length} books with rating ${minRating} or higher:`);
    highRatedBooks.forEach((book, index) => {
        const bookData = book.data;
        console.log(`${index + 1}. ${bookData.title} by ${bookData.author} (${bookData.publishedYear}) - Rating: ${bookData.rating}/5`);
    });
    
    return highRatedBooks;
}

async function findBooksByTitle(squid: Squid, titleQuery: string) {
    console.log(`🔍  Searching for books with title containing "${titleQuery}" …`);
    const booksCollection = squid.collection('books');
    
    const foundBooks = await booksCollection
        .query()
        .like('title', `%${titleQuery}%`)
        .snapshot();
    
    if (!foundBooks || foundBooks.length === 0) {
        console.log(`📖  No books found with title containing "${titleQuery}".`);
        return [];
    }
    
    console.log(`🔍  Found ${foundBooks.length} books with title containing "${titleQuery}":`);
    foundBooks.forEach((book, index) => {
        const bookData = book.data;
        console.log(`${index + 1}. ${bookData.title} by ${bookData.author} (${bookData.publishedYear}) - Rating: ${bookData.rating}/5`);
    });
    
    return foundBooks;
}

async function main() {
  const squid = new Squid({
    appId: process.env.SQUID_APP_ID!, 
    region: process.env.SQUID_REGION! as 'us-east-1.aws' | 'ap-south-1.aws' | 'us-central1.gcp',
    environmentId: process.env.SQUID_ENVIRONMENT_ID! as 'dev' | 'prod',
    apiKey: process.env.SQUID_API_KEY!,           
    squidDeveloperId: process.env.SQUID_DEVELOPER_ID!
  });

  const agentId = 'agent1';
  await squid.ai().agent(agentId).upsert({
        options: {
            model: 'gpt-4o',
        },
        isPublic: true,
    });
    const instruction = `
        You are helpful assistant. 
        Please reply in Japanese. 
    `;
    await squid.ai().agent(agentId).updateInstructions(instruction);
    
    const agent = squid.ai().agent(agentId);
    console.log(`📡  Connecting to agent '${agentId}' …`);
    const response = await agent.ask('Hello! What is the highest mountain in Japan?');
    console.log(`🤖  Response from agent '${agentId}': ${response}`);

    const favoriteBooks: Book[] = [
        {
            title: "ノルウェイの森",
            author: "村上春樹",
            genre: "現代文学",
            publishedYear: 1987,
            rating: 4
        },
        {
            title: "1984",
            author: "ジョージ・オーウェル",
            genre: "ディストピア小説",
            publishedYear: 1949,
            rating: 5
        },
        {
            title: "罪と罰",
            author: "フョードル・ドストエフスキー",
            genre: "古典文学",
            publishedYear: 1866,
            rating: 5
        },
        {
            title: "吾輩は猫である",
            author: "夏目漱石",
            genre: "日本文学",
            publishedYear: 1905,
            rating: 4
        },
        {
            title: "ハリー・ポッターと賢者の石",
            author: "J.K.ローリング",
            genre: "ファンタジー",
            publishedYear: 1997,
            rating: 5
        }
    ];
    
    /*
    console.log(`📚  Adding ${favoriteBooks.length} favorite books...`);
    for (const book of favoriteBooks) {
        await addBook(squid, book);
    }
    */
    
    await getAllBooks(squid);
    
    await getHighRatedBooks(squid, 5);
    
    await findBooksByTitle(squid, "ハリー");
}

main().catch(console.error);

