import mongoose from 'mongoose';

const dbConfig = async () => {
    try {
        await mongoose.connect(process.env.DB_LOCATION, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process with an error code
    }
};

export default dbConfig;
