require('dotenv').config();

const connectDB = require('./config/db');
const Admin = require('./models/Admin');

async function reset() {
    try {

        await connectDB();

        const admin = await Admin.findOne({
            email: "admin@hobbystudio.com"
        });

        if (!admin) {
            console.log("❌ Admin not found");
            process.exit();
        }

        // IMPORTANT:
        // DO NOT HASH HERE.
        // The Admin model will hash it automatically.

        admin.password = "Hobby@Studio#2026";

        await admin.save();

        console.log("✅ Password Reset Successfully");
        console.log("Email: admin@hobbystudio.com");
        console.log("Password: Hobby@Studio#2026");

        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

reset();