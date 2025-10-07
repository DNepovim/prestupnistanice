import { defineConfig } from 'tinacms'

import { AuthorsCollection } from './collections/authors'
import { BooksCollection } from './collections/books'
import { GlobalConfigCollection } from './collections/global-config'
import { PagesCollection } from './collections/pages'

export default defineConfig({
  branch: 'main',

  // Get this from tina.io
  clientId: process.env.PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      BooksCollection,
      AuthorsCollection,
      PagesCollection,
      GlobalConfigCollection,
    ],
  },
})
