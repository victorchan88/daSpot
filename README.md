# daSpot

## Demo

Live demo of daSpot can be found [**here**](https://da-spot-ruby.vercel.app/)

## Project Setup

Make a copy of the **.env.example** file and name it **.env.local**.

### Firebase

#### Getting Firebase Config

1. Visit the [**Firebase Console**](https://console.firebase.google.com/)

2. Click **Create a project** or **Add project**.

3. Enter a project name and click **Continue**.

4. Disable **Google Analytics** as it won't be needed for this project and click **Create project**. After your project is created click **Continue**.

5. Once on the overview page for your project, click the **Web** button under **"Get started by adding Firebase to your app"**.

6. Add an **App nickname** and click **Register app**.

7. From the `firebaseConfig` variable, copy all of the values into your **.env.local** file.

8. Click **Continue to console** which should take you back to the overview page.

#### Getting Private Firebase Keys

1. From the overview page, click **Project settings** from the sidebar menu.

2. Click **Service accounts** and ensure the **Admin SDK configuration snippet** is set to **Node.js**.

3. Click **Generate new private key** and after the popup, click **Generate key**.

4. Open the generated file and copy the **Client Email** and **Private Key** values into your **.env.local** file (**NOTE**: When copying your **Private Key**, keep the **double quotes** around the value - different from every other value in our **.env.local** file).

#### Setting up Authentication

1. From the project overview page, click **Authentication** and then **Get started**.

2. daSpot uses **Phone authentication**, so click **Phone** and **enable** it.

3. Optional: Add your **own phone number** to simplify the login process for your own account.

4. Click **Save**

#### Setting up Cloud Firestore (The Database)

1. From the project overview page, click **Cloud Firestore** and then **Create database**.

2. When prompted for **Security Rules**, keep the **Start in production mode** setting and then click **Next**.

3. Set the **Cloud Firestore location** to the region closest to you and click **Enable**.

4. After your database is created, click **Rules** and set them equal to the following to ensure only authenticated users can modify your database:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if
          request.auth != null;
    }
  }
}
```

5. Click **Publish** to confirm your changes.

### Spotify API

In order to use the Spotify API, you will need access to a Client ID, a Client Secret, and a Refresh Token.

#### Getting Client ID and Client Secret

1. First, go to your [**Spotify Developer Dashboard**](https://developer.spotify.com/dashboard/) and login.

2. Once logged in, click **Create an App**.

3. Fill out the **App name** and **App description** fields and accept all of the required permissions. Click **Create** once finished.

4. Click **Show Client Secret** and save your **Client ID** and **Client Secret** into your **.env.local** file.

5. Click **Edit Settings** and add [**http://localhost:3000**](http://localhost:3000) as a **Redirect URI**.

6. Scroll to the bottom and click **Save**.

#### Getting Refresh Token

1. First, we need to make sure that the application is running. If not, use the command `npm run dev`.

2. In your browser visit (Make sure to swap in your Client ID).

```
https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID_HERE&response_type=code&redirect_uri=http%3A%2F%2Flocalhost:3000
```

3. After authorizing, you'll be sent back to the application with the URL now looking like:

```
http://localhost:3000/callback?code=RETURN_CODE_HERE
```

4. Save the return code given in the URL.

5. Visit [**Base64 Encode**](https://www.base64encode.org/) and paste in your Client ID and your Client Secret in the following format:

```
CLIENT_ID:CLIENT_SECRET
```

6. Click encode and save this value.

7. In your terminal, run the following command (Make sure to substitute the values where necessary):

```
curl -H "Authorization: Basic BASE64_ENCODED_VALUE_HERE"
-d grant_type=authorization_code -d code=RETURN_CODE_HERE -d redirect_uri=http%3A
%2F%2Flocalhost:3000 https://accounts.spotify.com/api/token
```

8. After receiving the JSON response, save your **Refresh Token** into your **.env.local** file.

#### Getting Authentication Cookie Secrets

1. Visit [**Generate Secret**](https://generate-secret.now.sh/32) and copy the hashed value you get into your `COOKIE_SECRET_PREVIOUS` environment variable in the **.env.local** file.
2. Refresh the site and copy this second value into your `COOKIE_SECRET_CURRENT` environment variable.

## How to run

After setting up the project with your proper settings, run the command `npm run dev` in the root of the directory.  And that's it!
