# 🧭 Connect MongoDB Compass to Atlas

## Quick Steps

### 1. Get Your Connection String from Atlas

After creating your cluster and database user in MongoDB Atlas:

1. In Atlas dashboard, click **"Connect"** on your cluster
2. Choose **"Compass"** (or "Drivers" - same string works)
3. Copy the connection string:
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/
   ```
4. Replace `<password>` with your actual database user password

### 2. Connect in MongoDB Compass

1. Open **MongoDB Compass** on your computer
2. You'll see "New Connection" screen
3. Paste your connection string in the URI field
4. Click **"Connect"**

**That's it!** You're now viewing your Atlas database.

## Example Connection String

```
mongodb+srv://aiforhealth_user:MyP@ssw0rd123@cluster0.abc123.mongodb.net/
```

## Tips

- **Save the connection**: Click "Save & Connect" to save it for later
- **Name it**: Give it a name like "Atlas Production" to distinguish from local
- **Multiple connections**: You can save both local and Atlas connections:
  - Local: `mongodb://localhost:27017`
  - Atlas: `mongodb+srv://...`

## Troubleshooting

**Can't connect?**
- Check your password is correct (no `<` `>` brackets)
- Verify Network Access in Atlas allows your IP or 0.0.0.0/0
- Make sure database user exists and has permissions

## Using Both Local and Atlas

In Compass, you can switch between:

**Local Development:**
```
mongodb://localhost:27017
```

**Production (Atlas):**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
```

Just paste the different connection string and click "Connect"!

---

**Pro tip**: Use the same Atlas connection string in Render's `MONGODB_URI` environment variable.
