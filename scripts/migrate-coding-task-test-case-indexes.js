/**
 * Replace the legacy unique taskId index with the per-question compound index.
 *
 * Run once against the database used by the application:
 *   npm run migrate:coding-test-case-indexes
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const collectionName = 'coding-task-test-cases';
const taskIdIndex = { taskId: 1 };
const taskQuestionIndex = { taskId: 1, questionId: 1 };

const hasExactKeys = (actual, expected) => {
  const actualEntries = Object.entries(actual || {});
  const expectedEntries = Object.entries(expected);

  return actualEntries.length === expectedEntries.length &&
    expectedEntries.every(([key, value], index) =>
      actualEntries[index][0] === key &&
      actualEntries[index][1] === value
    );
};

(async () => {
  const connectionString = process.env.DB_CONNECTION_STRING;

  if (!connectionString) {
    throw new Error('DB_CONNECTION_STRING is required');
  }

  await mongoose.connect(connectionString, {
    dbName: process.env.DB_NAME || undefined
  });

  const collection = mongoose.connection.db.collection(collectionName);
  const indexes = await collection.indexes();
  const legacyIndex = indexes.find((index) =>
    index.unique === true &&
    hasExactKeys(index.key, taskIdIndex)
  );

  if (legacyIndex) {
    await collection.dropIndex(legacyIndex.name);
    console.log(`Dropped obsolete unique index: ${legacyIndex.name}`);
  } else {
    console.log('No obsolete unique taskId-only index found.');
  }

  const currentIndexes = await collection.indexes();
  const compoundIndex = currentIndexes.find((index) =>
    hasExactKeys(index.key, taskQuestionIndex)
  );

  if (compoundIndex?.unique) {
    console.log(`Compound unique index already exists: ${compoundIndex.name}`);
  } else if (compoundIndex) {
    throw new Error(
      `Index ${compoundIndex.name} has the correct keys but is not unique; ` +
      'review it before retrying this migration.'
    );
  } else {
    const indexName = await collection.createIndex(taskQuestionIndex, {
      unique: true
    });
    console.log(`Created compound unique index: ${indexName}`);
  }
})()
  .catch((error) => {
    console.error('Failed to migrate coding test-case indexes:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
