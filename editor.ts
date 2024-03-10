// Import necessary modules
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { v4 as uuidv4 } from 'uuid';

// Define Document interface
interface Document {
  id: string;
  title: string;
  content: string;
  creatorId: string;
  creationDate: Date;
  lastUpdatedDate: Date;
  lastUpdateAuthorId?: string;
  isPublished?: boolean;
  versions?: Version[]; // Add this property
  
}


// Define Version interface
interface Version {
  content: string;
  lastUpdateAuthorId: string;
  lastUpdatedDate: Date;
}
export { Document };
// Create Koa app and router
const app = new Koa();
const router = new Router();

// Documents store
const documents: Record<string, Document[]> = {};

// Middleware to parse request body
app.use(bodyParser());



router.get('/all-versions', async (ctx) => {
  const allVersions: Document[] = Object.values(documents)
    .flatMap((document) => document.map((version) => ({ ...version, versions: undefined })));
  
  ctx.body = allVersions;
});
// Create a new document
router.post('/create', async (ctx) => {
    console.log("reaching here ")
  const { title, content, creatorId }: Document = ctx.request.body as Document;
  const id = uuidv4();
  const document: Document = {
    id,
    title,
    content,
    creatorId,
    creationDate: new Date(),
    lastUpdatedDate: new Date(),
    versions: [{
      content,
      lastUpdateAuthorId: creatorId,
      lastUpdatedDate: new Date(),
    }],
  };

  documents[id] = [document];
  ctx.body = document;
});

// Create a new version of an existing document
router.post('/create-version/:id', async (ctx) => {
  const { id } = ctx.params;
  const { content, lastUpdateAuthorId }: Document = ctx.request.body as Document;
  const document = documents[id];

  if (!document) {
    ctx.status = 404;
    return;
  }

  const newVersion: Document = {
    ...document[0],
    content,
    lastUpdateAuthorId,
    lastUpdatedDate: new Date(),
  };

  documents[id].unshift(newVersion);
  ctx.body = newVersion;
});

// Update an existing draft version
router.post('/update/:id', async (ctx) => {
  const { id } = ctx.params;
  const { content, lastUpdateAuthorId }: Document = ctx.request.body as Document;
  const document = documents[id];

  if (!document) {
    ctx.status = 404;
    return;
  }

  const updatedVersion: Document = {
    ...document[0],
    content,
    lastUpdateAuthorId,
    lastUpdatedDate: new Date(),
  };

  documents[id].unshift(updatedVersion);
  ctx.body = updatedVersion;
});

// Publish a document
router.post('/publish/:id', async (ctx) => {
  const { id } = ctx.params;
  const document = documents[id];

  if (!document) {
    ctx.status = 404;
    return;
  }

  const publishedVersion: Document = {
    ...document[0],
    id: uuidv4(),
    isPublished: true,
  };

  documents[id] = [publishedVersion];
  ctx.body = publishedVersion;
});

// Get all versions of a document
router.get('/versions/:id', async (ctx) => {
  const { id } = ctx.params;
  console.log(id,documents)
  const document = documents[id];

  if (!document) {
    ctx.status = 404;
    return;
  }

  ctx.body = document;
});
app.use(router.routes());
// Start the 3erver
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Editor API running on port ${PORT}`);
});
