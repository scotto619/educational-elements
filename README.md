This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.


## Working with Assistant Branches

When the assistant provides updates, they usually live on a named branch in the remote repository. If you see an error like `not something we can merge` when running `git merge <branch-name>`, it means your local repository hasn't fetched that branch yet. Follow these steps to bring it in and merge it into your main line of development:

1. Make sure you have an up-to-date view of the remote branches:

   ```bash
   git fetch origin
   git branch -a
   ```

2. Fetch the specific branch into your local repository. Replace `<branch>` with the branch name provided by the assistant (for example, `codex/add-full-screen-feature-for-students-tab-swwf87`):

   ```bash
   git fetch origin <branch>:<branch>
   ```

3. Check out your main branch (or whichever branch you want to merge into) and ensure it's up to date:

   ```bash
   git checkout main
   git pull origin main
   ```

4. Merge the assistant's branch into your current branch and push the result back to the remote:

   ```bash
   git merge <branch>
   git push origin main
   ```

5. If you prefer not to keep the assistant branch around after merging, you can delete it locally and remotely:

   ```bash
   git branch -d <branch>
   git push origin --delete <branch>
   ```

Following this sequence ensures that the branch containing the assistant's work is available locally, allowing `git merge` to succeed. Once merged, new chats or collaborators working from `main` will inherit the latest updates.
