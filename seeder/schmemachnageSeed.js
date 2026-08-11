import db from "../config/db.js";
import mongoose from "mongoose";

const migrate = async () => {
    console.log("Connecting to the database...");
    await db();

    try {
        const dbInstance = mongoose.connection.db;
        const feedbackCollection = dbInstance.collection("mentaltestfeedbacks");

        // 1. Drop old indexes that might conflict with the new schema structure or restoration
        console.log("Checking and updating indexes...");
        try {
            const indexes = await feedbackCollection.indexes();
            console.log("Current indexes on collection:", indexes.map(idx => idx.name));

            const oldIndexName = "header_1_question_1";
            if (indexes.some(idx => idx.name === oldIndexName)) {
                console.log(`Dropping old index '${oldIndexName}'...`);
                await feedbackCollection.dropIndex(oldIndexName);
                console.log("Dropped old index successfully.");
            }

            const newIndexName = "header_1";
            if (indexes.some(idx => idx.name === newIndexName)) {
                console.log(`Dropping index '${newIndexName}' temporarily for migration...`);
                await feedbackCollection.dropIndex(newIndexName);
                console.log("Dropped index successfully.");
            }
        } catch (indexError) {
            console.warn("Could not drop old indexes:", indexError.message);
        }

        // 2. Fetch current documents from the collection first
        let allDocs = await feedbackCollection.find({}).toArray();
        let oldDocs = allDocs.filter(doc => doc.question !== undefined && doc.questions === undefined);
        let alreadyMigratedDocs = allDocs.filter(doc => doc.questions !== undefined);

        // 3. Self-Healing/Restoration: Check if we need to restore from a backup
        const collections = await dbInstance.listCollections().toArray();
        const backupColls = collections
            .filter(col => col.name.startsWith("mentaltestfeedbacks_backup_"))
            .sort((a, b) => b.name.localeCompare(a.name));

        if (backupColls.length > 0) {
            const latestBackupName = backupColls[0].name;
            const backupDocsCount = await dbInstance.collection(latestBackupName).countDocuments();

            // Only restore if the main collection is incomplete (i.e. fewer documents than backup,
            // and either has old schema documents or is completely empty).
            if (allDocs.length < backupDocsCount && (oldDocs.length > 0 || allDocs.length === 0)) {
                console.log(`Main collection has ${allDocs.length} documents and needs restoration. Restoring from backup '${latestBackupName}'...`);
                const backupDocs = await dbInstance.collection(latestBackupName).find({}).toArray();
                await feedbackCollection.deleteMany({});
                await feedbackCollection.insertMany(backupDocs);
                console.log("Restoration from backup completed successfully!");

                // Re-fetch documents after restoration
                allDocs = await feedbackCollection.find({}).toArray();
                oldDocs = allDocs.filter(doc => doc.question !== undefined && doc.questions === undefined);
                alreadyMigratedDocs = allDocs.filter(doc => doc.questions !== undefined);
            }
        }

        console.log(`Found ${allDocs.length} total documents in 'mentaltestfeedbacks' collection.`);

        if (allDocs.length === 0) {
            console.log("Collection is empty. Nothing to migrate.");
            process.exit(0);
        }

        console.log(`Old schema documents to migrate: ${oldDocs.length}`);
        console.log(`Already migrated/new schema documents: ${alreadyMigratedDocs.length}`);

        if (oldDocs.length > 0) {
            // 5. Group ALL documents by header and is_del to avoid duplicates
            const grouped = {};

            for (const doc of allDocs) {
                const headerStr = doc.header ? doc.header.toString() : "no-header";
                const isDel = doc.is_del === true;
                const key = `${headerStr}_${isDel}`;

                if (!grouped[key]) {
                    grouped[key] = {
                        header: doc.header,
                        is_del: isDel,
                        questions: [],
                        createdDates: [],
                        updatedDates: []
                    };
                }

                if (doc.questions !== undefined && Array.isArray(doc.questions)) {
                    // It's a new schema document, append its existing questions
                    grouped[key].questions.push(...doc.questions);
                } else if (doc.question !== undefined) {
                    // It's an old schema document, convert and append
                    grouped[key].questions.push({
                        _id: doc._id,
                        text: doc.question,
                        is_reversed: doc.is_reversed !== undefined ? doc.is_reversed : false
                    });
                }

                if (doc.createdAt) {
                    grouped[key].createdDates.push(new Date(doc.createdAt));
                }
                if (doc.updatedAt) {
                    grouped[key].updatedDates.push(new Date(doc.updatedAt));
                }
            }

            // 6. Build new documents to insert
            const newDocsToInsert = [];
            for (const key of Object.keys(grouped)) {
                const group = grouped[key];

                const createdAt = group.createdDates.length > 0
                    ? new Date(Math.min(...group.createdDates))
                    : new Date();
                const updatedAt = group.updatedDates.length > 0
                    ? new Date(Math.max(...group.updatedDates))
                    : new Date();

                newDocsToInsert.push({
                    header: group.header,
                    questions: group.questions,
                    is_del: group.is_del,
                    createdAt,
                    updatedAt,
                    __v: 0
                });
            }

            console.log(`Generated ${newDocsToInsert.length} grouped documents for insertion.`);

            // 7. Create a new backup before performing write/delete operations
            const backupCollectionName = `mentaltestfeedbacks_backup_${Date.now()}`;
            console.log(`Creating a backup of the current collection to '${backupCollectionName}'...`);
            const backupCollection = dbInstance.collection(backupCollectionName);
            await backupCollection.insertMany(allDocs);
            console.log(`Backup completed successfully.`);

            // 8. Delete all documents from the original collection to avoid index conflicts during insert
            console.log("Deleting all documents from 'mentaltestfeedbacks' to insert consolidated data...");
            const deleteResult = await feedbackCollection.deleteMany({});
            console.log(`Deleted ${deleteResult.deletedCount} documents.`);

            // 9. Insert the new grouped documents
            console.log(`Inserting ${newDocsToInsert.length} new grouped documents...`);
            const insertResult = await feedbackCollection.insertMany(newDocsToInsert);
            console.log(`Inserted ${insertResult.insertedCount} documents successfully.`);
        } else {
            console.log("No old schema documents found to migrate. Skipping migration step.");
        }

        // 10. Create the new unique index on header (where is_del is false)
        console.log("Creating new index on header...");
        try {
            await feedbackCollection.createIndex(
                { header: 1 },
                {
                    unique: true,
                    partialFilterExpression: { is_del: false }
                }
            );
            console.log("Created new index successfully.");
        } catch (indexCreateError) {
            console.error("Failed to create new index:", indexCreateError.message);
        }

        console.log("Migration completed successfully!");

    } catch (error) {
        console.error("Migration failed with error:", error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

migrate();
